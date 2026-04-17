// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const STATUS_LABELS = { pending:'Pendiente', processing:'Procesando', shipped:'Enviado', delivered:'Entregado', cancelled:'Cancelado' }
const STATUS_COLORS = { pending:'#f59e0b', processing:'#3b82f6', shipped:'#8b5cf6', delivered:'#22c55e', cancelled:'#ef4444' }

export default function AdminPedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [lines, setLines] = useState([])
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(false)

  useEffect(()=>{ loadOrders() },[filter])

  async function loadOrders(){
    setLoading(true)
    let q = supabase.from('orders').select('*').eq('channel','online_retail').order('created_at',{ascending:false}).limit(100)
    if(filter!=='all') q = q.eq('status',filter)
    const{data}=await q
    setOrders(data||[])
    setLoading(false)
  }

  async function openOrder(order){
    setSelected(order)
    const{data}=await supabase.from('order_lines').select('*').eq('order_id',order.id)
    setLines(data||[])
  }

  async function updateStatus(orderId, status){
    setUpdating(true)
    await supabase.from('orders').update({status}).eq('id',orderId)
    setSelected(o=>({...o,status}))
    setOrders(os=>os.map(o=>o.id===orderId?{...o,status}:o))
    setUpdating(false)
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o=>o.status==='pending').length,
    shipped: orders.filter(o=>o.status==='shipped').length,
    revenue: orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+Number(o.total),0)
  }

  return (
    <div style={{background:'#f5f5f5',minHeight:'100vh',padding:'1.5rem 20px'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem'}}>
          <h1 style={{fontSize:22,fontWeight:900,textTransform:'uppercase',margin:0}}>Admin — Pedidos</h1>
          <button onClick={loadOrders} style={{background:'var(--red)',color:'white',border:'none',padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'var(--font-body)',textTransform:'uppercase'}}>↻ Actualizar</button>
          <a href="/" style={{marginLeft:'auto',fontSize:12,color:'#888',textDecoration:'none'}}>← Volver a la tienda</a>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
          {[['Total pedidos',stats.total,'#111'],['Pendientes',stats.pending,'#f59e0b'],['Enviados',stats.shipped,'#8b5cf6'],['Facturación',stats.revenue.toFixed(2)+' €','#22c55e']].map(([l,v,c])=>(
            <div key={l} style={{background:'white',padding:'1rem 1.25rem',border:'1px solid #e8e8e8'}}>
              <div style={{fontSize:11,color:'#999',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>{l}</div>
              <div style={{fontSize:24,fontWeight:900,color:c}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem',flexWrap:'wrap'}}>
          {['all','pending','processing','shipped','delivered','cancelled'].map(s=>(
            <button key={s} onClick={()=>setFilter(s)}
              style={{padding:'5px 14px',border:'1px solid #ddd',background:filter===s?'#111':'white',color:filter===s?'white':'#555',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-body)',textTransform:'uppercase'}}>
              {s==='all'?'Todos':STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:selected?'1fr 380px':'1fr',gap:'1rem',alignItems:'start'}}>
          {/* Lista */}
          <div style={{background:'white',border:'1px solid #e8e8e8',overflow:'hidden'}}>
            {loading ? (
              <div style={{padding:'3rem',textAlign:'center',color:'#aaa'}}>Cargando...</div>
            ) : orders.length===0 ? (
              <div style={{padding:'3rem',textAlign:'center',color:'#aaa'}}>No hay pedidos</div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f9f9f9',borderBottom:'1px solid #e8e8e8'}}>
                    {['Pedido','Cliente','Fecha','Total','Estado'].map(h=>(
                      <th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,textTransform:'uppercase',color:'#888',letterSpacing:'0.05em'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o=>(
                    <tr key={o.id} onClick={()=>openOrder(o)}
                      style={{borderBottom:'1px solid #f5f5f5',cursor:'pointer',background:selected?.id===o.id?'#fff8f8':'white'}}
                      onMouseEnter={e=>e.currentTarget.style.background=selected?.id===o.id?'#fff8f8':'#fafafa'}
                      onMouseLeave={e=>e.currentTarget.style.background=selected?.id===o.id?'#fff8f8':'white'}>
                      <td style={{padding:'10px 12px',fontWeight:700,color:'var(--red)',fontSize:13}}>{o.order_number}</td>
                      <td style={{padding:'10px 12px',fontSize:13}}>
                        <div style={{fontWeight:600,color:'#111'}}>{o.customer_name}</div>
                        <div style={{fontSize:11,color:'#888'}}>{o.customer_email}</div>
                      </td>
                      <td style={{padding:'10px 12px',fontSize:12,color:'#888'}}>{new Date(o.created_at).toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'})}</td>
                      <td style={{padding:'10px 12px',fontSize:14,fontWeight:800}}>{Number(o.total).toFixed(2)} €</td>
                      <td style={{padding:'10px 12px'}}>
                        <span style={{background:STATUS_COLORS[o.status]+'20',color:STATUS_COLORS[o.status],padding:'3px 10px',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>
                          {STATUS_LABELS[o.status]||o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Detalle */}
          {selected && (
            <div style={{background:'white',border:'1px solid #e8e8e8',padding:'1.25rem',position:'sticky',top:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',borderBottom:'1px solid #f0f0f0',paddingBottom:'0.75rem'}}>
                <span style={{fontWeight:900,color:'var(--red)',fontSize:15}}>{selected.order_number}</span>
                <button onClick={()=>{setSelected(null);setLines([])}} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#aaa',padding:'2px 6px'}}>✕</button>
              </div>
              <div style={{marginBottom:'1rem'}}>
                <div style={{fontSize:11,color:'#999',textTransform:'uppercase',marginBottom:4}}>Cliente</div>
                <div style={{fontSize:13,fontWeight:600}}>{selected.customer_name}</div>
                <div style={{fontSize:12,color:'#666'}}>{selected.customer_email}</div>
                {selected.customer_phone&&<div style={{fontSize:12,color:'#666'}}>{selected.customer_phone}</div>}
                {selected.customer_nif&&<div style={{fontSize:12,color:'#888'}}>NIF: {selected.customer_nif}</div>}
              </div>
              <div style={{marginBottom:'1rem'}}>
                <div style={{fontSize:11,color:'#999',textTransform:'uppercase',marginBottom:4}}>Envío</div>
                <div style={{fontSize:12,color:'#555',lineHeight:1.7}}>
                  {selected.shipping_address}<br/>
                  {selected.shipping_city}, {selected.shipping_postal_code}<br/>
                  {selected.shipping_province}
                </div>
              </div>
              {lines.length>0 && (
                <div style={{marginBottom:'1rem'}}>
                  <div style={{fontSize:11,color:'#999',textTransform:'uppercase',marginBottom:8}}>Productos</div>
                  {lines.map(l=>(
                    <div key={l.id} style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:6,padding:'6px 0',borderBottom:'1px solid #f5f5f5'}}>
                      <span style={{flex:1,marginRight:8,color:'#333'}}>{l.product_name} x{l.quantity}</span>
                      <span style={{fontWeight:700}}>{(l.unit_price*l.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{borderTop:'2px solid #111',paddingTop:'0.75rem',marginBottom:'1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#888',marginBottom:3}}><span>Subtotal</span><span>{Number(selected.subtotal).toFixed(2)} €</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#888',marginBottom:3}}><span>IVA 21%</span><span>{Number(selected.tax_amount).toFixed(2)} €</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:Number(selected.shipping_cost)>0?'#888':'#22c55e',marginBottom:8}}><span>Envío</span><span>{Number(selected.shipping_cost)>0?Number(selected.shipping_cost).toFixed(2)+' €':'GRATIS'}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:18,fontWeight:900,color:'var(--red)'}}><span>TOTAL</span><span>{Number(selected.total).toFixed(2)} €</span></div>
              </div>
              <div>
                <div style={{fontSize:11,color:'#999',textTransform:'uppercase',marginBottom:8}}>Actualizar estado</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem'}}>
                  {Object.entries(STATUS_LABELS).map(([k,v])=>(
                    <button key={k} onClick={()=>updateStatus(selected.id,k)} disabled={updating||selected.status===k}
                      style={{padding:'5px 12px',border:'1px solid '+(selected.status===k?STATUS_COLORS[k]:'#ddd'),
                        background:selected.status===k?STATUS_COLORS[k]:'white',
                        color:selected.status===k?'white':'#555',fontSize:11,fontWeight:700,cursor:selected.status===k?'default':'pointer',
                        fontFamily:'var(--font-body)',textTransform:'uppercase',opacity:updating?0.6:1}}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              {selected.notes&&<div style={{marginTop:'1rem',padding:'8px 12px',background:'#fff8e1',border:'1px solid #ffd54f',fontSize:12,color:'#666'}}><strong>Notas:</strong> {selected.notes}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
