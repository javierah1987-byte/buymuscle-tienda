import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password, company_name, level_id } = await req.json()

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (authErr) throw new Error(authErr.message)

    // 2. Crear registro distribuidor vinculado al usuario
    const { error: distErr } = await supabaseAdmin.from('distributors').insert({
      email,
      company_name,
      level_id: parseInt(level_id),
      user_id: authData.user.id,
      active: true
    })

    if (distErr) {
      // Rollback: eliminar usuario auth si falla el insert
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error(distErr.message)
    }

    return NextResponse.json({ ok: true, user_id: authData.user.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
