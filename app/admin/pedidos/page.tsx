// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const db = createClient(
  'https://awwlbepjxuoxaigztugh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
)

const SL = { pending:'Pendiente', processing:'Procesando', shipped:'Enviado', delivered:'Entregado', cancelled:'Cancelado' }
const SC = { pending:'#f59e0b', processing:'#3b82f6', shipped:'#8b5cf6', delivered:'#22c55e', cancelled:'#ef4444' }

export default function AdminPedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState(null)
  const [lines, setLines] = useState([])
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState(false)

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    let q = db.from('orders').select('*').eq('channel','online_retail').order('created_at',{ascending:false}).limit(100)
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setOrders(data || [])
    setLoading(false)
  }

  async function open(order) {
    setSel(order)
    const { data } = await db.from('order_lines').select('*').eq('order_id', order.id)
    setLines(data || [])
  }

  async function setStatus(id, status) {
    setBusy(true)
    await db.from('orders').update({ status }).eq('id', id)
    setSel(o => ({ ...o, status }))
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o))
    setBusy(false)
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0)
  }

  const fmt = d => new Date(d).toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
  const R = (l, v, c) => <div style={{ background:'white', padding:'1rem 1.25rem', border:'1px solid #e8e8e8' }}><div style={{ fontSize:11, color:'#999', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{l}</div><div style={{ fontSize:24, fontWeight:900, color:c }}>{v}</div></div>

  return (
    <div style={{ background:'#f5f5f5', minHeight:'100vh', padding:'1.5rem 20px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
          <h1 style={{ fontSize:22, fontWeight:900, textTransform:'uppercase', margin:0 }}>Admin — Pedidos</h1>
          <button onClick={load} style={{ background:'var(--red)', color:'white', border:'none', padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', textTransform:'uppercase' }}>↻ Actualizar</button>
          <a href="/" style={{ marginLeft:'auto', fontSize:12, color:'#888', textDecoration:'none' }}>← Tienda</a>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
          {R('Total pedidos', stats.total, '#111')}
          {R('Pendientes', stats.pending, '#f59e0b')}
          {R('Enviados', stats.shipped, '#8b5cf6')}
          {R('Facturación', stats.revenue.toFixed(2)+' €', '#22c55e')}
        </div>

        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem', flexWrap:'wrap' }}>
          {['all','pending','processing','shipped','delivered','cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding:'5px 14px', border:'1px solid #ddd', background:filter===s?'#111':'white', color:filter===s?'white':'#555', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)', textTransform:'uppercase' }}>
              {s === 'all' ? 'Todos' : SL[s]}
            </button>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:sel?'1fr 370px':'1fr', gap:'1rem', alignItems:'start' }}>
          <div style={{ background:'white', border:'1px solid #e8e8e8', overflow:'hidden' }}>
            {loading ? <div style={{ padding:'3rem', textAlign:'center', color:'#aaa' }}>Cargando...</div>
              : orders.length === 0 ? <div style={{ padding:'3rem', textAlign:'center', color:'#aaa' }}>No hay pedidos</div>
              : <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f9f9f9', borderBottom:'1px solid #e8e8e8' }}>
                    {['Pedido','Cliente','Fecha','Total','Estado'].map(h => <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#888', letterSpacing:'0.05em' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} onClick={() => open(o)}
                      style={{ borderBottom:'1px solid #f5f5f5', cursor:'pointer', background:sel?.id===o.id?'#fff8f8':'white' }}>
                      <td style={{ padding:'10px 12px', fontWeight:700, color:'var(--red)', fontSize:13 }}>{o.order_number}</td>
                      <td style={{ padding:'10px 12px', fontSize:13 }}>
                        <div style={{ fontWeight:600 }}>{o.customer_name}</div>
                        <div style={{ fontSize:11, color:'#888' }}>{o.customer_email}</div>
                      </td>
                      <td style={{ padding:'10px 12px', fontSize:12, color:'#888' }}>{fmt(o.created_at)}</td>
                      <td style={{ padding:'10px 12px', fontSize:14, fontWeight:800 }}>{Number(o.total).toFixed(2)} €</td>
                      <td style={{ padding:'10px 12px' }}>
                        <span style={{ background:SC[o.status]+'20', color:SC[o.status], padding:'3px 10px', fontSize:11, fontWeight:700, textTransform:'uppercase' }}>
                          {SL[o.status] || o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>}
          </div>

          {sel && (
            <div style={{ background:'white', border:'1px solid #e8e8e8', padding:'1.25rem', position:'sticky', top:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', paddingBottom:'0.75rem', borderBottom:'1px solid #f0f0f0' }}>
                <span style={{ fontWeight:900, color:'var(--red)', fontSize:15 }}>{sel.order_number}</span>
                <button onClick={() => { setSel(null); setLines([]) }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#aaa' }}>✕</button>
              </div>
              <div style={{ marginBottom:'1rem' }}>
                <div style={{ fontSize:11, color:'#999', textTransform:'uppercase', marginBottom:4 }}>Cliente</div>
                <div style={{ fontWeight:600 }}>{sel.customer_name}</div>
                <div style={{ fontSize:12, color:'#666' }}>{sel.customer_email}</div>
                {sel.customer_phone && <div style={{ fontSize:12, color:'#666' }}>{sel.customer_phone}</div>}
              </div>
              <div style={{ marginBottom:'1rem' }}>
                <div style={{ fontSize:11, color:'#999', textTransform:'uppercase', marginBottom:4 }}>Envío</div>
                <div style={{ fontSize:12, color:'#555', lineHeight:1.7 }}>
                  {sel.shipping_address}<br/>{sel.shipping_city}, {sel.shipping_postal_code}<br/>{sel.shipping_province}
                </div>
              </div>
              {lines.length > 0 && (
                <div style={{ marginBottom:'1rem' }}>
                  <div style={{ fontSize:11, color:'#999', textTransform:'uppercase', marginBottom:8 }}>Productos</div>
                  {lines.map(l => (
                    <div key={l.id} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6, padding:'6px 0', borderBottom:'1px solid #f5f5f5' }}>
                      <span style={{ flex:1, marginRight:8 }}>{l.product_name} x{l.quantity}</span>
                      <span style={{ fontWeight:700 }}>{(l.unit_price*l.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ borderTop:'2px solid #111', paddingTop:'0.75rem', marginBottom:'1rem' }}>
                {[['Subtotal', Number(sel.subtotal).toFixed(2)+' €'],['IVA 21%', Number(sel.tax_amount).toFixed(2)+' €'],['Envío', Number(sel.shipping_cost)>0?Number(sel.shipping_cost).toFixed(2)+' €':'GRATIS']].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#888', marginBottom:3 }}><span>{l}</span><span>{v}</span></div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:900, color:'var(--red)', marginTop:8 }}><span>TOTAL</span><span>{Number(sel.total).toFixed(2)} €</span></div>
              </div>
              <div>
                <div style={{ fontSize:11, color:'#999', textTransform:'uppercase', marginBottom:8 }}>Estado</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                  {Object.entries(SL).map(([k,v]) => (
                    <button key={k} onClick={() => setStatus(sel.id, k)} disabled={busy || sel.status===k}
                      style={{ padding:'5px 12px', border:'1px solid '+(sel.status===k?SC[k]:'#ddd'), background:sel.status===k?SC[k]:'white', color:sel.status===k?'white':'#555', fontSize:11, fontWeight:700, cursor:sel.status===k?'default':'pointer', fontFamily:'var(--font-body)', textTransform:'uppercase' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              {sel.notes && <div style={{ marginTop:'1rem', padding:'8px 12px', background:'#fff8e1', border:'1px solid #ffd54f', fontSize:12 }}><strong>Notas:</strong> {sel.notes}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
