// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const HOLDED_KEY = process.env.HOLDED_API_KEY

// GET /api/order-invoice?n=<order_number>
// Descarga directa del PDF de la factura (Holded) de un pedido. El order_number
// es un token de capacidad impredecible, por eso permite la descarga directa sin
// más login (igual criterio que /api/order-lookup). Devuelve el PDF en streaming.
export async function GET(req: Request) {
  try {
    if (!SERVICE_KEY) return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
    if (!HOLDED_KEY) return NextResponse.json({ error: 'holded_no_configurado' }, { status: 503 })

    const { searchParams } = new URL(req.url)
    const num = (searchParams.get('n') || '').trim().toUpperCase()
    if (!num) return NextResponse.json({ error: 'missing_order_number' }, { status: 400 })

    const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: order } = await db.from('orders')
      .select('order_number,holded_invoice_id').eq('order_number', num).maybeSingle()
    if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    if (!order.holded_invoice_id) return NextResponse.json({ error: 'sin_factura' }, { status: 404 })

    // Holded devuelve el PDF como base64 en { status, data }
    const r = await fetch(
      `https://api.holded.com/api/invoicing/v1/documents/invoice/${order.holded_invoice_id}/pdf`,
      { headers: { key: HOLDED_KEY, Accept: 'application/json' } }
    )
    const j = await r.json().catch(() => null)
    if (!j?.data) return NextResponse.json({ error: 'pdf_no_disponible' }, { status: 502 })

    const pdf = Buffer.from(j.data, 'base64')
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="factura-${num}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (e: any) {
    console.error('order-invoice error:', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
