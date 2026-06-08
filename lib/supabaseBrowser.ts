'use client'
import { createBrowserClient } from '@supabase/ssr'

// Cliente de navegador que comparte la sesión (cookies) con el middleware.
export const sb = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cabeceras para llamadas REST autenticadas con el token de la sesión admin.
// Si no hay sesión, cae a la anon key (las políticas RLS lo rechazarán).
export async function authHeaders(extra: Record<string, string> = {}) {
  const { data } = await sb.auth.getSession()
  const token = data.session?.access_token
  return {
    apikey: ANON,
    Authorization: 'Bearer ' + (token || ANON),
    ...extra,
  }
}
