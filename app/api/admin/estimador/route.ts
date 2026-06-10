// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const DAY = 24 * 60 * 60 * 1000
const WEEK = 7 * DAY

// GET /api/admin/estimador?threshold=5&weeks=2
// Estimado de reposición + alertas de tendencia. SOLO LECTURA: no escribe nada.
//
// Fase fría (poco histórico de ventas) → lista principal de "stock bajo".
// Fase con datos → además "pedido sugerido" = media_semanal * horizonte - stock,
// y alertas de tendencia (semana vs semanas previas, mes vs meses previos).
export async function GET(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const threshold = Math.max(0, parseInt(searchParams.get('threshold') || '5', 10) || 5)
  const horizonWeeks = Math.max(1, parseInt(searchParams.get('weeks') || '2', 10) || 2)

  const db = svc()
  const now = Date.now()

  // 1. Productos activos (stock actual)
  const { data: products, error: pe } = await db.from('products')
    .select('id,name,stock,active').eq('active', true)
  if (pe) return NextResponse.json({ ok: false, error: pe.message }, { status: 500 })

  // 2. Ventas pagadas de los últimos ~180 días con sus líneas
  const since = new Date(now - 180 * DAY).toISOString()
  const { data: orders, error: oe } = await db.from('orders')
    .select('id,created_at,order_lines(product_id,quantity)')
    .eq('status', 'paid').gte('created_at', since)
  if (oe) return NextResponse.json({ ok: false, error: oe.message }, { status: 500 })

  // Aplanar líneas con su fecha
  const sales = []
  let firstSale = now
  for (const o of (orders || [])) {
    const t = new Date(o.created_at).getTime()
    if (t < firstSale) firstSale = t
    for (const l of (o.order_lines || [])) {
      sales.push({ product_id: l.product_id, qty: Number(l.quantity) || 0, t })
    }
  }

  // Semanas con datos en las últimas 8 (para decidir fase)
  const weekBuckets = new Set()
  for (const s of sales) {
    const wk = Math.floor((now - s.t) / WEEK)
    if (wk < 8) weekBuckets.add(wk)
  }
  const weeksWithData = weekBuckets.size
  const coldPhase = weeksWithData < 4

  // Semanas "rastreadas" para la media (desde la 1ª venta, máx 8)
  const weeksSinceStart = Math.max(1, Math.min(8, Math.ceil((now - firstSale) / WEEK)))

  // Agregados por producto
  const byProduct = new Map() // id -> { last8w, prevWeeks:[7], last30, prev5m:[5] }
  const bump = (id, field, val) => {
    const r = byProduct.get(id) || { last8w: 0, week: Array(8).fill(0), month: Array(6).fill(0) }
    if (field) r[field] += val
    byProduct.set(id, r)
  }
  for (const s of sales) {
    const wk = Math.floor((now - s.t) / WEEK)
    const mo = Math.floor((now - s.t) / (30 * DAY))
    const r = byProduct.get(s.product_id) || { last8w: 0, week: Array(8).fill(0), month: Array(6).fill(0) }
    if (wk < 8) { r.last8w += s.qty; r.week[wk] += s.qty }
    if (mo < 6) { r.month[mo] += s.qty }
    byProduct.set(s.product_id, r)
  }

  const prodMap = new Map((products || []).map(p => [p.id, p]))

  // 3. Stock bajo (siempre)
  const lowStock = (products || [])
    .filter(p => Number(p.stock) < threshold)
    .map(p => ({ id: p.id, name: p.name, stock: Number(p.stock), sold8w: byProduct.get(p.id)?.last8w || 0 }))
    .sort((a, b) => a.stock - b.stock)

  // 4. Pedido sugerido (solo fase con datos)
  let suggested = []
  if (!coldPhase) {
    suggested = (products || []).map(p => {
      const agg = byProduct.get(p.id)
      const weeklyAvg = agg ? agg.last8w / weeksSinceStart : 0
      const need = Math.max(0, Math.round(weeklyAvg * horizonWeeks) - Number(p.stock))
      return { id: p.id, name: p.name, stock: Number(p.stock), weeklyAvg: Math.round(weeklyAvg * 10) / 10, suggested: need }
    }).filter(x => x.suggested > 0).sort((a, b) => b.suggested - a.suggested)
  }

  // 5. Tendencias (solo fase con datos): última semana vs media de previas, e
  //    último mes vs media de previos. Solo cambios significativos (±40%, mín 3 uds).
  const trends = { week: [], month: [] }
  const MIN_UNITS = 3, UP = 1.4, DOWN = 0.6
  if (!coldPhase) {
    for (const [id, r] of byProduct) {
      const name = prodMap.get(id)?.name || ('#' + id)
      // Semana: week[0] = última semana; media de week[1..7]
      const lastW = r.week[0]
      const prevW = r.week.slice(1)
      const avgW = prevW.reduce((s, n) => s + n, 0) / (prevW.length || 1)
      if (Math.max(lastW, avgW) >= MIN_UNITS) {
        if (avgW > 0 && lastW >= avgW * UP) trends.week.push({ id, name, dir: 'up', last: lastW, avg: Math.round(avgW * 10) / 10 })
        else if (lastW <= avgW * DOWN && avgW >= MIN_UNITS) trends.week.push({ id, name, dir: 'down', last: lastW, avg: Math.round(avgW * 10) / 10 })
      }
      // Mes: month[0] = último mes; media de month[1..5]
      const lastM = r.month[0]
      const prevM = r.month.slice(1)
      const avgM = prevM.reduce((s, n) => s + n, 0) / (prevM.length || 1)
      if (Math.max(lastM, avgM) >= MIN_UNITS) {
        if (avgM > 0 && lastM >= avgM * UP) trends.month.push({ id, name, dir: 'up', last: lastM, avg: Math.round(avgM * 10) / 10 })
        else if (lastM <= avgM * DOWN && avgM >= MIN_UNITS) trends.month.push({ id, name, dir: 'down', last: lastM, avg: Math.round(avgM * 10) / 10 })
      }
    }
    trends.week.sort((a, b) => (b.last - b.avg) - (a.last - a.avg))
    trends.month.sort((a, b) => (b.last - b.avg) - (a.last - a.avg))
  }

  return NextResponse.json({
    ok: true,
    phase: coldPhase ? 'cold' : 'data',
    params: { threshold, horizonWeeks },
    meta: { weeksWithData, totalProducts: (products || []).length, totalSalesLines: sales.length },
    lowStock,
    suggested,
    trends,
  })
}
