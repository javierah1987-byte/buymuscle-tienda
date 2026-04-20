// @ts-nocheck
'use client'
import{useEffect,useState}from 'react'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
function Stars({r,size=16,active=false,onRate=null}){
  const[h,setH]=useState(0)
  return <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(s=>(
    <span key={s} onClick={()=>active&&onRate&&onRate(s)} onMouseEnter={()=>active&&setH(s)} onMouseLeave={()=>active&&setH(0)}
      style={{fontSize:size,cursor:active?'pointer':'default',color:(h||r)>=s?'#ffd700':'#ddd',lineHeight:1}}>★</span>
  ))}</div>
}
export default function ProductReviews({productId}){
  const[revs,setRevs]=useState([]),[loading,setLoading]=useState(true)
  const[form,setForm]=useState({name:'',email:'',rating:5,comment:''})
  const[sending,setSending]=useState(false),[sent,setSent]=useState(false)
  useEffect(()=>{
    fetch(S+'/rest/v1/product_reviews?product_id=eq.'+productId+'&order=created_at.desc',{
      headers:{'apikey':K,'Authorization':'Bearer '+K}
    }).then(r=>r.json()).then(d=>{setRevs(d||[]);setLoading(false)}).catch(()=>setLoading(false))
  },[productId])
  async function onSubmit(e){
    e.preventDefault();if(!form.name)return;setSending(true)
    await fetch(S+'/rest/v1/product_reviews',{method:'POST',
      headers:{'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify({product_id:productId,...form})}).catch(()=>{})
    setRevs(r=>[{...form,id:Date.now(),created_at:new Date().toISOString()},...r])
    setSent(true);setSending(false)
  }
  const avg=revs.length?(revs.reduce((s,r)=>s+r.rating,0)/revs.length).toFixed(1):null
  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})
  return(
    <div style={{background:'white',marginTop:40,padding:'24px 0'}}>
      <h3 style={{fontSize:14,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.05em',margin:'0 0 20px',paddingBottom:10,borderBottom:'2px solid #ff1e41',display:'inline-block'}}>
        Valoraciones ({revs.length})
      </h3>
      {avg&&<div style={{display:'flex',alignItems:'center',gap:20,marginBottom:24,padding:16,background:'#f9f9f9',border:'1px solid #f0f0f0'}}>
        <div style={{textAlign:'center',minWidth:80}}>
          <div style={{fontSize:36,fontWeight:900,lineHeight:1}}>{avg}</div>
          <Stars r={Math.round(Number(avg))} size={18}/>
          <div style={{fontSize:11,color:'#aaa',marginTop:4}}>{revs.length} reseña{revs.length!==1?'s':''}</div>
        </div>
        <div style={{flex:1}}>{[5,4,3,2,1].map(s=>{
          const n=revs.filter(r=>r.rating===s).length
          const pct=revs.length?Math.round(n/revs.length*100):0
          return<div key={s} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
            <span style={{fontSize:12,color:'#666',width:8}}>{s}</span>
            <span style={{color:'#ffd700',fontSize:12}}>★</span>
            <div style={{flex:1,height:6,background:'#f0f0f0',borderRadius:3}}><div style={{height:6,background:'#ffd700',borderRadius:3,width:pct+'%'}}/></div>
            <span style={{fontSize:11,color:'#aaa',width:24}}>{n}</span>
          </div>
        })}</div>
      </div>}
      {loading?<p style={{color:'#aaa',fontSize:13}}>Cargando...</p>
      :revs.length===0?<p style={{color:'#aaa',fontSize:13}}>Sé el primero en valorar este producto.</p>
      :revs.map(r=><div key={r.id} style={{borderBottom:'1px solid #f5f5f5',paddingBottom:14,marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
          <div><Stars r={r.rating} size={13}/><div style={{fontSize:13,fontWeight:600,marginTop:4}}>{r.name}</div></div>
          <div style={{fontSize:11,color:'#aaa'}}>{fmt(r.created_at)}</div>
        </div>
        {r.comment&&<p style={{fontSize:13,color:'#555',margin:0,lineHeight:1.6}}>{r.comment}</p>}
      </div>)}
      <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid #f0f0f0'}}>
        <h4 style={{fontSize:13,fontWeight:700,textTransform:'uppercase',margin:'0 0 16px'}}>Deja tu valoración</h4>
        {sent?<p style={{color:'#22c55e',fontWeight:600}}>✅ ¡Gracias! Tu valoración ha sido publicada.</p>
        :<form onSubmit={onSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
          <div><div style={{fontSize:12,color:'#666',marginBottom:6,fontWeight:600}}>Puntuación *</div><Stars r={form.rating} size={28} active onRate={s=>setForm(f=>({...f,rating:s}))}/></div>
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Tu nombre *" required style={{padding:'8px 12px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit'}}/>
          <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="Email (no se publica)" type="email" style={{padding:'8px 12px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit'}}/>
          <textarea value={form.comment} onChange={e=>setForm(f=>({...f,comment:e.target.value}))} placeholder="Tu experiencia con el producto..." rows={3} style={{padding:'8px 12px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',resize:'vertical'}}/>
          <button type="submit" disabled={sending} style={{background:'#ff1e41',color:'white',border:'none',padding:'10px 24px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',alignSelf:'flex-start'}}>
            {sending?'Enviando...':'Publicar valoración'}
          </button>
        </form>}
      </div>
    </div>
  )
}
