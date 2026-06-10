# Facturas de distribuidores — Diseño

**Fecha:** 2026-06-09
**Proyecto:** BuyMuscle Tienda (Next.js 14 + Supabase + Holded)
**Estado:** Implementado

## Objetivo

Que los distribuidores puedan descargar todas sus facturas (PDF de Holded) del
último año, y que cualquier cliente pueda descargar la factura de un pedido
concreto.

## Decisiones (brainstorming previo)

- Ubicación: **las dos cosas** → portal dedicado para distribuidores logueados
  **y** botón de descarga en la página pública `/mis-pedidos`.
- Seguridad de la descarga pública: **descarga directa** (se asume el tradeoff
  de privacidad), apoyada en que el `order_number` es un token impredecible.
- Alcance temporal: **últimos 12 meses** (de la petición original "todas las
  facturas que vayan haciendo durante un año").

## Arquitectura

- **`GET /api/order-invoice?n=<order_number>`** (pública): con service role busca
  el pedido por `order_number`; si tiene `holded_invoice_id`, descarga el PDF de
  Holded (`/documents/invoice/{id}/pdf`, base64) y lo devuelve como
  `application/pdf`. 404 si no hay factura. Es la descarga directa aprobada;
  el `order_number` (aleatorio criptográfico) actúa de token de capacidad.
- **Portal `/distribuidores/facturas`** (cliente): con la sesión del distribuidor
  (`useAuth`), lista sus pedidos de los últimos 12 meses con factura, consultando
  `orders` directamente — RLS (`orders_select`: email propio) acota a los suyos.
  Cada fila descarga el PDF vía la ruta pública por `order_number`.
- **`/mis-pedidos`** (pública, consulta por email): cada pedido con
  `holded_invoice_id` muestra un botón "Descargar factura" que apunta a la misma
  ruta pública.
- Enlace "Mis facturas" añadido en la landing `/distribuidores`.

## Fuera de alcance / notas

- No se listan facturas directamente desde Holded por contacto: se usan los
  `orders` de la propia tienda (que guardan `holded_invoice_id`), más simple y
  ya acotado por RLS.
- Privacidad: la descarga pública por `order_number` expone el PDF (con datos
  fiscales) a quien conozca el número; es el tradeoff aceptado. El número es
  impredecible, así que no es enumerable.
- Requiere `HOLDED_API_KEY` en el entorno (ya configurada para la facturación).
