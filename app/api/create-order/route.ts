// @ts-nocheck
import{NextResponse}from 'next/server'
import{createClient}from '@supabase/supabase-js'
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function holdedInvoice(order,items,isDistributor){
  const KEY=process.env.HOLDED_API_KEY
  if(!KEY)return
  const serieId=isDistributor?process.env.HOLDED_SERIE_DIST_ID:process.env.HOLDED_SERIE_T_ID
  let contactId=null
  try{
    const r=await fetch('https://api.holded.com/api/invoicing/v1/contacts?page=1&limit=50',{headers:{key:KEY}})
    const list=await r.json()
    const found=Array.isArray(list)?list.find(c=>c.email===order.customer_email):null
    contactId=found?.id||null
  }catch(e){console.error('holded-search:',e.message)}
  if(!contactId){
    try{
      const r=await fetch('https://api.holded.com/api/invoicing/v1/contacts',{method:'POST',headers:{key:KEY,'Content-Type':'application/json'},body:JSON.stringify({name:order.customer_name,email:order.customer_email,phone:order.customer_phone||'',code:order.customer_nif||'',type:'client',address:order.shipping_address||'',city:order.shipping_city||'',postalCode:order.shipping_postal_code||'',province:order.shipping_province||'',countryCode:'ES'})})
      const nc=await r.json();contactId=nc.id||null
      console.log('holded-contact-created:',contactId)
    }catch(e){console.error('holded-contact:',e.message)}
  }
  const holdedItems=items.map(i=>({name:i.name,units:i.qty,subtotal:(i.price*i.qty/1.21).toFixed(2),tax:'21',discount:0}))
  const body={contactId,contactName:order.customer_name,contactCode:order.customer_nif||'',date:Math.floor(Date.now()/1000),notes:'Pedido '+order.order_number,currency:'EUR',items:holdedItems,shippingAddress:order.shipping_address,shippingPostalCode:order.shipping_postal_code,shippingCity:order.shipping_city,shippingProvince:order.shipping_province,shippingCountry:'Espana',...(serieId?{numSerieId:serieId}:{})}
  try{
    const r=await fetch('https://api.holded.com/api/invoicing/v1/documents/invoice',{method:'POST',headers:{key:KEY,'Content-Type':'application/json'},body:JSON.stringify(body)})
    const d=await r.json()
    console.log('holded-invoice:',JSON.stringify(d).slice(0,120))
    return d.id
  }catch(e){console.error('holded-invoice:',e.message)}
}

async function sendEmail(order,items){
  const KEY=process.env.RESEND_API_KEY
  if(!KEY)return
  const rows=items.map(i=>'<tr><td style="padding:8px">'+i.name+'</td><td style="padding:8px;text-align:center">'+i.qty+'</td><td style="padding:8px;text-align:right">'+(i.price*i.qty).toFixed(2)+' €</td></tr>').join('')
  const html='<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#111;padding:20px;text-align:center"><span style="color:#ff1e41;font-size:28px;font-weight:900">BUYMUSCLE</span></div><div style="padding:30px"><h2>Pedido confirmado ✅</h2><p>Hola <strong>'+order.customer_name+'</strong></p><div style="background:#f5f5f5;padding:16px;text-align:center;margin:20px 0"><div style="font-size:12px;color:#999">NÚMERO DE PEDIDO</div><div style="font-size:28px;font-weight:900;color:#ff1e41">'+order.order_number+'</div></div><table style="width:100%;border-collapse:collapse;border:1px solid #eee"><thead><tr style="background:#f5f5f5"><th style="padding:8px;text-align:left">Producto</th><th style="padding:8px">Ud.</th><th style="padding:8px;text-align:right">Total</th></tr></thead><tbody>'+rows+'</tbody></table><div style="text-align:right;margin-top:16px;padding-top:12px;border-top:2px solid #111"><div style="color:#888">IVA 21%: '+Number(order.tax_amount).toFixed(2)+' €</div><div style="color:#888">Envío: '+(Number(order.shipping_cost)>0?Number(order.shipping_cost).toFixed(2)+' €':'GRATIS')+'</div><div style="font-size:22px;font-weight:900;color:#ff1e41">TOTAL: '+Number(order.total).toFixed(2)+' €</div></div><p style="color:#666;margin-top:24px">Entrega estimada: <strong>24-48h</strong> · Dudas: <a href="https://wa.me/34828048310" style="color:#ff1e41">WhatsApp</a></p></div><div style="background:#111;padding:12px;text-align:center"><p style="color:#666;font-size:12px;margin:0">© 2026 BuyMuscle · buymuscle.es</p></div></div>'
  try{
    await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify({from:'BuyMuscle <pedidos@buymuscle.es>',to:[order.customer_email],subject:'✅ Pedido '+order.order_number+' confirmado — BUYMUSCLE',html})})
    console.log('email-sent')
  }catch(e){console.error('email:',e.message)}
}

export async function POST(req){
  try{
    const{items,customer,shipping_cost=0,discount_pct=0}=await req.json()
    if(!items?.length||!customer?.email)return NextResponse.json({error:'Datos incompletos'},{status:400})
    const isDistributor=discount_pct>0
    const num='BM-'+Date.now().toString().slice(-8)
    const s0=items.reduce((s,i)=>s+i.price*i.qty,0)
    const sub=s0-s0*(discount_pct/100)
    const tax=sub*0.21
    const total=sub+tax+Number(shipping_cost)
    const{data:order,error:e1}=await admin.from('orders').insert({
      order_number:num,
      channel:isDistributor?'online_distributor':'online_retail',
      customer_email:customer.email,customer_name:customer.name,
      customer_phone:customer.phone||null,customer_nif:customer.nif||null,
      shipping_address:customer.address,shipping_city:customer.city,
      shipping_postal_code:customer.postal_code,shipping_province:customer.province||'Las Palmas',
      shipping_country:'Espana',subtotal:sub,tax_amount:tax,
      shipping_cost:Number(shipping_cost),total,discount_pct,
      payment_method:'card',status:'pending',notes:customer.notes||null
    }).select().single()
    if(e1)throw e1
    await admin.from('order_lines').insert(items.map(i=>({order_id:order.id,product_id:i.id,product_name:i.name,quantity:i.qty,unit_price:i.price,tax_rate:21,line_total:i.price*i.qty})))
    for(const i of items){
      const{data:p}=await admin.from('products').select('stock').eq('id',i.id).single()
      if(p)await admin.from('products').update({stock:Math.max(0,p.stock-i.qty)}).eq('id',i.id)
    }
    Promise.all([
      holdedInvoice(order,items,isDistributor).catch(e=>console.error('holded:',e.message)),
      sendEmail(order,items).catch(e=>console.error('email:',e.message))
    ])
    return NextResponse.json({success:true,order_id:order.id,order_number:num})
  }catch(err){
    console.error('create-order:',err.message)
    return NextResponse.json({error:err.message||'Error'},{status:500})
  }
}
