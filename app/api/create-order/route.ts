// @ts-nocheck
import{NextResponse}from 'next/server'
import{createClient}from '@supabase/supabase-js'

// RLS desactivado en orders/order_lines — la anon key puede insertar
const admin=createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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
    return NextResponse.json({success:true,order_id:order.id,order_number:num})
  }catch(err){
    console.error('create-order error:',err.message,err.code)
    return NextResponse.json({error:err.message||'Error'},{status:500})
  }
}
