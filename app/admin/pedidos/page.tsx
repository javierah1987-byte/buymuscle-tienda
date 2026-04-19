// @ts-nocheck
'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const db = createClient(
  'https://awwlbepjxuoxaigztugh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
)

const SL = { pending:'Pendiente', paid:'Pagado', processing:'Procesando', shipped:'Enviado', delivered:'Entregado', cancelled:'Cancelado', completed:'Completado' }
const SC = { pending:'#f59e0b', paid:'#22c55e', processing:'#3b82f6', shipped:'#8b5cf6', delivered:'#22c55e', cancelled:'#ef4444', completed:'#22c55e' }
const CHANNELS = { online_retail:'🌐 Tienda', online_distributor:'🤝 Dist.Online', tpv_retail:'🏪 TPV', tpv_distributor:'🏪 Dist.TPV' }

export default function AdminPedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState(null)
  const [lines, setLines] = useState([])
  const [filter, setFilter] = useState('all')
  const [tab, setTab] = useState('online') // online | tpv
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [busy, setSaving] = useState(false)
  const [selected, setSelected] = useState([]) // IDs seleccionados para cambio masivo
  const [bulkStatus, setBulkStatus] = useState('shipped')

  const load = useCallback(async () => {
    setLoading(true)
    setSel(null); setSelected([])
    const channels = tab === 'online'
      ? ['online_retail','online_distributor']
      : ['tpv_retail','tpv_distributor']

    let q = db.from('orders').select('*').in('channel', channels).order('created_at',{ascending:false}).limit(200)
    if (filter !== 'all') q = q.eq('status', filter)
    if (dateFrom) q = q.gte('created_at', dateFrom)
    if (dateTo) q = q.lte('created_at', dateTo + 'T23:59:59')
    const { data } = await q
    let rows = data || []
    if (search.trim()) {
      const q2 = search.toLowerCase()
      rows = rows.filter(o =>
        o.order_number?.toLowerCase().includes(q2) ||
        o.customer_name?.toLowerCase().includes(q2) ||
        o.customer_email?.toLowerCase().includes(q2)
      )
    }
    setOrders(rows)
    setLoading(false)
  }, [tab, filter, search, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  async function open(order) {
    setSel(order); setSelected([])
    const { data } = await db.from('order_lines').select('*').eq('order_id', order.id)
    setLines(data || [])
  }

  async function setStatus(id, status) {
    setSaving(true)
    await db.from('orders').update({ status }).eq('id', id)
    setSel(o => ({ ...o, status }))
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o))
    setSaving(false)
  }

  async function bulkUpdate() {
    if (!selected.length) return
    setSaving(true)
    await db.from('orders').update({ status: bulkStatus }).in('id', selected)
    setOrders(os => os.map(o => selected.includes(o.id) ? { ...o, status: bulkStatus } : o))
    setSelected([])
    setSaving(false)
  }

  function toggleSelect(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }
  function toggleAll() {
    setSelected(s => s.length === orders.length ? [] : orders.map(o => o.id))
  }

  function exportCSV() {
    const headers = ['Pedido','Canal','Cliente','Email','Teléfono','Fecha','Subtotal','IVA','Envío','Total','Descuento%','Estado','Pago','Notas']
    const rows = orders.map(o => [
      o.order_number, o.channel, o.customer_name, o.customer_email, o.customer_phone || '',
      new Date(o.created_at).toLocaleString('es-ES'),
      Number(o.subtotal).toFixed(2), Number(o.tax_amount).toFixed(2),
      Number(o.shipping_cost).toFixed(2), Number(o.total).toFixed(2),
      o.discount_pct, SL[o.status] || o.status, o.payment_method || '', o.notes || ''
    ])
    const csv = [headers, ...rows].map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'pedidos-buymuscle-' + new Date().toISOString().slice(0,10) + '.csv'
    a.click()
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['pending','processing'].includes(o.status)).length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s,o) => s + Number(o.total), 0)
  }
  const fmt = d => new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'})
  const R = (l,v,c) => <div style={{background:'white',padding:'1rem 1.25rem',border:'1px solid #e8e8e8'}}><div style={{fontSize:11,color:'#999',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>{l}</div><div style={{fontSize:24,fontWeight:900,color:c}}>{v}</div></div>

  return (
    <div style={{background:'#f5f5f5',minHeight:'100vh',padding:'1.5rem 20px'}}>
      <div style={{maxWidth:1300,margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1.25rem',flexWrap:'wrap'}}>
          <h1 style={{fontSize:20,fontWeight:900,textTransform:'uppercase',margin:0}}>Admin — Pedidos</h1>
          <button onClick={load} style={{background:'var(--red)',color:'white',border:'none',padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',textTransform:'uppercase'}}>↻ Actualizar</button>
          <button onClick={exportCSV} style={{background:'#22c55e',color:'white',border:'none',padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',textTransform:'uppercase'}}>⬇ Exportar CSV</button>
          <a href="/admin/stock" style={{background:'#3b82f6',color:'white',padding:'6px 14px',fontSize:12,fontWeight:700,textDecoration:'none',textTransform:'uppercase'}}>📦 Gestión Stock</a>
          <a href="/" style={{marginLeft:'auto',fontSize:12,color:'#888',textDecoration:'none'}}>← Tienda</a>
        </div>

        {/* Tabs online/TPV */}
        <div style={{display:'flex',gap:0,marginBottom:'1rem',borderBottom:'2px solid #e8e8e8'}}>
          {[['online','🌐 Online'],['tpv','🏪 TPV']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{padding:'8px 20px',border:'none',background:'none',fontWeight:tab===k?900:400,borderBottom:tab===k?'2px solid var(--red)':'2px solid transparent',color:tab===k?'var(--red)':'#888',cursor:'pointer',fontFamily:'inherit',fontSize:13,marginBottom:-2}}>
              {l}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.75rem',marginBottom:'1rem'}}>
          {R('Total',stats.total,'#111')}
          {R('Pendientes',stats.pending,'#f59e0b')}
          {R('Enviados',stats.shipped,'#8b5cf6')}
          {R('Facturación',stats.revenue.toFixed(2)+' €','#22c55e')}
        </div>

        {/* Filtros */}
        <div style={{background:'white',border:'1px solid #e8e8e8',padding:'0.75rem 1rem',marginBottom:'1rem',display:'flex',gap:'0.75rem',flexWrap:'wrap',alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar pedido, cliente..." style={{padding:'6px 10px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',flex:1,minWidth:180}}/>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:'6px 8px',border:'1px solid #ddd',fontSize:12,fontFamily:'inherit'}}/>
          <span style={{fontSize:12,color:'#aaa'}}>—</span>
          <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{padding:'6px 8px',border:'1px solid #ddd',fontSize:12,fontFamily:'inherit'}}/>
          <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
            {['all','pending','paid','processing','shipped','delivered','cancelled'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{padding:'4px 12px',border:'1px solid #ddd',background:filter===s?'#111':'white',color:filter===s?'white':'#666',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',textTransform:'uppercase'}}>
                {s==='all'?'Todos':SL[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Acción masiva */}
        {selected.length > 0 && (
          <div style={{background:'#fff3cd',border:'1px solid #ffc107',padding:'0.75rem 1rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>
            <span style={{fontSize:13,fontWeight:700}}>{selected.length} seleccionados</span>
            <span style={{fontSize:13}}>Cambiar a:</span>
            <select value={bulkStatus} onChange={e=>setBulkStatus(e.target.value)} style={{padding:'4px 8px',border:'1px solid #ddd',fontFamily:'inherit',fontSize:12}}>
              {Object.entries(SL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button onClick={bulkUpdate} disabled={busy} style={{background:'var(--red)',color:'white',border:'none',padding:'5px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
              ✓ Aplicar
            </button>
            <button onClick={() => setSelected([])} style={{background:'none',border:'1px solid #ddd',padding:'5px 12px',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
              Cancelar
            </button>
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:sel?'1fr 380px':'1fr',gap:'1rem',alignItems:'start'}}>
          {/* Tabla pedidos */}
          <div style={{background:'white',border:'1px solid #e8e8e8',overflow:'hidden'}}>
            {loading ? <div style={{padding:'3rem',textAlign:'center',color:'#aaa'}}>Cargando...</div>
              : orders.length === 0 ? <div style={{padding:'3rem',textAlign:'center',color:'#aaa'}}>No hay pedidos</div>
              : <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f9f9f9',borderBottom:'1px solid #e8e8e8'}}>
                    <th style={{padding:'8px 10px',textAlign:'left'}}>
                      <input type="checkbox" checked={selected.length===orders.length&&orders.length>0} onChange={toggleAll}/>
                    </th>
                    {['Pedido','Canal','Cliente','Fecha','Total','Estado'].map(h => <th key={h} style={{padding:'8px 10px',textAlign:'left',fontSize:11,fontWeight:700,textTransform:'uppercase',color:'#888',letterSpacing:'0.05em'}}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{borderBottom:'1px solid #f5f5f5',background:sel?.id===o.id?'#fff8f8':selected.includes(o.id)?'#f0f7ff':'white',cursor:'pointer'}}>
                      <td style={{padding:'8px 10px'}} onClick={e=>e.stopPropagation()}>
                        <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggleSelect(o.id)}/>
                      </td>
                      <td style={{padding:'8px 10px',fontWeight:700,color:'var(--red)',fontSize:12}} onClick={()=>open(o)}>{o.order_number}</td>
                      <td style={{padding:'8px 10px',fontSize:11,color:'#666'}} onClick={()=>open(o)}>{CHANNELS[o.channel]||o.channel}</td>
                      <td style={{padding:'8px 10px',fontSize:12}} onClick={()=>open(o)}>
                        <div style={{fontWeight:600}}>{o.customer_name}</div>
                        <div style={{fontSize:10,color:'#aaa'}}>{o.customer_email}</div>
                      </td>
                      <td style={{padding:'8px 10px',fontSize:11,color:'#999'}} onClick={()=>open(o)}>{fmt(o.created_at)}</td>
                      <td style={{padding:'8px 10px',fontSize:13,fontWeight:800}} onClick={()=>open(o)}>{Number(o.total).toFixed(2)} €</td>
                      <td style={{padding:'8px 10px'}} onClick={()=>open(o)}>
                        <span style={{background:SC[o.status]+'20',color:SC[o.status],padding:'2px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase'}}>{SL[o.status]||o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>}
          </div>

          {/* Panel detalle */}
          {sel && (
            <div style={{background:'white',border:'1px solid #e8e8e8',padding:'1.25rem',position:'sticky',top:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',paddingBottom:'0.75rem',borderBottom:'1px solid #f0f0f0'}}>
                <div>
                  <span style={{fontWeight:900,color:'var(--red)',fontSize:14}}>{sel.order_number}</span>
                  <span style={{marginLeft:8,fontSize:11,background:CHANNELS[sel.channel]?'#e8f4f8':'#f5f5f5',color:'#555',padding:'2px 8px'}}>{CHANNELS[sel.channel]||sel.channel}</span>
                </div>
                <button onClick={()=>{setSel(null);setLines([])}} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#aaa'}}>✕</button>
              </div>

              <div style={{marginBottom:'0.75rem'}}>
                <div style={{fontSize:10,color:'#999',textTransform:'uppercase',marginBottom:3}}>Cliente</div>
                <div style={{fontWeight:600,fontSize:13}}>{sel.customer_name}</div>
                <div style={{fontSize:11,color:'#666'}}>{sel.customer_email}</div>
                {sel.customer_phone&&<div style={{fontSize:11,color:'#666'}}>{sel.customer_phone}</div>}
                {sel.customer_nif&&<div style={{fontSize:11,color:'#999'}}>NIF: {sel.customer_nif}</div>}
              </div>

              {sel.shipping_address&&(
                <div style={{marginBottom:'0.75rem'}}>
                  <div style={{fontSize:10,color:'#999',textTransform:'uppercase',marginBottom:3}}>Envío</div>
                  <div style={{fontSize:11,color:'#555',lineHeight:1.7}}>
                    {sel.shipping_address}<br/>{sel.shipping_city}, {sel.shipping_postal_code}<br/>{sel.shipping_province}
                  </div>
                </div>
              )}

              <div style={{marginBottom:'0.75rem'}}>
                <div style={{fontSize:10,color:'#999',textTransform:'uppercase',marginBottom:3}}>Pago</div>
                <div style={{fontSize:11,color:'#555'}}>{sel.payment_method||'—'} {sel.discount_pct>0&&<span style={{color:'#f59e0b',fontWeight:700}}>(-{sel.discount_pct}%)</span>}</div>
              </div>

              {lines.length>0&&(
                <div style={{marginBottom:'0.75rem'}}>
                  <div style={{fontSize:10,color:'#999',textTransform:'uppercase',marginBottom:6}}>Productos</div>
                  {lines.map(l=>(
                    <div key={l.id} style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:5,padding:'5px 0',borderBottom:'1px solid #f5f5f5'}}>
                      <span style={{flex:1,marginRight:8,color:'#555'}}>{l.product_name} <span style={{color:'#aaa'}}>×{l.quantity}</span></span>
                      <span style={{fontWeight:700}}>{(l.unit_price*l.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{borderTop:'2px solid #111',paddingTop:'0.75rem',marginBottom:'1rem'}}>
                {[['Subtotal',Number(sel.subtotal).toFixed(2)+' €'],
                  ['Impuesto',Number(sel.tax_amount).toFixed(2)+' €'],
                  ['Envío',Number(sel.shipping_cost)>0?Number(sel.shipping_cost).toFixed(2)+' €':'GRATIS']
                ].map(([l,v])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#999',marginBottom:2}}><span>{l}</span><span>{v}</span></div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',fontSize:17,fontWeight:900,color:'var(--red)',marginTop:6}}><span>TOTAL</span><span>{Number(sel.total).toFixed(2)} €</span></div>
              </div>

              <div>
                <div style={{fontSize:10,color:'#999',textTransform:'uppercase',marginBottom:6}}>Estado</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
                  {Object.entries(SL).map(([k,v])=>(
                    <button key={k} onClick={()=>setStatus(sel.id,k)} disabled={busy||sel.status===k}
                      style={{padding:'4px 10px',border:'1px solid '+(sel.status===k?SC[k]:'#ddd'),background:sel.status===k?SC[k]:'white',color:sel.status===k?'white':'#666',fontSize:10,fontWeight:700,cursor:sel.status===k?'default':'pointer',fontFamily:'inherit',textTransform:'uppercase'}}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {sel.notes&&<div style={{marginTop:'0.75rem',padding:'8px 10px',background:'#fff8e1',border:'1px solid #ffd54f',fontSize:11}}><strong>Notas:</strong> {sel.notes}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
