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

// POST { id, status } — cambia el estado de un pedido. Al pasar a 'paid' por
// primera vez (stock_applied=false) descuenta el stock de forma atómica una
// sola vez. Guardado por admin. Devuelve { ok } o { ok:false, error }.
export async function POST(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: 'JSON invalido' }, { status: 400 }) }

  const id = body?.id
  const status = body?.status
  if (!id || !status) return NextResponse.json({ ok: false, error: 'id y status obligatorios' }, { status: 400 })

  const db = svc()

  const { data: order, error: oe } = await db.from('orders')
    .select('id,status,stock_applied').eq('id', id).maybeSingle()
  if (oe) return NextResponse.json({ ok: false, error: oe.message }, { status: 500 })
  if (!order) return NextResponse.json({ ok: false, error: 'pedido_no_encontrado' }, { status: 404 })

  const update: any = { status }

  // Transición a 'paid' sin stock aún aplicado → descontar una sola vez.
  if (status === 'paid' && !order.stock_applied) {
    const { data: lines } = await db.from('order_lines')
      .select('product_id,variant_id,quantity').eq('order_id', id)
    const { error: stockErr } = await db.rpc('process_order_stock', {
      p_lines: (lines || []).map((l: any) => ({ product_id: l.product_id, variant_id: l.variant_id, qty: l.quantity })),
    })
    if (stockErr) {
      const msg = String(stockErr.message || stockErr)
      // No cambiamos el estado si no hay stock para servir el pedido.
      if (msg.includes('INSUFFICIENT_STOCK'))
        return NextResponse.json({ ok: false, error: 'sin_stock' }, { status: 409 })
      return NextResponse.json({ ok: false, error: msg }, { status: 500 })
    }
    update.stock_applied = true
  }

  const { error: ue } = await db.from('orders').update(update).eq('id', id)
  if (ue) return NextResponse.json({ ok: false, error: ue.message }, { status: 500 })

  return NextResponse.json({ ok: true, stock_applied: update.stock_applied ?? order.stock_applied })
}
