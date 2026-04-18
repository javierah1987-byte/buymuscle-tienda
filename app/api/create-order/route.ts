// @ts-nocheck
import{NextResponse}from 'next/server'
import{createClient}from '@supabase/supabase-js'

const admin=createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ─── HOLDED ────────────────────────────────────────────────
// Series de numeracion en Holded:
//   T    → ventas particulares  (online_retail sin descuento distribuidor)
//   DIST → ventas distribuidores (discount_pct > 0)
// Los IDs se obtienen de: GET https://api.holded.com/api/invoicing/v1/numberseries
// y se guardan en variables de entorno HOLDED_SERIE_T_ID y HOLDED_SERIE_DIST_ID

async function createHoldedInvoice(order, items, isDistributor) {
  const HOLDED_KEY = process.env.HOLDED_API_KEY
  if (!HOLDED_KEY) { console.log('HOLDED: no API key, skipping'); return }

  const serieId = isDistributor
    ? process.env.HOLDED_SERIE_DIST_ID
    : process.env.HOLDED_SERIE_T_ID

  // Buscar o crear contacto en Holded por email
  let contactId = null
  try {
    const searchRes = await fetch(
      'https://api.holded.com/api/invoicing/v1/contacts?page=1&limit=10&contactType=client',
      { headers: { key: HOLDED_KEY, Accept: 'application/json' } }
    )
    const contacts = await searchRes.json()
    // Buscar por email en la lista
    const found = Array.isArray(contacts) ? contacts.find(c =>
      c.email === order.customer_email || (c.emails && c.emails.includes(order.customer_email))
    ) : null
    contactId = found?.id || null
  } catch(e) { console.error('HOLDED contact search:', e.message) }

  // Si no existe el contacto, crearlo
  if (!contactId) {
    try {
      const newContact = await fetch('https://api.holded.com/api/invoicing/v1/contacts', {
        method: 'POST',
        headers: { key: HOLDED_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone || '',
          code: order.customer_nif || '',
          type: 'client',
          address: order.shipping_address || '',
          city: order.shipping_city || '',
          postalCode: order.shipping_postal_code || '',
          province: order.shipping_province || 'Las Palmas',
          countryCode: 'ES'
        })
      })
      const nc = await newContact.json()
      contactId = nc.id || null
      console.log('HOLDED: contacto creado', contactId)
    } catch(e) { console.error('HOLDED create contact:', e.message) }
  }

  // Calcular subtotal sin IVA (los precios del carrito llevan IVA al 21%)
  const holdedItems = items.map(i => ({
    name: i.name,
    units: i.qty,
    subtotal: (i.price * i.qty / 1.21).toFixed(2), // sin IVA
    tax: '21',
    discount: 0
  }))

  const invoiceDate = Math.floor(Date.now() / 1000)

  const body = {
    contactId,
    contactName: order.customer_name,
    contactCode: order.customer_nif || '',
    date: invoiceDate,
    notes: 'Pedido ' + order.order_number + (order.notes ? ' — ' + order.notes : ''),
    currency: 'EUR',
    items: holdedItems,
    shippingAddress: order.shipping_address,
    shippingPostalCode: order.shipping_postal_code,
    shippingCity: order.shipping_city,
    shippingProvince: order.shipping_province,
    shippingCountry: 'España',
    ...(serieId ? { numSerieId: serieId } : {})
  }

  try {
    const res = await fetch('https://api.holded.com/api/invoicing/v1/documents/invoice', {
      method: 'POST',
      headers: { key: HOLDED_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    console.log('HOLDED invoice:', data.id || JSON.stringify(data).slice(0,100))
    return data.id
  } catch(e) {
    console.error('HOLDED create invoice:', e.message)
  }
}

// ─── EMAIL CONFIRMACIÓN ───────────────────────────────────
async function sendEmail(order, items) {
  const KEY = process.env.RESEND_API_KEY
  if (!KEY) return
  const rows = items.map(i =>
    '<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">'+i.name+'</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">'+i.qty+'</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">'+(i.price*i.qty).toFixed(2)+' €</td></tr>'
  ).join('')
  const html = '<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">'+
    '<div style="background:#111;padding:20px;text-align:center"><span style="color:#ff1e41;font-size:28px;font-weight:900">BUYMUSCLE</span></div>'+
    '<div style="padding:30px 20px"><h2>Pedido confirmado ✅</h2><p>Hola <strong>'+order.customer_name+'</strong>, hemos recibido tu pedido.</p>'+
    '<div style="background:#f9f9f9;border:1px solid #e0e0e0;padding:16px;margin:20px 0;text-align:center"><div style="font-size:12px;color:#999;text-transform:uppercase">Número de pedido</div><div style="font-size:28px;font-weight:900;color:#ff1e41">'+order.order_number+'</div></div>'+
    '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f5f5f5"><th style="padding:10px 12px;text-align:left">Producto</th><th style="padding:10px 12px">Ud.</th><th style="padding:10px 12px;text-align:right">Total</th></tr></thead><tbody>'+rows+'</tbody></table>'+
    '<div style="text-align:right;border-top:2px solid #111;padding-top:12px;margin-top:16px"><div style="color:#666">IVA (21%): '+Number(order.tax_amount).toFixed(2)+' €</div><div style="color:#666">Envío: '+(Number(order.shipping_cost)>0?Number(order.shipping_cost).toFixed(2)+' €':'GRATIS')+'</div><div style="font-size:22px;font-weight:900;color:#ff1e41">TOTAL: '+Number(order.total).toFixed(2)+' €</div></div>'+
    '<p style="color:#666;font-size:14px;margin-top:24px">Entrega estimada: <strong>24-48h</strong>. ¿Dudas? <a href="https://wa.me/34828048310" style="color:#ff1e41">WhatsApp</a></p></div>'+
    '<div style="background:#111;padding:16px;text-align:center"><p style="color:#666;font-size:12px;margin:0">© 2026 BuyMuscle · <a href="https://buymuscle.es" style="color:#ff1e41">buymuscle.es</a></p></div></body>'
  try {
    await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},
      body:JSON.stringify({ from:'BuyMuscle <pedidos@buymuscle.es>', to:[order.customer_email], subject:'✅ Pedido '+order.order_number+' — BUYMUSCLE', html })
    })
  } catch(e){ console.error('Email error:',e.message) }
}

