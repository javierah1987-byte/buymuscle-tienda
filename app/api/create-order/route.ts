// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ─── EMAIL CONFIRMACIÓN (Resend) ─────────────────────────────────────────
async function sendEmail(order, items) {
  const KEY = process.env.RESEND_API_KEY
  if (!KEY) { console.log('email: sin RESEND_API_KEY'); return }

  const rows = items.map(i =>
    `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#444">${i.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;color:#666">${i.qty}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700">${(i.price*i.qty).toFixed(2)} €</td>
    </tr>`
  ).join('')

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;background:white">
  <!-- Header -->
  <div style="background:#111;padding:24px 32px;text-align:center">
    <div style="color:#ff1e41;font-size:32px;font-weight:900;letter-spacing:2px">BUYMUSCLE</div>
    <div style="color:#555;font-size:12px;margin-top:4px">buymuscle.es · Las Palmas de Gran Canaria</div>
  </div>
  <!-- Body -->
  <div style="padding:32px">
    <h2 style="margin:0 0 8px;font-size:22px;color:#111">¡Pedido confirmado! ✅</h2>
    <p style="color:#555;margin:0 0 24px">Hola <strong>${order.customer_name}</strong>, hemos recibido tu pedido correctamente.</p>
    
    <!-- Numero pedido -->
    <div style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:4px;padding:20px;text-align:center;margin-bottom:24px">
      <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Número de pedido</div>
      <div style="font-size:32px;font-weight:900;color:#ff1e41">${order.order_number}</div>
      <div style="font-size:12px;color:#aaa;margin-top:4px">${new Date(order.created_at).toLocaleDateString('es-ES',{day:'2-digit',month:'long',year:'numeric'})}</div>
    </div>

    <!-- Productos -->
    <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;color:#888">Productos</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
      <thead>
        <tr style="background:#f5f5f5">
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#999">Producto</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#999">Ud.</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#999">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <!-- Totales -->
    <div style="border-top:2px solid #111;padding-top:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="color:#888;font-size:13px">Subtotal</span>
        <span style="color:#888;font-size:13px">${Number(order.subtotal).toFixed(2)} €</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="color:#888;font-size:13px">IVA (21%)</span>
        <span style="color:#888;font-size:13px">${Number(order.tax_amount).toFixed(2)} €</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:16px">
        <span style="color:#888;font-size:13px">Envío</span>
        <span style="color:#888;font-size:13px">${Number(order.shipping_cost)>0?Number(order.shipping_cost).toFixed(2)+' €':'GRATIS'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:22px;font-weight:900;color:#ff1e41">
        <span>TOTAL</span>
        <span>${Number(order.total).toFixed(2)} €</span>
      </div>
    </div>

    <!-- Dirección envío -->
    ${order.shipping_address ? `
    <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-left:3px solid #ff1e41">
      <div style="font-size:11px;color:#999;text-transform:uppercase;margin-bottom:8px">Dirección de envío</div>
      <div style="color:#444;font-size:13px;line-height:1.8">
        ${order.customer_name}<br>
        ${order.shipping_address}<br>
        ${order.shipping_postal_code} ${order.shipping_city}<br>
        ${order.shipping_province}
      </div>
    </div>` : ''}

    <p style="margin-top:24px;color:#666;font-size:13px">
      📦 Entrega estimada: <strong>24-48 horas laborables</strong><br>
      ¿Tienes alguna duda? Escríbenos por 
      <a href="https://wa.me/34828048310" style="color:#ff1e41;font-weight:700">WhatsApp</a> o responde a este email.
    </p>
  </div>
  <!-- Footer -->
  <div style="background:#111;padding:20px 32px;text-align:center">
    <p style="color:#555;font-size:11px;margin:0">© 2026 BuyMuscle · <a href="https://buymuscle.es" style="color:#ff1e41">buymuscle.es</a></p>
  </div>
</div>
</body></html>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'BuyMuscle <pedidos@buymuscle.es>',
        to: [order.customer_email],
        subject: `✅ Pedido ${order.order_number} confirmado — BUYMUSCLE`,
        html
      })
    })
    const d = await res.json()
    console.log('email-sent:', d.id || JSON.stringify(d).slice(0,80))
  } catch(e) { console.error('email-error:', e.message) }
}

// ─── WHATSAPP NOTIFICACIÓN ADMIN (360Dialog) ──────────────────────────────
async function sendWhatsApp(order, items) {
  const KEY = process.env.WHATSAPP_360DIALOG_KEY
  const PHONE = process.env.WHATSAPP_ADMIN_PHONE // ej: 34628048310
  if (!KEY || !PHONE) { console.log('wa: sin credenciales'); return }

  const itemsList = items.map(i => `• ${i.name} x${i.qty} — ${(i.price*i.qty).toFixed(2)}€`).join('\n')
  const msg = `🛒 *NUEVO PEDIDO BUYMUSCLE*\n\n*${order.order_number}*\nCliente: ${order.customer_name}\nEmail: ${order.customer_email}\n\nProductos:\n${itemsList}\n\n💰 *TOTAL: ${Number(order.total).toFixed(2)} €*\nPago: ${order.payment_method || 'online'}`

  try {
    await fetch(`https://waba.360dialog.io/v1/messages`, {
      method: 'POST',
      headers: { 'D360-API-KEY': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: PHONE,
        type: 'text',
        text: { body: msg }
      })
    })
    console.log('whatsapp-sent to admin')
  } catch(e) { console.error('wa-error:', e.message) }
}

