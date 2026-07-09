-- P0 fix (IDOR /mis-pedidos): verificación de email por OTP para el flujo de invitado.
-- Tabla de un solo propósito para el reto OTP + la sesión verificada efímera.
-- Solo la accede el service_role (las rutas /api/mis-pedidos/*), nunca el cliente.
-- EJECUTAR EN SUPABASE (SQL editor) ANTES de desplegar el código de esta rama.

create table if not exists public.mis_pedidos_otp (
  id                  uuid primary key default gen_random_uuid(),
  email               text        not null,
  code_hash           text        not null,           -- sha256(code + ':' + email)
  attempts            int         not null default 0, -- intentos de verificación fallidos
  consumed            boolean     not null default false,
  session_token_hash  text,                            -- sha256(token) tras verificar
  session_expires_at  timestamptz,                     -- validez de la sesión verificada
  expires_at          timestamptz not null,            -- validez del código OTP
  ip                  text,
  created_at          timestamptz not null default now()
);

create index if not exists mis_pedidos_otp_email_idx   on public.mis_pedidos_otp (email, created_at desc);
create index if not exists mis_pedidos_otp_session_idx on public.mis_pedidos_otp (session_token_hash);

-- RLS ON sin políticas = deny-all para anon/authenticated. Solo service_role (bypassa RLS) entra.
alter table public.mis_pedidos_otp enable row level security;

-- (Opcional) limpieza periódica de filas viejas — no crítico, filas minúsculas.
-- delete from public.mis_pedidos_otp where created_at < now() - interval '1 day';
