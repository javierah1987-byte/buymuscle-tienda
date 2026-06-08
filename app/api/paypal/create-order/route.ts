// @ts-nocheck
import { NextResponse } from 'next/server'
import { adminDb, quoteOrder } from '@/lib/orderCore'
import { createPaypalOrder, paypalConfigured } from '@/lib/paypal'

export const dynamic = 'force-dynamic'

// POST /api/paypal/create-order
// Calcula el importe AUTORITATIVO desde la BD (no del cliente) y crea la orden
// PayPal por ese importe. Devuelve { ok, id, total }.
export async function POST(req){
  try{
    if(!paypalConfigured())
      return NextResponse.json({ ok:false, error:'paypal_no_configurado' }, { status:503 })
    if(!process.env.SUPABASE_SERVICE_ROLE_KEY)
      return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })

    const body = await req.json()
    const db = adminDb()
    const quote = await quoteOrder(db, body)
    if(!quote.ok) return NextResponse.json(quote, { status: quote.status || 400 })

    const total = quote.totals.totalGross
    if(!(total > 0)) return NextResponse.json({ ok:false, error:'importe_invalido' }, { status:400 })

    const pp = await createPaypalOrder(total)
    return NextResponse.json({ ok:true, id: pp.id, total })
  }catch(e){
    console.error('paypal/create-order error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
