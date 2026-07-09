// @ts-nocheck
// Núcleo de creación de pedidos compartido por /api/create-order (checkout web)
// y /api/paypal/capture (pago verificado). Centraliza precios autoritativos,
// desglose de IGIC, descuento de stock atómico, cupones, CRM y notificaciones.
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { SITE_URL } from './site'

export const IGIC = 0.07           // Canarias: IGIC general 7%
export const SHIP_FREE_FROM = 50
export const SHIP_COST = 4.90

// El order_number actúa como token de capacidad (se consulta el pedido por él
// en /api/order-lookup), así que debe ser IMPREDECIBLE. Math.random no sirve:
// 10 bytes aleatorios criptográficos en base32 → inenumerable.
export function genId(prefix = 'BM'){
  return prefix + '-' + crypto.randomBytes(10).toString('hex').toUpperCase()
}
export function round2(n){ return Math.round((Number(n) + Number.EPSILON) * 100) / 100 }

export function adminDb(){
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth:{ autoRefreshToken:false, persistSession:false } }
  )
}

// ── EMAIL (Resend) ───────────────────────────────────────
async function sendEmail(order, lines){
  const key = process.env.RESEND_API_KEY
  if(!key || !order.customer_email) return
  const rows = lines.map(l => '<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">'+(l.product_name||'Producto')+'</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">'+(l.qty||1)+'</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">'+round2(l.unit_price).toFixed(2)+' €</td></tr>').join('')
  // Los pedidos 'pending' (transferencia/efectivo) aún no están pagados:
  // el email no debe decir "confirmado" hasta que el pago se verifique.
  const paid = order.status === 'paid'
  const subject = paid
    ? 'Pedido '+order.order_number+' confirmado ✔️'
    : 'Pedido '+order.order_number+' recibido — pendiente de pago'
  const heading = paid ? 'Pedido confirmado ✔️' : 'Pedido recibido — pendiente de pago'
  const intro = paid
    ? 'gracias por tu pedido.'
    : 'hemos recibido tu pedido. Está <strong>pendiente de pago</strong>: en breve recibirás las instrucciones para completar la transferencia.'
  const html = '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto"><div style="background:#ff1e41;padding:24px 32px;text-align:center"><h1 style="color:white;margin:0;font-size:28px;font-weight:900;font-style:italic">BUYMUSCLE</h1></div><div style="padding:32px"><h2>'+heading+'</h2><p>Hola <strong>'+(order.customer_name||'cliente')+'</strong>, '+intro+'</p><div style="background:#f8f8f8;padding:16px;margin:20px 0"><p style="margin:0;font-size:18px;font-weight:700">Número: <span style="color:#ff1e41">'+order.order_number+'</span></p></div><table style="width:100%;border-collapse:collapse;margin:16px 0"><thead><tr style="background:#f0f0f0"><th style="padding:10px 12px;text-align:left">Producto</th><th style="padding:10px 12px;text-align:center">Cant.</th><th style="padding:10px 12px;text-align:right">Precio</th></tr></thead><tbody>'+rows+'</tbody></table><div style="border-top:2px solid #ff1e41;padding-top:16px;text-align:right"><p style="margin:4px 0;font-size:18px;font-weight:700">Total: '+round2(order.total).toFixed(2)+' €</p><p style="margin:4px 0;color:#888;font-size:13px">IGIC incluido · Envío estimado 24-48h</p></div><div style="margin:24px 0;padding:16px;background:#f8f8f8"><p style="margin:0;font-size:13px;color:#666">📍 <strong>Dirección:</strong> '+(order.shipping_address||'')+', '+(order.shipping_city||'')+' '+(order.shipping_postal_code||'')+'</p></div><p style="color:#666;font-size:13px">Dudas: <strong>+34 828 048 310</strong> o <a href="mailto:tienda@buymuscle.es" style="color:#ff1e41">tienda@buymuscle.es</a></p><a href="'+SITE_URL+'/mi-cuenta" style="display:inline-block;margin-top:16px;background:#ff1e41;color:white;padding:12px 24px;text-decoration:none;font-weight:700">Ver mi cuenta</a></div><div style="background:#111;padding:16px 32px;text-align:center"><p style="color:#666;font-size:12px;margin:0">&copy; 2025 BuyMuscle · Alcalde Manuel Amador Rodríguez 23, Telde</p></div></body></html>'
  await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from:'BUYMUSCLE <pedidos@buymuscle.es>',to:order.customer_email,subject,html})}).catch(console.error)
}

