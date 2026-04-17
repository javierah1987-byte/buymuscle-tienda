// @ts-nocheck
import{NextResponse}from 'next/server'
import{createClient}from '@supabase/supabase-js'

const admin=createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function sendConfirmationEmail(order, items) {
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) return
  const itemsHtml = items.map(i=>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">${(i.price*i.qty).toFixed(2)} €</td>
    </tr>`
  ).join('')
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#111;padding:20px;text-align:center">
    <span style="color:#ff1e41;font-size:28px;font-weight:900;letter-spacing:2px">BUYMUSCLE</span>
  </div>
  <div style="padding:30px 20px">
    <h2 style="color:#111;margin-bottom:8px">Pedido confirmado ✅</h2>
    <p style="color:#666">Hola <strong>${order.customer_name}</strong>, hemos recibido tu pedido correctamente.</p>
    <div style="background:#f9f9f9;border:1px solid #e0e0e0;padding:16px;margin:20px 0;text-align:center">
      <div style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Número de pedido</div>
      <div style="font-size:28px;font-weight:900;color:#ff1e41;letter-spacing:2px">${order.order_number}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <thead>
        <tr style="background:#f5f5f5">
          <th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase">Producto</th>
          <th style="padding:10px 12px;text-align:center;font-size:12px;text-transform:uppercase">Ud.</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="text-align:right;border-top:2px solid #111;padding-top:12px">
      <div style="font-size:14px;color:#666;margin-bottom:4px">Subtotal: ${Number(order.subtotal).toFixed(2)} €</div>
      <div style="font-size:14px;color:#666;margin-bottom:4px">IVA (21%): ${Number(order.tax_amount).toFixed(2)} €</div>
      <div style="font-size:14px;color:#666;margin-bottom:8px">Envío: ${Number(order.shipping_cost)>0?Number(order.shipping_cost).toFixed(2)+' €':'GRATIS'}</div>
      <div style="font-size:22px;font-weight:900;color:#ff1e41">TOTAL: ${Number(order.total).toFixed(2)} €</div>
    </div>
    <div style="background:#f9f9f9;border:1px solid #e0e0e0;padding:16px;margin:20px 0">
      <h3 style="margin:0 0 10px;font-size:14px;text-transform:uppercase">Dirección de envío</h3>
      <p style="margin:0;color:#555;line-height:1.8">
        ${order.shipping_address}<br>
        ${order.shipping_city}, ${order.shipping_postal_code}<br>
        ${order.shipping_province}, España
      </p>
    </div>
    <p style="color:#666;font-size:14px">Recibirás una notificación cuando tu pedido sea enviado. Tiempo estimado de entrega: <strong>24-48 horas</strong>.</p>
    <p style="color:#999;font-size:12px">¿Tienes alguna pregunta? Contáctanos en <a href="https://wa.me/34828048310" style="color:#ff1e41">WhatsApp</a> o escríbenos a <a href="mailto:info@buymuscle.es" style="color:#ff1e41">info@buymuscle.es</a></p>
  </div>
  <div style="background:#111;padding:16px;text-align:center">
    <p style="color:#666;font-size:12px;margin:0">© 2026 BuyMuscle · Las Palmas de Gran Canaria · <a href="https://buymuscle.es" style="color:#ff1e41">buymuscle.es</a></p>
  </div>
</body></html>`
  try {
    await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{'Authorization':'Bearer '+RESEND_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({
        from:'BuyMuscle <pedidos@buymuscle.es>',
        to:[order.customer_email],
        subject:'✅ Pedido '+order.order_number+' confirmado — BUYMUSCLE',
        html
      })
    })
  } catch(e){ console.error('Email error:',e.message) }
}

export async function POST(req){
  try{
    const{items,customer,shipping_cost=0,discount_pct=0}=await req.json()
    if(!items?.length||!customer?.email)return NextResponse.json({error:'Datos incompletos'},{status:400})
    const num='BM-'+Date.now().toString().slice(-8)
    const s0=items.reduce((s,i)=>s+i.price*i.qty,0)
    const sub=s0-s0*(discount_pct/100)
    const tax=sub*0.21
    const total=sub+tax+Number(shipping_cost)
    const{data:order,error:e1}=await admin.from('orders').insert({
      order_number:num,channel:'online_retail',
      customer_email:customer.email,customer_name:customer.name,
      customer_phone:customer.phone||null,customer_nif:customer.nif||null,
      shipping_address:customer.address,shipping_city:customer.city,
      shipping_postal_code:customer.postal_code,shipping_province:customer.province||'Las Palmas',
      shipping_country:'Espana',subtotal:sub,tax_amount:tax,
      shipping_cost:Number(shipping_cost),total,discount_pct,
      payment_method:'card',status:'pending',notes:customer.notes||null
    }).select().single()
    if(e1){console.error('ORDER_ERR:',JSON.stringify(e1));throw e1}
    await admin.from('order_lines').insert(items.map(i=>({
      order_id:order.id,product_id:i.id,product_name:i.name,
      quantity:i.qty,unit_price:i.price,tax_rate:21,line_total:i.price*i.qty
    })))
    for(const i of items){
      const{data:p}=await admin.from('products').select('stock').eq('id',i.id).single()
      if(p)await admin.from('products').update({stock:Math.max(0,p.stock-i.qty)}).eq('id',i.id)
    }
    // Enviar email de confirmación (no bloqueante)
    sendConfirmationEmail(order, items).catch(e=>console.error('email fail:',e))
    return NextResponse.json({success:true,order_id:order.id,order_number:num})
  }catch(err){
    console.error('create-order error:',err.message)
    return NextResponse.json({error:err.message||'Error'},{status:500})
  }
}
