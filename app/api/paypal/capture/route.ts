// @ts-nocheck
import { NextResponse } from 'next/server'
import { adminDb, quoteOrder, persistOrder, checkStock, round2 } from '@/lib/orderCore'
import { capturePaypalOrder, refundPaypalCapture, paypalConfigured } from '@/lib/paypal'

export const dynamic = 'force-dynamic'

// POST /api/paypal/capture  { paypalOrderId, customer, items, discount_code }
// Captura el pago en PayPal, verifica que está COMPLETED y que el importe cobrado
// coincide con el total autoritativo, y solo entonces crea el pedido como 'paid'.
//
// GARANTÍA DE DINERO (cinturón-y-tirantes): NUNCA se queda un cobro sin pedido.
//  - ANTES de capturar: revalida stock → falla sin cobrar en el caso común.
//  - DESPUÉS de capturar: TODO lo que sigue va en una región guardada; cualquier
//    fallo o excepción dispara un REFUND inmediato de la captura + registro. La
//    única salida sin refund es "el pedido ya existía" (idempotencia = cobro legítimo).
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

    // 1. Importe autoritativo (mismo cálculo que al crear la orden PayPal).
    const quote = await quoteOrder(db, body)
    if(!quote.ok) return NextResponse.json(quote, { status: quote.status || 400 })
    const expected = quote.totals.totalGross

    // 2. Revalidar stock ANTES de cobrar (tirante 1): en el caso común (qty>stock,
    //    agotado) fallamos aquí, sin capturar → el cliente no llega a ser cobrado.
    const stock = await checkStock(db, quote.lines)
    if(!stock.ok)
      return NextResponse.json({ ok:false, error:'sin_stock', detail: stock.detail }, { status: 409 })

    // 3. Capturar en PayPal (a partir de aquí el dinero YA está cobrado).
    const cap = await capturePaypalOrder(paypalOrderId)
    if(cap?.status !== 'COMPLETED')
      return NextResponse.json({ ok:false, error:'pago_no_completado', detail: cap?.status || cap?.name || 'desconocido' }, { status:402 })

    const capture = cap?.purchase_units?.[0]?.payments?.captures?.[0]
    const paid = Number(capture?.amount?.value || 0)
    const captureId = capture?.id || null

    if(!captureId){
      // COMPLETED sin id de captura (respuesta degenerada): no podemos reembolsar por id.
      console.error('[PAYPAL_CAPTURE_SIN_ID]', { paypalOrderId, status: cap?.status })
      return NextResponse.json({ ok:false, error:'captura_sin_id' }, { status:500 })
    }

    // Cierre de dinero (tirante 2): reembolsa la captura + registra el intento.
    const refundAndFail = async (payload, status) => {
      let refund = null
      try {
        refund = await refundPaypalCapture(captureId)  // reembolso TOTAL, idempotente
      } catch (e) {
        // Refund fallido = alerta CRÍTICA (cobrado sin pedido y sin devolver → conciliar YA).
        console.error('[PAYPAL_REFUND_FAILED]', { captureId, paypalOrderId, paid, reason: payload.error, err: String(e?.message || e) })
      }
      const refunded = refund?.status === 'COMPLETED'
      console.error('[PAYPAL_POST_CAPTURE_FAIL]', { captureId, paypalOrderId, paid, reason: payload.error, refunded, refund_id: refund?.id || null })
      // Registro durable best-effort (no bloquea ni depende de que la tabla exista).
      try {
        await db.from('paypal_failed_captures').insert({
          paypal_order_id: paypalOrderId, capture_id: captureId, amount: paid,
          reason: payload.error, refunded, refund_id: refund?.id || null,
          detail: JSON.stringify(payload).slice(0, 2000), created_at: new Date().toISOString(),
        })
      } catch (e) { console.error('[PAYPAL_FAILED_CAPTURES_LOG_ERR]', String(e?.message || e)) }
      return NextResponse.json({ ...payload, refunded }, { status })
    }

    // Región guardada: cualquier throw aquí => refund (catch al final).
    try {
      // 4. Idempotencia: si ya existe un pedido con esta captura, devolverlo SIN
      //    recrear NI reembolsar (el cobro es legítimo). Índice único paypal_capture_id.
      const { data: existing } = await db.from('orders')
        .select('order_number,total').eq('paypal_capture_id', captureId).maybeSingle()
      if(existing)
        return NextResponse.json({ ok:true, order_number: existing.order_number, total: existing.total, idempotent:true })

      // 5. Verificar importe (tolerancia 1 céntimo). Si pagó MENOS → refund.
      if(round2(paid) + 0.01 < round2(expected))
        return await refundAndFail({ ok:false, error:'importe_no_coincide', paid, expected }, 409)

      // 6. Crear pedido pagado. Si persistOrder devuelve !ok (sin_stock por carrera) → refund.
      const res = await persistOrder(db, body, {
        status: 'paid', payment_method: 'paypal', channel: 'web', paypal_capture_id: captureId,
      })
      if(!res.ok) return await refundAndFail({ ok:false, ...res }, res.status || 409)

      return NextResponse.json({ ok:true, order_number: res.order_number, total: res.total })
    } catch (e) {
      // Excepción tras la captura (persist, BD, red…) → reembolsar sí o sí.
      console.error('paypal/capture fallo tras captura:', e)
      return await refundAndFail({ ok:false, error:'error_al_crear_pedido', detail: String(e?.message || e) }, 500)
    }
  }catch(e){
    // Fallo ANTES de capturar (quote, parseo, config): sin cobro, sin refund.
    console.error('paypal/capture error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
