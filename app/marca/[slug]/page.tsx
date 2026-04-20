// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K}
export default function MarcaPage({params}){
  const{slug}=params
  const[brand,setBrand]=useState(null)
  const[products,setProducts]=useState([])
  const[loading,setLoading]=useState(true)
  useEffect(()=>{
    fetch(S+'/rest/v1/brands?slug=eq.'+slug,{headers:h})
      .then(r=>r.json())
      .then(d=>{
        const b=Array.isArray(d)?d[0]:null
        setBrand(b)
        const brandName=b?.name||slug
        // Usar %25 para encodear % en el ilike con wildcards %
        fetch(S+'/rest/v1/products?active=eq.true&brand=ilike.%25'+encodeURIComponent(brandName)+'%25&select=id,name,price_incl_tax,sale_price,image_url,stock&order=name.asc&limit=80',{headers:h})
          .then(r=>r.json())
          .then(ps=>{setProducts(Array.isArray(ps)?ps:[]);setLoading(false)})
          .catch(()=>setLoading(false))
      })
      .catch(()=>setLoading(false))
  },[slug])
  if(!brand&&!loading) return(
    <div style={{padding:'5rem 2rem',textAlign:'center',fontFamily:'Arial,sans-serif',color:'#333'}}>
      <h1>Marca no encontrada</h1>
      <Link href="/tienda" style={{color:'#ff1e41'}}>Ver tienda</Link>
    </div>
  )
  const name=brand?.name||slug
  return(
    <div style={{fontFamily:'Arial,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#000 0%,#1a1a1a 50%,#000 100%)',padding:'60px 32px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at center,rgba(255,30,65,0.15) 0%,transparent 70%)'}}/>
        <div style={{position:'relative'}}>
          <div style={{display:'inline-block',background:'rgba(255,30,65,0.1)',border:'1px solid rgba(255,30,65,0.3)',padding:'4px 16px',fontSize:12,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'#ff1e41',marginBottom:16}}>MARCA OFICIAL</div>
          <h1 style={{margin:'0 0 12px',fontSize:'clamp(36px,7vw,72px)',fontWeight:900,textTransform:'uppercase',letterSpacing:'-2px',color:'white'}}>{name.toUpperCase()}</h1>
          <p style={{margin:0,fontSize:16,color:'rgba(255,255,255,0.6)',maxWidth:600,marginInline:'auto'}}>{brand?.description||'Descubre todos los productos de '+name}</p>
          {!loading&&<div style={{marginTop:24,fontSize:14,color:'rgba(255,255,255,0.4)'}}>{products.length} productos disponibles</div>}
        </div>
      </div>
      <div style={{background:'#f5f5f5',padding:'10px 32px',fontSize:13,color:'#666',display:'flex',gap:8,alignItems:'center'}}>
        <Link href="/" style={{color:'#666',textDecoration:'none'}}>Inicio</Link><span>/</span>
        <Link href="/tienda" style={{color:'#666',textDecoration:'none'}}>Tienda</Link><span>/</span>
        <span style={{color:'#ff1e41',fontWeight:600}}>{name}</span>
      </div>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'32px 24px'}}>
        {loading?<div style={{textAlign:'center',padding:'3rem',color:'#aaa',fontSize:16}}>Cargando productos...</div>
        :products.length===0?<div style={{textAlign:'center',padding:'3rem'}}>
          <p style={{color:'#aaa',fontSize:16,marginBottom:16}}>No hay productos de {name} disponibles.</p>
          <Link href="/tienda" style={{color:'#ff1e41',textDecoration:'none',fontWeight:700,padding:'10px 24px',border:'2px solid #ff1e41',display:'inline-block'}}>Ver toda la tienda</Link>
        </div>
        :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:20}}>
          {products.map(p=>{
            const price=Number(p.price_incl_tax||0)
            const sale=p.sale_price?Number(p.sale_price):null
            const hasOffer=sale&&sale<price
            return(
              <Link key={p.id} href={'/producto/'+p.id} style={{textDecoration:'none',color:'inherit',display:'block'}}>
                <div style={{background:'white',border:'1px solid #e8e8e8',transition:'all 0.2s',cursor:'pointer'}}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.12)';e.currentTarget.style.transform='translateY(-2px)'}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='translateY(0)'}}>
                  <div style={{position:'relative',paddingTop:'100%',background:'#f8f8f8'}}>
                    <img src={p.image_url||'https://placehold.co/300x300/f8f8f8/aaa?text=BM'} alt={p.name}
                      style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain',padding:8}}
                      onError={e=>{e.target.src='https://placehold.co/300x300/f8f8f8/aaa?text=BM'}}/>
                    {hasOffer&&<div style={{position:'absolute',top:8,left:8,background:'#ff1e41',color:'white',fontSize:10,fontWeight:700,padding:'2px 6px'}}>OFERTA</div>}
                    {!p.stock&&<div style={{position:'absolute',inset:0,background:'rgba(255,255,255,0.7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#999'}}>Sin stock</div>}
                  </div>
                  <div style={{padding:'12px 14px'}}>
                    <div style={{fontSize:12,fontWeight:600,color:'#333',lineHeight:1.3,marginBottom:8,minHeight:36,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.name}</div>
                    <div>
                      {hasOffer&&<div style={{fontSize:11,color:'#aaa',textDecoration:'line-through'}}>{price.toFixed(2)} €</div>}
                      <div style={{fontSize:16,fontWeight:700,color:hasOffer?'#ff1e41':'#333'}}>{(hasOffer?sale:price).toFixed(2)} €</div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>}
      </div>
    </div>
  )
}
