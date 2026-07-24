# FIX LISTO-PARA-APLICAR · Stock doble-descuento (🔴 doble confirmación de Javier)

> **NADA de este documento se ha ejecutado.** Todo son SELECT de solo-lectura (para
> cuantificar) + SQL escrito y listo. Aplicar el fix y la corrección de stock SOLO con
> el visto bueno explícito de Javier (es la BD de producción VIVA). Diagnóstico
> verificado con datos reales el 2026-07-24 vía Management API en modo read-only.

## 1. La causa, confirmada con el código REAL del trigger

`order_lines` tiene el trigger `trg_descontar_stock` (AFTER INSERT, **ENABLED**) que
ejecuta `fn_descontar_stock()`. Su código real hace TRES cosas mal:

```
-- fn_descontar_stock() (ACTUAL, con los bugs):
1) UPDATE products SET stock = GREATEST(stock - qty, 0),
        active = (stock 0 → false)            -- (a) toca products.stock SIEMPRE, aun en ventas de variante
                                              -- (b) desactiva el producto al llegar a 0, por su cuenta
2) "primera variante con stock" (ORDER BY id LIMIT 1) -= qty  -- (c) IGNORA NEW.variant_id → descuenta la variante EQUIVOCADA
3) INSERT stock_movements ('sale', ...)        -- (esto sí es útil: el histórico)
```

Y **además** el código de la app llama a `process_order_stock()` tras insertar las
líneas (en `/api/redsys/notification`, PayPal capture y create-order). Esa función SÍ
es correcta (atómica, `stock >= qty`, variante correcta):

```
-- process_order_stock(p_lines jsonb) (CORRECTA):
--   variante → UPDATE product_variants SET stock=stock-qty WHERE id=variant AND stock>=qty
--   producto → UPDATE products        SET stock=stock-qty WHERE id=product AND stock>=qty
--   (NO escribe historico, NO desactiva)
```

**Resultado:** cada venta descuenta DOS veces de `products.stock` (trigger + función), y
en ventas de variante toca `products.stock` (que no debería) y además vacía una variante
equivocada. La única razón de que no haya stock negativo es el `GREATEST(...,0)` que
enmascara el error clampando a 0.

## 2. El daño HOY (medido, solo-lectura, 2026-07-24)

- Catálogo: **505 productos** (336 activos), **913 variantes**. Stock negativo: **0** (clamp).
  Productos desactivados por stock 0: **0**.
- Pedidos confirmados: **20** · líneas de pedido: **30** · unidades: **30**.
- **Productos con `products.stock` desviado: 23** (todos los que se han vendido).
- Líneas de variante (descuento a variante equivocada): **16 líneas / 14 variantes distintas**.
- `stock_movements`: 30 filas `'sale'` (las escribe el trigger; `process_order_stock` no
  registra → por eso NO se ve el doble descuento en el histórico: hay 1 movimiento por
  línea pero el stock bajó dos veces).

### Deriva por producto (`add_back` = unidades a DEVOLVER a `products.stock`)

| product_id | add_back | (var / no-var) | product_id | add_back |
|---|---|---|---|---|
| 676  | +4 | (4/0) | 1129 | +1 |
| 1687 | +3 | (3/0) | 1161 | +1 |
| 1329 | +2 | (1/1) | 1196 | +1 |
| 1330 | +2 | (1/1) | 1265 | +1 |
| 654  | +1 | 1274 | +1 |
| 658  | +1 | 1285 | +1 |
| 659  | +1 | 1367 | +1 |
| 674  | +1 | 1392 | +1 |
| 721  | +1 | 1474 | +1 |
| 773  | +1 | 1630 | +1 |
| 1032 | +1 | 1673 | +1 |
|      |    | 1689 | +1 |

**23 productos · total 30 unidades** que el trigger quitó de más de `products.stock`.
(`add_back` = suma de TODAS las qty de las líneas del producto, porque la aportación del
trigger a `products.stock` es 100% espuria: en no-variante duplica; en variante no debía
tocar `products.stock`. No hubo clamp a 0: el stock mínimo de la lista es 16, qty 1-4.)

Variantes vendidas (para el recuento del descuento-a-variante-equivocada, NO
reconstruible de los logs porque dependía del stock en el instante de cada venta):
`654→2349, 674→2380, 676→{2399,2407,2409}, 1196→2721, 1265→2934, 1274→2905,
1329→2824, 1330→2886, 1392→3378, 1687→{4099,4103}, 1689→4112`.

## 3. EL FIX (elegir opción con Javier · nada ejecutado)

### 3.A · Recomendado — una sola fuente de verdad + conservar histórico
Dos DDL, se aplican juntas. `process_order_stock` pasa a ser la ÚNICA que mueve stock,
y además registra el histórico (que hoy sólo hacía el trigger):

