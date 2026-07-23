# PENDIENTE DE APROBACIÓN · 3 cambios en la BD de producción (2026-07-24)

> **NADA de este documento se ha aplicado.** Son cambios que tocan el comportamiento
> de la base de datos EN PRODUCCIÓN (no solo de esta rama), así que se dejan
> propuestos, con su análisis de impacto y su SQL listo. Aplicar solo con el visto
> bueno explícito de Javier.
>
> Lo que SÍ se aplicó esta noche fue únicamente la función nueva `process_return`
> (aditiva: no la llama nada en producción; revertir = `drop function`).

---

## 1. 🔴 El stock se descuenta DOS VECES en cada venta

**Qué pasa.** La tabla `order_lines` tiene un trigger `trg_descontar_stock` (ENABLED,
AFTER INSERT) que descuenta stock por su cuenta. Además, el código llama a
`process_order_stock` después de insertar las líneas. Resultado: cada venta descuenta
el doble.

Y el trigger descuenta MAL:

- Resta siempre de `products.stock`, aunque la línea sea de una variante (esa resta
  no debería existir: la venta de una variante consume el stock de la variante).
- Para la variante elige **«la primera variante con stock»** por id — **ignora
  `NEW.variant_id`**. Vendes «Green Apple» y puede descontar de «Cola».
- Desactiva el producto (`active = false`) cuando llega a 0.
- Lee-y-escribe (`SELECT stock` → `UPDATE stock = leído - qty`), así que además pierde
  descuentos con dos ventas simultáneas.

**Evidencia (medida, no deducida).** En una transacción de prueba revertida, insertar
2 líneas de pedido (3 uds + 1 ud) del producto 658 dejó su stock en 16 partiendo de
20 — **sin llamar a `process_order_stock` ni una vez**. Los 4 descuentos los hizo el
trigger. Hay 28 filas `'sale'` en `stock_movements`, la última del 2026-07-23.

**Por qué no lo he tocado.** Es el corazón del inventario de la tienda VIVA (afecta a
`main`, no solo a esta rama) y borrar el trigger a secas deja de escribir el histórico
de `stock_movements`. Merece tu OK y mirarlo con la tienda parada un minuto.

**Arreglo propuesto** — una sola fuente de verdad para el stock (`process_order_stock`),
conservando el histórico:

```sql
-- 1) El trigger deja de tocar stock: solo registra el movimiento, con la
--    granularidad correcta (y sin desactivar productos por su cuenta).
create or replace function public.fn_descontar_stock()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_stock int;
begin
  select stock into v_stock from products where id = NEW.product_id;
  insert into stock_movements (product_id, order_id, movement_type, quantity, stock_before, stock_after, notes)
  values (NEW.product_id, NEW.order_id, 'sale', NEW.quantity, v_stock, v_stock,
          'Linea de pedido (el stock lo mueve process_order_stock)');
  return NEW;
end $$;

-- Alternativa más limpia si no queréis el histórico desde el trigger:
--   drop trigger trg_descontar_stock on order_lines;
```

**Antes de aplicarlo hay que decidir qué hacer con el stock ya desviado**: los números
actuales llevan tiempo descontando de más (y de la variante equivocada), así que toca
un recuento físico o un ajuste. Yo NO he tocado ni una unidad de stock.

---

## 2. 🟡 `devoluciones` y `caja_sessions`: cualquier usuario registrado puede leerlas y escribirlas

**Qué pasa.** Las dos políticas RLS son:

```
auth_devoluciones   [ALL] USING (auth.role() = 'authenticated')
auth_caja_sessions  [ALL] USING (auth.role() = 'authenticated')
```

`authenticated` es **cualquiera con cuenta** en la tienda (un cliente, un
distribuidor), no un administrador. Con su propio token puede leer los arqueos de caja
del negocio y **insertar, modificar o borrar filas de devoluciones**. Eso no es solo
mirar: `tpv-caja` y `tpv-stats` restan `devoluciones.total_devuelto` para el cierre Z,
así que una fila inventada descuadra la caja.

**Riesgo de aplicarlo: prácticamente nulo.** Censo hecho: las dos tablas se tocan
SOLO desde rutas de API con `service_role` (`/api/tpv-return`, `/api/tpv-caja`,
`/api/tpv-stats`), y el service role **ignora RLS**. Ningún componente del navegador
las consulta. Aun así es un cambio de control de acceso en producción → tu OK.

```sql
drop policy if exists auth_devoluciones on public.devoluciones;
drop policy if exists auth_caja_sessions on public.caja_sessions;
-- Sin política = nadie por la API pública; las rutas de servidor siguen igual.
-- (Si algún día el admin las lee desde el navegador: USING (is_admin()).)
```

---

## 3. 🟢 No existe el estado «devuelto» para un pedido

`orders_status_check` solo admite `pending | paid | shipped | completed | cancelled`.
La pantalla de admin intentaba marcar `status:'returned'` y el PATCH se rechazaba
entero, en silencio (el `.catch(()=>{})` se lo tragaba): decía «procesada» y el pedido
seguía igual. Esta noche se ha quitado ese `status` del PATCH (la nota sí se guarda y
la fuente de verdad de una devolución es la tabla `devoluciones`).

Si quieres que el pedido muestre «devuelto», hay que ampliar la restricción:

```sql
alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status = any (array['pending','paid','shipped','completed','cancelled','returned']));
```

...y después volver a poner el `status:'returned'` en la pantalla de devoluciones.

---

## Nota suelta (sin acción, para que conste)

`generate_order_number` (trigger BEFORE INSERT en `orders`) genera
`BM-<fecha>-<secuencial>` cuando el `order_number` llega vacío. El código siempre lo
manda aleatorio (10 bytes cripto), así que hoy no se dispara — hay 0 pedidos con ese
formato. Pero conviene saberlo: `/api/order-lookup` y `/api/order-invoice` no piden
login porque confían en que el número es **imposible de adivinar**; un pedido creado
por otra vía (importación, inserción a mano) sí sería enumerable, y con él se leen los
datos del cliente y su factura en PDF.
