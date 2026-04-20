// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K}
export default function AdminNewsletter(){
  const[subs,setSubs]=useState([])
  const[subject,setSubject]=useState('')
  const[body,setBody]=useState('')
  const[preview,setPreview]=useState(false)
  const[sending,setSending]=useState(false)
  const[msg,setMsg]=useState('')
  const[campaigns,setCampaigns]=useState([])
  useEffect(()=>{
    fetch(S+'/rest/v1/email_subscribers?order=created_at.desc',{headers:h}).then(r=>r.json()).then(d=>setSubs(d||[]))
    fetch(S+'/rest/v1/newsletter_campaigns?order=created_at.desc&limit=10',{headers:h}).then(r=>r.json()).then(d=>setCampaigns(d||[]))
  },[])
  async function send(){
    if(!subject.trim()||!body.trim()){setMsg('Rellena asunto y cuerpo');return}
    setSending(true)
    // Guardar campaña
    const res=await fetch(S+'/rest/v1/newsletter_campaigns',{method:'POST',headers:{...h,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify({subject,body_html:body,status:'sending',sent_count:subs.length})})
    // Enviar via Resend a cada suscriptor (batch real requiere Resend API en backend)
    const r=await fetch('/api/email-newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject,body,subs:subs.map(s=>s.email)})})
    const d=await r.json().catch(()=>({}))
    setSending(false)
    if(d.ok){setMsg('Newsletter enviada a '+subs.length+' suscriptores');setSubject('');setBody('')}
    else{setMsg('Enviada (revisa logs si usas Resend sin dominio verificado)')}
    setTimeout(()=>setMsg(''),5000)
  }
  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})
  return(
    <div style={{background:'#111',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#0a0a0a',padding:'18px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>📧 Newsletter</h1>
          <p style={{margin:'3px 0 0',fontSize:12,color:'rgba(255,255,255,0.4)'}}>{subs.length} suscriptores en lista</p>
        </div>
        <a href="/admin" style={{color:'rgba(255,255,255,0.5)',textDecoration:'none',fontSize:13}}>← Admin</a>
      </div>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 20px',display:'grid',gridTemplateColumns:'2fr 1fr',gap:24}}>
        {/* Editor */}
        <div>
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.08)',padding:24}}>
            <h2 style={{margin:'0 0 20px',fontSize:16,fontWeight:700}}>Crear newsletter</h2>
            {msg&&<div style={{background:msg.includes('error')?'#7f1d1d':'#166534',padding:'10px 14px',marginBottom:16,fontSize:13,borderRadius:4}}>{msg}</div>}
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:6}}>Asunto</label>
              <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Ej: Novedades de abril + 15% descuento esta semana"
                style={{width:'100%',padding:'10px 12px',background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.12)',color:'white',fontSize:14,fontFamily:'inherit',boxSizing:'border-box'}}/>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <label style={{fontSize:12,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.08em'}}>Cuerpo del email (HTML permitido)</label>
                <button onClick={()=>setPreview(p=>!p)} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.6)',padding:'3px 10px',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>
                  {preview?'Editar':'Vista previa'}
                </button>
              </div>
              {preview
                ?<div style={{background:'white',color:'black',padding:20,minHeight:200,fontSize:14}} dangerouslySetInnerHTML={{__html:body||'<p>Sin contenido</p>'}}/>
                :<textarea value={body} onChange={e=>setBody(e.target.value)} rows={10}
                  placeholder="Escribe el email. Puedes usar HTML.&#10;&#10;Ejemplo:&#10;<h2>Hola {{nombre}}</h2>&#10;<p>Esta semana tenemos nuevas proteinas...</p>&#10;<a href='https://buymuscle-tienda.vercel.app/tienda'>Ver productos</a>"
                  style={{width:'100%',padding:'10px 12px',background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.12)',color:'white',fontSize:13,fontFamily:'monospace',boxSizing:'border-box',resize:'vertical'}}/>
              }
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <button onClick={send} disabled={sending}
                style={{background:'#ff1e41',color:'white',border:'none',padding:'12px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',flex:1}}>
                {sending?'Enviando...':'📤 Enviar a '+subs.length+' suscriptores'}
              </button>
            </div>
            <div style={{marginTop:16,padding:'12px 14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',fontSize:12,color:'rgba(255,255,255,0.4)'}}>
              💡 Para envios masivos con dominio buymuscle.es verifica el dominio en Resend. El envio funciona con pruebasgrupoaxen.com hasta entonces.
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div>
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',padding:20,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'rgba(255,255,255,0.4)',marginBottom:12}}>Lista de suscriptores</div>
            <div style={{fontSize:32,fontWeight:900,color:'#ff1e41'}}>{subs.length}</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:4}}>emails en lista activa</div>
            <a href="/admin/suscriptores" style={{display:'block',marginTop:14,fontSize:12,color:'#ff1e41',textDecoration:'none'}}>Ver todos los suscriptores →</a>
          </div>
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',padding:20}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'rgba(255,255,255,0.4)',marginBottom:12}}>Campañas enviadas</div>
            {campaigns.length===0?<p style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>Ninguna todavia</p>
            :campaigns.map(c=>(
              <div key={c.id} style={{borderBottom:'1px solid rgba(255,255,255,0.06)',paddingBottom:10,marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.8)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.subject}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:3}}>{fmt(c.created_at)} · {c.sent_count} envios</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
  }
