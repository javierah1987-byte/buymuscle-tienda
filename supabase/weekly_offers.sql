-- ─────────────────────────────────────────────────────────────────────────────
-- weekly_offers · única fuente de verdad de las ofertas semanales de BuyMuscle
-- (web "oferta de la semana" + web "oferta del día" + newsletter del lunes).
-- Aditiva: tabla NUEVA, no altera products ni ninguna tabla existente. La lee la
-- rama feature/mejoras-conversion; PROD (main) no la referencia todavía.
--
-- Modelo: 8 filas por semana → 1 slot 'week' (la oferta de la semana, válida los
-- 7 días) + 7 slots 'mon'..'sun' (una oferta por día, vale solo su día).
--   slot='week'  ≡ tipo "semana"
--   slot in (mon..sun) ≡ tipo "día", con el día de la semana codificado en el slot.
-- El descuento SIEMPRE sale de discount_pct (real, elegido por Javier). El precio
-- de oferta se DERIVA en render: price_incl_tax * (1 - discount_pct/100). No se
-- escribe nada en products → cero riesgo de dejar un sale_price fantasma.
--
-- Revert: proyectos/buymuscle/REVERT-weekly-offers-2026-07-28.sql
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.weekly_offers (
  id           bigint generated always as identity primary key,
  week_start   date    not null,                       -- lunes de la semana (Atlantic/Canary)
  slot         text    not null check (slot in ('week','mon','tue','wed','thu','fri','sat','sun')),
  product_id   integer not null references public.products(id) on delete cascade,
  discount_pct numeric(5,2) not null default 0 check (discount_pct >= 0 and discount_pct <= 90),
  active       boolean not null default true,
  starts_at    timestamptz,                            -- ventana de validez (informativa/cron)
  ends_at      timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (week_start, slot)                            -- exactamente una oferta por slot/semana
);

create index if not exists weekly_offers_week_idx on public.weekly_offers (week_start, active);

-- RLS: lectura pública SOLO de filas activas (mismas superficies públicas que
-- products/banners). La escritura queda para service_role (bypassa RLS) desde las
-- rutas admin — anon/authenticated no pueden INSERT/UPDATE/DELETE (sin policy).
alter table public.weekly_offers enable row level security;

drop policy if exists weekly_offers_public_read on public.weekly_offers;
create policy weekly_offers_public_read on public.weekly_offers
  for select using (active = true);
