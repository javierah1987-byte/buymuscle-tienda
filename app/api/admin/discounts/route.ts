import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabaseAdmin = svc()
  const { data, error } = await supabaseAdmin
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, codes: data || [] })
}

export async function POST(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  if (!body || !body.code) {
    return NextResponse.json({ error: 'Falta el código' }, { status: 400 })
  }

  const payload = {
    code: String(body.code).toUpperCase().trim(),
    type: body.type,
    value: Number(body.value),
    min_order: body.min_order != null && body.min_order !== '' ? Number(body.min_order) : 0,
    max_uses: body.max_uses != null && body.max_uses !== '' ? Number(body.max_uses) : null,
    expires_at: body.expires_at ? String(body.expires_at) : null,
    description: body.description || null,
    active: body.active
  }

  const supabaseAdmin = svc()
  const { error } = await supabaseAdmin.from('discount_codes').insert(payload)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const { id, fields } = body || {}
  if (!id || !fields || typeof fields !== 'object') {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const supabaseAdmin = svc()
  const { error } = await supabaseAdmin.from('discount_codes').update(fields).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const { id } = body || {}
  if (!id) return NextResponse.json({ error: 'Falta el id' }, { status: 400 })

  const supabaseAdmin = svc()
  const { error } = await supabaseAdmin.from('discount_codes').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
