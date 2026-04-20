// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart'
import Link from 'next/link'

const SUPA_URL='https://awwlbepjxuoxaigztugh.supabase.co'
const SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

export default function CartUpsell() {
  const { items, add } = useCart()
  const [related, setRelated] = useState([])
  const [added, setAdded] = useState(null)

  useEffect(()=>{
    if(!items.length) return
    const ids=items.map(i=>i.id)
    fetch(SUPA_URL+'/rest/v1/products?select=id,name,price_incl_tax,sale_price,image_url,stock,category_id&active=eq.true&stock=gt.0&limit=100',{
      headers:{'apikey':SUPA_KEY,'Authorization':'Bearer '+SUPA_KEY}
    }).then(r=>r.json()).then(data=>{
      const cats=new Set(items.map(i=>i.category_id))
      const filtered=(data||[])
        .filter(p=>!ids.includes(p.id)&&(cats.has(p.category_id)||cats.size===0))
        .sort(()=>Math.random()-0.5).slice(0,4)
      setRelated(filtered)
    }).catch(()=>{})
  },[items.length])

  if(!related.length) return null

  function handleAdd(p){
    add({id:p.id,name:p.name,price:Number(p.sale_price||p.price_incl_tax),image:p.image_url,qty:1})
    setAdded(p.id)
    setTimeout(()=>setAdded(null),2000)
  }

  return(
    <div style={{borderTop:'1px solid #f0f0f0',paddingTop:'1.5rem',marginTop:'1.5rem'}}>
      <h3 style={{fontSize:13,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.05em',color:'#111',margin:'0 0 1rem'}}>
        También te puede interesar
      </h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {related.map(p=>{
          const price=Number(p.sale_price||p.price_incl_tax)
          const isAdded=added===p.id
          return(
            <div key={p.id} style={{border:'1px solid #f0f0f0',background:'white',padding:10,display:'flex',flexDirection:'column',gap:6}}>
              <Link href={'/producto/'+p.id} style={{textDecoration:'none'}}>
                {p.image_url
                  ?<img src={p.image_url} alt={p.name} style={{width:'100%',aspectRatio:'1',objectFit:'contain',background:'#fafafa'}}/>
                  :<div style={{width:'100%',aspectRatio:'1',background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>📦</div>
                }
                <p style={{fontSize:11,fontWeight:600,color:'#333',margin:'4px 0 0',lineHeight:1.3,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                  {p.name}
                </p>
              </Link>
              <div style={{fontSize:14,fontWeight:900,color:'#ff1e41'}}>{price.toFixed(2)} €</div>
              <button onClick={()=>handleAdd(p)}
                style={{background:isAdded?'#22c55e':'#111',color:'white',border:'none',padding:'6px 0',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'background 0.2s'}}>
                {isAdded?'✓ Añadido':'+ Añadir'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
    }
