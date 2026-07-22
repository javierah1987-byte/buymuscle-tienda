// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import TicketTPV from '@/components/TicketTPV'

const DISCOUNTS = { particular:0, bronze:10, silver:15, gold:20 }
const CLIENT_COLORS = { particular:'#555', bronze:'#cd7f32', silver:'#aaa', gold:'#ffd700' }

// Imagen de producto con fallback: si la URL está rota o vacía, muestra 📦 (evita el icono de "imagen rota").
// Además sirve una MINIATURA al vuelo (transformación de Supabase, ~200px, WebP en navegador) en lugar del
// JPG original (hasta 2 MB) → la rejilla carga muchísimo más rápida.
function thumbUrl(url) {
  if (!url) return url
  return url.includes('/object/public/')
    ? url.replace('/object/public/', '/render/image/public/') + '?width=200&quality=60'
    : url
}
function ProdImg({ url }) {
  const [err, setErr] = useState(false)
  return (url && !err)
    ? <img src={thumbUrl(url)} alt="" loading="lazy" decoding="async" onError={()=>setErr(true)} style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }}/>
    : <span style={{ fontSize:24, opacity:.3 }}>📦</span>
}

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
  const [entregado, setEntregado] = useState('') // efectivo entregado por el cliente (para calcular cambio)
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

  // ── Sesión TPV (PIN) ──────────────────────────────────
  const [tpvAuth, setTpvAuth] = useState(null) // null=comprobando, false=bloqueado, true=ok
  const [pinInput, setPinInput] = useState('')
  const [pinErr, setPinErr] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  // Comprobar si ya hay sesión TPV al cargar
  useEffect(() => {
    fetch('/api/tpv-auth').then(r=>r.json()).then(d=>setTpvAuth(!!(d&&d.authorized))).catch(()=>setTpvAuth(false))
  }, [])

  async function entrarTpv() {
    setPinErr(''); setPinLoading(true)
    try {
      const r = await fetch('/api/tpv-auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ pin: pinInput }) })
      const d = await r.json()
      if (d && d.ok) { setTpvAuth(true); setPinInput('') }
      else setPinErr(d?.error==='pin_invalido' ? 'PIN incorrecto' : 'No se pudo iniciar sesión')
    } catch { setPinErr('Error de conexión') }
    setPinLoading(false)
  }

  async function salirTpv() {
    try { await fetch('/api/tpv-auth', { method:'DELETE' }) } catch {}
    setTpvAuth(false)
  }

  // Cargar productos, categorías y stats del día
  useEffect(() => {
    if (tpvAuth !== true) return
    async function load() {
      const H = {apikey:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,'Authorization':'Bearer '+process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
      // Productos con categorías — solo las columnas que usa el TPV
      // (la grid, las líneas del ticket y el cálculo de precio), no todo el catálogo con *.
      const rp = await fetch('https://awwlbepjxuoxaigztugh.supabase.co/rest/v1/products?active=eq.true&stock=gt.0&order=name.asc&select=id,name,price_incl_tax,sale_price,on_sale,stock,image_url,categories(name)', {headers:H})
      const prods = await rp.json()
      const p = Array.isArray(prods) ? prods : []
      setProducts(p)
      setFiltered(p)
      setCategories(['Todos', ...new Set(p.map(x => x.categories?.name).filter(Boolean).sort())])
      setLoading(false)
      // Ver si hay caja abierta primero, para acotar el arqueo al turno
      let caja = null
      try {
        const rc = await fetch('/api/tpv-caja', { credentials:'same-origin' })
        const cajaData = await rc.json()
        if (cajaData && cajaData.ok) caja = cajaData.open || null
      } catch {}
      if (caja) setCajaAbierta(caja)
      // Stats: si hay turno abierto, desde su apertura; si no, del día
      await recargarVentas(caja?.opened_at)
    }
    load()
  }, [tpvAuth])

  async function recargarVentas(since) {
    try {
      const qs = since ? ('?since=' + encodeURIComponent(since)) : ''
      const r = await fetch('/api/tpv-stats' + qs)
      const data = await r.json()
      if (data && data.ok && data.stats) setVentasDia(data.stats)
    } catch {}
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
      if (e.key === 'Escape') { setLines([]); setSearch(''); setEntregado(''); if (searchRef.current) { searchRef.current.value = ''; searchRef.current.focus() } }
      if (e.key === 'Enter' && lines.length > 0 && !saving && !showApertura && !showCierre && !showDevolucion) cobrar()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lines, saving, showApertura, showCierre, showDevolucion])

  const discount = Math.max(DISCOUNTS[clientType] || 0, discManual || 0)

  const addLine = async (product) => {
    let variants = []
    try {
      const H = {apikey:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,'Authorization':'Bearer '+process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
      const rv2 = await fetch('https://awwlbepjxuoxaigztugh.supabase.co/rest/v1/product_variants?product_id=eq.'+product.id+'&active=eq.true&stock=gt.0&select=*,attribute_values(value,attribute_types(name))', {headers:H})
      const data = await rv2.json()
      variants = Array.isArray(data) ? data : []
    } catch { variants = [] }
    if (variants.length > 0) { setVariantModal({ product, variants }); return }
    _addToLines(product, '')
  }

  const _addToLines = (product, variantLabel, variantId = null, stockAvail = null) => {
    const basePrice = product.on_sale && product.sale_price ? Number(product.sale_price) : Number(product.price_incl_tax)
    // Guardamos basePrice (PVP sin descuento). El descuento se aplica EN VIVO al mostrar y al cobrar,
    // así cambiar de nivel (particular/bronze/silver/gold) recalcula el total al momento.
    // Stock disponible de ESTE producto/variante. Avisamos AL TICAR, no al cobrar.
    const avail = Number(stockAvail != null ? stockAvail : product.stock) || 0
    const key = product.id + '|' + variantLabel
    const yaEnCarrito = lines.find(l => l.key === key)?.qty || 0
    if (yaEnCarrito + 1 > avail) {
      alert('⚠️ Sin stock de "' + product.name + (variantLabel ? ' – ' + variantLabel : '') + '": solo ' + (avail === 1 ? 'queda 1' : 'quedan ' + avail) + (yaEnCarrito ? ' y ya tienes ' + yaEnCarrito + ' en el ticket' : '') + '.')
      setVariantModal(null)
      return
    }
    setLines(prev => {
      const ex = prev.find(l => l.key === key)
      if (ex) return prev.map(l => l.key === key ? { ...l, qty: l.qty + 1 } : l)
      return [...prev, { key, product, qty: 1, basePrice, variantLabel, variantId, stockAvail: avail }]
    })
    setVariantModal(null)
  }

  const updateQty = (key, qty) => {
    if (qty <= 0) { setLines(prev => prev.filter(l => l.key !== key)); return }
    const line = lines.find(l => l.key === key)
    const avail = Number(line?.stockAvail != null ? line.stockAvail : line?.product?.stock) || 0
    if (line && qty > avail) {
      alert('⚠️ Sin stock: solo ' + (avail === 1 ? 'queda 1' : 'quedan ' + avail) + ' de "' + line.product.name + (line.variantLabel ? ' – ' + line.variantLabel : '') + '".')
      return
    }
    setLines(prev => prev.map(l => l.key === key ? { ...l, qty } : l))
  }

  // Precios (basePrice) con IGIC INCLUIDO (PVP). El descuento se aplica EN VIVO, reactivo al nivel
  // de cliente (bronze/silver/gold) y al dto manual → si cambias de nivel, el total se recalcula.
  const brutoTotal = lines.reduce((s, l) => s + l.basePrice * l.qty, 0)
  const subtotalPVP = brutoTotal / 1.07
  const total = brutoTotal * (1 - discount / 100)
  const subtotal = total / 1.07
  const igic = total - subtotal

  // ── COBRAR ─────────────────────────────────────────────
  const cobrar = async () => {
    if (!lines.length) return
    setSaving(true)
    try {
      // Toda la venta se procesa en el servidor (precios autoritativos,
      // stock atómico vía RPC y factura Holded con IGIC 7%).
      const res = await fetch('/api/tpv-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map(l => ({
            product_id: l.product.id,
            variant_id: l.variantId || null,
            qty: l.qty,
            variant: l.variantLabel || '',
          })),
          discount_pct: discount,
          payment_method: payMethod,
          channel: clientType !== 'particular' ? 'tpv_distributor' : 'tpv_retail',
          customer: { name: customerName || '', nif: customerNif || '' },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        if (data.error === 'sin_stock') throw new Error('Sin stock suficiente para completar la venta')
        throw new Error(data.error || 'Error al procesar la venta')
      }

      setTicket({ num: data.order_number, lines: lines.map(l => ({ ...l, unitPrice: l.basePrice * (1 - discount / 100) })), total: data.total, subtotal: data.subtotal, igic: data.igic, payMethod, clientType, customerName, discount })
      setLines([]); setCustomerName(''); setCustomerNif(''); setDiscManual(0); setEntregado('')
      await recargarVentas(cajaAbierta?.opened_at)
    } catch (e) { alert('Error al cobrar: ' + e.message) }
    setSaving(false)
  }

  // ── APERTURA DE CAJA ────────────────────────────────────
  const abrirCaja = async () => {
    if (!efectivoApertura || isNaN(Number(efectivoApertura))) { alert('Introduce el efectivo de apertura'); return }
    try {
      const r = await fetch('/api/tpv-caja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ cash_open: Number(efectivoApertura), operator: 'TPV' }),
      })
      const data = await r.json()
      if (!data.ok) { alert('Error: ' + (data.error || 'No se pudo abrir la caja')); return }
      setCajaAbierta(data.session)
      setShowApertura(false)
      setEfectivoApertura('')
    } catch (e) { alert('Error: ' + (e?.message || e)) }
  }

  // ── CIERRE DE CAJA (Z) ─────────────────────────────────
  const cerrarCaja = async () => {
    if (!cajaAbierta) return
    if (!efectivoCierre && efectivoCierre !== '0') { alert('Introduce el efectivo en caja al cierre'); return }
    try {
      const r = await fetch('/api/tpv-caja', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: cajaAbierta.id, cash_close: Number(efectivoCierre), notes: cierreNotes }),
      })
      const data = await r.json()
      if (!data.ok) { alert('Error: ' + (data.error || 'No se pudo cerrar la caja')); return }
      // Imprimir el Z desde los totales AUTORITATIVOS del servidor (canal TPV + devoluciones
      // ya restadas), NO desde ventasDia (que sumaba pedidos web y no restaba devoluciones).
      imprimirZ(data.session, data.expected_cash)
    } catch (e) { alert('Error: ' + (e?.message || e)); return }
    setCajaAbierta(null)
    setShowCierre(false)
    setEfectivoCierre('')
    setCierreNotes('')
  }

  const imprimirZ = (cierre, expectedCash) => {
    if (!cierre) return
    const cashOpen = Number(cierre.cash_open || 0)
    const efectivo = Number(cierre.total_efectivo || 0)
    const tarjeta = Number(cierre.total_tarjeta || 0)   // el servidor mete bizum/tarjeta en este bucket
    const tickets = Number(cierre.num_tickets || 0)
    const contado = Number(cierre.cash_close || 0)
    const esperado = expectedCash != null ? Number(expectedCash) : (cashOpen + efectivo)
    const dif = contado - esperado
    const notes = cierre.notes || cierreNotes || ''
    const w = window.open('', '', 'width=380,height=500')
    if (!w) return
    w.document.write(`<html><body style="font-family:monospace;font-size:13px;padding:20px;width:300px">
      <h2 style="text-align:center">CIERRE DE CAJA — Z</h2>
      <p style="text-align:center">${new Date().toLocaleString('es-ES')}</p>
      <hr/>
      <p>Efectivo apertura: ${cashOpen.toFixed(2)} €</p>
      <p>Ventas efectivo: ${efectivo.toFixed(2)} €</p>
      <p>Ventas tarjeta/Bizum: ${tarjeta.toFixed(2)} €</p>
      <p>Total ventas: ${(efectivo+tarjeta).toFixed(2)} €</p>
      <p>Nº tickets: ${tickets}</p>
      <hr/>
      <p>Efectivo esperado en caja: ${esperado.toFixed(2)} €</p>
      <p>Efectivo en caja (contado): ${contado.toFixed(2)} €</p>
      <p>Diferencia: <b>${dif>=0?'+':''}${dif.toFixed(2)} €</b></p>
      ${notes ? '<p>Notas: ' + notes + '</p>' : ''}
    </body></html>`)
    w.print()
  }

  // ── DEVOLUCIÓN ─────────────────────────────────────────
  const buscarPedidoDev = async () => {
    if (!devOrderNum.trim()) return
    setDevLoading(true)
    try {
      const r = await fetch('/api/order-lookup?n=' + encodeURIComponent(devOrderNum.trim()))
      const data = await r.json()
      if (!data || !data.ok || !data.order) { alert('Pedido no encontrado'); setDevLoading(false); return }
      const ls = data.lines || []
      setDevOrder(data.order)
      setDevLines(ls)
      setDevSelected(Object.fromEntries(ls.map(l => [l.id, 0])))
    } catch { alert('Error al buscar el pedido') }
    setDevLoading(false)
  }

  const procesarDevolucion = async () => {
    const itemsDev = devLines.filter(l => devSelected[l.id] > 0).map(l => ({
      line_id: l.id, product_id: l.product_id, product_name: l.product_name,
      qty_dev: devSelected[l.id], unit_price: l.unit_price,
      importe: l.unit_price * devSelected[l.id]
    }))
    if (!itemsDev.length) { alert('Selecciona al menos un producto para devolver'); return }
    setDevSaving(true)
    try {
      // La devolución se procesa en el servidor (registro + reposición de stock)
      const r = await fetch('/api/tpv-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: devOrder.order_number,
          items: itemsDev,
          method: devMethod,
          motivo: devMotivo,
        }),
      })
      const data = await r.json()
      if (!r.ok || !data.ok) throw new Error(data.error || 'No se pudo procesar la devolución')
      setDevDone({ total: data.total, method: data.method, items: data.items })
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
    page: { display:'grid', gridTemplateColumns:'1fr 380px', height:'100vh', background:'#f1f5f9', color:'#111', fontFamily:'Heebo,Arial,sans-serif', position:'relative' },
    left: { display:'flex', flexDirection:'column', overflow:'hidden', borderRight:'1px solid #e2e8f0', background:'#f8fafc' },
    header: { padding:'10px 14px', background:'#111827', borderBottom:'1px solid #1f2937', display:'flex', alignItems:'center', gap:10 },
    searchInput: { flex:1, background:'white', border:'1px solid #d1d5db', color:'#111', padding:'8px 12px', fontSize:13, fontFamily:'inherit', borderRadius:6, outline:'none', boxShadow:'0 1px 2px rgba(0,0,0,0.05)' },
    catBar: { display:'flex', gap:4, padding:'8px 14px', background:'white', borderBottom:'1px solid #e2e8f0', overflowX:'auto', flexShrink:0, scrollbarWidth:'none' },
    catBtn: (active) => ({ padding:'4px 12px', fontSize:10, fontWeight:700, textTransform:'uppercase', border:'none', cursor:'pointer', background:active?'#ff1e41':'#f1f5f9', color:active?'white':'#374151', borderRadius:12, whiteSpace:'nowrap', fontFamily:'inherit', transition:'all 0.15s' }),
    grid: { flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, padding:8, background:'#e2e8f0', alignContent:'start' },
    card: { background:'white', cursor:'pointer', display:'flex', flexDirection:'column', padding:'8px 6px', alignItems:'center', textAlign:'center', transition:'all 0.15s', borderRadius:8, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', border:'1px solid #e2e8f0' },
    right: { display:'flex', flexDirection:'column', background:'white', borderLeft:'1px solid #e2e8f0' },
    tipoBtn: (active, activeColor) => ({ padding:'14px 8px', fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:0.5, border:'2px solid '+(active?(activeColor||'#ff1e41'):'#e2e8f0'), cursor:'pointer', background:active?(activeColor||'#ff1e41'):'white', color:active?'white':'#374151', fontFamily:'inherit', borderRadius:8, transition:'all 0.15s', boxShadow:active?'0 2px 8px rgba(0,0,0,0.15)':'none' }),
    nivelBtn: (active, type) => ({ padding:'10px 4px', fontSize:12, fontWeight:800, textTransform:'uppercase', lineHeight:1.3, border:'2px solid '+(active?CLIENT_COLORS[type]:'#e2e8f0'), cursor:'pointer', background:active?CLIENT_COLORS[type]:'white', color:active?(type==='bronze'?'white':'#111'):'#374151', fontFamily:'inherit', borderRadius:8, transition:'all 0.15s' }),
    ticket: { flex:1, overflowY:'auto', padding:'12px', background:'#fafafa' },
    lineRow: { display:'flex', alignItems:'center', gap:6, padding:'7px 0', borderBottom:'1px solid #f1f5f9' },
    footer: { borderTop:'1px solid #e2e8f0', padding:'12px', background:'white' },
    payRow: { display:'flex', gap:3, marginBottom:8 },
    payBtn: (active) => ({ flex:1, padding:'8px 2px', fontSize:11, fontWeight:700, border:'none', cursor:'pointer', background:active?'#ff1e41':'#f1f5f9', color:active?'white':'#374151', fontFamily:'inherit', borderRadius:4, transition:'all 0.15s' }),
    cobraBtn: { width:'100%', padding:14, background:saving?'#64748b':'#ff1e41', color:'white', border:'none', fontWeight:900, fontSize:16, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', letterSpacing:1, borderRadius:6, transition:'all 0.2s' },
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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:2000, backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'white', border:'none', borderRadius:12, boxShadow:'0 20px 60px rgba(0,0,0,0.3)', padding:0, width:'100%', maxWidth:480, maxHeight:'90vh', overflow:'auto' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc', borderRadius:'12px 12px 0 0' }}>
          <span style={{ fontWeight:800, fontSize:15, color:'#111' }}>{titulo}</span>
          <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', color:'#6b7280', cursor:'pointer', fontSize:16, lineHeight:1, width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ padding:'18px' }}>{children}</div>
      </div>
    </div>
  )

  const inputSt = { width:'100%', background:'white', border:'1px solid #d1d5db', color:'#111', padding:'10px 12px', fontSize:13, fontFamily:'inherit', borderRadius:6, outline:'none', boxSizing:'border-box', boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }
  const btnRed = { background:'#ff1e41', color:'white', border:'none', padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer', borderRadius:3, fontFamily:'inherit', width:'100%' }
  const btnGray = { background:'white', color:'#374151', border:'1px solid #d1d5db', padding:'9px 18px', fontWeight:600, fontSize:13, cursor:'pointer', borderRadius:6, fontFamily:'inherit', boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }

  // ── VISTA TICKET COMPLETADO ────────────────────────────
  if (ticket) return (
    <div style={{ background:'#f8fafc', color:'#111', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>
      <div style={{ textAlign:'center', maxWidth:380, padding:32 }}>
        <div style={{ fontSize:72, marginBottom:12 }}>✅</div>
        <h2 style={{ fontSize:28, fontWeight:900, margin:'0 0 6px', color:'#ff1e41' }}>¡Cobrado!</h2>
        <p style={{ color:'#888', margin:'0 0 4px' }}>Pedido <strong style={{ color:'#111' }}>{ticket.num}</strong></p>
        <div style={{ background:'white', border:'1px solid #e2e8f0', padding:'20px', margin:'20px 0', borderRadius:12, boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
          {ticket.lines.map(l => (
            <div key={l.key} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'5px 0', borderBottom:'1px solid #f1f5f9' }}>
              <span style={{ color:'#4b5563' }}>{l.product.name} ×{l.qty}</span>
              <span style={{ color:'#111' }}>{(l.unitPrice*l.qty).toFixed(2)} €</span>
            </div>
          ))}
          {ticket.discount>0 && <div style={{ fontSize:12, color:'#f59e0b', marginTop:8 }}>Dto. {ticket.discount}% aplicado</div>}
          <div style={{ borderTop:'2px solid #f1f5f9', marginTop:12, paddingTop:12, display:'flex', justifyContent:'space-between', fontSize:22, fontWeight:900, color:'#111' }}>
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
            <div key={l} style={{ background:'white', border:'1px solid #e2e8f0', padding:'10px 6px', borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize:16, fontWeight:900, color:'#ff1e41' }}>{v}</div>
              <div style={{ fontSize:9, color:'#555', marginTop:2, textTransform:'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Pantalla de bloqueo del TPV (PIN) ──────────────────
  if (tpvAuth !== true) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#111', fontFamily:'Arial,sans-serif' }}>
      {tpvAuth === null ? (
        <div style={{ color:'#888', fontSize:15 }}>Cargando TPV…</div>
      ) : (
        <div style={{ width:'100%', maxWidth:360, background:'#1b1b1b', padding:36, borderRadius:8, textAlign:'center' }}>
          <div style={{ fontSize:26, fontWeight:900, fontStyle:'italic', color:'#ff1e41', marginBottom:6 }}>BUYMUSCLE</div>
          <div style={{ color:'#888', fontSize:13, marginBottom:24 }}>Terminal de punto de venta</div>
          {pinErr && <div style={{ background:'#3a1111', color:'#ff8080', fontSize:13, padding:'8px 12px', borderRadius:4, marginBottom:14 }}>{pinErr}</div>}
          <input type="password" inputMode="numeric" value={pinInput} autoFocus
            onChange={e=>setPinInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&pinInput&&!pinLoading&&entrarTpv()}
            placeholder="PIN de acceso"
            style={{ width:'100%', padding:'14px', fontSize:22, textAlign:'center', letterSpacing:6, border:'1px solid #333', background:'#111', color:'white', borderRadius:6, boxSizing:'border-box', marginBottom:16 }}/>
          <button onClick={entrarTpv} disabled={pinLoading||!pinInput}
            style={{ width:'100%', background:'#ff1e41', color:'white', border:'none', padding:'14px', fontSize:15, fontWeight:700, borderRadius:6, cursor:'pointer', opacity:(pinLoading||!pinInput)?0.6:1 }}>
            {pinLoading?'Comprobando…':'Entrar'}
          </button>
        </div>
      )}
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
              <div key={l} style={{ background:'#f8fafc', padding:'12px 8px', borderRadius:8, textAlign:'center', border:'1px solid #e2e8f0' }}>
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
            <div style={{ fontSize:13, marginBottom:12, padding:'10px 14px', background:'#f8fafc', borderRadius:8, border:'1px solid #e2e8f0' }}>
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
              <div style={{ background:'#f8fafc', padding:'12px 14px', borderRadius:8, marginBottom:14, fontSize:13, border:'1px solid #e2e8f0' }}>
                <div style={{ fontWeight:700, color:'#111', marginBottom:2 }}>Pedido {devOrder.order_number}</div>
                <div style={{ color:'#6b7280' }}>{devOrder.customer_name} · {Number(devOrder.total).toFixed(2)} € · {devOrder.payment_method}</div>
              </div>

              <div style={{ marginBottom:14 }}>
                {devLines.map(l => (
                  <div key={l.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, color:'#111' }}>{l.product_name}</div>
                      <div style={{ fontSize:11, color:'#6b7280' }}>×{l.quantity} · {Number(l.unit_price).toFixed(2)} €/ud</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <button onClick={()=>setDevSelected(s=>({...s,[l.id]:Math.max(0,(s[l.id]||0)-1)}))}
                        style={{ width:28, height:28, border:'1px solid #d1d5db', background:'white', color:'#111', cursor:'pointer', fontSize:16, borderRadius:4 }}>−</button>
                      <span style={{ width:24, textAlign:'center', fontSize:13, fontWeight:700 }}>{devSelected[l.id]||0}</span>
                      <button onClick={()=>setDevSelected(s=>({...s,[l.id]:Math.min(l.quantity,(s[l.id]||0)+1)}))}
                        style={{ width:28, height:28, border:'1px solid #d1d5db', background:'white', color:'#111', cursor:'pointer', fontSize:16, borderRadius:4 }}>+</button>
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
                      style={{ ...btnGray, flex:1, background:devMethod===m?'#ff1e41':'white', color:devMethod===m?'white':'#374151', borderColor:devMethod===m?'#ff1e41':'#d1d5db', borderRadius:3 }}>
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
                Se han devuelto <strong style={{ color:'#111' }}>{devDone.total.toFixed(2)} €</strong> en {devDone.method}
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
          <input ref={searchRef} style={ST.searchInput} placeholder="Buscar producto..." defaultValue={search}
            onChange={e=>{ const v=e.target.value; clearTimeout(searchTimer.current); searchTimer.current=setTimeout(()=>setSearch(v),120) }} autoFocus/>
          <span style={{ fontSize:10, color:'#555', whiteSpace:'nowrap' }}>{filtered.length} prods</span>
          {/* Botones rápidos de caja */}
          <div style={{ display:'flex', gap:4 }}>
            {!cajaAbierta ? (
              <button onClick={()=>setShowApertura(true)} title="Abrir caja"
                style={{ background:'rgba(34,197,94,0.15)', border:'1px solid #22c55e', color:'#22c55e', padding:'5px 10px', fontSize:11, fontWeight:700, cursor:'pointer', borderRadius:3, whiteSpace:'nowrap', fontFamily:'inherit' }}>
                🟢 Abrir
              </button>
            ) : (
              <button onClick={()=>setShowCierre(true)} title="Cierre de caja"
                style={{ background:'rgba(220,38,38,0.15)', border:'1px solid #dc2626', color:'#ef4444', padding:'5px 10px', fontSize:11, fontWeight:700, cursor:'pointer', borderRadius:3, whiteSpace:'nowrap', fontFamily:'inherit' }}>
                🔴 Cierre Z
              </button>
            )}
            <button onClick={()=>setShowDevolucion(true)} title="Procesar devolución"
              style={{ background:'rgba(245,158,11,0.15)', border:'1px solid #f59e0b', color:'#f59e0b', padding:'5px 10px', fontSize:11, fontWeight:700, cursor:'pointer', borderRadius:3, whiteSpace:'nowrap', fontFamily:'inherit' }}>
              ↩️ Dev.
            </button>
          </div>
        </div>

        {/* Stats del día */}
        <div style={{ display:'flex', gap:0, background:'#e2e8f0', flexShrink:0, borderBottom:'1px solid #e2e8f0' }}>
          {[
            {l:'Hoy',v:ventasDia.total.toFixed(0)+'€',c:'#ff1e41'},
            {l:'Tickets',v:ventasDia.count,c:'#111'},
            {l:'Efectivo',v:ventasDia.efectivo.toFixed(0)+'€',c:'#22c55e'},
            {l:'Tarjeta',v:(ventasDia.tarjeta+ventasDia.bizum).toFixed(0)+'€',c:'#3b82f6'},
            {l:'Caja',v:cajaAbierta?'ABIERTA':'CERRADA',c:cajaAbierta?'#22c55e':'#ef4444'},
          ].map(({l,v,c})=>(
            <div key={l} style={{ flex:1, padding:'6px 4px', background:'white', textAlign:'center', borderRight:'1px solid #e2e8f0' }}>
              <div style={{ fontSize:13, fontWeight:900, color:c }}>{v}</div>
              <div style={{ fontSize:8, color:'#94a3b8', textTransform:'uppercase', marginTop:2, letterSpacing:'0.05em' }}>{l}</div>
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
            {filtered.slice(0, 90).map(p => {
              const price = p.on_sale && p.sale_price ? Number(p.sale_price) : Number(p.price_incl_tax)
              const cat = p.categories?.name || ''
              return (
                <div key={p.id} style={ST.card}
                  onClick={() => addLine(p)}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 12px rgba(255,30,65,0.3)'}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.3)'}>
                  <div style={{ width:'100%', height:160, background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:4, marginBottom:6, overflow:'hidden' }}>
                    <ProdImg url={p.image_url}/>
                  </div>
                  <div style={{ fontSize:10, color:'#64748b', marginBottom:2, lineHeight:1.2, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.name}</div>
                  <div style={{ fontSize:13, fontWeight:900, color:'#ff1e41', marginTop:'auto', padding:'4px 0 6px' }}>{price.toFixed(2)}€</div>
                  {p.stock <= 5 && <div style={{ fontSize:8, color:'#f59e0b', marginTop:0, paddingBottom:4 }}>⚠️ Stock: {p.stock}</div>}
                </div>
              )
            })}
            {filtered.length > 90 && (
              <div style={{ gridColumn:'1 / -1', flexBasis:'100%', width:'100%', textAlign:'center', color:'#94a3b8', fontSize:11, padding:'10px 0' }}>
                Mostrando 90 de {filtered.length} · escribe en el buscador para afinar
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ PANEL DERECHO — TICKET ═════════════════════ */}
      <div style={ST.right}>
        {/* Tipo de cliente: PARTICULAR / DISTRIBUIDOR */}
        <div style={{ padding:8, background:'#f1f5f9', borderBottom:'1px solid #e2e8f0', flexShrink:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            <button style={ST.tipoBtn(clientType==='particular')}
              onClick={()=>{ setClientType('particular'); setDiscManual(0) }}>
              👤 Particular
            </button>
            <button style={ST.tipoBtn(clientType!=='particular', '#334155')}
              onClick={()=>{ if (clientType==='particular') setClientType('bronze'); setDiscManual(0) }}>
              🏢 Distribuidor
            </button>
          </div>
          {clientType!=='particular' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginTop:6 }}>
              {[['bronze','🥉 Bronce'],['silver','🥈 Plata'],['gold','🥇 Oro']].map(([t,label]) => (
                <button key={t} style={ST.nivelBtn(clientType===t, t)}
                  onClick={()=>{ setClientType(t); setDiscManual(0) }}>
                  {label}<br/><span style={{ fontSize:11, opacity:.9 }}>−{DISCOUNTS[t]}%</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nombre cliente + NIF en una fila */}
        <div style={{ padding:'6px 8px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', display:'flex', gap:4 }}>
          <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Nombre cliente"
            style={{ flex:2, background:'white', border:'1px solid #d1d5db', color:'#111', padding:'6px 10px', fontSize:12, fontFamily:'inherit', outline:'none', borderRadius:4 }}/>
          <input value={customerNif} onChange={e=>setCustomerNif(e.target.value)} placeholder="NIF/CIF"
            style={{ flex:1, background:'white', border:'1px solid #d1d5db', color:'#111', padding:'6px 10px', fontSize:12, fontFamily:'inherit', outline:'none', borderRadius:4 }}/>
        </div>

        {/* Líneas del ticket */}
        <div style={ST.ticket}>
          {lines.length === 0 ? (
            <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#94a3b8', gap:8 }}>
              <span style={{ fontSize:48 }}>🛒</span>
              <span style={{ fontSize:12 }}>Haz click en un producto</span>
              <span style={{ fontSize:10, color:'#9ca3af' }}>Enter = cobrar · Esc = vaciar</span>
            </div>
          ) : (
            lines.map(l => (
              <div key={l.key} style={ST.lineRow}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:'#111', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontWeight:500 }}>
                    {l.product.name}{l.variantLabel?' – '+l.variantLabel:''}
                  </div>
                  <div style={{ fontSize:10, color:'#6b7280' }}>{(l.basePrice*(1-discount/100)).toFixed(2)}€/ud</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:3, flexShrink:0 }}>
                  <button onClick={()=>updateQty(l.key, l.qty-1)} style={{ width:26, height:26, border:'1px solid #d1d5db', background:'white', color:'#111', cursor:'pointer', fontSize:14, padding:0, borderRadius:4 }}>−</button>
                  <span style={{ width:20, textAlign:'center', fontSize:13, fontWeight:700, color:'#111' }}>{l.qty}</span>
                  <button onClick={()=>updateQty(l.key, l.qty+1)} style={{ width:26, height:26, border:'1px solid #d1d5db', background:'white', color:'#111', cursor:'pointer', fontSize:14, padding:0, borderRadius:4 }}>+</button>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:'#111', width:56, textAlign:'right', flexShrink:0 }}>{(l.basePrice*(1-discount/100)*l.qty).toFixed(2)}€</span>
                <button onClick={()=>updateQty(l.key, 0)} style={{ background:'none', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:16, padding:0, flexShrink:0 }}>✕</button>
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
              placeholder="0" style={{ width:50, background:'white', border:'1px solid #d1d5db', color:'#111', padding:'4px 6px', fontSize:12, textAlign:'center', fontFamily:'inherit', outline:'none', borderRadius:2 }}/>
            <span style={{ fontSize:10, color:'#6b7280' }}>activo: <strong style={{ color: discount>0?'#f59e0b':'#555' }}>{discount}%</strong></span>
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
                <span>Subtotal</span><span>{subtotalPVP.toFixed(2)} €</span>
              </div>
              {discount > 0 && <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#f59e0b' }}>
                <span>Descuento {discount}%</span><span>-{(subtotalPVP*discount/100).toFixed(2)} €</span>
              </div>}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#555' }}>
                <span>IGIC 7%</span><span>{igic.toFixed(2)} €</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:17, fontWeight:900, color:'#ff1e41', borderTop:'1px solid #333', paddingTop:6, marginTop:4 }}>
                <span>TOTAL</span><span>{total.toFixed(2)} €</span>
              </div>
            </div>
          )}

          {/* Cambio en efectivo — solo con pago en efectivo */}
          {payMethod==='efectivo' && lines.length>0 && (
            <div style={{ marginBottom:8, padding:'8px 10px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:6, display:'flex', flexDirection:'column', gap:5 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <span style={{ fontSize:11, color:'#555', textTransform:'uppercase', fontWeight:700 }}>Entregado €</span>
                <input type="number" min="0" step="0.01" value={entregado} onChange={e=>setEntregado(e.target.value)}
                  placeholder="0.00"
                  style={{ width:110, background:'white', border:'1px solid #d1d5db', color:'#111', padding:'6px 8px', fontSize:16, textAlign:'right', fontWeight:700, fontFamily:'inherit', outline:'none', borderRadius:4 }}/>
              </div>
              {entregado!=='' && !isNaN(Number(entregado)) && (
                Number(entregado) >= total ? (
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:900, color:'#16a34a' }}>
                    <span>Cambio</span><span>{(Number(entregado)-total).toFixed(2)} €</span>
                  </div>
                ) : (
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:800, color:'#ef4444' }}>
                    <span>Falta</span><span>{(total-Number(entregado)).toFixed(2)} €</span>
                  </div>
                )
              )}
            </div>
          )}

          <button style={ST.cobraBtn} onClick={cobrar} disabled={saving||!lines.length}>
            {saving ? 'Procesando...' : lines.length ? `COBRAR ${total.toFixed(2)} €` : 'TICKET VACÍO'}
          </button>

          {/* Ventas resumen del día debajo del cobrar */}
          <div style={{ borderTop:'1px solid #e2e8f0', marginTop:10, paddingTop:8, display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:10, color:'#9ca3af', textTransform:'uppercase' }}>Ventas hoy</span>
            <span style={{ fontSize:10, color:'#ff1e41', fontWeight:700 }}>{ventasDia.total.toFixed(2)} € · {ventasDia.count} tickets</span>
          </div>
        </div>
      </div>

      {/* ══ MODAL VARIANTES ════════════════════════════ */}
      {variantModal && (
        <Modal titulo={'Elige variante — ' + variantModal.product.name} onClose={()=>setVariantModal(null)}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {variantModal.variants.map(v => {
              const raw = v.attribute_values
              const attrs = Array.isArray(raw) ? raw : (raw ? [raw] : [])
              const label = attrs.map(a => (a?.attribute_types?.name ? a.attribute_types.name+': ' : '') + (a?.value ?? '')).filter(Boolean).join(' · ')
              return (
                <button key={v.id} onClick={()=>_addToLines(variantModal.product, label, v.id, v.stock)}
                  style={{ padding:'8px 16px', background:'white', border:'1px solid #d1d5db', color:'#111', cursor:'pointer', fontSize:12, fontFamily:'inherit', borderRadius:3 }}>
                  {label}<div style={{ fontSize:9, color:'#888', marginTop:2 }}>Stock: {v.stock}</div>
                </button>
              )
            })}
          </div>
        </Modal>
      )}

      {/* Modal ticket tras cobro */}
      {ticket && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}
          onClick={e=>{if(e.target===e.currentTarget)setTicket(null)}}>
          <div style={{background:'white',borderRadius:12,padding:'1.5rem',maxWidth:340,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
            <TicketTPV
              ticketNumber={ticket.num}
              lines={(ticket.lines||[]).map(l=>({name:l.product?.name||l.name||'',qty:l.qty,unit_price:l.unitPrice,subtotal:l.qty*l.unitPrice}))}
              total={ticket.total}
              paymentMethod={ticket.payMethod||'tarjeta'}
              cashGiven={ticket.cashGiven}
              cashChange={ticket.cashChange}
              onClose={()=>setTicket(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