```sql
-- (1) process_order_stock: misma lógica correcta + registrar el movimiento con
--     granularidad correcta y before/after REALES. Additiva (no cambia su firma).
create or replace function public.process_order_stock(p_lines jsonb)
returns void language plpgsql security definer set search_path to 'public' as $$
declare l jsonb; v_qty int; v_variant int; v_product int; v_order int; v_before int; v_after int;
begin
  for l in select * from jsonb_array_elements(p_lines) loop
    v_qty := coalesce((l->>'qty')::int, 0);
    if v_qty <= 0 then raise exception 'INVALID_QTY'; end if;
    v_variant := nullif(l->>'variant_id','')::int;
    v_product := (l->>'product_id')::int;
    v_order   := nullif(l->>'order_id','')::int;   -- opcional (ver nota de callers)
    if v_variant is not null then
      update product_variants set stock = stock - v_qty
        where id = v_variant and stock >= v_qty
        returning stock + v_qty, stock into v_before, v_after;
      if not found then raise exception 'INSUFFICIENT_STOCK_VARIANT:%', v_variant; end if;
    else
      update products set stock = stock - v_qty
        where id = v_product and stock >= v_qty
        returning stock + v_qty, stock into v_before, v_after;
      if not found then raise exception 'INSUFFICIENT_STOCK_PRODUCT:%', v_product; end if;
    end if;
    insert into stock_movements (product_id, order_id, movement_type, quantity, stock_before, stock_after, notes)
    values (v_product, v_order, 'sale', v_qty, v_before, v_after,
            case when v_variant is not null then 'Venta (variante '||v_variant||')' else 'Venta' end);
  end loop;
end $$;

-- (2) Quitar el trigger buggy: process_order_stock ya hace stock + histórico.
drop trigger if exists trg_descontar_stock on public.order_lines;
-- (la función fn_descontar_stock() puede quedarse huérfana o borrarse aparte:
--  drop function if exists public.fn_descontar_stock();)
```

> **Nota de callers (opcional, para que el histórico guarde el nº de pedido):** hoy las
> rutas llaman a `process_order_stock` con `{product_id, variant_id, qty}` (sin
> `order_id`), así que `stock_movements.order_id` quedaría NULL. Si se quiere conservar
> el pedido en el histórico, añadir `order_id` al payload en `/api/redsys/notification`,
> `/api/paypal/capture` y `/api/create-order` (cambio de 1 línea en cada uno). Es
> cosmético para el histórico; el stock queda correcto con o sin ello.

### 3.B · Mínimo — sólo parar la hemorragia
Si no se quiere tocar `process_order_stock` ahora, basta quitar el trigger. Para los 3
bugs (doble descuento, variante equivocada, auto-desactivar). Se PIERDE el registro de
`stock_movements` de ventas nuevas (hasta que se añada el logging a la función):

```sql
drop trigger if exists trg_descontar_stock on public.order_lines;
```

## 4. Corregir el stock ya desviado (elegir con Javier · nada ejecutado)

### 4.A · Recomendado — recuento físico de la lista afectada
La lista es corta y enumerada (23 productos + 14 variantes de §2). Contar físicamente y
fijar el stock real. Sortea toda ambigüedad, sobre todo la del **descuento-a-variante-
equivocada**, que NO es reconstruible desde los datos (dependía del stock en el instante
de cada venta). Es lo más fiable.

### 4.B · Rápido — corrección calculada (solo nivel producto)
Devuelve a `products.stock` las 30 unidades espurias del trigger. **No** corrige las
variantes equivocadas (para eso, recuento de esas 14 variantes):

```sql
-- products.stock += add_back (deshace la aportación espuria del trigger). NO EJECUTADO.
update products set stock = stock + 4 where id = 676;
update products set stock = stock + 3 where id = 1687;
update products set stock = stock + 2 where id in (1329, 1330);
update products set stock = stock + 1 where id in
  (654,658,659,674,721,773,1032,1129,1161,1196,1265,1274,1285,1367,1392,1474,1630,1673,1689);
-- (verificación: 30 unidades repartidas en 23 productos)
```

## 5. Protocolo de aplicación (cuando Javier dé el doble OK)

1. **Backup** de `products` + `product_variants` + `stock_movements` (SELECT → export).
2. **Ensayo en transacción REVERTIDA** primero: `begin; <fix + corrección>; <verificar
   invariantes>; rollback;` — ver el resultado sin commitear.
3. **Aplicar el FIX del trigger PRIMERO** (§3), y sólo después la corrección de stock
   (§4) — si no, la corrección volvería a duplicarse en la próxima venta.
4. **Con la tienda en pausa un minuto** (evita una venta a mitad de la corrección).
5. **Verificar por invariante**: tras aplicar, una venta de prueba (en `begin...rollback`)
   descuenta EXACTAMENTE una vez, de la variante correcta, y registra 1 movimiento.
6. Orden crítico: **fix (§3) → corrección (§4) → verificación (§5)**.

⛔ Ejecutado en este encargo: **NADA** en la BD (ni trigger, ni stock, ni corrección).
Solo lecturas para cuantificar. El fix queda escrito y listo para la doble confirmación.
