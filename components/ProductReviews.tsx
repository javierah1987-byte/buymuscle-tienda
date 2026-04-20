// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K}
function Stars({rating,interactive,onRate}){
  const[hover,setHover]=useState(0)
  return(
    <div style={{display:'flex',gap:2}}>
      {[1,2,3,4,5].map(s=>(
        <span key={s} onClick={()=>interactive&&onRate&&onRate(s)}
          onMouseEnter={()=>interactive&&setHover(s)} onMouseLeave={()=>interactive&&setHover(0)}
          style={{fontSize:interactive?22:16,cursor:interactive?'pointer':'default',color:(hover||rating)>=s?'#f59e0b':'#ddd',transition:'color 0.1s'}}>
          ★
        </span>
      ))}
    </div>
  )
}
export default function ProductReviews({productId,productName}){
  const[reviews,setReviews]=useState([])
  const[avg,setAvg]=useState(0)
  const[showForm,setShowForm]=useState(false)
  const[form,setForm]=useState({name:'',email:'',rating:0,comment:''})
  const[sending,setSending]=useState(false)
  const[msg,setMsg]=useState('')
  useEffect(()=>{
    fetch(S+'/rest/v1/product_reviews?product_id=eq.'+productId+'&status=eq.approved&order=created_at.desc',{headers:h})
      .then(r=>r.json()).then(d=>{
        const revs=Array.isArray(d)?d:[]
        setReviews(revs)
        if(revs.length>0) setAvg(revs.reduce((s,r)=>s+(r.rating||0),0)/revs.length)
      })
  },[productId])
  async function submit(){
    if(!form.rating){setMsg('Selecciona una valoracion');return}
    if(!form.name.trim()||!form.email.trim()){setMsg('Nombre y email son obligatorios');return}
    setSending(true)
    const res=await fetch(S+'/rest/v1/product_reviews',{method:'POST',
      headers:{...h,'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify({product_id:productId,product_name:productName,customer_name:form.name,customer_email:form.email,rating:form.rating,comment:form.comment,status:'pending'})})
    setSending(false)
    if(res.ok||res.status===201){setMsg('Gracias. Tu resena sera publicada tras revision.');setShowForm(false);setForm({name:'',email:'',rating:0,comment:''})}
    else setMsg('Error al enviar. Intentalo de nuevo.')
    setTimeout(()=>setMsg(''),4000)
  }
  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})
  return(
    <div style={{padding:'40px 0',borderTop:'2px solid #f0f0f0',fontFamily:'Arial,sans-serif'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h2 style={{margin:0,fontSize:22,fontWeight:900,color:'#111'}}>Valoraciones</h2>
          {reviews.length>0&&<div style={{display:'flex',alignItems:'center',gap:10,marginTop:6}}>
            <Stars rating={Math.round(avg)}/>
            <span style={{fontSize:18,fontWeight:700,color:'#f59e0b'}}>{avg.toFixed(1)}</span>
            <span style={{fontSize:13,color:'#888'}}>({reviews.length} valoracion{reviews.length!==1?'es':''})</span>
          </div>}
        </div>
        <button onClick={()=>setShowForm(f=>!f)}
          style={{background:showForm?'#fff':'#ff1e41',color:showForm?'#ff1e41':'white',border:'2px solid #ff1e41',padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'Arial'}}>
          {showForm?'Cancelar':'Escribir resena'}
        </button>
      </div>
      {msg&&<div style={{padding:'10px 14px',marginBottom:16,fontSize:13,background:msg.includes('Gracias')?'#f0fdf4':'#fff3f3',color:msg.includes('Gracias')?'#166534':'#c62828',border:'1px solid',borderColor:msg.includes('Gracias')?'#bbf7d0':'#ffcdd2'}}>{msg}</div>}
      {showForm&&(
        <div style={{background:'#f8f8f8',padding:24,marginBottom:28,border:'1px solid #e8e8e8'}}>
          <h3 style={{margin:'0 0 20px',fontSize:16,fontWeight:700}}>Tu valoracion</h3>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:6}}>Puntuacion *</label>
            <Stars rating={form.rating} interactive onRate={r=>setForm(f=>({...f,rating:r}))}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:4}}>Nombre *</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Tu nombre"
                style={{width:'100%',padding:'10px',border:'1px solid #ddd',fontSize:13,fontFamily:'Arial',boxSizing:'border-box'}}/>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:4}}>Email *</label>
              <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="tu@email.com" type="email"
                style={{width:'100%',padding:'10px',border:'1px solid #ddd',fontSize:13,fontFamily:'Arial',boxSizing:'border-box'}}/>
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:4}}>Comentario</label>
            <textarea value={form.comment} onChange={e=>setForm(f=>({...f,comment:e.target.value}))} rows={3} placeholder="Cuéntanos tu experiencia con el producto..."
              style={{width:'100%',padding:'10px',border:'1px solid #ddd',fontSize:13,fontFamily:'Arial',boxSizing:'border-box',resize:'vertical'}}/>
          </div>
          <button onClick={submit} disabled={sending}
            style={{background:'#ff1e41',color:'white',border:'none',padding:'12px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'Arial'}}>
            {sending?'Enviando...':'Publicar valoracion'}
          </button>
        </div>
      )}
      {reviews.length===0?<p style={{color:'#aaa',fontStyle:'italic',fontSize:14}}>Aun no hay valoraciones. Se el primero en valorar este producto.</p>
      :reviews.map((r,i)=>(
        <div key={i} style={{paddingBottom:20,marginBottom:20,borderBottom:'1px solid #f0f0f0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <Stars rating={r.rating||0}/>
                {r.verified&&<span style={{fontSize:11,background:'#f0fdf4',color:'#166534',padding:'2px 6px',border:'1px solid #bbf7d0',fontWeight:600}}>Compra verificada</span>}
              </div>
              <div style={{fontWeight:700,fontSize:14,marginTop:4,color:'#111'}}>{r.customer_name||'Cliente'}</div>
            </div>
            <div style={{fontSize:12,color:'#aaa'}}>{r.created_at?fmt(r.created_at):''}</div>
          </div>
          {r.comment&&<p style={{margin:0,fontSize:14,color:'#444',lineHeight:1.6}}>{r.comment}</p>}
        </div>
      ))}
    </div>
  )
    }
