// @ts-nocheck
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'

const SB='https://awwlbepjxuoxaigztugh.supabase.co'
const SK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

// Producto de oferta del día — cambia cada 24h según el día del año
export default function OfertaDia() {
  const [product, setProduct] = useState(null)
  const [timeLeft, setTimeLeft] = useState({ h:0, m:0, s:0 })
  const [adding, setAdding] = useState(false)
  const { add } = useCart()

  useEffect(()=>{
    // Calcular tiempo hasta medianoche
    const tick = () => {
      const now = new Date()
      const midnight = new Date(now); midnight.setHours(24,0,0,0)
      const diff = Math.floor((midnight - now) / 1000)
      setTimeLeft({ h: Math.floor(diff/3600), m: Math.floor((diff%3600)/60), s: diff%60 })
    }
    tick()
    const t = setInterval(tick, 1000)
    return ()=>clearInterval(t)
  },[])

  useEffect(()=>{
    // Seleccionar producto del día basado en el día del año
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000)
    fetch(SB+'/rest/v1/products?active=eq.true&on_sale=eq.true&select=id,name,price_incl_tax,sale_price,image_url,brand&limit=30',{
      headers:{apikey:SK,'Authorization':'Bearer '+SK}
    }).then(r=>r.json()).then(prods=>{
      if(Array.isArray(prods)&&prods.length>0){
        setProduct(prods[dayOfYear % prods.length])
      } else {
        // Fallback: producto con descuento cualquiera
        fetch(SB+'/rest/v1/products?active=eq.true&select=id,name,price_incl_tax,sale_price,image_url,brand&limit=1&order=id.asc&offset='+((dayOfYear*7)%300),{
          headers:{apikey:SK,'Authorization':'Bearer '+SK}
        }).then(r=>r.json()).then(p=>{ if(Array.isArray(p)&&p[0]) setProduct(p[0]) })
      }
    })
  },[])

  if(!product) return null

  const price = Number(product.price_incl_tax)
  const sale = product.sale_price ? Number(product.sale_price) : price * 0.8
  const pct = Math.round((1 - sale/price)*100)

  const handleAdd = () => {
    add({id:product.id, name:product.name, price:sale, image:product.image_url, variant:'', qty:1})
    setAdding(true); setTimeout(()=>setAdding(false),1500)
  }

  const pad = n => String(n).padStart(2,'0')

  return (
    <section style={{background:'linear-gradient(135deg,#1a0a0a 0%,#2d0000 100%)',padding:'1.5rem 20px',borderBottom:'1px solid #3d0000'}}>
      <div style={{maxWidth:1280,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',gap:24,flexWrap:'wrap'}}>
        {/* Label */}
        <div style={{display:'flex',flexDirection:'column',gap:4,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:24}}>⚡</span>
            <div>
              <div style={{fontWeight:900,fontSize:'clamp(16px,2vw,22px)',color:'white',letterSpacing:'-0.02em'}}>OFERTA DEL DIA</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:1}}>Solo hoy · Precio especial</div>
            </div>
          </div>
          {/* Countdown */}
          <div style={{display:'flex',gap:6,marginTop:4}}>
            {[{v:timeLeft.h,l:'H'},{v:timeLeft.m,l:'M'},{v:timeLeft.s,l:'S'}].map(({v,l})=>(
              <div key={l} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:4,padding:'6px 10px',textAlign:'center',minWidth:44}}>
                <div style={{fontWeight:900,fontSize:18,color:'#ff1e41',fontVariantNumeric:'tabular-nums'}}>{pad(v)}</div>
                <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',letterSpacing:'0.1em'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Producto */}
        <Link href={'/producto/'+product.id} style={{display:'flex',alignItems:'center',gap:16,textDecoration:'none',flex:1,minWidth:0,maxWidth:480}}>
          {product.image_url && (
            <div style={{width:72,height:72,background:'rgba(255,255,255,0.06)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)'}}>
              <img src={product.image_url} alt={product.name} style={{maxWidth:60,maxHeight:60,objectFit:'contain'}}/>
            </div>
          )}
          <div style={{minWidth:0}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.45)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2}}>{product.brand||''}</div>
            <div style={{fontWeight:700,color:'white',fontSize:'clamp(12px,1.2vw,15px)',lineHeight:1.3,overflow:'hidden',textOverflow:'ellipsis',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{product.name}</div>
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginTop:6}}>
              <span style={{fontWeight:900,fontSize:'clamp(18px,2vw,24px)',color:'#ff1e41'}}>{sale.toFixed(2)} €</span>
              <span style={{fontSize:13,color:'rgba(255,255,255,0.3)',textDecoration:'line-through'}}>{price.toFixed(2)} €</span>
              <span style={{background:'#ff1e41',color:'white',fontSize:10,fontWeight:800,padding:'2px 6px',borderRadius:10}}>-{pct}%</span>
            </div>
          </div>
        </Link>

        {/* CTA */}
        <button onClick={handleAdd} style={{flexShrink:0,padding:'12px 28px',background:adding?'#22c55e':'#ff1e41',border:'none',borderRadius:4,color:'white',fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:'var(--font-body)',textTransform:'uppercase',letterSpacing:'0.05em',transition:'background 0.2s',whiteSpace:'nowrap'}}>
          {adding ? '✓ Anadido' : '🛒 Anadir al carrito'}
        </button>
      </div>
    </section>
  )
}
