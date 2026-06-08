// @ts-nocheck
import { NextResponse } from 'next/server'
import { adminDb, persistOrder } from '@/lib/orderCore'

export const dynamic = 'force-dynamic'

// POST /api/create-order — checkout web. Crea el pedido como 'pending'
// (pago no verificado: tarjeta/efectivo/transferencia). El pago verificado
// por PayPal va por /api/paypal/capture y marca el pedido como 'paid'.
export async function POST(req){
  try{
    if(!process.env.SUPABASE_SERVICE_ROLE_KEY)
      return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const db = adminDb()
    const body = await req.json()

    const res = await persistOrder(db, body, {
      status: 'pending',
      payment_method: body.payment_method || 'card',
      channel: body.channel || 'web',
    })
    if(!res.ok) return NextResponse.json(res, { status: res.status || 400 })
    return NextResponse.json({ ok:true, order_number: res.order_number, total: res.total })
  }catch(e){
    console.error('create-order error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
