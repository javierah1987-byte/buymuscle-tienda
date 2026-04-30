// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json'}

export default function AdminResenas(){
  const[reviews,setReviews]=useState([])
  const[products,setProducts]=useState({})
  const[tab,setTab]=useState('pending') // pending=no verificadas, approved=verificadas
  const[loading,setLoading]=useState(true)
  const[msg,setMsg]=useState('')

  useEffect(()=>{
    // Cargar productos para mostrar nombres
    fetch(S+'/rest/v1/products?select=id,name&active=eq.true&limit=500',{headers:h})
      .then(r=>r.json()).then(d=>{
        if(Array.isArray(d)){
          const map={}
          d.forEach(p=>{map[p.id]=p.name})
          setProducts(map)
        }
      })
  },[])

  useEffect(()=>{load()},[tab])

  async function load(){
    setLoading(true)
    // verified=true → aprobadas, verified=false/null → pendientes
    const filter=tab==='approved'?'&verified=eq.true':'&verified=eq.false'
    const r=await fetch(S+'/rest/v1/product_reviews?order=created_at.desc'+filter,{headers:h})
    const d=await r.json()
    setReviews(Array.isArray(d)?d:[])
    setLoading(false)
  }

  async function approve(id){
    await fetch(S+'/rest/v1/product_reviews?id=eq.'+id,{method:'PATCH',headers:h,body:JSON.stringify({verified:true})})
    setMsg('Reseña aprobada y publicada ✅')
    setTimeout(()=>setMsg(''),2500)
    load()
  }

  async function reject(id){
    if(!confirm('Eliminar esta reseña?')) return
    await fetch(S+'/rest/v1/product_reviews?id=eq.'+id,{method:'DELETE',headers:h})
    setMsg('Reseña eliminada')
    setTimeout(()=>setMsg(''),2500)
    load()
  }

  async function addManual(){
    // Formulario de añadir reseña manual
    const productId=prompt('ID del producto:')
    if(!productId) return
    const name=prompt('Nombre del cliente:')
    if(!name) return
    const rating=prompt('Valoración (1-5):','5')
    const comment=prompt('Comentario:')
    if(!rating||!comment) return
    await fetch(S+'/rest/v1/product_reviews',{method:'POST',headers:{...h,'Prefer':'return=minimal'},
      body:JSON.stringify({product_id:Number(productId),name,rating:Number(rating),comment,verified:true,created_at:new Date().toISOString()})
    })
    setMsg('Reseña añadida ✅')
    setTimeout(()=>setMsg(''),2500)
    load()
  }

  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})
  const Stars=({n})=>(
    <span style={{letterSpacing:2,fontSize:14}}>
      {[1,2,3,4,5].map(i=><span key={i} style={{color:i<=n?'#f59e0b':'#333'}}>★</span>)}
    </span>
  )

  return(
    <div style={{background:'#0d0d0d',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#080808',padding:'18px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>⭐ Reseñas de clientes</h1>
          <p style={{margin:'3px 0 0',fontSize:12,color:'rgba(255,255,255,0.4)'}}>Modera las reseñas antes de publicarlas</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button onClick={addManual} style={{padding:'8px 16px',background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',color:'#22c55e',fontSize:12,cursor:'pointer',fontFamily:'Arial',fontWeight:700,borderRadius:4}}>
            + Añadir reseña
          </button>
          <Link href="/admin" style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:13}}>← Admin</Link>
        </div>
      </div>

      {msg&&<div style={{background:'rgba(34,197,94,0.1)',borderBottom:'1px solid rgba(34,197,94,0.2)',padding:'12px 28px',fontSize:13,color:'#22c55e'}}>{msg}</div>}

      <div style={{padding:'16px 28px 0',display:'flex',gap:4}}>
        {[{k:'pending',l:'Pendientes de aprobar'},{k:'approved',l:'Aprobadas y publicadas'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)}
            style={{padding:'8px 18px',background:tab===t.k?'rgba(255,30,65,0.15)':'transparent',border:'1px solid',borderColor:tab===t.k?'rgba(255,30,65,0.4)':'rgba(255,255,255,0.12)',color:'white',fontSize:13,cursor:'pointer',fontFamily:'Arial',borderRadius:'4px 4px 0 0'}}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{padding:'20px 28px'}}>
        {loading
          ?<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.4)'}}>Cargando...</div>
          :reviews.length===0
          ?<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)',fontSize:14}}>
            No hay reseñas {tab==='pending'?'pendientes de aprobar':'aprobadas'}.<br/>
            {tab==='pending'&&<span style={{fontSize:12,color:'rgba(255,255,255,0.2)'}}>Las reseñas de clientes aparecerán aquí para que las moderes.</span>}
          </div>
          :reviews.map((r)=>(
            <div key={r.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:20,marginBottom:12,borderRadius:4}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
                    <Stars n={r.rating||0}/>
                    <span style={{fontSize:13,fontWeight:700,color:'white'}}>{r.name||'Anónimo'}</span>
                    {r.email&&<span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'monospace'}}>{r.email}</span>}
                  </div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginBottom:10}}>
                    📦 {products[r.product_id]||('Producto #'+r.product_id)} · {r.created_at?fmt(r.created_at):''}
                  </div>
                  {r.comment&&<p style={{margin:0,fontSize:14,color:'rgba(255,255,255,0.75)',lineHeight:1.6,maxWidth:600,fontStyle:'italic'}}>"{r.comment}"</p>}
                </div>
                <div style={{display:'flex',gap:8,flexShrink:0,marginLeft:16}}>
                  {tab==='pending'&&(
                    <button onClick={()=>approve(r.id)}
                      style={{padding:'8px 14px',background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',color:'#22c55e',fontSize:12,cursor:'pointer',fontFamily:'Arial',fontWeight:700,borderRadius:4}}>
                      ✓ Aprobar
                    </button>
                  )}
                  {tab==='approved'&&<span style={{fontSize:11,background:'rgba(34,197,94,0.15)',color:'#22c55e',padding:'4px 12px',borderRadius:12,alignSelf:'center'}}>Publicada</span>}
                  <button onClick={()=>reject(r.id)}
                    style={{padding:'8px 14px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',fontSize:12,cursor:'pointer',fontFamily:'Arial',borderRadius:4}}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
