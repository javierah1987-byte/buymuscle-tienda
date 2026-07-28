// @ts-nocheck
// ── Cliente Holded API v2 (Bearer) ──────────────────────────────────────────
// Migración v1→v2 (2026-07-28, decisión Javier: Holded retira la v1). Esta rama/preview
// usa v2 contra el Holded de PRUEBA. PROD sigue en v1 (main) hasta su migración con doble OK.
// Fuente única para los ~5 puntos de facturación (orderCore, tpv-order, tpv-return,
// holded/create-invoice, order-invoice).
//
// Contrato v2 verificado con probes reales (test PAT):
//   POST /api/v2/invoices      {contact_id,date:"YYYY-MM-DD",numbering_series_id,notes,items:[{name,units,subtotal,tax}]} -> 201 {id}
//   POST /api/v2/credit-notes  (idem, serie CN)
//   GET  /api/v2/contacts?email=<mail>  (filtra) · POST /api/v2/contacts {name,email,type:'client'}
//   GET  /api/v2/invoices/{id}/pdf  -> { data: <base64> }
// Auth: Authorization: Bearer <HOLDED_API_KEY>. snake_case. date ISO (NO unix).

const V2 = 'https://api.holded.com/api/v2'
const IGIC = 0.07
const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100
const H = (key) => ({ Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Accept: 'application/json' })
const isoDate = (ms) => new Date(ms || Date.now()).toISOString().slice(0, 10)

// ¿Se debe facturar en Holded en este entorno?
//  - production: sí (con su key). En preview/dev: SOLO si HOLDED_ALLOW_PREVIEW=1 (para
//    facturar al Holded de PRUEBA). Siempre requiere HOLDED_API_KEY presente.
export function holdedInvoicingEnabled() {
  if (!process.env.HOLDED_API_KEY) return false
  if (process.env.VERCEL_ENV === 'production') return true
  return process.env.HOLDED_ALLOW_PREVIEW === '1'
}

// Serie de FACTURA por canal: distribuidor -> Distribucion, resto -> Tienda.
export function invoiceSerieForChannel(channel) {
  const isDistrib = String(channel || '').includes('distributor')
  return isDistrib ? process.env.HOLDED_SERIE_DIST_ID : process.env.HOLDED_SERIE_T_ID
}

// Busca el contacto por email; si no existe, lo crea. Devuelve su id o null.
async function findOrCreateContact(key, email, name) {
  const mail = email || 'tpv@buymuscle.es'
  try {
    const f = await fetch(`${V2}/contacts?email=` + encodeURIComponent(mail), { headers: H(key) })
    if (f.ok) {
      const fj = await f.json()
      const items = (fj && (fj.items || fj)) || []
      if (Array.isArray(items) && items[0] && items[0].id) return items[0].id
    }
  } catch {}
  const c = await fetch(`${V2}/contacts`, { method: 'POST', headers: H(key), body: JSON.stringify({ name: name || mail, email: mail, type: 'client' }) })
  const cj = await c.json().catch(() => null)
  return (cj && cj.id) || null
}

// IGIC 7% en v2: la línea usa `price` (base SIN impuesto) y referencia el impuesto por su
// CLAVE en el array `taxes` (el número 7 o el id NO aplican; la clave sí — verificado).
// Configurable por env por si la cuenta usa otra clave (verificado 'tax_7_sales' en el test).
const TAX_IGIC7 = process.env.HOLDED_TAX_IGIC7 || 'tax_7_sales'

// Líneas de pedido -> items v2. `price` = precio SIN IGIC (÷1.07); el 7% lo añade `taxes`.
function toItems(lines, shippingCost) {
  const items = (lines || []).map((l) => ({
    name: l.product_name || l.name || 'Producto',
    units: l.qty != null ? l.qty : (l.quantity != null ? l.quantity : 1),
    price: r2(Number(l.unit_price) / (1 + IGIC)),
    taxes: [TAX_IGIC7],
  }))
  if (Number(shippingCost) > 0)
    items.push({ name: 'Gastos de envío', units: 1, price: r2(Number(shippingCost) / (1 + IGIC)), taxes: [TAX_IGIC7] })
  return items
}

// Crea factura de venta en Holded v2. Best-effort: devuelve el id (string) o null (no lanza).
export async function createInvoiceV2(order, lines) {
  if (!holdedInvoicingEnabled()) return null
  const key = process.env.HOLDED_API_KEY
  try {
    const contactId = await findOrCreateContact(key, order.customer_email, order.customer_name)
    if (!contactId) return null
    const serie = invoiceSerieForChannel(order.channel)
    const esTpv = String(order.channel || '').startsWith('tpv')
    const body = {
      contact_id: contactId,
      date: isoDate(order.created_at ? new Date(order.created_at).getTime() : Date.now()),
      notes: (esTpv ? 'Venta TPV ' : 'Pedido ') + order.order_number,
      items: toItems(lines, order.shipping_cost),
    }
    if (serie) body.numbering_series_id = serie
    const r = await fetch(`${V2}/invoices`, { method: 'POST', headers: H(key), body: JSON.stringify(body) })
    if (!r.ok) { console.error('holded v2 invoice error', r.status, (await r.text()).slice(0, 200)); return null }
    const j = await r.json()
    return (j && j.id) || null
  } catch (e) { console.error('holded v2 invoice exception:', e); return null }
}

// Crea abono/rectificativa (credit note) en Holded v2. Serie CN (HOLDED_SERIE_CN_ID).
export async function createCreditNoteV2(order, itemsDev) {
  if (!holdedInvoicingEnabled()) return null
  const key = process.env.HOLDED_API_KEY
  if (!order || !order.customer_email) return null
  try {
    const contactId = await findOrCreateContact(key, order.customer_email, order.customer_name)
    if (!contactId) return null
    const body = {
      contact_id: contactId,
      date: isoDate(Date.now()),
      notes: 'Rectificativa devolución pedido ' + order.order_number,
      items: (itemsDev || []).map((i) => ({ name: i.product_name || 'Producto', units: i.qty_dev, price: r2(Number(i.unit_price) / (1 + IGIC)), taxes: [TAX_IGIC7] })),
    }
    if (process.env.HOLDED_SERIE_CN_ID) body.numbering_series_id = process.env.HOLDED_SERIE_CN_ID
    const r = await fetch(`${V2}/credit-notes`, { method: 'POST', headers: H(key), body: JSON.stringify(body) })
    if (!r.ok) { console.error('holded v2 creditnote error', r.status, (await r.text()).slice(0, 200)); return null }
    const j = await r.json()
    return (j && j.id) || null
  } catch (e) { console.error('holded v2 creditnote exception:', e); return null }
}

// PDF de una factura v2 (base64 en { data }). Devuelve un Buffer o null. NO gateado por
// holdedInvoicingEnabled: solo descarga un documento existente (no crea nada).
export async function invoicePdfV2(invoiceId) {
  const key = process.env.HOLDED_API_KEY
  if (!key || !invoiceId) return null
  try {
    const r = await fetch(`${V2}/invoices/${invoiceId}/pdf`, { headers: { Authorization: 'Bearer ' + key, Accept: 'application/json' } })
    if (!r.ok) return null
    const j = await r.json().catch(() => null)
    if (!j || !j.data) return null
    return Buffer.from(j.data, 'base64')
  } catch { return null }
}
