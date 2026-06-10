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

// GET ?t=subscribers | abandoned | campaigns
export async function GET(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const t = new URL(req.url).searchParams.get('t')
  const db = svc()
  try {
    if (t === 'subscribers') {
      const { data, error } = await db.from('email_subscribers')
        .select('*').order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true, rows: data || [] })
    }
    if (t === 'abandoned') {
      const { data, error } = await db.from('abandoned_carts')
        .select('*').order('created_at', { ascending: false }).limit(200)
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true, rows: data || [] })
    }
    if (t === 'campaigns') {
      const { data, error } = await db.from('newsletter_campaigns')
        .select('*').order('created_at', { ascending: false }).limit(10)
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true, rows: data || [] })
    }
    return NextResponse.json({ error: 't invalido' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH { t:'abandoned', id, fields } -> ej. marcar recovery_email_sent
const ABANDONED_FIELDS = ['recovery_email_sent', 'recovery_sent_at']

export async function PATCH(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  if (body?.t !== 'abandoned') {
    return NextResponse.json({ error: 't invalido' }, { status: 400 })
  }
  const id = body?.id
  const fields = body?.fields
  if (id === undefined || id === null || id === '') {
    return NextResponse.json({ error: 'id obligatorio' }, { status: 400 })
  }
  if (!fields || typeof fields !== 'object') {
    return NextResponse.json({ error: 'fields obligatorio' }, { status: 400 })
  }
  const clean: any = {}
  for (const k of ABANDONED_FIELDS) {
    if (k in fields) clean[k] = fields[k]
  }
  if (Object.keys(clean).length === 0) {
    return NextResponse.json({ error: 'sin campos validos' }, { status: 400 })
  }

  const db = svc()
  try {
    const { error } = await db.from('abandoned_carts').update(clean).eq('id', id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST { t:'campaign', row } -> inserta newsletter_campaigns y la devuelve
export async function POST(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  if (body?.t !== 'campaign') {
    return NextResponse.json({ error: 't invalido' }, { status: 400 })
  }
  const row = body?.row
  if (!row || typeof row !== 'object' || !row.subject) {
    return NextResponse.json({ error: 'row.subject obligatorio' }, { status: 400 })
  }

  const db = svc()
  try {
    const { data, error } = await db.from('newsletter_campaigns').insert({
      subject: String(row.subject),
      body_html: row.body_html ?? null,
      status: row.status ?? 'sending',
      sent_count: Number(row.sent_count) || 0,
    }).select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true, row: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