// ─── HOLDED FACTURA ───────────────────────────────────────────────────────
async function holdedInvoice(order, items, isDistributor) {
  const KEY = process.env.HOLDED_API_KEY
  if (!KEY) return
  const serieId = isDistributor ? process.env.HOLDED_SERIE_DIST_ID : process.env.HOLDED_SERIE_T_ID
  let contactId = null
  try {
    const r = await fetch('https://api.holded.com/api/invoicing/v1/contacts?page=1&limit=50', { headers: { key: KEY } })
    const list = await r.json()
    const found = Array.isArray(list) ? list.find(c => c.email === order.customer_email) : null
    contactId = found?.id || null
  } catch(e) { console.error('holded-search:', e.message) }
  if (!contactId) {
    try {
      const r = await fetch('https://api.holded.com/api/invoicing/v1/contacts', {
        method: 'POST',
        headers: { key: KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: order.customer_name, email: order.customer_email, phone: order.customer_phone||'', code: order.customer_nif||'', type: 'client', address: order.shipping_address||'', city: order.shipping_city||'', postalCode: order.shipping_postal_code||'', province: order.shipping_province||'', countryCode: 'ES' })
      })
      const nc = await r.json(); contactId = nc.id || null
    } catch(e) { console.error('holded-contact:', e.message) }
  }
  const holdedItems = items.map(i => ({ name: i.name, units: i.qty, subtotal: (i.price*i.qty/1.21).toFixed(2), tax: '21', discount: 0 }))
  const body = { contactId, contactName: order.customer_name, contactCode: order.customer_nif||'', date: Math.floor(Date.now()/1000), notes: 'Pedido '+order.order_number, currency: 'EUR', items: holdedItems, shippingAddress: order.shipping_address, shippingPostalCode: order.shipping_postal_code, shippingCity: order.shipping_city, shippingProvince: order.shipping_province, shippingCountry: 'Espana', ...(serieId ? { numSerieId: serieId } : {}) }
  try {
    const r = await fetch('https://api.holded.com/api/invoicing/v1/documents/invoice', { method: 'POST', headers: { key: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json()
    console.log('holded-invoice:', JSON.stringify(d).slice(0,100))
  } catch(e) { console.error('holded-invoice:', e.message) }
}

// ─── MAIN POST ────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const { items, customer, shipping_cost = 0, discount_pct = 0 } = await req.json()
    if (!items?.length || !customer?.email) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })

    const isDistributor = discount_pct > 0
    const num = 'BM-' + Date.now().toString().slice(-8)
    const s0 = items.reduce((s, i) => s + i.price * i.qty, 0)
    const sub = s0 - s0 * (discount_pct / 100)
    const tax = sub * 0.21
    const total = sub + tax + Number(shipping_cost)

    const { data: order, error: e1 } = await admin.from('orders').insert({
      order_number: num,
      channel: isDistributor ? 'online_distributor' : 'online_retail',
      customer_email: customer.email,
      customer_name: customer.name,
      customer_phone: customer.phone || null,
      customer_nif: customer.nif || null,
      shipping_address: customer.address,
      shipping_city: customer.city,
      shipping_postal_code: customer.postal_code,
      shipping_province: customer.province || 'Las Palmas',
      shipping_country: 'Espana',
      subtotal: sub, tax_amount: tax, shipping_cost: Number(shipping_cost),
      total, discount_pct, payment_method: 'card', status: 'pending',
      notes: customer.notes || null
    }).select().single()

    if (e1) throw e1

    await admin.from('order_lines').insert(
      items.map(i => ({ order_id: order.id, product_id: i.id, product_name: i.name, quantity: i.qty, unit_price: i.price, tax_rate: 21, line_total: i.price * i.qty }))
    )

    for (const i of items) {
      const { data: p } = await admin.from('products').select('stock').eq('id', i.id).single()
      if (p) await admin.from('products').update({ stock: Math.max(0, p.stock - i.qty) }).eq('id', i.id)
    }

    // Ejecutar en paralelo: email cliente + WhatsApp admin + Holded factura
    Promise.all([
      sendEmail(order, items).catch(e => console.error('email:', e.message)),
      sendWhatsApp(order, items).catch(e => console.error('wa:', e.message)),
      holdedInvoice(order, items, isDistributor).catch(e => console.error('holded:', e.message))
    ])

    return NextResponse.json({ success: true, order_id: order.id, order_number: num })
  } catch(err) {
    console.error('create-order:', err.message)
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 })
  }
}