// ── WHATSAPP (360dialog) ─────────────────────────────────
async function notifyWhatsApp(order){
  const phone = process.env.WHATSAPP_ADMIN_PHONE
  const wkey = process.env.WHATSAPP_360DIALOG_KEY
  if(!phone || !wkey) return
  const NL = String.fromCharCode(10)
  const msg = '*Nuevo pedido BuyMuscle*'+NL+'*Nº:* '+order.order_number+NL+'*Cliente:* '+(order.customer_name||'-')+NL+'*Total:* '+round2(order.total).toFixed(2)+' €'+NL+'*Canal:* '+(order.channel||'web')
  await fetch('https://waba.360dialog.io/v1/messages',{method:'POST',headers:{'D360-API-KEY':wkey,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:phone,type:'text',text:{body:msg}})}).catch(console.error)
}

// ── HOLDED (factura, IGIC 7%) ────────────────────────────
async function createHoldedInvoice(order, lines){
  const key = process.env.HOLDED_API_KEY
  if(!key) return null
  try{
    const isDistrib = (order.channel||'').includes('distributor')
    const serie = isDistrib ? process.env.HOLDED_SERIE_DIST_ID : process.env.HOLDED_SERIE_T_ID
    const cRes = await fetch('https://api.holded.com/api/invoicing/v1/contacts?email='+encodeURIComponent(order.customer_email||''),{headers:{key}})
    const contacts = await cRes.json()
    let contactId = contacts?.[0]?.id
    if(!contactId){
      const nc = await fetch('https://api.holded.com/api/invoicing/v1/contacts',{method:'POST',headers:{key,'Content-Type':'application/json'},body:JSON.stringify({name:order.customer_name||order.customer_email,email:order.customer_email,type:'client'})}).then(r=>r.json())
      contactId = nc?.id
    }
    const inv = {
      contactId,
      date: Math.floor(Date.now()/1000),
      notes: 'Pedido '+order.order_number,
      // Holded espera precio SIN impuesto; nuestros precios llevan IGIC incluido → desglosamos
      items: [
        ...lines.map(l => ({ name: l.product_name||'Producto', units: l.qty||1, subtotal: round2(Number(l.unit_price)/(1+IGIC)), tax: 7 })),
        // Línea de envío: sin ella la factura quedaba por debajo de lo cobrado.
        ...(Number(order.shipping_cost) > 0
          ? [{ name: 'Gastos de envío', units: 1, subtotal: round2(Number(order.shipping_cost)/(1+IGIC)), tax: 7 }]
          : []),
      ],
      ...(serie && { numSerieId: serie })
    }
    const invRes = await fetch('https://api.holded.com/api/invoicing/v1/documents/invoice',{method:'POST',headers:{key,'Content-Type':'application/json'},body:JSON.stringify(inv)}).then(r=>r.json())
    return invRes?.id || null
  }catch(e){ console.error('holded error:', e); return null }
}

