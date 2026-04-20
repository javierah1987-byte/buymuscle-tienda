// @ts-nocheck
import{NextResponse}from 'next/server'
export const dynamic='force-dynamic'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const H={apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json'}
function genId(){return 'BM-'+Math.random().toString(36).slice(2,10).toUpperCase()}
async function sendEmail(order,items){
  const key=process.env.RESEND_API_KEY
  if(!key||!order.customer_email)return
  const rows=items.map(i=>'<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">'+( i.name||i.product_name||'Producto')+'</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">'+(i.qty||1)+'</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">'+Number(i.price||i.unit_price||0).toFixed(2)+' €</td></tr>').join('')
  const html='<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto"><div style="background:#ff1e41;padding:24px 32px;text-align:center"><h1 style="color:white;margin:0;font-size:28px;font-weight:900;font-style:italic">BUYMUSCLE</h1></div><div style="padding:32px"><h2>Pedido confirmado ✔️</h2><p>Hola <strong>'+(order.customer_name||'cliente')+'</strong>, gracias por tu pedido.</p><div style="background:#f8f8f8;padding:16px;margin:20px 0"><p style="margin:0;font-size:18px;font-weight:700">Número: <span style="color:#ff1e41">'+order.order_number+'</span></p></div><table style="width:100%;border-collapse:collapse;margin:16px 0"><thead><tr style="background:#f0f0f0"><th style="padding:10px 12px;text-align:left">Producto</th><th style="padding:10px 12px;text-align:center">Cant.</th><th style="padding:10px 12px;text-align:right">Precio</th></tr></thead><tbody>'+rows+'</tbody></table><div style="border-top:2px solid #ff1e41;padding-top:16px;text-align:right"><p style="margin:4px 0;font-size:18px;font-weight:700">Total: '+Number(order.total||0).toFixed(2)+' €</p><p style="margin:4px 0;color:#888;font-size:13px">IVA incluido · Envío estimado 24-48h</p></div><div style="margin:24px 0;padding:16px;background:#f8f8f8"><p style="margin:0;font-size:13px;color:#666">📍 <strong>Dirección:</strong> '+(order.shipping_address||'')+', '+(order.shipping_city||'')+' '+(order.shipping_zip||'')+'</p></div><p style="color:#666;font-size:13px">Dudas: <strong>+34 828 048 310</strong> o <a href="mailto:tienda@buymuscle.es" style="color:#ff1e41">tienda@buymuscle.es</a></p><a href="https://buymuscle-tienda.vercel.app/mi-cuenta" style="display:inline-block;margin-top:16px;background:#ff1e41;color:white;padding:12px 24px;text-decoration:none;font-weight:700">Ver mi cuenta</a></div><div style="background:#111;padding:16px 32px;text-align:center"><p style="color:#666;font-size:12px;margin:0">&copy; 2025 BuyMuscle · Alcalde Manuel Amador Rodríguez 23, Telde</p></div></body></html>'
  await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from:'BUYMUSCLE <pedidos@pruebasgrupoaxen.com>',to:order.customer_email,subject:'Pedido '+order.order_number+' confirmado ✔️',html})}).catch(console.error)
}
async function notifyWhatsApp(order){
  const phone=process.env.WHATSAPP_ADMIN_PHONE
  const wkey=process.env.WHATSAPP_360DIALOG_KEY
  if(!phone||!wkey)return
  const NL=String.fromCharCode(10)
  const msg='*Nuevo pedido BuyMuscle*'+NL+'*Nº:* '+order.order_number+NL+'*Cliente:* '+order.customer_name+NL+'*Total:* '+Number(order.total||0).toFixed(2)+' €'+NL+'*Canal:* '+(order.channel||'web')
  await fetch('https://waba.360dialog.io/v1/messages',{method:'POST',headers:{'D360-API-KEY':wkey,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:phone,type:'text',text:{body:msg}})}).catch(console.error)
}
async function createHoldedInvoice(order,items){
  const key=process.env.HOLDED_API_KEY
  if(!key)return null
  try{
    const isDistrib=order.channel?.includes('distributor')
    const serie=isDistrib?process.env.HOLDED_SERIE_DIST_ID:process.env.HOLDED_SERIE_T_ID
    const cRes=await fetch('https://api.holded.com/api/invoicing/v1/contacts?email='+encodeURIComponent(order.customer_email||''),{headers:{key}})
    const contacts=await cRes.json()
    let contactId=contacts?.[0]?.id
    if(!contactId){const nc=await fetch('https://api.holded.com/api/invoicing/v1/contacts',{method:'POST',headers:{key,'Content-Type':'application/json'},body:JSON.stringify({name:order.customer_name||order.customer_email,email:order.customer_email,type:'client'})}).then(r=>r.json());contactId=nc?.id}
    const inv={contactId,date:Math.floor(Date.now()/1000),notes:'Pedido '+order.order_number,items:items.map(i=>({name:i.name||i.product_name||'Producto',units:i.qty||1,subtotal:Number(i.price||i.unit_price||0),tax:21})),...(serie&&{numSerieId:serie})}
    const invRes=await fetch('https://api.holded.com/api/invoicing/v1/documents/invoice',{method:'POST',headers:{key,'Content-Type':'application/json'},body:JSON.stringify(inv)}).then(r=>r.json())
    return invRes?.id||null
  }catch(e){console.error('holded error:',e);return null}
}
export async function POST(req){
  try{
    const body=await req.json()
    const{customer_name,customer_email,customer_phone,shipping_address,shipping_city,shipping_zip,payment_method,items,subtotal,tax,shipping,total,discount_code,discount_amount,channel}=body
    const order_number=genId()
    const orderRes=await fetch(S+'/rest/v1/orders',{method:'POST',headers:{...H,'Prefer':'return=representation'},body:JSON.stringify({order_number,customer_name,customer_email,customer_phone,shipping_address,shipping_city,shipping_zip,payment_method,subtotal,tax,shipping:shipping||0,total,discount_code:discount_code||null,discount_amount:discount_amount||0,status:'pending',channel:channel||'online_retail'})})
    const orderData=await orderRes.json()
    const orderId=Array.isArray(orderData)?orderData[0]?.id:orderData?.id
    if(orderId&&items?.length){
      await fetch(S+'/rest/v1/order_lines',{method:'POST',headers:H,body:JSON.stringify(items.map(i=>({order_id:orderId,product_id:i.product_id||i.id,product_name:i.name,quantity:i.qty||1,unit_price:i.price,total_price:i.price*(i.qty||1)})))})
      await Promise.all(items.map(i=>fetch(S+'/rest/v1/products?id=eq.'+(i.product_id||i.id),{method:'PATCH',headers:H,body:JSON.stringify({stock:Math.max(0,(i.stock||0)-(i.qty||1))})})))
    }
    if(discount_code) await fetch(S+'/rest/v1/discount_codes?code=eq.'+discount_code,{method:'PATCH',headers:H,body:JSON.stringify({used_count:1})})
    const orderObj={order_number,customer_name,customer_email,customer_phone,shipping_address,shipping_city,shipping_zip,total,channel}
    sendEmail(orderObj,items||[])
    notifyWhatsApp(orderObj)
    createHoldedInvoice(orderObj,items||[]).then(hid=>{if(hid&&orderId)fetch(S+'/rest/v1/orders?id=eq.'+orderId,{method:'PATCH',headers:H,body:JSON.stringify({holded_invoice_id:hid})})}).catch(console.error)
    return NextResponse.json({ok:true,order_number})
  }catch(e){return NextResponse.json({ok:false,error:String(e)},{status:500})}
}
