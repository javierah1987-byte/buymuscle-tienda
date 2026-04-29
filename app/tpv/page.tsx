// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const db = createClient(S, K)

const DISCOUNTS = { particular:0, bronze:10, silver:15, gold:20 }
const CLIENT_COLORS = { particular:'#555', bronze:'#cd7f32', silver:'#aaa', gold:'#ffd700' }

export default function TPVPage() {
  // ── Productos y catálogo ──────────────────────────────
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const searchRef = useRef(null)
  const searchTimer = useRef(null)

  // ── Ticket actual ─────────────────────────────────────
  const [lines, setLines] = useState([])
  const [clientType, setClientType] = useState('particular')
  const [payMethod, setPayMethod] = useState('tarjeta')
  const [customerName, setCustomerName] = useState('')
  const [customerNif, setCustomerNif] = useState('')
  const [discManual, setDiscManual] = useState(0)
  const [saving, setSaving] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [variantModal, setVariantModal] = useState(null)

  // ── Estadísticas del día ──────────────────────────────
  const [ventasDia, setVentasDia] = useState({total:0,count:0,efectivo:0,tarjeta:0,bizum:0})

  // ── Modales especiales ────────────────────────────────
  const [showApertura, setShowApertura] = useState(false)
  const [showCierre, setShowCierre] = useState(false)
  const [showDevolucion, setShowDevolucion] = useState(false)
  const [cajaAbierta, setCajaAbierta] = useState(null) // sesión de caja actual
  const [efectivoApertura, setEfectivoApertura] = useState('')
  const [efectivoCierre, setEfectivoCierre] = useState('')
  const [cierreNotes, setCierreNotes] = useState('')

  // ── Devolución ────────────────────────────────────────
  const [devOrderNum, setDevOrderNum] = useState('')
  const [devOrder, setDevOrder] = useState(null)
  const [devLines, setDevLines] = useState([]) // lineas del pedido
  const [devSelected, setDevSelected] = useState({}) // {line_id: qty}
  const [devMethod, setDevMethod] = useState('efectivo')
  const [devMotivo, setDevMotivo] = useState('')
  const [devLoading, setDevLoading] = useState(false)
  const [devSaving, setDevSaving] = useState(false)
  const [devDone, setDevDone] = useState(null)

  // Cargar productos, categorías y stats del día
  useEffect(() => {
    async function load() {
      // Productos
      const { data: prods } = await db.from('products').select('*, categories(name)').eq('active',true).gt('stock',0).order('name')
      const p = prods || []
      setProducts(p)
      setFiltered(p)
      setCategories(['Todos', ...new Set(p.map(x => x.categories?.name).filter(Boolean).sort())])
      setLoading(false)
      // Stats del día
      await recargarVentas()
      // Ver si hay caja abierta
      const { data: cajas } = await db.from('caja_sessions').select('*').is('closed_at', null).order('opened_at', {ascending:false}).limit(1)
      if (cajas && cajas.length > 0) setCajaAbierta(cajas[0])
    }
    load()
  }, [])

  async function recargarVentas() {
    const today = new Date(); today.setHours(0,0,0,0)
    const { data: orders } = await db.from('orders').select('total,payment_method').gte('created_at', today.toISOString()).eq('status','paid')
    if (!orders) return
    const stats = orders.reduce((acc, o) => {
      acc.total += Number(o.total)
      acc.count += 1
      const m = o.payment_method || 'tarjeta'
      if (m.includes('efectivo')) acc.efectivo += Number(o.total)
      else if (m.includes('bizum')) acc.bizum += Number(o.total)
      else acc.tarjeta += Number(o.total)
      return acc
    }, {total:0,count:0,efectivo:0,tarjeta:0,bizum:0})
    setVentasDia(stats)
  }

  // Filtrar
  useEffect(() => {
    let f = products
    if (catFilter !== 'Todos') f = f.filter(p => p.categories?.name === catFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      f = f.filter(p => p.name.toLowerCase().includes(q) || p.categories?.name?.toLowerCase().includes(q))
    }
    setFiltered(f)
  }, [search, catFilter, products])

  // Teclado rápido
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setLines([]); setSearch(''); searchRef.current?.focus() }
      if (e.key === 'Enter' && lines.length > 0 && !saving && !showApertura && !showCierre && !showDevolucion) cobrar()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lines, saving, showApertura, showCierre, showDevolucion])

  const discount = Math.max(DISCOUNTS[clientType] || 0, discManual || 0)

  const addLine = async (product) => {
    const { data: variants } = await db.from('product_variants').select('*, attribute_values(value, attribute_types(name))').eq('product_id', product.id).eq('active',true).gt('stock',0)
    if (variants && variants.length > 0) { setVariantModal({ product, variants }); return }
    _addToLines(product, '')
  }

  const _addToLines = (product, variantLabel) => {
    const basePrice = product.on_sale && product.sale_price ? Number(product.sale_price) : Number(product.price_incl_tax)
    const unitPrice = basePrice * (1 - discount / 100)
    setLines(prev => {
      const key = product.id + '|' + variantLabel
      const ex = prev.find(l => l.key === key)
      if (ex) return prev.map(l => l.key === key ? { ...l, qty: l.qty + 1 } : l)
      return [...prev, { key, product, qty: 1, unitPrice, variantLabel }]
    })
    setVariantModal(null)
  }

  const updateQty = (key, qty) => {
    if (qty <= 0) setLines(prev => prev.filter(l => l.key !== key))
    else setLines(prev => prev.map(l => l.key === key ? { ...l, qty } : l))
  }

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0)
  const igic = subtotal * 0.07
  const total = subtotal + igic

  // ── COBRAR ─────────────────────────────────────────────
  const cobrar = async () => {
    if (!lines.length) return
    setSaving(true)
    try {
      const num = 'BM-TPV-' + Date.now().toString().slice(-8)
      const { data: order, error } = await db.from('orders').insert({
        order_number: num,
        channel: clientType !== 'particular' ? 'tpv_distributor' : 'tpv_retail',
        customer_name: customerName || 'Venta directa',
        customer_nif: customerNif || null,
        customer_email: 'tpv@buymuscle.es',
        subtotal, tax_amount: igic, shipping_cost: 0, total,
        discount_pct: discount, payment_method: payMethod,
        status: 'paid',
        notes: 'TPV · ' + payMethod + (customerName ? ' · ' + customerName : '')
      }).select().single()
      if (error) throw error

      await db.from('order_lines').insert(lines.map(l => ({
        order_id: order.id,
        product_id: l.product.id,
        product_name: l.product.name + (l.variantLabel ? ' – ' + l.variantLabel : ''),
        quantity: l.qty, unit_price: l.unitPrice, tax_rate: 7,
        line_total: l.unitPrice * l.qty
      })))

      // Descontar stock
      for (const l of lines) {
        const { data: p } = await db.from('products').select('stock').eq('id', l.product.id).single()
        if (p) await db.from('products').update({ stock: Math.max(0, p.stock - l.qty) }).eq('id', l.product.id)
      }

      setTicket({ num, lines: [...lines], total, subtotal, igic, payMethod, clientType, customerName, discount })
      setLines([]); setCustomerName(''); setCustomerNif(''); setDiscManual(0)
      await recargarVentas()
    } catch (e) { alert('Error al cobrar: ' + e.message) }
    setSaving(false)
  }

  // ── APERTURA DE CAJA ────────────────────────────────────
  const abrirCaja = async () => {
    if (!efectivoApertura || isNaN(Number(efectivoApertura))) { alert('Introduce el efectivo de apertura'); return }
    const { data, error } = await db.from('caja_sessions').insert({
      opened_at: new Date().toISOString(),
      cash_open: Number(efectivoApertura),
      operator: 'TPV',
      total_efectivo: 0, total_tarjeta: 0, total_vales: 0, num_tickets: 0
    }).select().single()
    if (error) { alert('Error: ' + error.message); return }
    setCajaAbierta(data)
    setShowApertura(false)
    setEfectivoApertura('')
  }

  // ── CIERRE DE CAJA (Z) ─────────────────────────────────
  const cerrarCaja = async () => {
    if (!cajaAbierta) return
    if (!efectivoCierre && efectivoCierre !== '0') { alert('Introduce el efectivo en caja al cierre'); return }
    const { error } = await db.from('caja_sessions').update({
      closed_at: new Date().toISOString(),
      cash_close: Number(efectivoCierre),
      total_efectivo: ventasDia.efectivo,
      total_tarjeta: ventasDia.tarjeta + ventasDia.bizum,
      num_tickets: ventasDia.count,
      notes: cierreNotes
    }).eq('id', cajaAbierta.id)
    if (error) { alert('Error: ' + error.message); return }
    setCajaAbierta(null)
    setShowCierre(false)
    setEfectivoCierre('')
    setCierreNotes('')
    // Imprimir resumen Z
    imprimirZ()
  }

  const imprimirZ = () => {
    const w = window.open('', '', 'width=380,height=500')
    const dif = Number(efectivoCierre) - cajaAbierta.cash_open - ventasDia.efectivo
    w.document.write(`<html><body style="font-family:monospace;font-size:13px;padding:20px;width:300px">
      <h2 style="text-align:center">CIERRE DE CAJA — Z</h2>
      <p style="text-align:center">${new Date().toLocaleString('es-ES')}</p>
      <hr/>
      <p>Efectivo apertura: ${Number(cajaAbierta.cash_open).toFixed(2)} €</p>
      <p>Ventas efectivo: ${ventasDia.efectivo.toFixed(2)} €</p>
      <p>Ventas tarjeta/Bizum: ${(ventasDia.tarjeta+ventasDia.bizum).toFixed(2)} €</p>
      <p>Total ventas: ${ventasDia.total.toFixed(2)} €</p>
      <p>Nº tickets: ${ventasDia.count}</p>
      <hr/>
      <p>Efectivo en caja (contado): ${Number(efectivoCierre).toFixed(2)} €</p>
      <p>Diferencia: <b>${dif>=0?'+':''}${dif.toFixed(2)} €</b></p>
      ${cierreNotes ? '<p>Notas: ' + cierreNotes + '</p>' : ''}
    </body></html>`)
    w.print()
  }

  // ── DEVOLUCIÓN ─────────────────────────────────────────
  const buscarPedidoDev = async () => {
    if (!devOrderNum.trim()) return
    setDevLoading(true)
    const { data: ord } = await db.from('orders').select('*').eq('order_number', devOrderNum.trim().toUpperCase()).single()
    if (!ord) { alert('Pedido no encontrado'); setDevLoading(false); return }
    const { data: ls } = await db.from('order_lines').select('*').eq('order_id', ord.id)
    setDevOrder(ord)
    setDevLines(ls || [])
    setDevSelected(Object.fromEntries((ls||[]).map(l => [l.id, 0])))
    setDevLoading(false)
  }

  const procesarDevolucion = async () => {
    const itemsDev = devLines.filter(l => devSelected[l.id] > 0).map(l => ({
      line_id: l.id, product_id: l.product_id, product_name: l.product_name,
      qty_dev: devSelected[l.id], unit_price: l.unit_price,
      importe: l.unit_price * devSelected[l.id]
    }))
    if (!itemsDev.length) { alert('Selecciona al menos un producto para devolver'); return }
    const totalDev = itemsDev.reduce((s,i) => s + i.importe, 0)
    setDevSaving(true)
    try {
      // Guardar devolución
      await db.from('devoluciones').insert({
        order_number: devOrder.order_number,
        order_id: devOrder.id,
        items: itemsDev,
        total_devuelto: totalDev,
        method: devMethod,
        motivo: devMotivo,
        operator: 'TPV',
        created_at: new Date().toISOString()
      })
      // Reponer stock
      for (const item of itemsDev) {
        const { data: p } = await db.from('products').select('stock').eq('id', item.product_id).single()
        if (p) await db.from('products').update({ stock: p.stock + item.qty_dev }).eq('id', item.product_id)
      }
      setDevDone({ total: totalDev, method: devMethod, items: itemsDev })
    } catch (e) { alert('Error: ' + e.message) }
    setDevSaving(false)
  }

  const resetDev = () => {
    setDevOrderNum(''); setDevOrder(null); setDevLines([]); setDevSelected({})
    setDevMethod('efectivo'); setDevMotivo(''); setDevDone(null); setDevLoading(false)
    setShowDevolucion(false)
  }

  // ── ESTILOS ────────────────────────────────────────────
  const ST = {
    page: { display:'grid', gridTemplateColumns:'1fr 340px', height:'100vh', background:'#111', color:'white', fontFamily:'Heebo,Arial,sans-serif', position:'relative' },
    left: { display:'flex', flexDirection:'column', overflow:'hidden', borderRight:'1px solid #222' },
    header: { padding:'10px 14px', background:'#0a0a0a', borderBottom:'1px solid #222', display:'flex', alignItems:'center', gap:10 },
    searchInput: { flex:1, background:'#1a1a1a', border:'1px solid #333', color:'white', padding:'7px 10px', fontSize:13, fontFamily:'inherit', borderRadius:2, outline:'none' },
    catBar: { display:'flex', gap:4, padding:'7px 14px', background:'#0d0d0d', borderBottom:'1px solid #222', overflowX:'auto', flexShrink:0, scrollbarWidth:'none' },
    catBtn: (active) => ({ padding:'3px 10px', fontSize:10, fontWeight:700, textTransform:'uppercase', border:'none', cursor:'pointer', background:active?'#ff1e41':'#1a1a1a', color:active?'white':'#666', borderRadius:2, whiteSpace:'nowrap', fontFamily:'inherit' }),
    grid: { flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:1, background:'#222', alignContent:'start' },
    card: { background:'#111', cursor:'pointer', display:'flex', flexDirection:'column', padding:'8px 6px', alignItems:'center', textAlign:'center', transition:'background 0.1s' },
    right: { display:'flex', flexDirection:'column', background:'#0a0a0a' },
    clientRow: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'#222', flexShrink:0 },
    clientBtn: (active, type) => ({ padding:'7px 4px', fontSize:10, fontWeight:700, textTransform:'uppercase', border:'none', cursor:'pointer', background:active?CLIENT_COLORS[type]:' #111', color:'white', fontFamily:'inherit' }),
    ticket: { flex:1, overflowY:'auto', padding:'8px' },
    lineRow: { display:'flex', alignItems:'center', gap:6, padding:'5px 0', borderBottom:'1px solid #1a1a1a' },
    footer: { borderTop:'1px solid #222', padding:'10px' },
    payRow: { display:'flex', gap:3, marginBottom:8 },
    payBtn: (active) => ({ flex:1, padding:'6px 2px', fontSize:11, fontWeight:700, border:'none', cursor:'pointer', background:active?'#ff1e41':'#1a1a1a', color:'white', fontFamily:'inherit', borderRadius:2 }),
    cobraBtn: { width:'100%', padding:12, background:saving?'#555':'#ff1e41', color:'white', border:'none', fontWeight:900, fontSize:16, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', letterSpacing:1 },
  }

  // ── TICKET IMPRIMIBLE ───────────────────────────────────
  const imprimirTicket = () => {
    if (!ticket) return
    const rows = ticket.lines.map(l => `<tr><td>${l.product.name}${l.variantLabel?'–'+l.variantLabel:''}</td><td>${l.qty}</td><td style="text-align:right">${(l.unitPrice*l.qty).toFixed(2)}€</td></tr>`).join('')
    const w = window.open('','','width=380,height=600')
    w.document.write(`<html><head><style>body{font-family:monospace;font-size:12px;width:300px;padding:10px}table{width:100%}hr{border-top:1px dashed}</style></head>
    <body><h3 style="text-align:center">BUYMUSCLE</h3><p style="text-align:center;font-size:10px">${new Date().toLocaleString('es-ES')}</p><hr/>
    <table><thead><tr><th>Producto</th><th>Ud</th><th>€</th></tr></thead><tbody>${rows}</tbody></table><hr/>
    ${ticket.discount>0?'<p>Dto '+ticket.discount+'%</p>':''}
    <p>IGIC 7%: ${ticket.igic.toFixed(2)}€</p>
    <p><b>TOTAL: ${ticket.total.toFixed(2)}€</b></p>
    <p>Forma pago: ${ticket.payMethod.toUpperCase()}</p>
    <p style="text-align:center;margin-top:12px">Gracias por tu compra<br/>buymuscle.es</p>
    </body></html>`)
    w.print()
  }

  // ── MODAL OVERLAY ───────────────────────────────────────
  const Modal = ({ onClose, children, titulo }) => (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#111', border:'1px solid #333', borderRadius:6, padding:0, width:'100%', maxWidth:480, maxHeight:'90vh', overflow:'auto' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #222', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:800, fontSize:15 }}>{titulo}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:22, lineHeight:1 }}>✕</button>
        </div>
        <div style={{ padding:'18px' }}>{children}</div>
      </div>
    </div>
  )

  const inputSt = { width:'100%', background:'#1a1a1a', border:'1px solid #333', color:'white', padding:'9px 12px', fontSize:13, fontFamily:'inherit', borderRadius:3, outline:'none', boxSizing:'border-box' }
  const btnRed = { background:'#ff1e41', color:'white', border:'none', padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer', borderRadius:3, fontFamily:'inherit', width:'100%' }
  const btnGray = { background:'#222', color:'white', border:'1px solid #333', padding:'9px 18px', fontWeight:600, fontSize:13, cursor:'pointer', borderRadius:3, fontFamily:'inherit' }

  // ── VISTA TICKET COMPLETADO ────────────────────────────
  if (ticket) return (
    <div style={{ background:'#111', color:'white', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>
      <div style={{ textAlign:'center', maxWidth:380, padding:32 }}>
        <div style={{ fontSize:72, marginBottom:12 }}>✅</div>
        <h2 style={{ fontSize:24, fontWeight:900, margin:'0 0 6px', color:'#ff1e41' }}>¡Cobrado!</h2>
        <p style={{ color:'#888', margin:'0 0 4px' }}>Pedido <strong style={{ color:'white' }}>{ticket.num}</strong></p>
        <div style={{ background:'#1a1a1a', border:'1px solid #222', padding:'16px', margin:'20px 0', borderRadius:4 }}>
          {ticket.lines.map(l => (
            <div key={l.key} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'3px 0', borderBottom:'1px solid #111' }}>
              <span style={{ color:'#ccc' }}>{l.product.name} ×{l.qty}</span>
              <span style={{ color:'white' }}>{(l.unitPrice*l.qty).toFixed(2)} €</span>
            </div>
          ))}
          {ticket.discount>0 && <div style={{ fontSize:12, color:'#f59e0b', marginTop:8 }}>Dto. {ticket.discount}% aplicado</div>}
          <div style={{ borderTop:'1px solid #333', marginTop:10, paddingTop:10, display:'flex', justifyContent:'space-between', fontSize:20, fontWeight:900 }}>
            <span>TOTAL</span><span style={{ color:'#ff1e41' }}>{ticket.total.toFixed(2)} €</span>
          </div>
          <div style={{ fontSize:12, color:'#555', marginTop:4, textAlign:'right' }}>IGIC incluido · {ticket.payMethod.toUpperCase()}</div>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={imprimirTicket} style={{ ...btnGray, flex:'none' }}>🖨️ Imprimir ticket</button>
          <button onClick={()=>setTicket(null)} style={{ background:'#ff1e41', color:'white', border:'none', padding:'10px 24px', fontWeight:700, fontSize:14, cursor:'pointer', borderRadius:3, fontFamily:'inherit' }}>
            Nuevo ticket →
          </button>
        </div>
        {/* Mini stats del día */}
        <div style={{ marginTop:24, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[{l:'Ventas hoy',v:ventasDia.total.toFixed(0)+' €'},{l:'Tickets',v:ventasDia.count},{l:'Efectivo',v:ventasDia.efectivo.toFixed(0)+' €'}].map(({l,v})=>(
            <div key={l} style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', padding:'8px 4px', borderRadius:4 }}>
              <div style={{ fontSize:16, fontWeight:900, color:'#ff1e41' }}>{v}</div>
              <div style={{ fontSize:9, color:'#555', marginTop:2, textTransform:'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div style={ST.page}>

      {/* ══ MODAL APERTURA DE CAJA ══════════════════════ */}
      {showApertura && (
        <Modal titulo="🟢 Apertura de caja" onClose={()=>setShowApertura(false)}>
          <p style={{ color:'#888', fontSize:13, marginBottom:16 }}>Introduce el efectivo que hay en caja al inicio de la jornada.</p>
          <label style={{ display:'block', fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:6 }}>Efectivo en caja (€)</label>
          <input type="number" min="0" step="0.01" placeholder="Ej: 150.00" value={efectivoApertura}
            onChange={e=>setEfectivoApertura(e.target.value)}
            style={{ ...inputSt, fontSize:24, textAlign:'center', marginBottom:16 }} autoFocus/>
          <button onClick={abrirCaja} style={btnRed}>✅ Abrir caja</button>
        </Modal>
      )}

      {/* ══ MODAL CIERRE DE CAJA (Z) ════════════════════ */}
      {showCierre && (
        <Modal titulo="🔴 Cierre de caja — Informe Z" onClose={()=>setShowCierre(false)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:20 }}>
            {[{l:'Efectivo',v:ventasDia.efectivo},{l:'Tarjeta/Bizum',v:ventasDia.tarjeta+ventasDia.bizum},{l:'Total',v:ventasDia.total}].map(({l,v})=>(
              <div key={l} style={{ background:'#1a1a1a', padding:'10px 8px', borderRadius:4, textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:900, color:'#ff1e41' }}>{v.toFixed(2)} €</div>
                <div style={{ fontSize:10, color:'#555', marginTop:3, textTransform:'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>
          <label style={{ display:'block', fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:6 }}>Efectivo contado en caja (€)</label>
          <input type="number" min="0" step="0.01" placeholder="Cuenta el efectivo ahora" value={efectivoCierre}
            onChange={e=>setEfectivoCierre(e.target.value)}
            style={{ ...inputSt, marginBottom:10 }} autoFocus/>
          {efectivoCierre!=='' && cajaAbierta && (
            <div style={{ fontSize:13, marginBottom:12, padding:'8px 12px', background:'#1a1a1a', borderRadius:4 }}>
              Diferencia: <strong style={{ color: (Number(efectivoCierre)-Number(cajaAbierta.cash_open)-ventasDia.efectivo)>=0 ? '#22c55e' : '#ef4444' }}>
                {((Number(efectivoCierre)-Number(cajaAbierta.cash_open)-ventasDia.efectivo)>=0?'+':'') + (Number(efectivoCierre)-Number(cajaAbierta.cash_open)-ventasDia.efectivo).toFixed(2)} €
              </strong>
            </div>
          )}
          <label style={{ display:'block', fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:6 }}>Notas (opcional)</label>
          <textarea value={cierreNotes} onChange={e=>setCierreNotes(e.target.value)} rows={2}
            style={{ ...inputSt, resize:'vertical', marginBottom:14 }} placeholder="Incidencias, cambios..."/>
          <button onClick={cerrarCaja} style={{ ...btnRed, background:'#dc2626' }}>🖨️ Cerrar caja e imprimir informe Z</button>
        </Modal>
      )}

      {/* ══ MODAL DEVOLUCIÓN ════════════════════════════ */}
      {showDevolucion && (
        <Modal titulo="↩️ Devolución" onClose={resetDev}>
          {!devOrder && !devDone && (
            <>
              <p style={{ color:'#888', fontSize:13, marginBottom:14 }}>Introduce el número de pedido o ticket para procesar la devolución.</p>
              <div style={{ display:'flex', gap:6, marginBottom:16 }}>
                <input value={devOrderNum} onChange={e=>setDevOrderNum(e.target.value.toUpperCase())}
                  onKeyDown={e=>e.key==='Enter'&&buscarPedidoDev()}
                  placeholder="BM-TPV-12345678" style={{ ...inputSt, flex:1 }} autoFocus/>
                <button onClick={buscarPedidoDev} disabled={devLoading}
                  style={{ ...btnGray, whiteSpace:'nowrap' }}>
                  {devLoading ? '...' : '🔍 Buscar'}
                </button>
              </div>
            </>
          )}

          {devOrder && !devDone && (
            <>
              <div style={{ background:'#1a1a1a', padding:'10px 12px', borderRadius:4, marginBottom:14, fontSize:13 }}>
                <div style={{ fontWeight:700, color:'white', marginBottom:2 }}>Pedido {devOrder.order_number}</div>
                <div style={{ color:'#888' }}>{devOrder.customer_name} · {Number(devOrder.total).toFixed(2)} € · {devOrder.payment_method}</div>
              </div>

              <div style={{ marginBottom:14 }}>
                {devLines.map(l => (
                  <div key={l.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #1a1a1a' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, color:'white' }}>{l.product_name}</div>
                      <div style={{ fontSize:11, color:'#555' }}>×{l.quantity} · {Number(l.unit_price).toFixed(2)} €/ud</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <button onClick={()=>setDevSelected(s=>({...s,[l.id]:Math.max(0,(s[l.id]||0)-1)}))}
                        style={{ width:28, height:28, border:'1px solid #333', background:'#1a1a1a', color:'white', cursor:'pointer', fontSize:16 }}>−</button>
                      <span style={{ width:24, textAlign:'center', fontSize:13, fontWeight:700 }}>{devSelected[l.id]||0}</span>
                      <button onClick={()=>setDevSelected(s=>({...s,[l.id]:Math.min(l.quantity,(s[l.id]||0)+1)}))}
                        style={{ width:28, height:28, border:'1px solid #333', background:'#1a1a1a', color:'white', cursor:'pointer', fontSize:16 }}>+</button>
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, width:64, textAlign:'right', color:'#ff1e41' }}>
                      {((devSelected[l.id]||0)*Number(l.unit_price)).toFixed(2)} €
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:12 }}>
                <label style={{ display:'block', fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:5 }}>Forma de devolución</label>
                <div style={{ display:'flex', gap:4 }}>
                  {['efectivo','tarjeta','vale'].map(m=>(
                    <button key={m} onClick={()=>setDevMethod(m)}
                      style={{ ...btnGray, flex:1, background:devMethod===m?'#ff1e41':'#1a1a1a', borderColor:devMethod===m?'#ff1e41':'#333', borderRadius:3 }}>
                      {m==='efectivo'?'💵':m==='tarjeta'?'💳':'🎟️'} {m}
                    </button>
                  ))}
                </div>
              </div>

              <input value={devMotivo} onChange={e=>setDevMotivo(e.target.value)}
                placeholder="Motivo de la devolución (opcional)" style={{ ...inputSt, marginBottom:14 }}/>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:15, fontWeight:700 }}>Total a devolver:</span>
                <span style={{ fontSize:22, fontWeight:900, color:'#ff1e41' }}>
                  {devLines.filter(l=>devSelected[l.id]>0).reduce((s,l)=>s+(devSelected[l.id]||0)*Number(l.unit_price),0).toFixed(2)} €
                </span>
              </div>

              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>setDevOrder(null)} style={{ ...btnGray, flex:'none' }}>← Atrás</button>
                <button onClick={procesarDevolucion} disabled={devSaving} style={{ ...btnRed, flex:1 }}>
                  {devSaving ? 'Procesando...' : '✅ Confirmar devolución'}
                </button>
              </div>
            </>
          )}

          {devDone && (
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
              <h3 style={{ margin:'0 0 8px', color:'#22c55e', fontSize:18 }}>Devolución procesada</h3>
              <p style={{ color:'#888', fontSize:14, margin:'0 0 16px' }}>
                Se han devuelto <strong style={{ color:'white' }}>{devDone.total.toFixed(2)} €</strong> en {devDone.method}
                <br/>y el stock ha sido repuesto.
              </p>
              <button onClick={resetDev} style={btnRed}>Cerrar</button>
            </div>
          )}
        </Modal>
      )}

      {/* ══ PANEL IZQUIERDO — CATÁLOGO ═════════════════ */}
      <div style={ST.left}>
        {/* Header */}
        <div style={ST.header}>
          <a href="/" style={{ color:'#ff1e41', fontWeight:900, fontSize:18, textDecoration:'none' }}>BM</a>
          <input ref={searchRef} style={ST.searchInput} placeholder="Buscar producto..." value={search}
            onChange={e=>{ const v=e.target.value; clearTimeout(searchTimer.current); searchTimer.current=setTimeout(()=>setSearch(v),200) }} autoFocus/>
          <span style={{ fontSize:10, color:'#555', whiteSpace:'nowrap' }}>{filtered.length} prods</span>
          {/* Botones rápidos de caja */}
          <div style={{ display:'flex', gap:4 }}>
            {!cajaAbierta ? (
              <button onClick={()=>setShowApertura(true)} title="Abrir caja"
                style={{ background:'#1a1a1a', border:'1px solid #22c55e', color:'#22c55e', padding:'4px 8px', fontSize:11, fontWeight:700, cursor:'pointer', borderRadius:3, whiteSpace:'nowrap', fontFamily:'inherit' }}>
                🟢 Abrir
              </button>
            ) : (
              <button onClick={()=>setShowCierre(true)} title="Cierre de caja"
                style={{ background:'#1a1a1a', border:'1px solid #dc2626', color:'#dc2626', padding:'4px 8px', fontSize:11, fontWeight:700, cursor:'pointer', borderRadius:3, whiteSpace:'nowrap', fontFamily:'inherit' }}>
                🔴 Cierre Z
              </button>
            )}
            <button onClick={()=>setShowDevolucion(true)} title="Procesar devolución"
              style={{ background:'#1a1a1a', border:'1px solid #f59e0b', color:'#f59e0b', padding:'4px 8px', fontSize:11, fontWeight:700, cursor:'pointer', borderRadius:3, whiteSpace:'nowrap', fontFamily:'inherit' }}>
              ↩️ Dev.
            </button>
          </div>
        </div>

        {/* Stats del día */}
        <div style={{ display:'flex', gap:1, background:'#222', flexShrink:0 }}>
          {[
            {l:'Hoy',v:ventasDia.total.toFixed(0)+'€',c:'#ff1e41'},
            {l:'Tickets',v:ventasDia.count,c:'white'},
            {l:'Efectivo',v:ventasDia.efectivo.toFixed(0)+'€',c:'#22c55e'},
            {l:'Tarjeta',v:(ventasDia.tarjeta+ventasDia.bizum).toFixed(0)+'€',c:'#3b82f6'},
            {l:'Caja',v:cajaAbierta?'ABIERTA':'CERRADA',c:cajaAbierta?'#22c55e':'#ef4444'},
          ].map(({l,v,c})=>(
            <div key={l} style={{ flex:1, padding:'5px 4px', background:'#0a0a0a', textAlign:'center' }}>
              <div style={{ fontSize:12, fontWeight:900, color:c }}>{v}</div>
              <div style={{ fontSize:8, color:'#444', textTransform:'uppercase', marginTop:1 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Filtros de categoría */}
        <div style={ST.catBar}>
          {categories.map(cat => (
            <button key={cat} style={ST.catBtn(catFilter===cat)} onClick={()=>setCatFilter(cat)}>{cat}</button>
          ))}
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#555' }}>Cargando...</div>
        ) : (
          <div style={ST.grid}>
            {filtered.map(p => {
              const price = p.on_sale && p.sale_price ? Number(p.sale_price) : Number(p.price_incl_tax)
              const cat = p.categories?.name || ''
              return (
                <div key={p.id} style={ST.card}
                  onClick={() => addLine(p)}
                  onMouseEnter={e=>e.currentTarget.style.background='#1a1a1a'}
                  onMouseLeave={e=>e.currentTarget.style.background='#111'}>
                  <div style={{ width:'100%', aspectRatio:'1', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:4, overflow:'hidden' }}>
                    {p.image_url ? <img src={p.image_url} alt="" loading="lazy" style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }}/> : <span style={{ fontSize:24, opacity:.3 }}>📦</span>}
                  </div>
                  <div style={{ fontSize:10, color:'#888', marginBottom:2, lineHeight:1.2, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.name}</div>
                  <div style={{ fontSize:13, fontWeight:900, color:'#ff1e41', marginTop:'auto' }}>{price.toFixed(2)}€</div>
                  {p.stock <= 5 && <div style={{ fontSize:8, color:'#f59e0b', marginTop:1 }}>⚠️ Stock: {p.stock}</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ══ PANEL DERECHO — TICKET ═════════════════════ */}
      <div style={ST.right}>
        {/* Tipo de cliente */}
        <div style={ST.clientRow}>
          {['particular','bronze','silver','gold'].map(t => (
            <button key={t} style={ST.clientBtn(clientType===t, t)} onClick={()=>{ setClientType(t); setDiscManual(0) }}>
              {t==='particular'?'👤':t==='bronze'?'🥉':t==='silver'?'🥈':'🥇'}<br/>{t.toUpperCase()}<br/>
              <span style={{ fontSize:8, opacity:.7 }}>{DISCOUNTS[t]>0?'-'+DISCOUNTS[t]+'%':'PVP'}</span>
            </button>
          ))}
        </div>

        {/* Nombre cliente + NIF en una fila */}
        <div style={{ padding:'6px 8px', background:'#0d0d0d', borderBottom:'1px solid #222', display:'flex', gap:4 }}>
          <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Nombre cliente"
            style={{ flex:2, background:'#111', border:'1px solid #222', color:'white', padding:'5px 8px', fontSize:11, fontFamily:'inherit', outline:'none' }}/>
          <input value={customerNif} onChange={e=>setCustomerNif(e.target.value)} placeholder="NIF/CIF"
            style={{ flex:1, background:'#111', border:'1px solid #222', color:'white', padding:'5px 8px', fontSize:11, fontFamily:'inherit', outline:'none' }}/>
        </div>

        {/* Líneas del ticket */}
        <div style={ST.ticket}>
          {lines.length === 0 ? (
            <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#333', gap:8 }}>
              <span style={{ fontSize:48 }}>🛒</span>
              <span style={{ fontSize:12 }}>Haz click en un producto</span>
              <span style={{ fontSize:10, color:'#252525' }}>Enter = cobrar · Esc = vaciar</span>
            </div>
          ) : (
            lines.map(l => (
              <div key={l.key} style={ST.lineRow}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, color:'#ccc', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {l.product.name}{l.variantLabel?' – '+l.variantLabel:''}
                  </div>
                  <div style={{ fontSize:10, color:'#555' }}>{l.unitPrice.toFixed(2)}€/ud</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:3, flexShrink:0 }}>
                  <button onClick={()=>updateQty(l.key, l.qty-1)} style={{ width:22, height:22, border:'1px solid #333', background:'#1a1a1a', color:'white', cursor:'pointer', fontSize:14, padding:0 }}>−</button>
                  <span style={{ width:20, textAlign:'center', fontSize:13, fontWeight:700 }}>{l.qty}</span>
                  <button onClick={()=>updateQty(l.key, l.qty+1)} style={{ width:22, height:22, border:'1px solid #333', background:'#1a1a1a', color:'white', cursor:'pointer', fontSize:14, padding:0 }}>+</button>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:'white', width:56, textAlign:'right', flexShrink:0 }}>{(l.unitPrice*l.qty).toFixed(2)}€</span>
                <button onClick={()=>updateQty(l.key, 0)} style={{ background:'none', border:'none', color:'#333', cursor:'pointer', fontSize:16, padding:0, flexShrink:0 }}>✕</button>
              </div>
            ))
          )}
        </div>

        {/* Footer de cobro */}
        <div style={ST.footer}>
          {/* Descuento manual */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
            <span style={{ fontSize:10, color:'#555', textTransform:'uppercase', flexShrink:0 }}>Dto %</span>
            <input type="number" min="0" max="100" value={discManual||''} onChange={e=>setDiscManual(Number(e.target.value)||0)}
              placeholder="0" style={{ width:50, background:'#1a1a1a', border:'1px solid #333', color:'white', padding:'4px 6px', fontSize:12, textAlign:'center', fontFamily:'inherit', outline:'none', borderRadius:2 }}/>
            <span style={{ fontSize:10, color:'#555' }}>activo: <strong style={{ color: discount>0?'#f59e0b':'#555' }}>{discount}%</strong></span>
          </div>

          {/* Forma de pago */}
          <div style={ST.payRow}>
            {['efectivo','tarjeta','bizum'].map(m => (
              <button key={m} style={ST.payBtn(payMethod===m)} onClick={()=>setPayMethod(m)}>
                {m==='efectivo'?'💵':m==='tarjeta'?'💳':'📱'} {m}
              </button>
            ))}
          </div>

          {/* Totales */}
          {lines.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:2, marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#555' }}>
                <span>Subtotal</span><span>{subtotal.toFixed(2)} €</span>
              </div>
              {discount > 0 && <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#f59e0b' }}>
                <span>Descuento {discount}%</span><span>-{(subtotal*discount/100).toFixed(2)} €</span>
              </div>}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#555' }}>
                <span>IGIC 7%</span><span>{igic.toFixed(2)} €</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:17, fontWeight:900, color:'#ff1e41', borderTop:'1px solid #333', paddingTop:6, marginTop:4 }}>
                <span>TOTAL</span><span>{total.toFixed(2)} €</span>
              </div>
            </div>
          )}

          <button style={ST.cobraBtn} onClick={cobrar} disabled={saving||!lines.length}>
            {saving ? 'Procesando...' : lines.length ? `COBRAR ${total.toFixed(2)} €` : 'TICKET VACÍO'}
          </button>

          {/* Ventas resumen del día debajo del cobrar */}
          <div style={{ borderTop:'1px solid #1a1a1a', marginTop:10, paddingTop:8, display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:10, color:'#333', textTransform:'uppercase' }}>Ventas hoy</span>
            <span style={{ fontSize:10, color:'#ff1e41', fontWeight:700 }}>{ventasDia.total.toFixed(2)} € · {ventasDia.count} tickets</span>
          </div>
        </div>
      </div>

      {/* ══ MODAL VARIANTES ════════════════════════════ */}
      {variantModal && (
        <Modal titulo={'Elige variante — ' + variantModal.product.name} onClose={()=>setVariantModal(null)}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {variantModal.variants.map(v => {
              const attrs = v.attribute_values || []
              const label = attrs.map(a => (a.attribute_types?.name ? a.attribute_types.name+': ' : '') + a.value).join(' · ')
              return (
                <button key={v.id} onClick={()=>_addToLines(variantModal.product, label)}
                  style={{ padding:'8px 16px', background:'#1a1a1a', border:'1px solid #333', color:'white', cursor:'pointer', fontSize:12, fontFamily:'inherit', borderRadius:3 }}>
                  {label}<div style={{ fontSize:9, color:'#555', marginTop:2 }}>Stock: {v.stock}</div>
                </button>
              )
            })}
          </div>
        </Modal>
      )}
    </div>
  )
}
