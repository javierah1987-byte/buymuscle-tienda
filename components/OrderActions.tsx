'use client'
// Las 3 acciones de un pedido, juntas: FACTURA · TICKET · ETIQUETA.
// - Factura: reutiliza el backend Holded ya existente. Si el pedido aún no tiene
//   factura, la genera (POST /api/holded/create-invoice) y luego descarga el PDF
//   (GET /api/order-invoice?n=<order_number>, que lo devuelve inline).
// - Ticket: reutiliza <TicketTPV> (impresión térmica) mapeando pedido + líneas.
// - Etiqueta: reutiliza el selector de posición + printEtiquetas de EtiquetasEnvio.
//
// variant='detail' -> botones con etiqueta (panel de detalle del pedido).
// variant='row'    -> botones compactos con icono (celda de la tabla).
import { useState, type CSSProperties } from 'react'
import { sb as db } from '@/lib/supabaseBrowser'
import TicketTPV from './TicketTPV'
import { EtiquetaSlotPicker } from './EtiquetasEnvio'

type Pago = 'efectivo' | 'tarjeta' | 'mixto'

// El pedido guarda payment_method libre ('card','paypal','transfer','cash'…);
// TicketTPV solo entiende efectivo/tarjeta/mixto. Mapeamos al más cercano.
function mapPago(pm: unknown): Pago {
  const p = String(pm ?? '').toLowerCase()
  if (/efect|cash|metal/.test(p)) return 'efectivo'
  if (/tarj|card|paypal|redsys|bizum|transfer|stripe|visa/.test(p)) return 'tarjeta'
  return 'mixto'
}

interface TicketState {
  number: string
  lines: { name: string; qty: number; unit_price: number; subtotal: number }[]
  total: number
  pago: Pago
  date: Date
}

export default function OrderActions({
  order, lines: linesProp, variant = 'detail',
}: {
  order: any
  lines?: any[]
  variant?: 'row' | 'detail'
}) {
  const [invoiceId, setInvoiceId] = useState<string | null>(order?.holded_invoice_id || null)
  const [invoicing, setInvoicing] = useState(false)
  const [ticket, setTicket] = useState<TicketState | null>(null)
  const [showSlot, setShowSlot] = useState(false)

  // FACTURA — genera si hace falta, luego abre el PDF inline en nueva pestaña.
  async function factura() {
    let id = invoiceId
    if (!id) {
      setInvoicing(true)
      try {
        const r = await fetch('/api/holded/create-invoice', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
          body: JSON.stringify({ orderId: order.id }),
        })
        const d = await r.json().catch(() => ({}))
        if (!r.ok || !d.ok || !d.invoiceId) {
          alert('No se pudo generar la factura: ' + (d.error || ('HTTP ' + r.status)))
          return
        }
        id = d.invoiceId
        setInvoiceId(id)
      } catch (e: any) {
        alert('Error generando la factura: ' + (e?.message || e)); return
      } finally { setInvoicing(false) }
    }
    window.open('/api/order-invoice?n=' + encodeURIComponent(order.order_number), '_blank')
  }

  // TICKET — mapea pedido + líneas al shape de TicketTPV y abre el modal.
  async function abrirTicket() {
    let ls = linesProp
    if (!ls) {
      const { data } = await db.from('order_lines').select('*').eq('order_id', order.id)
      ls = data || []
    }
    const tLines = (ls || []).map((l: any) => ({
      name: l.product_name,
      qty: Number(l.quantity),
      unit_price: Number(l.unit_price),
      subtotal: Number(l.unit_price) * Number(l.quantity),
    }))
    // El total del pedido incluye envío; añadimos su línea para que cuadre con el total.
    if (Number(order.shipping_cost) > 0) {
      tLines.push({ name: 'Gastos de envío', qty: 1, unit_price: Number(order.shipping_cost), subtotal: Number(order.shipping_cost) })
    }
    setTicket({
      number: order.order_number,
      lines: tLines,
      total: Number(order.total),
      pago: mapPago(order.payment_method),
      date: order.created_at ? new Date(order.created_at) : new Date(),
    })
  }

  const isRow = variant === 'row'
  const base: CSSProperties = {
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, whiteSpace: 'nowrap',
    border: '1px solid #cbd5e1', background: 'white', color: '#334155',
    ...(isRow
      ? { padding: '3px 7px', fontSize: 13, borderRadius: 4 }
      : { padding: '6px 8px', fontSize: 11, borderRadius: 4, flex: 1, textTransform: 'uppercase' as const }),
  }

  return (
    <>
      <div style={{ display: 'flex', gap: isRow ? 4 : 6, marginTop: isRow ? 0 : 8, alignItems: 'center' }}>
        <button onClick={factura} disabled={invoicing} title="Factura (PDF Holded)" style={{ ...base, opacity: invoicing ? 0.6 : 1 }}>
          {isRow ? '📄' : (invoicing ? 'Generando…' : '📄 Factura')}
        </button>
        <button onClick={abrirTicket} title="Ticket térmico" style={base}>
          {isRow ? '🎫' : '🎫 Ticket'}
        </button>
        <button onClick={() => setShowSlot(true)} title="Etiqueta de envío" style={{ ...base, borderColor: '#0ea5e9', color: '#0ea5e9' }}>
          {isRow ? '🏷' : '🏷 Etiqueta'}
        </button>
      </div>

      {/* Modal ticket térmico */}
      {ticket && (
        <div onClick={() => setTicket(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 10, padding: 18, width: '100%', maxWidth: 360 }}>
            <TicketTPV
              ticketNumber={ticket.number}
              lines={ticket.lines}
              total={ticket.total}
              paymentMethod={ticket.pago}
              date={ticket.date}
              onClose={() => setTicket(null)}
            />
          </div>
        </div>
      )}

      {/* Selector de posición de etiqueta (1 etiqueta, elige slot) */}
      {showSlot && <EtiquetaSlotPicker orders={[order]} onClose={() => setShowSlot(false)} />}
    </>
  )
}