// Calcula líneas y totales autoritativos a partir del carrito del cliente.
// No persiste nada: sirve también para crear la orden de PayPal por el importe correcto.
// Devuelve { ok:false, error } o { ok:true, lines, totals, couponRow, discountPct }.
export async function quoteOrder(db, { items = [], discount_code = '', distributorDiscountPct = 0, distributorLevelId = null }){
  if(!Array.isArray(items) || items.length === 0)
    return { ok:false, error:'empty_cart', status:400 }

  const productIds = [...new Set(items.map(i => Number(i.product_id ?? i.id)).filter(Boolean))]
  const { data: prods } = await db.from('products')
    .select('id,name,price_incl_tax,sale_price,on_sale,active,hide_from_distributors').in('id', productIds)
  const prodMap = new Map((prods||[]).map(p => [p.id, p]))

  // Override de % por producto para el grupo del distribuidor (manda sobre el % general).
  let distOverride = new Map()
  if(distributorLevelId && productIds.length){
    const { data: ov } = await db.from('distributor_product_discounts')
      .select('product_id,discount_pct').eq('level_id', distributorLevelId).in('product_id', productIds)
    distOverride = new Map((ov||[]).map(o => [Number(o.product_id), Number(o.discount_pct)]))
  }

  const variantIds = [...new Set(items.map(i => Number(i.variant_id)).filter(Boolean))]
  let varMap = new Map()
  if(variantIds.length){
    const { data: vars } = await db.from('product_variants')
      .select('id,product_id,price_modifier,active').in('id', variantIds)
    varMap = new Map((vars||[]).map(v => [v.id, v]))
  }

  const lines = []
  for(const it of items){
    const pid = Number(it.product_id ?? it.id)
    const p = prodMap.get(pid)
    if(!p || p.active === false)
      return { ok:false, error:'product_unavailable:'+pid, status:400 }
    // Un distribuidor no puede comprar un producto oculto para distribución
    // (monodosis suelta, otras marcas…), aunque intente forzar el pedido por API.
    if(distributorLevelId && p.hide_from_distributors)
      return { ok:false, error:'no_disponible_distribuidor:'+pid, status:400 }
    const qty = Math.max(1, parseInt(it.qty ?? it.quantity ?? 1))
    let unit = (p.on_sale && p.sale_price) ? Number(p.sale_price) : Number(p.price_incl_tax)
    const vid = Number(it.variant_id) || null
    if(vid && varMap.has(vid)) unit += Number(varMap.get(vid).price_modifier || 0)
    unit = round2(unit)
    // Precio de distribuidor: descuento aplicado en SERVIDOR (autoritativo, nunca del cliente).
    // El % por producto (override del grupo) manda sobre el % general del grupo.
    {
      const dpct = distOverride.has(pid) ? distOverride.get(pid) : distributorDiscountPct
      if(dpct > 0) unit = round2(unit * (1 - dpct/100))
    }
    lines.push({
      product_id: pid,
      variant_id: vid,
      product_name: p.name + (it.variant ? ' – ' + it.variant : ''),
      qty,
      unit_price: unit,
      line_total: round2(unit * qty),
    })
  }

  const subtotalGross = round2(lines.reduce((s, l) => s + l.line_total, 0))

  let discountPct = 0, discountAmt = 0, couponRow = null
  if(discount_code){
    const { data: dc } = await db.from('discount_codes')
      .select('*').eq('code', discount_code).eq('active', true).maybeSingle()
    if(dc){
      const notExpired = !dc.expires_at || new Date(dc.expires_at) > new Date()
      const underMax = !dc.max_uses || (dc.uses || 0) < dc.max_uses
      const meetsMin = !dc.min_order || subtotalGross >= Number(dc.min_order)
      if(notExpired && underMax && meetsMin){
        couponRow = dc
        if(dc.type === 'percent' || dc.type === 'percentage'){
          discountPct = Number(dc.value)
          discountAmt = round2(subtotalGross * (discountPct / 100))
        } else {
          discountAmt = round2(Math.min(Number(dc.value), subtotalGross))
        }
      }
    }
  }

  const afterDiscount = Math.max(0, round2(subtotalGross - discountAmt))
  const shipping = afterDiscount >= SHIP_FREE_FROM ? 0 : SHIP_COST
  const totalGross = round2(afterDiscount + shipping)
  const base = round2(totalGross / (1 + IGIC))
  const taxAmount = round2(totalGross - base)

  return {
    ok:true, lines, couponRow, discountPct,
    totals: { subtotalGross, discountAmt, shipping, totalGross, base, taxAmount },
  }
}

