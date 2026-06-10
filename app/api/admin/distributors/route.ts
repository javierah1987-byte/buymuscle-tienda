// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET -> { ok, distributors, levels }
export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const db = svc()
  try {
    const [{ data: levels, error: le }, { data: distributors, error: de }] = await Promise.all([
      db.from('distributor_levels').select('*').order('discount_pct', { ascending: true }),
      db.from('distributors').select('*,distributor_levels(name,discount_pct)').order('company_name', { ascending: true }),
    ])
    if (le) throw new Error(le.message)
    if (de) throw new Error(de.message)
    return NextResponse.json({ ok: true, distributors: distributors || [], levels: levels || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH { kind:'distributor'|'level', id, fields } -> actualiza la tabla correspondiente
const ALLOWED = {
  distributor: ['company_name', 'phone', 'nif', 'level_id', 'active', 'email'],
  level: ['discount_pct', 'min_order_amount', 'name'],
}

export async function PATCH(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  const kind = body?.kind
  const id = body?.id
  const fields = body?.fields
  if (kind !== 'distributor' && kind !== 'level') {
    return NextResponse.json({ error: 'kind invalido' }, { status: 400 })
  }
  if (id === undefined || id === null || id === '') {
    return NextResponse.json({ error: 'id obligatorio' }, { status: 400 })
  }
  if (!fields || typeof fields !== 'object') {
    return NextResponse.json({ error: 'fields obligatorio' }, { status: 400 })
  }

  const clean: any = {}
  for (const k of ALLOWED[kind]) {
    if (k in fields) clean[k] = fields[k]
  }
  if (Object.keys(clean).length === 0) {
    return NextResponse.json({ error: 'sin campos validos' }, { status: 400 })
  }

  const table = kind === 'distributor' ? 'distributors' : 'distributor_levels'
  const db = svc()
  try {
    const { error } = await db.from(table).update(clean).eq('id', id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
