// @ts-nocheck
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// requireAdmin(): para rutas server. Devuelve el usuario SOLO si:
//   1) hay una sesión Supabase válida (cookie del navegador), y
//   2) su email está en la allowlist `admin_emails`.
// En cualquier otro caso devuelve null y la ruta debe responder 401.
export async function getAdminUser() {
  const cookieStore = cookies()
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await auth.auth.getUser()
  const email = user?.email?.toLowerCase()
  if (!email) return null

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data } = await db.from('admin_emails').select('email').eq('email', email).maybeSingle()
  return data ? user : null
}
