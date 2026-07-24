-- ═══════════════════════════════════════════════════════════════════════════
-- Devolución ATÓMICA — espeja process_order_stock, pero sumando en vez de restar.
--
-- POR QUÉ: /api/tpv-return hacía la devolución en 4 pasos sueltos desde Node, y
-- eso rompía la integridad de tres maneras distintas:
--
--  1) STOCK NO ATÓMICO (lost update). Reponía con leer-y-escribir:
--       SELECT stock → UPDATE stock = <leído> + qty
--     Dos devoluciones simultáneas del mismo producto leen el mismo valor y la
--     segunda pisa a la primera: se pierde una reposición. (process_order_stock
--     nunca tuvo este fallo: hace `set stock = stock - qty` en el propio UPDATE.)
--
--  2) TOCTOU EN EL TOPE DE LO YA DEVUELTO (esto es DINERO, no solo inventario).
--     El "cuánto queda por devolver" se calculaba leyendo las devoluciones previas
--     y se comprobaba fuera de transacción: dos peticiones a la vez leen el mismo
--     "ya devuelto = 0", ambas pasan el tope y se devuelve DOS VECES el mismo
--     artículo (doble reembolso + stock inflado).
--
--  3) SIN TRANSACCIÓN. El INSERT en `devoluciones` iba antes que la reposición, y
--     el resultado de cada UPDATE de stock se descartaba (ni se miraba el error).
--     Si algo fallaba a mitad quedaba una devolución registrada con el stock a
--     medio reponer, en silencio y sin forma de saber cuáles.
--
-- CÓMO: todo dentro de una función = una transacción. El `for update` sobre la
-- fila del pedido serializa las devoluciones DEL MISMO pedido (mata el TOCTOU) sin
-- bloquear las de otros pedidos. Importes y cantidades salen SIEMPRE de order_lines
-- (autoritativos, como hace el TPV al vender), nunca del cliente.
--
-- Excepciones: ORDER_NOT_FOUND · ORDER_NOT_REFUNDABLE · NO_ITEMS ·
--              VARIANT_NOT_FOUND:<id> · PRODUCT_NOT_FOUND:<id>
-- Devuelve: { dev_id, order_number, items, total }  (items con la MISMA forma que
-- escribía el código anterior: line_id, product_id, variant_id, product_name,
-- qty_dev, unit_price, importe — para no romper a quien ya lee esa columna).
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.process_return(
  p_order_id  uuid,
  p_items     jsonb,
  p_method    text default 'efectivo',
  p_motivo    text default '',
  p_operator  text default 'TPV'
) returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_status    text;
  v_number    text;
  v_it        jsonb;
  v_line      record;
  v_already   integer;
  v_remaining integer;
  v_qty       integer;
  v_importe   numeric;
  v_items     jsonb := '[]'::jsonb;
  v_total     numeric := 0;
  v_dev_id    integer;
begin
  -- Bloqueo de la fila del pedido: serializa TODAS las devoluciones de ESTE pedido.
  select o.status, o.order_number
    into v_status, v_number
    from orders o
   where o.id = p_order_id
     for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  -- Un pedido sin pagar o cancelado no se reembolsa (mismo criterio que la API).
  if v_status in ('pending', 'cancelled') then
    raise exception 'ORDER_NOT_REFUNDABLE';
  end if;

  for v_it in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    -- Línea autoritativa: precio y cantidad SIEMPRE de BD, nunca del cliente.
    -- El AND order_id impide devolver contra la línea de OTRO pedido.
    select l.id, l.product_id, l.variant_id, l.product_name, l.unit_price, l.quantity
      into v_line
      from order_lines l
     where l.id = nullif(v_it->>'line_id', '')::int
       and l.order_id = p_order_id;
    if not found then
      continue;
    end if;

    -- Ya devuelto de esta línea (dentro del lock → no puede colarse otra a la vez).
    -- Defensivo con filas legacy: items que no sean array o qty_dev no numérico → 0.
    select coalesce(sum(
             case when (di->>'qty_dev') ~ '^[0-9]+$' then (di->>'qty_dev')::int else 0 end
           ), 0)
      into v_already
      from devoluciones d
      cross join lateral jsonb_array_elements(
        case when jsonb_typeof(d.items) = 'array' then d.items else '[]'::jsonb end
      ) as di
     where d.order_id = p_order_id
       and (di->>'line_id') = v_line.id::text;

    v_remaining := greatest(v_line.quantity - coalesce(v_already, 0), 0);
    v_qty := least(
      greatest(coalesce(case when (v_it->>'qty_dev') ~ '^[0-9]+$' then (v_it->>'qty_dev')::int else 0 end, 0), 0),
      v_remaining
    );
    if v_qty <= 0 then
      continue;
    end if;

    v_importe := round(v_line.unit_price * v_qty, 2);
    v_total := v_total + v_importe;
    v_items := v_items || jsonb_build_object(
      'line_id',      v_line.id,
      'product_id',   v_line.product_id,
      'variant_id',   v_line.variant_id,
      'product_name', v_line.product_name,
      'qty_dev',      v_qty,
      'unit_price',   v_line.unit_price,
      'importe',      v_importe
    );

    -- Reposición ATÓMICA, en la MISMA granularidad con la que la venta lo descontó
    -- (process_order_stock): línea con variante → product_variants; sin variante →
    -- products. Reponer en el padre una línea de variante desviaba el stock.
    if v_line.variant_id is not null then
      update product_variants
         set stock = coalesce(stock, 0) + v_qty
       where id = v_line.variant_id;
      if not found then
        raise exception 'VARIANT_NOT_FOUND:%', v_line.variant_id;
      end if;
    else
      update products
         set stock = coalesce(stock, 0) + v_qty
       where id = v_line.product_id;
      if not found then
        raise exception 'PRODUCT_NOT_FOUND:%', v_line.product_id;
      end if;
    end if;
  end loop;

  if jsonb_array_length(v_items) = 0 then
    raise exception 'NO_ITEMS';
  end if;

  insert into devoluciones (order_number, order_id, items, total_devuelto, method, motivo, operator, created_at)
  values (
    v_number, p_order_id, v_items, round(v_total, 2),
    coalesce(nullif(p_method, ''), 'efectivo'),
    coalesce(p_motivo, ''),
    coalesce(nullif(p_operator, ''), 'TPV'),
    now()
  )
  returning id into v_dev_id;

  return jsonb_build_object(
    'dev_id', v_dev_id,
    'order_number', v_number,
    'items', v_items,
    'total', round(v_total, 2)
  );
end;
$function$;

-- Misma superficie que process_order_stock: SOLO service_role (las API routes).
-- Sin esto, PostgREST la expondría a anon/authenticated y cualquiera podría
-- inflar stock y fabricar devoluciones (es SECURITY DEFINER).
revoke all on function public.process_return(uuid, jsonb, text, text, text) from public;
revoke all on function public.process_return(uuid, jsonb, text, text, text) from anon;
revoke all on function public.process_return(uuid, jsonb, text, text, text) from authenticated;
grant execute on function public.process_return(uuid, jsonb, text, text, text) to service_role;
