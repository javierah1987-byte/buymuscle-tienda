import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const HOLDED_API = 'https://api.holded.com/api/invoicing/v1'
const HOLDED_KEY = process.env.HOLDED_API_KEY!

async function holdedFetch(path: string, method = 'GET', body?: object) {
  const res = await fetch(`${HOLDED_API}${path}`, {
    method,
    headers: { 'key': HOLDED_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  return res.json()
}

async function findOrCreateContact(email: string, name: string, phone?: string, isDistributor = false) {
  // Buscar contacto existente por email
  const contacts = await holdedFetch(`/contacts?email=${encodeURIComponent(email)}`)
  if (Array.isArray(contacts) && contacts.length > 0) return contacts[0].id

  // Crear nuevo contacto
  const contact = await holdedFetch('/contacts', 'POST', {
    name,
    email,
    phone: phone || '',
    type: isDistributor ? 1 : 0, // 0=cliente, 1=proveedor/distribuidor
    isperson: 1,
    tags: isDistributor ? ['distribuidor'] : ['tienda-online'],
  })
  return contact.id
}

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Cargar pedido completo con líneas
    const { data: order, error: orderErr } = await supabase
      .from('orders').select('*').eq('id', orderId).single()
    if (orderErr || !order) throw new Error('Pedido no encontrado')

    const { data: lines } = await supabase
      .from('order_lines').select('*').eq('order_id', orderId)

    // Si ya tiene factura Holded, no duplicar
    if (order.holded_invoice_id) {
      return NextResponse.json({ ok: true, invoiceId: order.holded_invoice_id, cached: true })
    }

    // Buscar o crear contacto en Holded
    const isDistributor = order.channel === 'online_distributor' || order.channel === 'tpv_distributor'
    const contactId = await findOrCreateContact(
      order.customer_email || 'cliente@buymuscle.es',
      order.customer_name || 'Cliente BuyMuscle',
      order.customer_phone,
      isDistributor
    )

    if (!contactId) throw new Error('No se pudo crear el contacto en Holded')

    // Preparar líneas de factura
    const items = (lines || []).map((line: any) => ({
      name: line.product_name,
      units: line.quantity,
      subtotal: Number(line.unit_price) * line.quantity,
      tax: 21,
    }))

    // Añadir gastos de envío si aplica
    if (Number(order.shipping_cost) > 0) {
      items.push({
        name: 'Gastos de envío',
        units: 1,
        subtotal: Number(order.shipping_cost),
        tax: 21,
      })
    }

    // Serie según canal: B2C o B2B
    const series = isDistributor ? 'B2B' : 'B2C'

    // Crear factura en Holded
    const invoice = await holdedFetch('/documents/invoice', 'POST', {
      contactId,
      date: Math.floor(new Date(order.created_at).getTime() / 1000),
      notes: `Pedido ${order.order_number}${order.notes ? ' — ' + order.notes : ''}`,
      saleschannel: 'tienda-online',
      numSerieId: series,
      items,
    })

    if (!invoice?.id) throw new Error(invoice?.message || 'Error creando factura en Holded')

    // Guardar ID de factura en el pedido
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
