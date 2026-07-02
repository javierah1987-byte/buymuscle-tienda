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

// GET ?level_id=X -> overrides de % por producto del grupo (con nombre de producto)
export async function GET(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const levelId = new URL(req.url).searchParams.get('level_id')
  if (!levelId) return NextResponse.json({ error: 'level_id obligatorio' }, { status: 400 })
  const { data, error } = await svc().from('distributor_product_discounts')
    .select('id,product_id,discount_pct,products(name)').eq('level_id', levelId).order('id', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, items: data || [] })
}

// PUT { level_id, product_id, discount_pct } -> crea/actualiza el override
export async function PUT(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const level_id = Number(b.level_id), product_id = Number(b.product_id), discount_pct = Number(b.discount_pct)
  if (!level_id || !product_id) return NextResponse.json({ error: 'level_id y product_id obligatorios' }, { status: 400 })
  const { error } = await svc().from('distributor_product_discounts')
    .upsert({ level_id, product_id, discount_pct: discount_pct || 0 }, { onConflict: 'level_id,product_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE { id } o { level_id, product_id } -> borra el override
export async function DELETE(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  let q = svc().from('distributor_product_discounts').delete()
  if (b.id) q = q.eq('id', b.id)
  else if (b.level_id && b.product_id) q = q.eq('level_id', b.level_id).eq('product_id', b.product_id)
  else return NextResponse.json({ error: 'id o (level_id + product_id)' }, { status: 400 })
  const { error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