// ─── MAIN POST ────────────────────────────────────────────
export async function POST(req) {
  try {
    const{items,customer,shipping_cost=0,discount_pct=0}=await req.json()
    if(!items?.length||!customer?.email)return NextResponse.json({error:'Datos incompletos'},{status:400})

    const num='BM-'+Date.now().toString().slice(-8)
    const s0=items.reduce((s,i)=>s+i.price*i.qty,0)
    const sub=s0-s0*(discount_pct/100)
    const tax=sub*0.21
    const total=sub+tax+Number(shipping_cost)
    const isDistributor = discount_pct > 0

    const{data:order,error:e1}=await admin.from('orders').insert({
      order_number:num, channel: isDistributor ? 'distributor' : 'online_retail',
      customer_email:customer.email, customer_name:customer.name,
      customer_phone:customer.phone||null, customer_nif:customer.nif||null,
      shipping_address:customer.address, shipping_city:customer.city,
      shipping_postal_code:customer.postal_code, shipping_province:customer.province||'Las Palmas',
      shipping_country:'Espana', subtotal:sub, tax_amount:tax,
      shipping_cost:Number(shipping_cost), total, discount_pct,
      payment_method:'card', status:'pending', notes:customer.notes||null
    }).select().single()
    if(e1) throw e1

    await admin.from('order_lines').insert(items.map(i=>({
      order_id:order.id, product_id:i.id, product_name:i.name,
      quantity:i.qty, unit_price:i.price, tax_rate:21, line_total:i.price*i.qty
    })))

    for(const i of items){
      const{data:p}=await admin.from('products').select('stock').eq('id',i.id).single()
      if(p) await admin.from('products').update({stock:Math.max(0,p.stock-i.qty)}).eq('id',i.id)
    }

    // Holded + Email en paralelo (no bloquean la respuesta)
    Promise.all([
      createHoldedInvoice(order, items, isDistributor).catch(e=>console.error('holded:',e)),
      sendEmail(order, items).catch(e=>console.error('email:',e))
    ])

    return NextResponse.json({success:true,order_id:order.id,order_number:num})
  } catch(err) {
    console.error('create-order:',err.message)
    return NextResponse.json({error:err.message||'Error'},{status:500})
  }
}
