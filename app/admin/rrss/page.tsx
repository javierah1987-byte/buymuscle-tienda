// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

const PLATFORMS=[
  {id:'instagram',icon:'📸',name:'Instagram',color:'#E1306C'},
  {id:'facebook',icon:'👥',name:'Facebook',color:'#1877F2'},
  {id:'tiktok',icon:'🎵',name:'TikTok',color:'#000'},
]

export default function PanelRRSS(){
  const[posts,setPosts]=useState([])
  const[form,setForm]=useState({content:'',image_url:'',platforms:[],scheduled_at:''})
  const[saving,setSaving]=useState(false)
  const[saved,setSaved]=useState(false)
  const[charCount,setCharCount]=useState(0)

  useEffect(()=>{
    fetch(S+'/rest/v1/social_posts?order=created_at.desc&limit=20',{headers:{'apikey':K,'Authorization':'Bearer '+K}})
      .then(r=>r.json()).then(d=>setPosts(d||[])).catch(()=>{})
  },[])

  function togglePlatform(id){
    setForm(f=>({...f,platforms:f.platforms.includes(id)?f.platforms.filter(p=>p!==id):[...f.platforms,id]}))
  }

  async function save(status='draft'){
    if(!form.content||!form.platforms.length)return
    setSaving(true)
    const r=await fetch(S+'/rest/v1/social_posts',{
      method:'POST',
      headers:{'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json','Prefer':'return=representation'},
      body:JSON.stringify({...form,status,published_at:status==='published'?new Date().toISOString():null})
    })
    const d=await r.json()
    setPosts(p=>[d[0]||{},...p])
    setForm({content:'',image_url:'',platforms:[],scheduled_at:''})
    setCharCount(0);setSaved(true);setSaving(false)
    setTimeout(()=>setSaved(false),3000)
  }

  async function deletePost(id){
    await fetch(S+'/rest/v1/social_posts?id=eq.'+id,{method:'DELETE',headers:{'apikey':K,'Authorization':'Bearer '+K}})
    setPosts(p=>p.filter(x=>x.id!==id))
  }

  const fmt=(d)=>d?new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):''
  const statusColor={draft:'#aaa',published:'#22c55e',scheduled:'#f59e0b'}

  return(
    <div style={{background:'#f5f5f5',minHeight:'100vh',fontFamily:'Arial,sans-serif'}}>
      <div style={{background:'#111',color:'white',padding:'24px 32px',display:'flex',alignItems:'center',gap:16}}>
        <span style={{fontSize:24}}>📱</span>
        <div>
          <h1 style={{margin:0,fontSize:20,fontWeight:900,textTransform:'uppercase'}}>Panel RRSS</h1>
          <p style={{margin:0,fontSize:12,color:'rgba(255,255,255,0.6)'}}>Publica en Instagram, Facebook y TikTok desde un solo lugar</p>
        </div>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 20px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        {/* Formulario */}
        <div style={{background:'white',padding:24,border:'1px solid #e8e8e8'}}>
          <h3 style={{fontSize:14,fontWeight:700,textTransform:'uppercase',margin:'0 0 20px',color:'#111'}}>Nueva publicación</h3>

          {/* Plataformas */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:'#666',marginBottom:8,fontWeight:600}}>Plataformas *</div>
            <div style={{display:'flex',gap:8}}>
              {PLATFORMS.map(p=>(
                <button key={p.id} onClick={()=>togglePlatform(p.id)}
                  style={{flex:1,padding:'8px 4px',border:'2px solid',borderColor:form.platforms.includes(p.id)?p.color:'#ddd',background:form.platforms.includes(p.id)?p.color+'15':'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4,fontFamily:'inherit',transition:'all 0.15s'}}>
                  <span style={{fontSize:20}}>{p.icon}</span>
                  <span style={{fontSize:11,fontWeight:600,color:form.platforms.includes(p.id)?p.color:'#888'}}>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contenido */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:'#666',marginBottom:6,fontWeight:600}}>Texto *</div>
            <textarea value={form.content}
              onChange={e=>{setForm(f=>({...f,content:e.target.value}));setCharCount(e.target.value.length)}}
              placeholder="Escribe tu publicación..." rows={5}
              style={{width:'100%',padding:'10px 12px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',resize:'vertical',boxSizing:'border-box'}}/>
            <div style={{fontSize:11,color:charCount>2200?'#ef4444':'#aaa',textAlign:'right',marginTop:2}}>{charCount}/2200</div>
          </div>

          {/* Imagen URL */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:'#666',marginBottom:6,fontWeight:600}}>URL de imagen (opcional)</div>
            <input value={form.image_url} onChange={e=>setForm(f=>({...f,image_url:e.target.value}))}
              placeholder="https://..." style={{width:'100%',padding:'8px 12px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}}/>
          </div>

          {/* Programar */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,color:'#666',marginBottom:6,fontWeight:600}}>Programar para (opcional)</div>
            <input type="datetime-local" value={form.scheduled_at} onChange={e=>setForm(f=>({...f,scheduled_at:e.target.value}))}
              style={{width:'100%',padding:'8px 12px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}}/>
          </div>

          {saved&&<div style={{background:'#f0fdf4',border:'1px solid #86efac',padding:'8px 12px',fontSize:13,color:'#166534',marginBottom:12}}>✅ Guardado correctamente</div>}

          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>save('draft')} disabled={saving||!form.content||!form.platforms.length}
              style={{flex:1,padding:'10px',border:'1px solid #ddd',background:'white',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit'}}>
              Guardar borrador
            </button>
            <button onClick={()=>save('published')} disabled={saving||!form.content||!form.platforms.length}
              style={{flex:1,padding:'10px',border:'none',background:'#ff1e41',color:'white',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:'inherit'}}>
              {saving?'Guardando...':'Publicar ahora'}
            </button>
          </div>
          <p style={{fontSize:11,color:'#aaa',marginTop:8,margin:'8px 0 0'}}>
            ⚠️ La publicación real requiere conectar las APIs de cada plataforma. Por ahora se guarda el registro.
          </p>
        </div>

        {/* Historial */}
        <div>
          <h3 style={{fontSize:14,fontWeight:700,textTransform:'uppercase',margin:'0 0 16px',color:'#111'}}>Publicaciones ({posts.length})</h3>
          {posts.length===0?<div style={{background:'white',padding:24,border:'1px solid #e8e8e8',textAlign:'center',color:'#aaa',fontSize:13}}>No hay publicaciones todavía</div>
          :posts.map(p=>(
            <div key={p.id} style={{background:'white',border:'1px solid #e8e8e8',padding:16,marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div style={{display:'flex',gap:6}}>
                  {(p.platforms||[]).map(pl=>{
                    const plat=PLATFORMS.find(x=>x.id===pl)
                    return plat?<span key={pl} style={{fontSize:16}}>{plat.icon}</span>:null
                  })}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:11,color:statusColor[p.status]||'#aaa',fontWeight:600,textTransform:'uppercase'}}>{p.status}</span>
                  <button onClick={()=>deletePost(p.id)} style={{background:'none',border:'none',color:'#ccc',cursor:'pointer',fontSize:16,padding:0}}>🗑</button>
                </div>
              </div>
              <p style={{fontSize:13,color:'#333',margin:'0 0 8px',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.content}</p>
              {p.image_url&&<img src={p.image_url} alt="" style={{width:'100%',height:80,objectFit:'cover',marginBottom:8}}/>}
              <div style={{fontSize:11,color:'#aaa'}}>{fmt(p.created_at)}{p.scheduled_at?' · Programado: '+fmt(p.scheduled_at):''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
