// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const db = createClient(
  'https://awwlbepjxuoxaigztugh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
)

const DISCOUNTS = { particular:0, bronze:10, silver:15, gold:20 }
const CLIENT_COLORS = { particular:'#555', bronze:'#cd7f32', silver:'#aaa', gold:'#ffd700' }
const PAYMENT_ICONS = { efectivo:'💵', tarjeta:'💳', bizum:'📱' }

export default function TPVPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('Todos')
  const [lines, setLines] = useState([])
  const [discPct, setDiscPct] = useState(0)
  const [clientType, setClientType] = useState('particular')
  const [payMethod, setPayMethod] = useState('tarjeta')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ticket, setTicket] = useState(null) // orden confirmada
  const [variantModal, setVariantModal] = useState(null) // {product, variants}
  const [customerName, setCustomerName] = useState('')
  const [customerNif, setCustomerNif] = useState('')
  const searchTimer = useRef(null)
  const [ventasDia, setVentasDia] = useState({total:0,count:0})
  const [topFavs, setTopFavs] = useState([])
    const searchRef = useRef(null)

  // Cargar productos y categorías
  useEffect(() => {
    db.from('products').select('*, categories(name)').eq('active', true).gt('stock', 0).order('name').limit(500)
      .then(({ data }) => {
        const prods = data || []
        setProducts(prods)
        setFiltered(prods)
        // Extraer categorías únicas
        const cats = ['Todos', ...new Set(prods.map(p => p.categories?.name).filter(Boolean).sort())]
        setCategories(cats)
        setLoading(false)
      // v4: Ventas del día
      try {
        const today = new Date(); today.setHours(0,0,0,0);
        const {data:orders} = await db.from('orders').select('total').gte('created_at',today.toISOString());
        if(orders) setVentasDia({total:orders.reduce((s,o)=>s+Number(o.total),0),count:orders.length});
      } catch(e){}
      // v2: Top productos frecuentes para favoritos rápidos
      try {
        const {data:prods} = await db.from('products').select('id,name,price_incl_tax,stock').eq('active',true).gt('stock',0).order('id',{ascending:false}).limit(8);
        if(prods) setTopFavs(prods);
      } catch(e){}
      })
  }, [])

  // Filtrar por búsqueda y categoría
  useEffect(() => {
    let f = products
    if (catFilter !== 'Todos') f = f.filter(p => p.categories?.name === catFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      f = f.filter(p => p.name.toLowerCase().includes(q) || p.categories?.name?.toLowerCase().includes(q))
    }
    setFiltered(f)
  }, [search, catFilter, products])


  useEffect(() => {
    let buf = '', t
    const sk = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 'Enter' && buf.length > 2) { setSearch(buf.trim()); buf = ''; return }
      if (/^[\w\d\-]$/.test(e.key)) { buf += e.key; clearTimeout(t); t = setTimeout(() => { buf = '' }, 200) }
    }
    document.addEventListener('keydown', sk)
    return () => { document.removeEventListener('keydown', sk); clearTimeout(t) }
  }, [])
  // Tecla Escape → limpiar
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setLines([]); setSearch(''); searchRef.current?.focus() }
      if (e.key === 'Enter' && lines.length > 0 && !saving) cobrar()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lines, saving])

  const discount = DISCOUNTS[clientType]

  const addLine = async (product) => {
    // Ver si tiene variantes
    const { data: variants } = await db.from('product_variants')
      .select('*, attribute_values(value, attribute_types(name))')
      .eq('product_id', product.id).eq('active', true).gt('stock', 0)

    if (variants && variants.length > 0) {
      setVariantModal({ product, variants })
      return
    }
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
  const tax = subtotal * 0.07 // IGIC 7% Canarias
  const total = subtotal + tax

  const cobrar = async () => {
    if (!lines.length) return
    setSaving(true)
    try {
      const isDistributor = clientType !== 'particular'
      const channel = isDistributor ? 'tpv_distributor' : 'tpv_retail'
      const num = 'BM-TPV-' + Date.now().toString().slice(-8)

      const { data: order, error } = await db.from('orders').insert({
        order_number: num,
        channel,
        customer_name: customerName || (clientType === 'particular' ? 'Venta directa' : 'Distribuidor ' + clientType),
        customer_nif: customerNif || null,
        customer_email: 'tpv@buymuscle.es',
        subtotal,
        tax_amount: tax,
        shipping_cost: 0,
        total,
        discount_pct: discount,
        payment_method: payMethod,
        status: 'paid', // TPV = pagado al momento
        notes: 'Venta TPV · ' + payMethod + (customerName ? ' · ' + customerName : '')
      }).select().single()

      if (error) throw error

      await db.from('order_lines').insert(
        lines.map(l => ({
          order_id: order.id,
          product_id: l.product.id,
          product_name: l.product.name + (l.variantLabel ? ' - ' + l.variantLabel : ''),
          quantity: l.qty,
          unit_price: l.unitPrice,
          tax_rate: 7,
          line_total: l.unitPrice * l.qty
        }))
      )

      // Descontar stock
      for (const l of lines) {
        const { data: p } = await db.from('products').select('stock').eq('id', l.product.id).single()
        if (p) await db.from('products').update({ stock: Math.max(0, p.stock - l.qty) }).eq('id', l.product.id)
      }

      // Llamar a API para Holded
      fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map(l => ({ id: l.product.id, name: l.product.name + (l.variantLabel ? ' - ' + l.variantLabel : ''), price: l.unitPrice, qty: l.qty })),
          customer: { name: customerName || 'Venta TPV', email: 'tpv@buymuscle.es', phone: '', address: 'TPV BuyMuscle', city: 'Las Palmas', postal_code: '35001', province: 'Las Palmas', nif: customerNif || '' },
          shipping_cost: 0,
          discount_pct: discount
        })
      }).catch(() => {})

      setTicket({ num, lines: [...lines], total, payMethod, clientType, customerName, tax, subtotal })

      // Puntos de fidelizacion (1 punto por euro — solo particulares con nombre)
      if(clientType==='particular' && customerName && customerName.trim().length>2){
        try{
          // Buscar cliente por nombre para obtener customer_id
          const cr=await db.from('customers').select('id').ilike('name','%'+customerName.trim()+'%').limit(1)
          const custId=cr.data&&cr.data.length>0?cr.data[0].id:null
          if(custId){
            const pts=Math.floor(subtotal)
            await db.from('loyalty_points').insert({customer_id:custId,order_id:num,points:pts,reason:'Compra TPV '+num})
          }
        }catch(e){/* silencioso */}
      }
      setLines([])
      setCustomerName('')
      setCustomerNif('')
    } catch (e) {
      alert('Error: ' + e.message)
    }
    setSaving(false)
  }

  const printTicket = () => window.print()

  const S = {
    page: { display:'grid', gridTemplateColumns:'1fr 340px', height:'100vh', background:'#111', color:'white', fontFamily:'var(--font-body,Arial)' },
    left: { display:'flex', flexDirection:'column', overflow:'hidden', borderRight:'1px solid #222' },
    header: { padding:'12px 16px', background:'#0a0a0a', borderBottom:'1px solid #222', display:'flex', gap:12, alignItems:'center' },
    searchInput: { flex:1, background:'#1a1a1a', border:'1px solid #333', color:'white', padding:'8px 12px', fontSize:14, outline:'none', fontFamily:'inherit' },
    catBar: { display:'flex', gap:6, padding:'8px 16px', background:'#0d0d0d', borderBottom:'1px solid #1a1a1a', overflowX:'auto', flexShrink:0 },
    catBtn: (active) => ({ padding:'4px 12px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', border:'none', cursor:'pointer', whiteSpace:'nowrap', background:active?'var(--red)':'#222', color:active?'white':'#aaa' }),
    grid: { flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:1, background:'#1a1a1a', padding:1, alignContent:'start' },
    card: { background:'#111', cursor:'pointer', display:'flex', flexDirection:'column', padding:'8px', transition:'background 0.1s', border:'1px solid transparent' },
    right: { display:'flex', flexDirection:'column', background:'#0a0a0a' },
    clientRow: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, padding:'8px', background:'#111', borderBottom:'1px solid #222' },
    clientBtn: (active, type) => ({ padding:'6px 4px', fontSize:11, fontWeight:700, textTransform:'uppercase', border:'none', cursor:'pointer', background:active?CLIENT_COLORS[type]:'#222', color:active?'#000':'#888', transition:'all 0.15s' }),
    ticket: { flex:1, overflowY:'auto', padding:'8px' },
    lineRow: { display:'flex', alignItems:'center', gap:6, padding:'6px 0', borderBottom:'1px solid #1a1a1a', fontSize:12 },
    footer: { borderTop:'1px solid #222', padding:'12px' },
    payRow: { display:'flex', gap:4, marginBottom:10 },
    payBtn: (active) => ({ flex:1, padding:'7px 4px', fontSize:12, fontWeight:700, border:'none', cursor:'pointer', background:active?'#ff1e41':'#222', color:'white', transition:'all 0.15s' }),
    cobraBtn: { width:'100%', padding:14, background: saving ? '#555' : '#ff1e41', color:'white', border:'none', fontSize:16, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.05em', cursor: saving ? 'default' : 'pointer' },
  }

  const imprimirTicket = () => {
    const factor = 1 - discPct / 100
    const rows = lines.map(l => '<tr><td>' + l.name + '</td><td style="text-align:right">' + l.qty + 'x ' + (l.price*l.qty*factor).toFixed(2) + ' €</td></tr>').join('')
    const tot = lines.reduce((s,l)=>s+l.price*l.qty,0)*factor
    const w = window.open('','','width=380,height=600')
    w.document.write('<html><head><style>body{font-family:monospace;font-size:12px;width:300px;padding:8px}h2,p{text-align:center}hr{border:none;border-top:1px dashed #000;margin:5px 0}table{width:100%}</style></head><body><h2>BUYMUSCLE</h2><p>Telde, Las Palmas</p><hr><table>'+rows+'</table><hr><p style="font-weight:bold;text-align:right">TOTAL: '+tot.toFixed(2)+' €</p>'+(discPct>0?'<p>Dto: '+discPct+'%</p>':'')+'<p style="font-size:10px">Gracias por tu compra</p></body></html>')
    w.print()
  }

  return (
    <div style={S.page}>
      {/* IZQUIERDA — PRODUCTOS */}
      <div style={S.left}>
        {/* Header busqueda */}
        <div style={S.header}>
          <a href="/" style={{ color:'#ff1e41', fontWeight:900, fontSize:18, textDecoration:'none', letterSpacing:1 }}>BM</a>
          <input ref={searchRef} style={S.searchInput} placeholder="Buscar producto..." value={search}
            onChange={e=>{ const v=e.target.value; clearTimeout(searchTimer.current); searchTimer.current=setTimeout(()=>setSearch(v),200) }} autoFocus />
          <span style={{ fontSize:11, color:'#555', whiteSpace:'nowrap' }}>{filtered.length} prods</span>
        </div>

        
        {/* v2 ACCESO RAPIDO — productos frecuentes */}
        {lines.length===0 && (
          <div style={{padding:'8px 12px',borderBottom:'1px solid #2a2a2a',background:'#0d0d0d'}}>
            <div style={{fontSize:10,color:'#555',marginBottom:6,letterSpacing:'0.08em',textTransform:'uppercase'}}>Acceso rapido</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {products.slice(0,8).map(p=>(
                <button key={p.id} onClick={()=>addLine(p)}
                  style={{padding:'4px 10px',background:'#1a1a1a',border:'1px solid #333',borderRadius:3,color:'white',fontSize:11,cursor:'pointer',fontFamily:'inherit',transition:'border-color 0.15s',whiteSpace:'nowrap',overflow:'hidden',maxWidth:130,textOverflow:'ellipsis'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='#ff1e41'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='#333'}
                  title={p.name}>
                  {p.name.slice(0,18)}{p.name.length>18?'...':''}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* v2 FAVORITOS RÁPIDOS */}
        {topFavs.length>0&&(
          <div style={{padding:'6px 10px',borderBottom:'1px solid #222',display:'flex',gap:4,flexWrap:'wrap',alignItems:'center'}}>
            <span style={{fontSize:9,color:'#666',textTransform:'uppercase',letterSpacing:'0.08em',marginRight:4}}>⚡</span>
            {topFavs.map(p=>(
              <button key={p.id} onClick={()=>addLine(p)}
                style={{fontSize:10,padding:'4px 8px',background:'#1a1a1a',border:'1px solid #333',color:p.stock<=5?'#f59e0b':'#aaa',borderRadius:3,cursor:'pointer',whiteSpace:'nowrap',maxWidth:110,overflow:'hidden',textOverflow:'ellipsis'}}
                title={p.name}>
                {p.name.slice(0,14)}{p.name.length>14?'…':''}
              </button>
            ))}
          </div>
        )}
                {/* Filtros categoría */}
        <div style={S.catBar}>
          {categories.map(cat => (
            <button key={cat} style={S.catBtn(catFilter===cat)} onClick={() => setCatFilter(cat)}>{cat}</button>
          ))}
        </div>

        {/* Grid productos */}
        <div style={S.grid}>
          {loading && <div style={{ gridColumn:'1/-1', padding:'2rem', textAlign:'center', color:'#555' }}>Cargando productos...</div>}
          {!loading && filtered.length === 0 && <div style={{ gridColumn:'1/-1', padding:'2rem', textAlign:'center', color:'#555' }}>Sin resultados</div>}
          {filtered.map(p => {
            const price = p.on_sale && p.sale_price ? Number(p.sale_price) : Number(p.price_incl_tax)
            const discPrice = price * (1 - discount/100)
            return (
              <div key={p.id} style={S.card}
                onClick={() => addLine(p)}
                onMouseEnter={e => e.currentTarget.style.background='#1a1a1a'}
                onMouseLeave={e => e.currentTarget.style.background='#111'}>
                {/* Imagen */}
                <div style={{ width:'100%', aspectRatio:'1', background:'#1a1a1a', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:6, overflow:'hidden' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }} onError={e => e.target.style.display='none'}/>
                    : <span style={{ fontSize:24, opacity:0.3 }}>📦</span>}
                </div>
                {/* Nombre */}
                <div style={{ fontSize:10, color:'#ccc', lineHeight:1.3, marginBottom:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.name}</div>
                {/* Precio */}
                <div style={{ fontSize:13, fontWeight:900, color:'#ff1e41' }}>{discPrice.toFixed(2)} €</div>
                {discount > 0 && <div style={{ fontSize:9, color:'#555', textDecoration:'line-through' }}>{price.toFixed(2)} €</div>}
                {/* Stock bajo */}
                {p.stock <= 5 && <div style={{ fontSize:9, color:'#f59e0b', marginTop:2 }}>⚠ {p.stock} uds</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* DERECHA — TICKET */}
      <div style={S.right}>
        {/* Tipo cliente */}
        <div style={S.clientRow}>
          {(['particular','bronze','silver','gold']).map(t => (
            <button key={t} style={S.clientBtn(clientType===t, t)} onClick={() => setClientType(t)}>
              {t==='particular'?'Partic.':t.charAt(0).toUpperCase()+t.slice(1)}<br/>
              <span style={{ fontSize:9 }}>{DISCOUNTS[t]>0?'-'+DISCOUNTS[t]+'%':'PVP'}</span>
            </button>
          ))}
        </div>

        {/* Datos cliente opcionales */}
        <div style={{ padding:'6px 8px', display:'flex', gap:6, borderBottom:'1px solid #1a1a1a' }}>
          <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Nombre cliente (opcional)"
            style={{ flex:1, background:'#1a1a1a', border:'1px solid #333', color:'white', padding:'5px 8px', fontSize:11, fontFamily:'inherit', outline:'none' }}/>
          <input value={customerNif} onChange={e=>setCustomerNif(e.target.value)} placeholder="NIF"
            style={{ width:80, background:'#1a1a1a', border:'1px solid #333', color:'white', padding:'5px 8px', fontSize:11, fontFamily:'inherit', outline:'none' }}/>
        </div>

        {/* Líneas ticket */}
        <div style={S.ticket}>
          {lines.length === 0 && (
            <div style={{ textAlign:'center', padding:'2rem', color:'#333' }}>
              <div style={{ fontSize:48, marginBottom:8 }}>🛒</div>
              <div style={{ fontSize:12 }}>TICKET VACÍO</div>
              <div style={{ fontSize:10, color:'#555', marginTop:4 }}>Haz click en un producto</div>
            </div>
          )}
          {lines.map(l => (
            <div key={l.key} style={S.lineRow}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, color:'#ccc', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.product.name}</div>
                {l.variantLabel && <div style={{ fontSize:10, color:'#666' }}>{l.variantLabel}</div>}
                <div style={{ fontSize:11, color:'#ff1e41', fontWeight:700 }}>{l.unitPrice.toFixed(2)} €/u</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                <button onClick={() => updateQty(l.key, l.qty-1)} style={{ width:22, height:22, background:'#222', border:'none', color:'white', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                <span style={{ width:24, textAlign:'center', fontSize:13, fontWeight:700 }}>{l.qty}</span>
                <button onClick={() => updateQty(l.key, l.qty+1)} style={{ width:22, height:22, background:'#222', border:'none', color:'white', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
              </div>
              <div style={{ width:56, textAlign:'right', fontSize:12, fontWeight:700, color:'white' }}>{(l.unitPrice*l.qty).toFixed(2)} €</div>
              <button onClick={() => updateQty(l.key, 0)} style={{ background:'none', border:'none', color:'#444', cursor:'pointer', fontSize:14, padding:'0 2px' }}>✕</button>
            </div>
          ))}
        </div>

        {/* Footer totales + cobro */}
        <div style={S.footer}>
          {/* Totales */}
          {lines.length > 0 && (
            <div style={{ marginBottom:10, padding:'8px 0', borderTop:'1px solid #222', borderBottom:'1px solid #222' }}>
              {discount > 0 && <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#f59e0b', marginBottom:3 }}><span>Descuento {clientType} ({discount}%)</span><span>−{(lines.reduce((s,l)=>s+Number(l.product.on_sale&&l.product.sale_price?l.product.sale_price:l.product.price_incl_tax)*l.qty,0)*discount/100).toFixed(2)} €</span></div>}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#888', marginBottom:3 }}>
              <div style={{marginBottom:8}}><div style={{fontSize:10,color:'#888',textTransform:'uppercase',marginBottom:4}}>Descuento directo</div><div style={{display:'flex',gap:4}}>{[0,5,10,15,20].map(p=>(<button key={p} onClick={()=>setDiscPct(p)} style={{flex:1,padding:'4px 0',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',background:discPct===p?'rgba(255,30,65,0.25)':'rgba(255,255,255,0.05)',border:'1px solid',borderColor:discPct===p?'#ff1e41':'rgba(255,255,255,0.1)',color:discPct===p?'#ff1e41':'rgba(255,255,255,0.5)'}}>{p===0?'0%':'-'+p+'%'}</button>))}</div></div>
              <button onClick={imprimirTicket} style={{width:'100%',padding:'7px',marginBottom:8,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Imprimir ticket</button>
              <span>Subtotal</span><span>{subtotal.toFixed(2)} €</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#888', marginBottom:6 }}><span>IGIC 7%</span><span>{tax.toFixed(2)} €</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:20, fontWeight:900, color:'white' }}><span>TOTAL</span><span style={{ color:'#ff1e41' }}>{total.toFixed(2)} €</span></div>
            </div>
          )}

          {/* Método de pago */}
          <div style={S.payRow}>
            {Object.entries(PAYMENT_ICONS).map(([m, icon]) => (
              <button key={m} style={S.payBtn(payMethod===m)} onClick={() => setPayMethod(m)}>
                {icon} {m.charAt(0).toUpperCase()+m.slice(1)}
              </button>
            ))}
          </div>

          {/* Botón cobrar */}
          <button style={S.cobraBtn} onClick={cobrar} disabled={!lines.length || saving}>
            {saving ? '⏳ Procesando...' : lines.length ? `✓ COBRAR ${total.toFixed(2)} €` : 'TICKET VACÍO'}
          </button>
          {lines.length > 0 && <div style={{ textAlign:'center', fontSize:9, color:'#555', marginTop:6 }}>ESC para limpiar · ENTER para cobrar</div>}
        </div>
      </div>

      {/* v4 RESUMEN DEL DÍA */}
      {ventasDia.count>0&&(
        <div style={{position:'fixed',bottom:0,left:0,right:'340px',background:'#0a0a0a',borderTop:'1px solid #1e1e1e',padding:'6px 16px',display:'flex',gap:20,alignItems:'center',fontSize:11,zIndex:90}}>
          <span style={{color:'#555'}}>📊 HOY:</span>
          <span style={{color:'#22c55e',fontWeight:700}}>{ventasDia.total.toFixed(2)} €</span>
          <span style={{color:'#555'}}>{ventasDia.count} venta{ventasDia.count!==1?'s':''}</span>
          <span style={{color:'#555'}}>·</span>
          <span style={{color:'#888'}}>Ticket medio: {ventasDia.count>0?(ventasDia.total/ventasDia.count).toFixed(2):0} €</span>
        </div>
      )}
            {/* MODAL VARIANTES */}
      {variantModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#111', border:'1px solid #333', padding:'1.5rem', minWidth:320, maxWidth:480 }}>
            <div style={{ fontWeight:700, marginBottom:'1rem', color:'white' }}>{variantModal.product.name}</div>
            <div style={{ fontSize:12, color:'#888', marginBottom:'0.75rem' }}>Selecciona variante:</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {variantModal.variants.map(v => {
                const label = v.attribute_values?.value || 'Sin nombre'
                const typeName = v.attribute_values?.attribute_types?.name || ''
                return (
                  <button key={v.id} onClick={() => _addToLines(variantModal.product, typeName ? typeName+': '+label : label)}
                    style={{ padding:'8px 16px', background:'#222', border:'1px solid #333', color:'white', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
                    {label}
                    <div style={{ fontSize:9, color:'#666', marginTop:2 }}>Stock: {v.stock}</div>
                  </button>
                )
              })}
            </div>
            <button onClick={() => setVariantModal(null)} style={{ marginTop:'1rem', width:'100%', padding:8, background:'#333', border:'none', color:'#aaa', cursor:'pointer', fontFamily:'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* MODAL TICKET CONFIRMADO */}
      {ticket && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#111', border:'1px solid #333', padding:'2rem', minWidth:340, textAlign:'center' }} id="ticket-print">
            <div style={{ color:'#ff1e41', fontWeight:900, fontSize:24, letterSpacing:2, marginBottom:4 }}>BUYMUSCLE</div>
            <div style={{ color:'#555', fontSize:11, marginBottom:'1rem' }}>Las Palmas de Gran Canaria</div>
            <div style={{ fontSize:11, color:'#888', marginBottom:4 }}>Nº: <strong style={{ color:'white' }}>{ticket.num}</strong></div>
            <div style={{ fontSize:11, color:'#888', marginBottom:'1rem' }}>{new Date().toLocaleString('es-ES')}</div>
            {ticket.customerName && <div style={{ fontSize:12, color:'#aaa', marginBottom:'0.5rem' }}>Cliente: {ticket.customerName}</div>}
            <div style={{ borderTop:'1px dashed #333', borderBottom:'1px dashed #333', padding:'0.75rem 0', margin:'0.75rem 0', textAlign:'left' }}>
              {ticket.lines.map(l => (
                <div key={l.key} style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4, color:'#ccc' }}>
                  <span>{l.product.name}{l.variantLabel?' ('+l.variantLabel+')':''} x{l.qty}</span>
                  <span>{(l.unitPrice*l.qty).toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign:'right', marginBottom:'1rem' }}>
              <div style={{ fontSize:11, color:'#666' }}>Subtotal: {ticket.subtotal.toFixed(2)} €</div>
              <div style={{ fontSize:11, color:'#666' }}>IGIC 7%: {ticket.tax.toFixed(2)} €</div>
              <div style={{ fontSize:20, fontWeight:900, color:'#ff1e41' }}>TOTAL: {ticket.total.toFixed(2)} €</div>
              <div style={{ fontSize:11, color:'#888', marginTop:4 }}>{PAYMENT_ICONS[ticket.payMethod]} {ticket.payMethod.charAt(0).toUpperCase()+ticket.payMethod.slice(1)}</div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={printTicket} style={{ flex:1, padding:10, background:'#333', border:'none', color:'white', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>🖨️ Imprimir</button>
              <button onClick={() => setTicket(null)} style={{ flex:1, padding:10, background:'#ff1e41', border:'none', color:'white', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>✓ Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body > * { display: none !important; }
          #ticket-print { display: block !important; position: fixed; inset: 0; background: white; color: black; padding: 20px; font-family: monospace; }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #333; }
      `}</style>
    </div>
  )
}
