// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'

const SB='https://awwlbepjxuoxaigztugh.supabase.co'
const SK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

export default function RecomendadosVacio() {
  const [prods, setProds] = useState([])
  const [adding, setAdding] = useState({})
  const { add } = useCart()

  useEffect(()=>{
    fetch(SB+'/rest/v1/products?active=eq.true&select=id,name,price_incl_tax,sale_price,on_sale,image_url,brand&order=id.desc&limit=6',{
      headers:{apikey:SK,'Authorization':'Bearer '+SK}
    }).then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setProds(d) })
  },[])

  if(!prods.length) return null

  const handleAdd = (p, e) => {
    e.preventDefault(); e.stopPropagation()
    const price = p.on_sale && p.sale_price ? Number(p.sale_price) : Number(p.price_incl_tax)
    add({id:p.id, name:p.name, price, image:p.image_url, variant:'', qty:1})
    setAdding(a=>({...a,[p.id]:true}))
    setTimeout(()=>setAdding(a=>({...a,[p.id]:false})),1400)
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10,width:'100%',maxWidth:600,margin:'0 auto'}}>
      {prods.map(p=>{
        const price = p.on_sale&&p.sale_price ? Number(p.sale_price) : Number(p.price_incl_tax)
        const original = Number(p.price_incl_tax)
        const isAdded = adding[p.id]
        return (
          <Link key={p.id} href={'/producto/'+p.id} style={{textDecoration:'none',color:'inherit',display:'flex',flexDirection:'column',background:'white',border:'1px solid #ebebeb',borderRadius:6,overflow:'hidden',transition:'box-shadow 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,0.1)'}
            onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
            <div style={{background:'#f9f9f9',aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',padding:8}}>
              {p.image_url
                ? <img src={p.image_url} alt={p.name} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/>
                : <div style={{fontSize:28,opacity:0.3}}>📦</div>}
            </div>
            <div style={{padding:'8px 8px 6px',flex:1,display:'flex',flexDirection:'column',gap:4}}>
              <div style={{fontSize:11,fontWeight:600,color:'#333',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.name}</div>
              <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                <span style={{fontSize:13,fontWeight:800,color:'#ff1e41'}}>{price.toFixed(2)}€</span>
                {p.on_sale&&p.sale_price&&<span style={{fontSize:10,color:'#ccc',textDecoration:'line-through'}}>{original.toFixed(2)}</span>}
              </div>
              <button onClick={e=>handleAdd(p,e)} style={{width:'100%',padding:'5px 4px',border:'1px solid #ff1e41',background:isAdded?'#22c55e':'transparent',color:isAdded?'white':'#ff1e41',fontSize:10,fontWeight:700,borderRadius:3,cursor:'pointer',transition:'all 0.15s',fontFamily:'inherit'}}>
                {isAdded ? '✓ Anadido' : 'Anadir'}
              </button>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
