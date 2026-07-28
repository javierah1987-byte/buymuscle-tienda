import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser } from '@/lib/adminAuth'
import { createInvoiceV2, holdedInvoicingEnabled } from '@/lib/holdedV2'

export const dynamic = 'force-dynamic'

const HOLDED_API = 'https://api.holded.com/api/invoicing/v1'
const HOLDED_KEY = process.env.HOLDED_API_KEY || ''
const IGIC = 0.07 // Canarias: IGIC general 7%

// Service role: RLS de orders está bloqueada salvo admin/cliente/servicio.
// Se crea dentro del handler para no instanciar en build sin env.
const adminDb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
const round2 = (n: number) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

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
    const admin = await getAdminUser()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // 🔒 Guard v2: en preview solo factura si HOLDED_ALLOW_PREVIEW=1 (+ key presente). Prod: sí.
    if (!holdedInvoicingEnabled())
      return NextResponse.json({ ok: true, skipped: true, reason: 'facturacion Holded deshabilitada en este entorno' })

    const { orderId } = await req.json()
    if (!orderId) throw new Error('orderId requerido')

    const supabase = adminDb()

    // Cargar pedido
    const { data: order, error: orderErr } = await supabase
      .from('orders').select('*').eq('id', orderId).single()
    if (orderErr) throw new Error('Error BD: ' + orderErr.message)
    if (!order) throw new Error('Pedido no encontrado: ' + orderId)

    // Si ya tiene factura, no duplicar
    if (order.holded_invoice_id) {
      return NextResponse.json({ ok: true, invoiceId: order.holded_invoice_id, cached: true })
    }

    // Cargar líneas y crear la factura en Holded v2 (serie por canal, en lib/holdedV2).
    const { data: lines } = await supabase
      .from('order_lines').select('*').eq('order_id', orderId)
    const invoiceId = await createInvoiceV2(order, lines || [])
    if (!invoiceId) throw new Error('No se pudo crear la factura en Holded v2')

    const isDistributor = String(order.channel || '').includes('distributor')
    const series = isDistributor ? 'Distribucion' : 'Tienda'
    await supabase.from('orders').update({ holded_invoice_id: invoiceId, holded_series: series }).eq('id', orderId)

    return NextResponse.json({ ok: true, invoiceId, series })

  } catch (err: any) {
    console.error('Holded error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
