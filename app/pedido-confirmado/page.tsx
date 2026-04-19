// @ts-nocheck
'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const db = createClient(
  'https://awwlbepjxuoxaigztugh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
)

function Contenido() {
  const params = useSearchParams()
  const num = params.get('n')
  const [order, setOrder] = useState(null)
  const [lines, setLines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!num) { setLoading(false); return }
    db.from('orders').select('*').eq('order_number', num).single().then(async ({ data }) => {
      setOrder(data)
      if (data) {
        const { data: l } = await db.from('order_lines').select('*').eq('order_id', data.id)
        setLines(l || [])
      }
      setLoading(false)
    })
  }, [num])

  if (loading) return <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0a0a',color:'#555'}}>Cargando pedido...</div>
  if (!order) return <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0a0a',flexDirection:'column',gap:16,fontFamily:'inherit'}}><div style={{fontSize:48}}>🛒</div><div style={{color:'#ccc',fontWeight:700,fontSize:18}}>Pedido no encontrado</div><Link href="/" style={{color:'#ff1e41',fontSize:13}}>← Inicio</Link></div>

  return (
    <div style={{background:'#0a0a0a',minHeight:'60vh',fontFamily:'var(--font-body,Arial)',padding:'40px 20px'}}>
      <div style={{maxWidth:640,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{fontSize:72,marginBottom:12}}>✅</div>
          <h1 style={{fontSize:26,fontWeight:900,color:'white',margin:'0 0 8px'}}>¡Pedido confirmado!</h1>
          <p style={{color:'#555',fontSize:14,margin:0}}>Gracias {order.customer_name?.split(' ')[0]}, hemos recibido tu pedido.</p>
        </div>

        <div style={{background:'#111',border:'2px solid #ff1e41',padding:'24px',textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:11,color:'#555',textTransform:'uppercase',letterSpacing:'0.15em',marginBottom:8}}>Número de pedido</div>
          <div style={{fontSize:34,fontWeight:900,color:'#ff1e41',letterSpacing:2}}>{order.order_number}</div>
          <div style={{fontSize:11,color:'#555',marginTop:6}}>{new Date(order.created_at).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',marginBottom:28,position:'relative'}}>
          <div style={{position:'absolute',top:16,left:'12%',right:'12%',height:2,background:'#1a1a1a',zIndex:0}}/>
          {[['📋','Recibido',true],['📦','Preparando',false],['🚚','En camino',false],['🏠','Entregado',false]].map(([icon,label,done],i)=>(
            <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,zIndex:1,flex:1}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:done?'#ff1e41':'#1a1a1a',border:'2px solid '+(done?'#ff1e41':'#333'),display:'flex',alignItems:'center',justifyContent:'center',fontSize:done?16:13}}>
                {done?'✓':icon}
              </div>
              <div style={{fontSize:10,color:done?'#ff1e41':'#555',textAlign:'center'}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{background:'#111',border:'1px solid #1a1a1a',marginBottom:14}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid #1a1a1a',fontSize:12,fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:'0.06em'}}>Productos</div>
          {lines.map(l=>(
            <div key={l.id} style={{padding:'12px 18px',borderBottom:'1px solid #0f0f0f',display:'flex',justifyContent:'space-between',gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:'#ccc'}}>{l.product_name}</div>
                <div style={{fontSize:11,color:'#555'}}>×{l.quantity} · {Number(l.unit_price).toFixed(2)} €/ud</div>
              </div>
              <div style={{fontWeight:700,color:'white',fontSize:13}}>{(l.unit_price*l.quantity).toFixed(2)} €</div>
            </div>
          ))}
          <div style={{padding:'14px 18px',background:'#0f0f0f'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#555',marginBottom:3}}><span>Subtotal</span><span>{Number(order.subtotal).toFixed(2)} €</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#555',marginBottom:3}}><span>IVA (21%)</span><span>{Number(order.tax_amount).toFixed(2)} €</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#555',marginBottom:10}}><span>Envío</span><span>{Number(order.shipping_cost)>0?Number(order.shipping_cost).toFixed(2)+' €':'GRATIS'}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:20,fontWeight:900,color:'#ff1e41',paddingTop:10,borderTop:'1px solid #1a1a1a'}}><span>TOTAL</span><span>{Number(order.total).toFixed(2)} €</span></div>
          </div>
        </div>

        {order.shipping_address && (
          <div style={{background:'#111',border:'1px solid #1a1a1a',padding:'14px 18px',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Dirección de entrega</div>
            <div style={{fontSize:13,color:'#888',lineHeight:1.9}}>
              <div style={{fontWeight:600,color:'#ccc'}}>{order.customer_name}</div>
              <div>{order.shipping_address}</div>
              <div>{order.shipping_postal_code} {order.shipping_city}, {order.shipping_province}</div>
            </div>
          </div>
        )}

        <div style={{background:'#111',border:'1px solid #1a1a1a',padding:'14px 18px',marginBottom:28,display:'flex',gap:14,alignItems:'flex-start'}}>
          <span style={{fontSize:22}}>📦</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:'#ccc',marginBottom:4}}>Entrega en 24-48 horas laborables</div>
            <div style={{fontSize:12,color:'#555'}}>Confirmación enviada a <strong style={{color:'#777'}}>{order.customer_email}</strong></div>
          </div>
        </div>

        <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/" style={{background:'#ff1e41',color:'white',padding:'12px 24px',textDecoration:'none',fontWeight:700,fontSize:13,textTransform:'uppercase'}}>Seguir comprando</Link>
          <a href={'https://wa.me/34828048310?text=Consulta%20pedido%20'+order.order_number} target="_blank" style={{background:'#25d366',color:'white',padding:'12px 24px',textDecoration:'none',fontWeight:700,fontSize:13}}>💬 WhatsApp</a>
        </div>
      </div>
    </div>
  )
}

export default function PedidoConfirmado() {
  return (
    <Suspense fallback={<div style={{minHeight:'60vh',background:'#0a0a0a'}}/>}>
      <Contenido/>
    </Suspense>
  )
}
