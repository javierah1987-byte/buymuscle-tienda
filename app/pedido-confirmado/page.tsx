// @ts-nocheck
'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const S = 'https://awwlbepjxuoxaigztugh.supabase.co'
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const db = createClient(S, K)

function Contenido() {
  const params = useSearchParams()
  const num = params.get('n')
  const [order, setOrder] = useState(null)
  const [lines, setLines] = useState([])
  const [upsell, setUpsell] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!num) { setLoading(false); return }
    db.from('orders').select('*').eq('order_number', num).single().then(async ({ data }) => {
      setOrder(data)
      if (data) {
        const { data: l } = await db.from('order_lines').select('*').eq('order_id', data.id)
        setLines(l || [])
        const boughtIds = (l || []).map(function(x){ return x.product_id })
        const { data: ups } = await db.from('products')
          .select('id,name,price_incl_tax,sale_price,image_url')
          .eq('active', true).gt('stock', 0).order('id', { ascending: false }).limit(12)
        if (ups) setUpsell(ups.filter(function(p){ return boughtIds.indexOf(p.id) === -1 }).slice(0,4))
      }
      setLoading(false)
    })
  }, [num])

  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f8f8' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid #ff1e41', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 12px' }}/>
        <div style={{ color:'#888', fontSize:14 }}>Cargando tu pedido...</div>
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    </div>
  )

  if (!num || !order) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f8f8' }}>
      <div style={{ textAlign:'center', padding:40 }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🛒</div>
        <h2 style={{ fontSize:20, fontWeight:700, margin:'0 0 8px', color:'#111' }}>Pedido no encontrado</h2>
        <Link href="/tienda" style={{ background:'#ff1e41', color:'white', padding:'11px 24px', textDecoration:'none', fontWeight:700, fontSize:13, borderRadius:4 }}>Ver catálogo</Link>
      </div>
    </div>
  )

  const firstName = order.customer_name ? order.customer_name.split(' ')[0] : 'cliente'
  const fecha = new Date(order.created_at).toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' })

  return (
    <div style={{ background:'#f8f8f8', minHeight:'60vh', fontFamily:'Heebo, Arial, sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#111 0%,#1a0808 100%)', padding:'48px 20px', textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:12 }}>🎉</div>
        <h1 style={{ fontSize:'clamp(22px,4vw,32px)', fontWeight:900, color:'white', margin:'0 0 8px', textTransform:'uppercase' }}>¡Pedido confirmado!</h1>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:15, margin:'0 0 20px' }}>Gracias <strong style={{ color:'white' }}>{firstName}</strong> — lo estamos preparando.</p>
        <div style={{ display:'inline-block', background:'rgba(255,30,65,0.15)', border:'1px solid #ff1e41', padding:'12px 28px', borderRadius:4 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:4 }}>Número de pedido</div>
          <div style={{ fontSize:28, fontWeight:900, color:'#ff1e41', letterSpacing:3 }}>{order.order_number}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:4 }}>{fecha}</div>
        </div>
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'32px 20px' }}>
        <div style={{ background:'white', border:'1px solid #e8e8e8', borderRadius:8, padding:'24px 28px', marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:20 }}>Estado del pedido</div>
          <div style={{ display:'flex', alignItems:'flex-start', position:'relative' }}>
            <div style={{ position:'absolute', top:20, left:'10%', right:'10%', height:2, background:'#f0f0f0' }}/>
            {[
              { icon:'📋', label:'Recibido', done:true },
              { icon:'📦', label:'Preparando', done:false },
              { icon:'🚚', label:'En camino', done:false },
              { icon:'🏠', label:'Entregado', done:false },
            ].map(function(s,i){ return(
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, position:'relative', zIndex:1 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:s.done?'#ff1e41':'white', border:'2px solid '+(s.done?'#ff1e41':'#e8e8e8'), display:'flex', alignItems:'center', justifyContent:'center', fontSize:s.done?18:14 }}>{s.done?'✓':s.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color:s.done?'#ff1e41':'#aaa', textAlign:'center' }}>{s.label}</div>
              </div>
            )})}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, alignItems:'start' }}>
          <div>
            <div style={{ background:'white', border:'1px solid #e8e8e8', borderRadius:8, overflow:'hidden', marginBottom:16 }}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid #f0f0f0', fontWeight:700, fontSize:13, textTransform:'uppercase', color:'#111' }}>Productos</div>
              {lines.map(function(l){ return(
                <div key={l.id} style={{ display:'flex', gap:12, padding:'12px 20px', borderBottom:'1px solid #f9f9f9', alignItems:'center' }}>
                  <div style={{ width:44, height:44, background:'#f5f5f5', borderRadius:4, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>📦</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#111' }}>{l.product_name}</div>
                    <div style={{ fontSize:11, color:'#aaa' }}>×{l.quantity} · {Number(l.unit_price).toFixed(2)} €/ud</div>
                  </div>
                  <div style={{ fontWeight:800, fontSize:14 }}>{(l.unit_price*l.quantity).toFixed(2)} €</div>
                </div>
              )})}
            </div>

            {order.shipping_address&&(
              <div style={{ background:'white', border:'1px solid #e8e8e8', borderRadius:8, padding:'16px 20px', marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:10 }}>📍 Dirección</div>
                <div style={{ fontSize:13, color:'#555', lineHeight:1.8 }}>
                  <div style={{ fontWeight:700, color:'#111' }}>{order.customer_name}</div>
                  <div>{order.shipping_address}</div>
                  <div>{order.shipping_postal_code} {order.shipping_city}{order.shipping_province?', '+order.shipping_province:''}</div>
                </div>
              </div>
            )}

            <div style={{ background:'white', border:'1px solid #e8e8e8', borderRadius:8, padding:'16px 20px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:14 }}>¿Qué pasa ahora?</div>
              {[
                { icon:'📧', title:'Email de confirmación', desc:'Recibirás un resumen en '+order.customer_email },
                { icon:'📦', title:'Preparación en 24h', desc:'Tu pedido se prepara en nuestro almacén en Canarias' },
                { icon:'🚚', title:'Envío 24-48h laborables', desc:'Te avisamos por WhatsApp cuando salga' },
                { icon:'💬', title:'¿Dudas? Escríbenos', desc:'WhatsApp 828 048 310 · L-V 9:00-18:00' },
              ].map(function(s,i){ return(
                <div key={i} style={{ display:'flex', gap:10, marginBottom:i<3?12:0, paddingBottom:i<3?12:0, borderBottom:i<3?'1px solid #f5f5f5':'none' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#111', marginBottom:2 }}>{s.title}</div>
                    <div style={{ fontSize:12, color:'#888' }}>{s.desc}</div>
                  </div>
                </div>
              )})}
            </div>
          </div>

          <div style={{ position:'sticky', top:20 }}>
            <div style={{ background:'white', border:'1px solid #e8e8e8', borderRadius:8, padding:20, marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', marginBottom:14, color:'#111' }}>Resumen</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:10, fontSize:13, color:'#555' }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}><span>Subtotal</span><span>{Number(order.subtotal).toFixed(2)} €</span></div>
                <div style={{ display:'flex', justifyContent:'space-between', color:Number(order.shipping_cost)>0?'#555':'#22c55e' }}>
                  <span>Envío</span><span>{Number(order.shipping_cost)>0?Number(order.shipping_cost).toFixed(2)+' €':'GRATIS'}</span>
                </div>
              </div>
              <div style={{ borderTop:'2px solid #111', paddingTop:12, display:'flex', justifyContent:'space-between', fontSize:20, fontWeight:900 }}>
                <span>TOTAL</span><span style={{ color:'#ff1e41' }}>{Number(order.total).toFixed(2)} €</span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <Link href="/tienda" style={{ display:'block', background:'#ff1e41', color:'white', padding:'12px', textDecoration:'none', fontWeight:700, fontSize:13, textTransform:'uppercase', textAlign:'center', borderRadius:4 }}>Seguir comprando</Link>
              <a href={'https://wa.me/34828048310?text=Pedido+'+order.order_number} target="_blank" rel="noopener noreferrer"
                style={{ display:'block', background:'#25d366', color:'white', padding:'12px', textDecoration:'none', fontWeight:700, fontSize:13, textAlign:'center', borderRadius:4 }}>
                💬 WhatsApp
              </a>
              <Link href="/mis-pedidos" style={{ display:'block', border:'1px solid #e8e8e8', color:'#555', padding:'11px', textDecoration:'none', fontWeight:600, fontSize:13, textAlign:'center', borderRadius:4 }}>
                Mis pedidos
              </Link>
            </div>
          </div>
        </div>

        {upsell.length>0&&(
          <div style={{ marginTop:40 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, paddingBottom:12, borderBottom:'2px solid #ff1e41' }}>
              <span style={{ fontSize:18 }}>🔥</span>
              <h3 style={{ margin:0, fontSize:15, fontWeight:800, textTransform:'uppercase', color:'#111' }}>También te puede gustar</h3>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
              {upsell.map(function(p){
                const price = Number(p.sale_price||p.price_incl_tax)
                return(
                  <Link key={p.id} href={'/producto/'+p.id} style={{ textDecoration:'none', color:'inherit', background:'white', border:'1px solid #e8e8e8', borderRadius:8, overflow:'hidden', display:'flex', flexDirection:'column' }}>
                    <div style={{ background:'#f9f9f9', aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', padding:10 }}>
                      {p.image_url?<img src={p.image_url} alt="" loading="lazy" style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }}/>:<div style={{ fontSize:28, opacity:.3 }}>📦</div>}
                    </div>
                    <div style={{ padding:'10px 12px' }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'#111', lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', marginBottom:4 }}>{p.name}</div>
                      <div style={{ fontSize:14, fontWeight:900, color:'#ff1e41' }}>{price.toFixed(2)} €</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PedidoConfirmado() {
  return (
    <Suspense fallback={<div style={{ minHeight:'60vh', background:'#f8f8f8' }}/>}>
      <Contenido/>
    </Suspense>
  )
}
