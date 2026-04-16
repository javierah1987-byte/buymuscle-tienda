'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Order = {
  id:string; order_number:string; channel:string;
  customer_name:string; customer_email:string; customer_phone:string;
  shipping_address:string; shipping_city:string; shipping_postal_code:string;
  total:number; subtotal:number; tax_amount:number; shipping_cost:number;
  discount_pct:number; payment_method:string; status:string;
  notes:string; created_at:string;
  holded_invoice_id:string|null; holded_series:string|null;
}
type OrderLine = { id:number; product_id:number; product_name:string; quantity:number; unit_price:number; line_total:number }

const STATUS_LABELS: Record<string,string> = { pending:'⏳ Pendiente', paid:'💳 Pagado', shipped:'📦 Enviado', completed:'✅ Completado', cancelled:'❌ Cancelado' }
const STATUS_COLORS: Record<string,string> = { pending:'#f59e0b', paid:'#3b82f6', shipped:'#8b5cf6', completed:'#22c55e', cancelled:'#ef4444' }
const CHANNEL_LABELS: Record<string,string> = { online_retail:'🌐 Web', online_distributor:'🤝 Dist. Web', tpv_retail:'🖥️ TPV', tpv_distributor:'🖥️ TPV Dist.' }

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order|null>(null)
  const [lines, setLines] = useState<OrderLine[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState(false)
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [invoiceMsg, setInvoiceMsg] = useState('')

  const loadOrders = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('orders').select('*').order('created_at',{ascending:false})
    if (filterStatus!=='all') q = q.eq('status', filterStatus)
    if (search) q = q.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`)
    const { data } = await q.limit(100)
    setOrders(data||[])
    setLoading(false)
  }, [filterStatus, search])

  useEffect(() => { loadOrders() }, [loadOrders])

  const openOrder = async (order: Order) => {
    setSelected(order); setInvoiceMsg('')
    const { data } = await supabase.from('order_lines').select('*').eq('order_id', order.id)
    setLines(data||[])
  }

  const updateStatus = async (orderId:string, status:string) => {
    setUpdating(true)
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setSelected(prev => prev?{...prev,status}:null)
    setOrders(prev => prev.map(o => o.id===orderId?{...o,status}:o))
    setUpdating(false)
  }

  const createHoldedInvoice = async (orderId: string) => {
    setCreatingInvoice(true); setInvoiceMsg('')
    try {
      const res = await fetch('/api/holded/create-invoice', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ orderId })
      })
      const data = await res.json()
      if (data.invoiceId) {
        setInvoiceMsg(`✓ Factura creada en Holded (${data.series}): ${data.invoiceId}`)
        // Recargar para ver el holded_invoice_id
        const { data: updated } = await supabase.from('orders').select('*').eq('id', orderId).single()
        if (updated) {
          setSelected(updated)
          setOrders(prev => prev.map(o => o.id===orderId?updated:o))
        }
      } else {
        setInvoiceMsg('Error: ' + (data.error || 'No se pudo crear la factura'))
      }
    } catch {
      setInvoiceMsg('Error de conexión con Holded')
    }
    setCreatingInvoice(false)
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o=>o.status==='pending').length,
    paid: orders.filter(o=>o.status==='paid').length,
    shipped: orders.filter(o=>o.status==='shipped').length,
    revenue: orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+Number(o.total),0),
    sinFactura: orders.filter(o=>!o.holded_invoice_id&&o.status!=='cancelled').length,
  }

  return (
    <div style={{background:'var(--bg)',minHeight:'100vh',paddingBottom:'3rem'}}>
      <div className="container" style={{paddingTop:'2rem'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem',flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--red)',marginBottom:4}}>PANEL DE ADMINISTRACIÓN</div>
            <h1 style={{fontSize:28,fontWeight:900,textTransform:'uppercase',margin:0}}>GESTIÓN DE PEDIDOS</h1>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Link href="/admin/distribuidores" style={{fontSize:13,color:'var(--muted)',border:'1px solid var(--border)',padding:'8px 16px',display:'flex',alignItems:'center',gap:4}}>🤝 Distribuidores</Link>
            <Link href="/" style={{fontSize:13,color:'var(--muted)',border:'1px solid var(--border)',padding:'8px 16px'}}>← Tienda</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:'0.75rem',marginBottom:'1.5rem'}}>
          {[
            {l:'Total',v:stats.total,c:'var(--text)'},
            {l:'Pendientes',v:stats.pending,c:'#f59e0b'},
            {l:'Pagados',v:stats.paid,c:'#3b82f6'},
            {l:'Enviados',v:stats.shipped,c:'#8b5cf6'},
            {l:'Ingresos',v:stats.revenue.toFixed(2)+' €',c:'var(--red)'},
            {l:'Sin factura',v:stats.sinFactura,c:stats.sinFactura>0?'#ef4444':'#22c55e'},
          ].map(s=>(
            <div key={s.l} style={{background:'var(--white)',border:'1px solid var(--border)',padding:'0.875rem',textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:900,color:s.c,fontFamily:'var(--font-body)'}}>{s.v}</div>
              <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--muted)',marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap',alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar por nº pedido, nombre, email..." style={{flex:1,minWidth:200,padding:'9px 14px',fontSize:13,margin:0}}/>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:'9px 14px',fontSize:13,border:'1px solid var(--border)',background:'var(--white)',color:'var(--text)',margin:0,width:'auto'}}>
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          <button onClick={loadOrders} className="btn-outline" style={{padding:'9px 16px',fontSize:13}}>↻</button>
        </div>

        {/* Tabla + detalle */}
        <div style={{display:'grid',gridTemplateColumns:selected?'1fr 420px':'1fr',gap:'1rem',alignItems:'start'}}>
          {/* Tabla */}
          <div style={{background:'var(--white)',border:'1px solid var(--border)',overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'120px 1fr 90px 80px 90px 110px',gap:'0.5rem',padding:'10px 1rem',borderBottom:'2px solid var(--border)',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--muted)',background:'var(--bg)'}}>
              <span>Nº Pedido</span><span>Cliente</span><span>Fecha</span><span style={{textAlign:'right'}}>Total</span><span style={{textAlign:'center'}}>Holded</span><span style={{textAlign:'center'}}>Estado</span>
            </div>
            {loading ? (
              Array.from({length:8}).map((_,i)=><div key={i} className="skeleton" style={{height:52,margin:'0.5rem 1rem'}}/>)
            ) : orders.length===0 ? (
              <div style={{textAlign:'center',padding:'3rem',color:'var(--muted)'}}>
                <div style={{fontSize:36,marginBottom:'0.5rem'}}>📋</div>
                <p style={{fontWeight:700}}>No hay pedidos</p>
              </div>
            ) : orders.map(order=>(
              <div key={order.id} onClick={()=>openOrder(order)}
                style={{display:'grid',gridTemplateColumns:'120px 1fr 90px 80px 90px 110px',gap:'0.5rem',padding:'12px 1rem',borderBottom:'1px solid var(--border)',cursor:'pointer',transition:'background 0.12s',background:selected?.id===order.id?'rgba(255,30,65,0.03)':'transparent',alignItems:'center'}}
                onMouseEnter={e=>{if(selected?.id!==order.id)(e.currentTarget as HTMLElement).style.background='var(--bg)'}}
                onMouseLeave={e=>{if(selected?.id!==order.id)(e.currentTarget as HTMLElement).style.background='transparent'}}>
                <span style={{fontFamily:'var(--font-body)',fontSize:12,fontWeight:700,color:'var(--red)'}}>{order.order_number}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{order.customer_name||'—'}</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{CHANNEL_LABELS[order.channel]||order.channel}</div>
                </div>
                <span style={{fontSize:12,color:'var(--muted)'}}>{new Date(order.created_at).toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'2-digit'})}</span>
                <span style={{fontSize:14,fontWeight:800,color:'var(--red)',textAlign:'right'}}>{Number(order.total).toFixed(2)} €</span>
                <div style={{textAlign:'center'}}>
                  {order.holded_invoice_id
                    ? <span style={{fontSize:10,fontWeight:700,color:'#22c55e'}}>📄 {order.holded_series||'OK'}</span>
                    : <span style={{fontSize:10,color:'var(--muted)'}}>—</span>}
                </div>
                <div style={{textAlign:'center'}}>
                  <span style={{fontSize:11,fontWeight:700,padding:'3px 8px',background:`${STATUS_COLORS[order.status]}15`,color:STATUS_COLORS[order.status],border:`1px solid ${STATUS_COLORS[order.status]}40`}}>
                    {STATUS_LABELS[order.status]?.split(' ')[1]||order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Panel detalle */}
          {selected && (
            <div style={{background:'var(--white)',border:'1px solid var(--border)',position:'sticky',top:'20px'}}>
              <div style={{padding:'1rem',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:11,color:'var(--muted)',fontWeight:700,textTransform:'uppercase'}}>{CHANNEL_LABELS[selected.channel]||selected.channel}</div>
                  <div style={{fontSize:18,fontWeight:900,color:'var(--red)',fontFamily:'var(--font-body)'}}>{selected.order_number}</div>
                </div>
                <button onClick={()=>setSelected(null)} style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'1px solid var(--border)',cursor:'pointer',fontSize:16,color:'var(--muted)'}}>×</button>
              </div>

              {/* Holded */}
              <div style={{padding:'0.75rem 1rem',borderBottom:'1px solid var(--border)',background:'rgba(40,167,69,0.03)'}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:'var(--muted)',marginBottom:6}}>Factura Holded</div>
                {selected.holded_invoice_id ? (
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:13,color:'#22c55e',fontWeight:700}}>📄 Factura {selected.holded_series} generada</span>
                    <a href={`https://app.holded.com/invoices/${selected.holded_invoice_id}`} target="_blank" rel="noopener"
                      style={{fontSize:11,color:'var(--red)',fontWeight:700,border:'1px solid var(--red)',padding:'3px 8px',textDecoration:'none'}}>
                      Ver en Holded →
                    </a>
                  </div>
                ) : (
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <span style={{fontSize:12,color:'var(--muted)'}}>Sin factura generada</span>
                    <button onClick={()=>createHoldedInvoice(selected.id)} disabled={creatingInvoice} className="btn-primary" style={{padding:'5px 12px',fontSize:12}}>
                      {creatingInvoice?'Generando...':'📄 Generar factura'}
                    </button>
                  </div>
                )}
                {invoiceMsg && (
                  <div style={{marginTop:6,fontSize:12,color:invoiceMsg.includes('Error')?'var(--red)':'#22c55e',fontWeight:600}}>{invoiceMsg}</div>
                )}
              </div>

              {/* Estado */}
              <div style={{padding:'0.75rem 1rem',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:'var(--muted)',marginBottom:6}}>Cambiar estado</div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  {Object.entries(STATUS_LABELS).map(([v,l])=>(
                    <button key={v} onClick={()=>updateStatus(selected.id,v)} disabled={updating}
                      style={{padding:'5px 10px',fontSize:11,fontWeight:700,border:`1px solid ${selected.status===v?STATUS_COLORS[v]:'var(--border)'}`,background:selected.status===v?`${STATUS_COLORS[v]}15`:'transparent',color:selected.status===v?STATUS_COLORS[v]:'var(--muted)',cursor:'pointer',transition:'all 0.12s'}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cliente */}
              <div style={{padding:'0.75rem 1rem',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:'var(--muted)',marginBottom:6}}>Cliente</div>
                <div style={{fontSize:13,fontWeight:600}}>{selected.customer_name||'—'}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>{selected.customer_email}</div>
                {selected.customer_phone&&<div style={{fontSize:12,color:'var(--muted)'}}>{selected.customer_phone}</div>}
                {selected.shipping_address&&<div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>📍 {selected.shipping_address}, {selected.shipping_city} {selected.shipping_postal_code}</div>}
                {selected.notes&&<div style={{fontSize:12,color:'var(--text)',marginTop:4,fontStyle:'italic'}}>"{selected.notes}"</div>}
              </div>

              {/* Líneas */}
              <div style={{padding:'0.75rem 1rem',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:'var(--muted)',marginBottom:8}}>Artículos</div>
                {lines.map(l=>(
                  <div key={l.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,textTransform:'uppercase'}}>{l.product_name}</div>
                      <div style={{fontSize:11,color:'var(--muted)'}}>x{l.quantity} × {Number(l.unit_price).toFixed(2)} €</div>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:'var(--red)'}}>{Number(l.line_total).toFixed(2)} €</span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div style={{padding:'0.75rem 1rem'}}>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--muted)'}}><span>Base imponible</span><span>{Number(selected.subtotal).toFixed(2)} €</span></div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--muted)'}}><span>IVA (21%)</span><span>{Number(selected.tax_amount).toFixed(2)} €</span></div>
                  {Number(selected.shipping_cost)>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--muted)'}}><span>Envío</span><span>{Number(selected.shipping_cost).toFixed(2)} €</span></div>}
                  {Number(selected.discount_pct)>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--red)'}}><span>Descuento</span><span>-{selected.discount_pct}%</span></div>}
                  <div style={{display:'flex',justifyContent:'space-between',paddingTop:6,borderTop:'1px solid var(--border)',marginTop:2}}>
                    <span style={{fontSize:14,fontWeight:800,textTransform:'uppercase'}}>Total</span>
                    <span style={{fontSize:18,fontWeight:900,color:'var(--red)'}}>{Number(selected.total).toFixed(2)} €</span>
                  </div>
                  <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>Pago: {selected.payment_method||'—'} · {new Date(selected.created_at).toLocaleString('es-ES')}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
