// @ts-nocheck
// Panel admin de ofertas semanales. Escribe/lee weekly_offers (service role) —
// única fuente de verdad de la web (oferta semana/día) y del email del lunes.
// Guard: getAdminUser() (sesión cookie + allowlist admin_emails), igual que
// app/api/admin/marketing. anon/authenticated NO pueden escribir (RLS).
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'
import { ALL_SLOTS, DAY_SLOTS, canaryWeekStart, slotWindowIso } from '@/lib/weeklyOffers'

export const dynamic = 'force-dynamic'

function svc() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

const PROD_COLS = 'id,name,brand,image_url,price_incl_tax,stock,active,has_variants,categories(name)'
const OFFER_SEL = `id,week_start,slot,product_id,discount_pct,active,products(${PROD_COLS})`

// GET ?week=<ymd> | ?search=<term> | ?bestsellers=1
export async function GET(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ ok: false, error: 'no_autorizado' }, { status: 401 })
  const url = new URL(req.url)
  const db = svc()
  try {
    const search = url.searchParams.get('search')
    if (search !== null) {
      const term = search.trim()
      if (!term) return NextResponse.json({ ok: true, rows: [] })
      let q = db.from('products').select(PROD_COLS).eq('active', true).gt('stock', 0).limit(20)
      // por id exacto o por nombre
      q = /^\d+$/.test(term) ? q.eq('id', Number(term)) : q.ilike('name', `%${term}%`)
      const { data, error } = await q.order('is_bestseller', { ascending: false }).order('name')
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true, rows: data || [] })
    }
    if (url.searchParams.get('bestsellers')) {
      const { data, error } = await db.from('products').select(PROD_COLS)
        .eq('active', true).gt('stock', 0).eq('is_bestseller', true)
        .order('bestseller_rank', { ascending: true }).limit(20)
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true, rows: data || [] })
    }
    // por defecto: los slots de una semana
    const week = url.searchParams.get('week') || canaryWeekStart()
    const { data, error } = await db.from('weekly_offers').select(OFFER_SEL).eq('week_start', week)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true, week_start: week, rows: data || [] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

// POST { week_start, slots:[{slot, product_id, discount_pct}] }
// product_id falsy → borra ese slot. Procesa SOLO los slots que llegan.
export async function POST(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ ok: false, error: 'no_autorizado' }, { status: 401 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: 'json_invalido' }, { status: 400 }) }

  const week = String(body?.week_start || '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) return NextResponse.json({ ok: false, error: 'week_start_invalido' }, { status: 400 })
  const slots = Array.isArray(body?.slots) ? body.slots : []
  if (!slots.length) return NextResponse.json({ ok: false, error: 'sin_slots' }, { status: 400 })

  const db = svc()
  const now = new Date().toISOString()
  const toUpsert: any[] = []
  const toDelete: string[] = []

  for (const s of slots) {
    const slot = String(s?.slot || '')
    if (!ALL_SLOTS.includes(slot as any)) return NextResponse.json({ ok: false, error: `slot_invalido:${slot}` }, { status: 400 })
    const pid = Number(s?.product_id)
    if (!pid) { toDelete.push(slot); continue }
    const pct = Number(s?.discount_pct)
    if (!Number.isFinite(pct) || pct < 0 || pct > 90) return NextResponse.json({ ok: false, error: `descuento_invalido:${slot}` }, { status: 400 })
    const win = slotWindowIso(week, slot as any)
    toUpsert.push({ week_start: week, slot, product_id: pid, discount_pct: pct, active: true, starts_at: win.starts_at, ends_at: win.ends_at, updated_at: now })
  }

  try {
    if (toUpsert.length) {
      // valida que los productos existen (mensaje claro en vez de error FK crudo)
      const ids = [...new Set(toUpsert.map((r) => r.product_id))]
      const { data: found } = await db.from('products').select('id').in('id', ids)
      const ok = new Set((found || []).map((p: any) => p.id))
      const missing = ids.filter((id) => !ok.has(id))
      if (missing.length) return NextResponse.json({ ok: false, error: `producto_inexistente:${missing.join(',')}` }, { status: 400 })
      const { error } = await db.from('weekly_offers').upsert(toUpsert, { onConflict: 'week_start,slot' })
      if (error) throw new Error(error.message)
    }
    if (toDelete.length) {
      const { error } = await db.from('weekly_offers').delete().eq('week_start', week).in('slot', toDelete)
      if (error) throw new Error(error.message)
    }
    // devuelve el estado final de la semana
    const { data } = await db.from('weekly_offers').select(OFFER_SEL).eq('week_start', week)
    return NextResponse.json({ ok: true, week_start: week, saved: toUpsert.length, cleared: toDelete.length, rows: data || [] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
