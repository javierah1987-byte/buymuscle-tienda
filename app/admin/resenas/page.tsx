// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json'}
const STARS=n=>Array.from({length:5},(_,i)=>'<span style="color:'+(i<n?'#f59e0b':'#333')+'">★</span>').join('')
export default function AdminResenas(){
  const[reviews,setReviews]=useState([])
  const[tab,setTab]=useState('pending')
  const[loading,setLoading]=useState(true)
  const[msg,setMsg]=useState('')
  useEffect(()=>{load()},[tab])
  async function load(){
    setLoading(true)
    const r=await fetch(S+'/rest/v1/product_reviews?status=eq.'+tab+'&order=created_at.desc',{headers:h})
    const d=await r.json()
    setReviews(Array.isArray(d)?d:[])
    setLoading(false)
  }
  async function update(id,status){
    await fetch(S+'/rest/v1/product_reviews?id=eq.'+id,{method:'PATCH',headers:h,body:JSON.stringify({status})})
    setMsg(status==='approved'?'Resena aprobada y publicada':'Resena rechazada')
    setTimeout(()=>setMsg(''),2500)
    load()
  }
  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})
  const tabs=[{k:'pending',l:'Pendientes'},{k:'approved',l:'Aprobadas'},{k:'rejected',l:'Rechazadas'}]
  return(
    <div style={{background:'#0d0d0d',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#080808',padding:'18px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>⭐ Reseñas de clientes</h1>
        <Link href="/admin" style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:13}}>← Admin</Link>
      </div>
      {msg&&<div style={{background:'rgba(34,197,94,0.1)',borderBottom:'1px solid rgba(34,197,94,0.2)',padding:'12px 28px',fontSize:13,color:'#22c55e'}}>{msg}</div>}
      <div style={{padding:'16px 28px 0',display:'flex',gap:4}}>
        {tabs.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)}
            style={{padding:'8px 18px',background:tab===t.k?'rgba(255,30,65,0.15)':'transparent',border:'1px solid',borderColor:tab===t.k?'rgba(255,30,65,0.4)':'rgba(255,255,255,0.12)',color:'white',fontSize:13,cursor:'pointer',fontFamily:'Arial'}}>
            {t.l}
          </button>
        ))}
      </div>
      <div style={{padding:'20px 28px'}}>
        {loading?<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.4)'}}>Cargando...</div>
        :reviews.length===0?<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)',fontSize:14}}>No hay reseñas {tab==='pending'?'pendientes':tab==='approved'?'aprobadas':'rechazadas'}.</div>
        :reviews.map((r,i)=>(
          <div key={i} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:20,marginBottom:12,borderRadius:4}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                  <span dangerouslySetInnerHTML={{__html:STARS(r.rating||0)}}/>
                  <span style={{fontSize:13,fontWeight:700,color:'white'}}>{r.customer_name||'Anónimo'}</span>
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>·</span>
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'monospace'}}>{r.customer_email||''}</span>
                </div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginBottom:8}}>
                  📦 {r.product_name||'Producto'} · {r.created_at?fmt(r.created_at):''}
                </div>
                {r.comment&&<p style={{margin:0,fontSize:14,color:'rgba(255,255,255,0.7)',lineHeight:1.6,maxWidth:600}}>{r.comment}</p>}
              </div>
              {tab==='pending'&&(
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  <button onClick={()=>update(r.id,'approved')}
                    style={{padding:'8px 16px',background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',color:'#22c55e',fontSize:13,cursor:'pointer',fontFamily:'Arial',fontWeight:700}}>
                    ✓ Aprobar
                  </button>
                  <button onClick={()=>update(r.id,'rejected')}
                    style={{padding:'8px 16px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',fontSize:13,cursor:'pointer',fontFamily:'Arial'}}>
                    ✕ Rechazar
                  </button>
                </div>
              )}
              {tab==='approved'&&<span style={{fontSize:11,background:'rgba(34,197,94,0.15)',color:'#22c55e',padding:'3px 10px',borderRadius:12,flexShrink:0}}>Publicada</span>}
              {tab==='rejected'&&<span style={{fontSize:11,background:'rgba(239,68,68,0.1)',color:'#ef4444',padding:'3px 10px',borderRadius:12,flexShrink:0}}>Rechazada</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
                                                       }
