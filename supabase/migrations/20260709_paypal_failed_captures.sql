-- P0 fix (PayPal cobrado sin pedido): registro de conciliación de capturas que
-- fallaron DESPUÉS de cobrar y se reembolsaron (o cuyo refund falló).
-- OPCIONAL: el refund NO depende de esta tabla (el código inserta best-effort). Pero
-- créala para tener trazabilidad y poder alertar sobre refunds fallidos.
-- La escribe solo el service_role (la ruta /api/paypal/capture). Ejecutar en Supabase.

create table if not exists public.paypal_failed_captures (
  id              uuid primary key default gen_random_uuid(),
  paypal_order_id text,
  capture_id      text,
  amount          numeric,
  reason          text,          -- sin_stock | importe_no_coincide | error_al_crear_pedido | ...
  refunded        boolean not null default false,
  refund_id       text,          -- null si el refund falló (=> revisar a mano, dinero retenido)
  detail          text,
  created_at      timestamptz not null default now()
);

create index if not exists paypal_failed_captures_capture_idx on public.paypal_failed_captures (capture_id);
create index if not exists paypal_failed_captures_pending_idx on public.paypal_failed_captures (refunded, created_at desc);

alter table public.paypal_failed_captures enable row level security;
-- Sin políticas: solo service_role (bypassa RLS). Deny-all para anon/authenticated.

-- Alerta útil: refunds que NO se completaron (dinero cobrado, sin pedido, sin devolver):
--   select * from public.paypal_failed_captures where refunded = false order by created_at desc;