// Comprobación de stock BEST-EFFORT previa a cobrar (líneas de quoteOrder).
// Espeja la semántica de process_order_stock (variant-aware: líneas con variante
// consumen product_variants.stock; sin variante, products.stock) para fallar ANTES
// de capturar en el caso común (qty>stock, agotado). NO es atómica con la captura
// posterior (una carrera puede colarse) → el refund post-captura es la red final.
// Devuelve { ok:true } o { ok:false, error:'sin_stock', status:409, detail }.
export async function checkStock(db, lines){
  const byProduct = new Map()  // product_id -> qty requerida (líneas SIN variante)
  const byVariant = new Map()  // variant_id -> qty requerida
  for(const l of (lines || [])){
    const qty = Number(l.qty) || 0
    if(qty <= 0) continue
    if(l.variant_id) byVariant.set(l.variant_id, (byVariant.get(l.variant_id) || 0) + qty)
    else byProduct.set(l.product_id, (byProduct.get(l.product_id) || 0) + qty)
  }

  if(byProduct.size){
    const ids = [...byProduct.keys()]
    const { data: prods } = await db.from('products').select('id,name,stock').in('id', ids)
    const pmap = new Map((prods || []).map(p => [p.id, p]))
    for(const [pid, need] of byProduct){
      const have = Number(pmap.get(pid)?.stock ?? 0)
      if(have < need)
        return { ok:false, error:'sin_stock', status:409, detail:{ product_id:pid, name:pmap.get(pid)?.name, need, have } }
    }
  }

  if(byVariant.size){
    const ids = [...byVariant.keys()]
    const { data: vars } = await db.from('product_variants').select('id,stock,product_id').in('id', ids)
    const vmap = new Map((vars || []).map(v => [v.id, v]))
    for(const [vid, need] of byVariant){
      const have = Number(vmap.get(vid)?.stock ?? 0)
      if(have < need)
        return { ok:false, error:'sin_stock', status:409, detail:{ variant_id:vid, need, have } }
    }
  }

  return { ok:true }
}

