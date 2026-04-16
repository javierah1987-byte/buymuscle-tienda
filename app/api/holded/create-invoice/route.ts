import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const HOLDED_API = 'https://api.holded.com/api/invoicing/v1'
const HOLDED_KEY = process.env.HOLDED_API_KEY || ''

// Usa anon key — RLS ya tiene políticas abiertas para SELECT/UPDATE en orders
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function holdedFetch(path: string, method = 'GET', body?: object) {
  const res = await fetch(`${HOLDED_API}${path}`, {
    method,
    headers: {
      'key': HOLDED_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  const text = await res.text()
  try { return JSON.parse(text) } catch { return { error: text } }
}

async function findOrCreateContact(email: string, name: string, phone?: string) {
  // Buscar por email
  const contacts = await holdedFetch(`/contacts?email=${encodeURIComponent(email)}`)
  if (Array.isArray(contacts) && contacts.length > 0) return contacts[0].id

  // Crear contacto
  const res = await holdedFetch('/contacts', 'POST', {
    name: name || email,
    email,
    phone: phone || '',
    isperson: 1,
  })
  return res?.id || null
}

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()
    if (!orderId) throw new Error('orderId requerido')
    if (!HOLDED_KEY) throw new Error('HOLDED_API_KEY no configurada')

    // Cargar pedido
    const { data: order, error: orderErr } = await supabase
      .from('orders').select('*').eq('id', orderId).single()
    if (orderErr) throw new Error('Error BD: ' + orderErr.message)
    if (!order) throw new Error('Pedido no encontrado: ' + orderId)

    // Si ya tiene factura, no duplicar
    if (order.holded_invoice_id) {
      return NextResponse.json({ ok: true, invoiceId: order.holded_invoice_id, cached: true })
    }

    // Cargar líneas
    const { data: lines } = await supabase
      .from('order_lines').select('*').eq('order_id', orderId)

    // Buscar o crear contacto en Holded
    const contactId = await findOrCreateContact(
      order.customer_email || 'cliente@buymuscle.es',
      order.customer_name || 'Cliente',
      order.customer_phone
    )
    if (!contactId) throw new Error('No se pudo crear contacto en Holded')

    // Preparar líneas de factura
    const items = (lines || []).map((line: any) => ({
      name: line.product_name,
      units: line.quantity,
      subtotal: Number(line.unit_price) * line.quantity,
      tax: 21,
    }))

    // Añadir envío si aplica
    if (Number(order.shipping_cost) > 0) {
      items.push({ name: 'Gastos de envío', units: 1, subtotal: Number(order.shipping_cost), tax: 21 })
    }

    // Serie B2C o B2B
    const isDistributor = order.channel === 'online_distributor' || order.channel === 'tpv_distributor'
    const series = isDistributor ? 'B2B' : 'B2C'

    // Crear factura en Holded
    const invoice = await holdedFetch('/documents/invoice', 'POST', {
      contactId,
      date: Math.floor(new Date(order.created_at).getTime() / 1000),
      notes: `Pedido ${order.order_number}${order.notes ? ' — ' + order.notes : ''}`,
      items,
    })

    if (!invoice?.id) {
      throw new Error('Holded no devolvió ID: ' + JSON.stringify(invoice))
    }

    // Guardar en Supabase
    await supabase.from('orders').update({
      holded_invoice_id: invoice.id,
      holded_series: series,
    }).eq('id', orderId)

    return NextResponse.json({ ok: true, invoiceId: invoice.id, series })

  } catch (err: any) {
    console.error('Holded error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
