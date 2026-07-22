'use client'
import { useRef } from 'react'

interface TicketLine {
  name: string
  qty: number
  unit_price: number
  subtotal: number
}

interface TicketProps {
  ticketNumber: string
  lines: TicketLine[]
  total: number
  paymentMethod: 'efectivo' | 'tarjeta' | 'mixto'
  cashGiven?: number
  cashChange?: number
  date?: Date
  onClose?: () => void
}

export default function TicketTPV({
  ticketNumber, lines, total, paymentMethod,
  cashGiven, cashChange, date = new Date(), onClose
}: TicketProps) {
  const ref = useRef<HTMLDivElement>(null)

  function handlePrint() {
    const w = window.open('', '_blank', 'width=380,height=600')
    if (!w || !ref.current) return
    w.document.write('<html><head><title>Ticket BuyMuscle</title><style>')
    w.document.write('@page{size:80mm auto;margin:0}*{box-sizing:border-box;margin:0;padding:0}body{font-family:monospace;font-size:12px;padding:3mm;width:80mm;max-width:80mm}hr{border:none;border-top:1px dashed #000;margin:8px 0}.center{text-align:center}.right{text-align:right}.bold{font-weight:bold}.row{display:flex;justify-content:space-between;margin:3px 0}.logo{font-size:18px;font-weight:bold;text-align:center;margin-bottom:4px}')
    w.document.write('</style></head><body>')
    w.document.write(ref.current.innerHTML)
    w.document.write('</body></html>')
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 300)
  }

  const fmt = (n: number) => n.toFixed(2) + ' EUR'
  const dateStr = date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const payLabel = paymentMethod === 'efectivo' ? 'EFECTIVO' : paymentMethod === 'tarjeta' ? 'TARJETA' : 'MIXTO'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {/* Ticket preview */}
      <div ref={ref} style={{ fontFamily:'monospace', fontSize:12, maxWidth:300, background:'white', padding:12, border:'1px dashed #ccc', lineHeight:1.5 }}>
        <div className="logo" style={{ fontSize:18, fontWeight:'bold', textAlign:'center', marginBottom:4 }}>BUYMUSCLE</div>
        <div style={{ textAlign:'center', fontSize:11, color:'#555', marginBottom:8 }}>Gran Canaria · buymuscle.es</div>
        <hr style={{ border:'none', borderTop:'1px dashed #000', margin:'8px 0' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
          <span>Ticket #{ticketNumber}</span>
          <span>{dateStr}</span>
        </div>
        <hr style={{ border:'none', borderTop:'1px dashed #000', margin:'8px 0' }}/>
        {lines.map((l, i) => (
          <div key={i} style={{ marginBottom:4 }}>
            <div style={{ fontWeight:'bold', fontSize:12 }}>{l.name}</div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#444' }}>
              <span>{l.qty} x {fmt(l.unit_price)}</span>
              <span style={{ fontWeight:'bold' }}>{fmt(l.subtotal)}</span>
            </div>
          </div>
        ))}
        <hr style={{ border:'none', borderTop:'1px dashed #000', margin:'8px 0' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:'bold' }}>
          <span>TOTAL</span>
          <span>{fmt(total)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginTop:4, color:'#555' }}>
          <span>{payLabel}</span>
          {cashGiven !== undefined && <span>Entregado: {fmt(cashGiven)}</span>}
        </div>
        {cashChange !== undefined && cashChange > 0 && (
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:'bold', color:'#e11d48', marginTop:2 }}>
            <span>CAMBIO</span>
            <span>{fmt(cashChange)}</span>
          </div>
        )}
        <hr style={{ border:'none', borderTop:'1px dashed #000', margin:'8px 0' }}/>
        <div style={{ textAlign:'center', fontSize:10, color:'#777' }}>IVA incluido en todos los precios</div>
        <div style={{ textAlign:'center', fontSize:10, color:'#777' }}>¡Gracias por tu compra!</div>
      </div>

      {/* Botones de acción */}
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={handlePrint}
          style={{ flex:1, padding:'10px 16px', background:'#1a1a1a', color:'white', border:'none', borderRadius:6, fontSize:14, fontWeight:600, cursor:'pointer' }}>
          🖨️ Imprimir ticket
        </button>
        {onClose && (
          <button onClick={onClose}
            style={{ padding:'10px 16px', background:'#f0f0f0', color:'#333', border:'none', borderRadius:6, fontSize:14, fontWeight:600, cursor:'pointer' }}>
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
