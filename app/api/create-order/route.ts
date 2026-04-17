import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export async function POST(req: NextRequest) {
  try {
    const { items, customer, shipping_cost = 0, discount_pct = 0 } = await req.json()
    if (!items?.length || !customer?.email) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    const orderNumber = 'BM-' + Date.now().toString().slice(-8)
    const sub0 = items.reduce((s: number, i: any) => s + i.price * i.qty, 0)
    const sub = sub0 - sub0 * (discount_pct / 100)
    const taxAmount = sub * 0.21
    const total = sub + taxAmount + Number(shipping_cost)
    const { data: order, error: e1 } = await admin.from('orders').insert({
      order_number: orderNumber, channel: 'online_retail',
      customer_email: customer.email, customer_name: customer.name,
      customer_phone: customer.phone || null, customer_nif: customer.nif || null,
      shipping_address: customer.address, shipping_city: customer.city,
      shipping_postal_code: customer.postal_code, shipping_province: customer.province || 'Las Palmas',
      shipping_country: 'Espana', subtotal: sub, tax_amount: taxAmount,
      shipping_cost: Number(shipping_cost), total, discount_pct,
      payment_method: 'card', status: 'pending', notes: customer.notes || null,
    }).select().single()
    if (e1) throw e1
    await admin.from('order_lines').insert(items.map((i: any) => ({
      order_id: order.id, product_id: i.id, product_name: i.name,
      quantity: i.qty, unit_price: i.price, tax_rate: 21, line_total: i.price * i.qty,
    })))
    for (const i of items) {
      const { data: p } = await admin.from('products').select('stock').eq('id', i.id).single()
      if (p) await admin.from('products').update({ stock: Math.max(0, p.stock - i.qty) }).eq('id', i.id)
    }
    return NextResponse.json({ success: true, order_id: order.id, order_number: orderNumber })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 })
  }
}
