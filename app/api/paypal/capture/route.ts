// @ts-nocheck
import { NextResponse } from 'next/server'
import { adminDb, quoteOrder, persistOrder, round2 } from '@/lib/orderCore'
import { capturePaypalOrder, paypalConfigured } from '@/lib/paypal'

export const dynamic = 'force-dynamic'

// POST /api/paypal/capture  { paypalOrderId, customer, items, discount_code }
// Captura el pago en PayPal, verifica que está COMPLETED y que el importe
// cobrado coincide con el total autoritativo recalculado en servidor, y solo
// entonces crea el pedido como 'paid'. Devuelve { ok, order_number, total }.
export async function POST(req){
  try{
    if(!paypalConfigured())
      return NextResponse.json({ ok:false, error:'paypal_no_configurado' }, { status:503 })
    if(!process.env.SUPABASE_SERVICE_ROLE_KEY)
      return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })

    const body = await req.json()
    const paypalOrderId = body.paypalOrderId || body.orderID || body.id
    if(!paypalOrderId)
      return NextResponse.json({ ok:false, error:'falta_paypal_order_id' }, { status:400 })

    const db = adminDb()

    // 1. Importe autoritativo (mismo cálculo que usamos al crear la orden PayPal)
    const quote = await quoteOrder(db, body)
    if(!quote.ok) return NextResponse.json(quote, { status: quote.status || 400 })
    const expected = quote.totals.totalGross

    // 2. Capturar en PayPal
    const cap = await capturePaypalOrder(paypalOrderId)
    if(cap?.status !== 'COMPLETED')
      return NextResponse.json({ ok:false, error:'pago_no_completado', detail: cap?.status || cap?.name || 'desconocido' }, { status:402 })

    const capture = cap?.purchase_units?.[0]?.payments?.captures?.[0]
    const paid = Number(capture?.amount?.value || 0)
    const captureId = capture?.id || null

    // 3. Idempotencia: si ya existe un pedido con esta captura, devolverlo sin
    // volver a crear (evita pedido/stock/factura duplicados si el cliente
    // reintenta la captura). Respaldado por índice único en paypal_capture_id.
    if(captureId){
      const { data: existing } = await db.from('orders')
        .select('order_number,total').eq('paypal_capture_id', captureId).maybeSingle()
      if(existing)
        return NextResponse.json({ ok:true, order_number: existing.order_number, total: existing.total, idempotent:true })
    }

    // 4. Verificar importe (tolerancia 1 céntimo). Si pagó MENOS, no creamos pedido.
    if(round2(paid) + 0.01 < round2(expected))
      return NextResponse.json({ ok:false, error:'importe_no_coincide', paid, expected }, { status:409 })

    // 5. Crear pedido como pagado. El canal NO se toma del cliente (evita que un
    // comprador retail se autofacture en serie B2B de distribuidor); la web pública
    // siempre es 'web'. El canal de distribuidor se derivará de la sesión cuando
    // exista ese flujo autenticado.
    const res = await persistOrder(db, body, {
      status: 'paid',
      payment_method: 'paypal',
      channel: 'web',
      paypal_capture_id: captureId,
    })
    if(!res.ok) return NextResponse.json(res, { status: res.status || 400 })
    return NextResponse.json({ ok:true, order_number: res.order_number, total: res.total })
  }catch(e){
    console.error('paypal/capture error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