// Persiste el pedido (orders + order_lines), descuenta stock atómicamente,
// actualiza cupón/CRM y dispara notificaciones. Devuelve { ok, order_number, total }
// o { ok:false, error, status }.
// opts: { status='pending', payment_method, paypal_capture_id, channel, customer }
export async function persistOrder(db, body, opts = {}){
  // Idempotencia: si el cliente reenvía el mismo checkout (red móvil, doble
  // clic), la clave única evita un segundo pedido. Respaldada por índice
  // único parcial orders_idempotency_key_uniq.
  const idemKey = typeof body.idempotency_key === 'string' && body.idempotency_key.length >= 8
    ? body.idempotency_key.slice(0, 64) : null
  if(idemKey){
    const { data: existing } = await db.from('orders')
      .select('order_number,total').eq('idempotency_key', idemKey).maybeSingle()
    if(existing) return { ok:true, order_number: existing.order_number, total: Number(existing.total), idempotent:true }
  }

  const quote = await quoteOrder(db, { ...body, distributorDiscountPct: opts.distributorDiscountPct || 0, distributorLevelId: opts.distributorLevelId || null })
  if(!quote.ok) return quote

  const { lines, couponRow, discountPct, totals } = quote
  const customer = opts.customer || body.customer || {}
  const status = opts.status || 'pending'
  const payment_method = opts.payment_method || body.payment_method || 'card'
  const channel = opts.channel || body.channel || 'web'

  const order_number = genId()
  const { data: orderRow, error: orderErr } = await db.from('orders').insert({
    order_number,
    idempotency_key: idemKey,
    channel,
    customer_name: customer.name || null,
    customer_email: customer.email || null,
    customer_phone: customer.phone || null,
    customer_nif: customer.nif || null,
    shipping_address: customer.address || null,
    shipping_city: customer.city || null,
    shipping_postal_code: customer.postal_code || null,
    shipping_province: customer.province || null,
    subtotal: totals.base,
    tax_amount: totals.taxAmount,
    shipping_cost: totals.shipping,
    total: totals.totalGross,
    discount_pct: opts.distributorDiscountPct || discountPct || 0,
    payment_method,
    status,
    paypal_capture_id: opts.paypal_capture_id || null,
    // El stock solo se descuenta cuando el pedido está pagado. Los pendientes
    // (tarjeta/transferencia/efectivo) NO reservan stock hasta confirmarse el
    // pago (se descuenta al marcarlos 'paid' en admin), para que no se pueda
    // agotar inventario sin pagar.
    stock_applied: status === 'paid',
    notes: customer.notes || null,
  }).select().single()
  if(orderErr){
    // Carrera idempotente: dos envíos simultáneos con la misma clave; el índice
    // único frena al segundo → devolvemos el pedido que sí se creó.
    if(idemKey && String(orderErr.code) === '23505' && String(orderErr.message||'').includes('idempotency')){
      const { data: existing } = await db.from('orders')
        .select('order_number,total').eq('idempotency_key', idemKey).maybeSingle()
      if(existing) return { ok:true, order_number: existing.order_number, total: Number(existing.total), idempotent:true }
    }
    throw orderErr
  }
  const orderId = orderRow.id

  const { error: linesErr } = await db.from('order_lines').insert(
    lines.map(l => ({
      order_id: orderId,
      product_id: l.product_id,
      variant_id: l.variant_id || null,
      product_name: l.product_name,
      quantity: l.qty,
      unit_price: l.unit_price,
      tax_rate: 7,
      line_total: l.line_total,
    }))
  )
  if(linesErr){
    await db.from('orders').delete().eq('id', orderId)
    throw linesErr
  }

  // Solo descontar stock si el pedido nace pagado (p. ej. PayPal capturado).
  const stockErr = status === 'paid' ? (await db.rpc('process_order_stock', {
    p_lines: lines.map(l => ({ product_id: l.product_id, variant_id: l.variant_id, qty: l.qty })),
  })).error : null
  if(stockErr){
    await db.from('order_lines').delete().eq('order_id', orderId)
    await db.from('orders').delete().eq('id', orderId)
    const msg = String(stockErr.message || stockErr)
    if(msg.includes('INSUFFICIENT_STOCK'))
      return { ok:false, error:'sin_stock', status:409 }
    throw stockErr
  }

  if(couponRow){
    // Incremento atómico (uses = uses + 1) vía RPC: un update leído-y-escrito
    // permitía superar max_uses con pedidos simultáneos.
    await db.rpc('increment_coupon_uses', { p_id: couponRow.id }).catch(()=>{})
  }

  if(customer.email){
    await db.from('customers').upsert({
      email: customer.email,
      name: customer.name || '',
      phone: customer.phone || '',
      last_order_date: new Date().toISOString(),
    }, { onConflict: 'email' }).catch(()=>{})
    // Si dejó un carrito abandonado registrado, marcarlo recuperado para que
    // el cron no le mande el email de "olvidaste tu carrito" tras comprar.
    await db.from('abandoned_carts')
      .update({ recovered: true })
      .eq('email', String(customer.email).toLowerCase())
      .eq('recovered', false)
      .catch(()=>{})
  }

  const orderObj = { ...orderRow }
  const linesForNotif = lines
  sendEmail(orderObj, linesForNotif)
  notifyWhatsApp(orderObj)
  createHoldedInvoice(orderObj, linesForNotif).then(hid => {
    if(hid) db.from('orders').update({ holded_invoice_id: hid, holded_synced_at: new Date().toISOString() }).eq('id', orderId)
  }).catch(console.error)

  return { ok:true, order_number, total: totals.totalGross }
}
