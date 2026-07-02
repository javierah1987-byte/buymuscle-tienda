// @ts-nocheck
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/orderCore'
import { redsysConfigured, verifyRedsysNotification } from '@/lib/redsys'

export const dynamic = 'force-dynamic'

// POST /api/redsys/notification — notificación server-to-server de Redsys tras el
// pago. Verifica la FIRMA (si no cuadra → 403) y, si el pago está autorizado,
// marca el pedido 'paid' y descuenta el stock UNA sola vez. Idempotente: Redsys
// puede reenviar la misma notificación. El nº de pedido interno llega en
// MerchantData (lo pusimos al crear). INACTIVO hasta configurar REDSYS_*.
export async function POST(req){
  try{
    if(!redsysConfigured()) return NextResponse.json({ ok:false, error:'redsys_no_configurado' }, { status:503 })

    // Redsys envía application/x-www-form-urlencoded
    const form = await req.formData()
    const payload = {
      Ds_SignatureVersion: form.get('Ds_SignatureVersion'),
      Ds_MerchantParameters: form.get('Ds_MerchantParameters'),
      Ds_Signature: form.get('Ds_Signature'),
    }
    if(!payload.Ds_MerchantParameters || !payload.Ds_Signature)
      return NextResponse.json({ ok:false, error:'payload_invalido' }, { status:400 })

    // La firma es la barrera: sin ella, cualquiera podría marcar pedidos pagados.
    const v = verifyRedsysNotification(payload)
    if(!v.ok) return NextResponse.json({ ok:false, error:'firma_invalida' }, { status:403 })

    const orderNumber = v.merchantData
    if(!orderNumber) return NextResponse.json({ ok:false, error:'sin_referencia' }, { status:400 })

    const db = adminDb()
    const { data: order } = await db.from('orders')
      .select('id,status,stock_applied').eq('order_number', orderNumber).maybeSingle()
    if(!order) return NextResponse.json({ ok:false, error:'pedido_no_encontrado' }, { status:404 })

    // Pago NO autorizado (KO): dejamos el pedido 'pending' para que el cliente
    // pueda reintentar. Respondemos 200 igualmente (Redsys sólo espera un 200).
    if(!v.paid) return new NextResponse('OK', { status:200 })

    // Pago autorizado. Idempotente: sólo aplicamos si aún no estaba pagado/aplicado.
    if(order.status !== 'paid' || !order.stock_applied){
      const update = { status:'paid' }
      if(!order.stock_applied){
        const { data: lines } = await db.from('order_lines')
          .select('product_id,variant_id,quantity').eq('order_id', order.id)
        const { error: stockErr } = await db.rpc('process_order_stock', {
          p_lines: (lines||[]).map(l => ({ product_id:l.product_id, variant_id:l.variant_id, qty:l.quantity })),
        })
        // Si faltara stock, marcamos 'paid' igualmente (el cobro ya entró) pero
        // dejamos stock_applied=false: el admin lo ve pendiente de aplicar y lo concilia.
        if(!stockErr) update.stock_applied = true
      }
      await db.from('orders').update(update).eq('id', order.id)
    }

    return new NextResponse('OK', { status:200 })
  }catch(e){
    console.error('redsys/notification error:', e)
    // 200 para que Redsys no reintente en bucle por un fallo transitorio nuestro;
    // el pedido queda 'pending' y se puede conciliar a mano.
    return new NextResponse('OK', { status:200 })
  }
}
