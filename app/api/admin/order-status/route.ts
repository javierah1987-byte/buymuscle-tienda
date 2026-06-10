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
    .select('id,status,stock_applied,customer_email,customer_name,order_number,tracking_number,total').eq('id', id).maybeSingle()
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

  // Aviso de envío al cliente (best-effort: nunca rompe el cambio de estado).
  if (status === 'shipped' && order.status !== 'shipped') {
    try { await sendShippedEmail(order) } catch (e) { console.error('shipped email error:', e) }
  }

  return NextResponse.json({ ok: true, stock_applied: update.stock_applied ?? order.stock_applied })
}

// Email "pedido enviado" vía Resend, mismo estilo de marca que el de
// confirmación de lib/orderCore.ts. Best-effort: si falta la key o falla
// la petición, no pasa nada.
async function sendShippedEmail(order: any) {
  const key = process.env.RESEND_API_KEY
  if (!key || !order?.customer_email) return
  const tracking = order.tracking_number
    ? '<div style="background:#f8f8f8;padding:16px;margin:20px 0"><p style="margin:0;font-size:14px"><strong>Número de seguimiento:</strong> <span style="color:#ff1e41;font-weight:700">' + order.tracking_number + '</span></p></div>'
    : ''
  const html = '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto"><div style="background:#ff1e41;padding:24px 32px;text-align:center"><h1 style="color:white;margin:0;font-size:28px;font-weight:900;font-style:italic">BUYMUSCLE</h1></div><div style="padding:32px"><h2>🚚 ¡Tu pedido está en camino!</h2><p>Hola <strong>' + (order.customer_name || 'cliente') + '</strong>, tu pedido ya ha salido de nuestro almacén.</p><div style="background:#f8f8f8;padding:16px;margin:20px 0"><p style="margin:0;font-size:18px;font-weight:700">Número: <span style="color:#ff1e41">' + order.order_number + '</span></p>' + (order.total != null ? '<p style="margin:8px 0 0;font-size:14px;color:#666">Total: <strong>' + Number(order.total).toFixed(2) + ' €</strong></p>' : '') + '</div>' + tracking + '<p style="color:#666;font-size:13px">Entrega estimada 24-48h laborables. Si tienes cualquier duda escríbenos por WhatsApp al <strong>+34 828 048 310</strong> o a <a href="mailto:tienda@buymuscle.es" style="color:#ff1e41">tienda@buymuscle.es</a>.</p><a href="https://wa.me/34828048310?text=Pedido+' + encodeURIComponent(order.order_number || '') + '" style="display:inline-block;margin-top:16px;background:#25d366;color:white;padding:12px 24px;text-decoration:none;font-weight:700">💬 WhatsApp</a></div><div style="background:#111;padding:16px 32px;text-align:center"><p style="color:#666;font-size:12px;margin:0">&copy; 2025 BuyMuscle · Alcalde Manuel Amador Rodríguez 23, Telde</p></div></body></html>'
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'BuyMuscle <pedidos@buymuscle.es>',
      to: order.customer_email,
      subject: '🚚 Tu pedido ' + order.order_number + ' está en camino',
      html,
    }),
  }).catch(console.error)
}
