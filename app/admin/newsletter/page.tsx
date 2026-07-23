// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
export default function AdminNewsletter(){
  const[subs,setSubs]=useState([])
  const[subject,setSubject]=useState('')
  const[body,setBody]=useState('')
  const[preview,setPreview]=useState(false)
  const[sending,setSending]=useState(false)
  const[msg,setMsg]=useState('')
  const[campaigns,setCampaigns]=useState([])
  async function loadCampaigns(){
    const r=await fetch('/api/admin/marketing?t=campaigns')
    const d=await r.json().catch(()=>({}))
    if(r.ok&&d.ok)setCampaigns(Array.isArray(d.rows)?d.rows:[])
  }
  useEffect(()=>{
    fetch('/api/admin/marketing?t=subscribers').then(async r=>{
      const d=await r.json().catch(()=>({}))
      if(!r.ok||!d.ok){setMsg('Error cargando suscriptores: '+(d.error||('HTTP '+r.status)));return}
      setSubs(Array.isArray(d.rows)?d.rows:[])
    }).catch(e=>setMsg('Error cargando suscriptores: '+String(e?.message||e)))
    loadCampaigns()
  },[])
  async function send(){
    if(!subject.trim()||!body.trim()){setMsg('Rellena asunto y cuerpo');return}
    if(subs.length===0){setMsg('No hay suscriptores en la lista');return}
    setSending(true)
    // Guardar campaña (service role en el servidor) y comprobar el resultado
    const res=await fetch('/api/admin/marketing',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({t:'campaign',row:{subject,body_html:body,status:'sending',sent_count:subs.length}})})
    const saved=await res.json().catch(()=>({}))
    if(!res.ok||!saved.ok){
      setMsg('Error guardando la campaña: '+(saved.error||('HTTP '+res.status)))
      setSending(false);setTimeout(()=>setMsg(''),5000);return
    }
    // Enviar via Resend a cada suscriptor (la lista viene del servidor)
    const r=await fetch('/api/email-newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject,body,subs:subs.map(s=>s.email)})})
    const d=await r.json().catch(()=>({}))
    setSending(false)
    if(r.ok&&d.ok){setMsg('Newsletter enviada a '+subs.length+' suscriptores');setSubject('');setBody('')}
    else{setMsg('Campaña guardada pero el envío falló: '+(d.error||('HTTP '+r.status)))}
    loadCampaigns()
    setTimeout(()=>setMsg(''),5000)
  }
  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})
  return(
    <div style={{background:'#f5f5f6',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'#111'}}>
      <div style={{background:'#ffffff',padding:'18px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #eaeaea'}}>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>📧 Newsletter</h1>
          <p style={{margin:'3px 0 0',fontSize:12,color:'#888888'}}>{subs.length} suscriptores en lista</p>
        </div>
        <a href="/admin" style={{color:'#6a6a6a',textDecoration:'none',fontSize:13}}>← Admin</a>
      </div>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 20px',display:'grid',gridTemplateColumns:'2fr 1fr',gap:24}}>
        {/* Editor */}
        <div>
          <div style={{background:'#ffffff',border:'1px solid #e6e6e6',padding:24}}>
            <h2 style={{margin:'0 0 20px',fontSize:16,fontWeight:700}}>Crear newsletter</h2>
            {msg&&<div style={{background:msg.includes('error')?'#7f1d1d':'#166534',padding:'10px 14px',marginBottom:16,fontSize:13,borderRadius:4}}>{msg}</div>}
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:'#6a6a6a',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:6}}>Asunto</label>
              <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Ej: Novedades de abril + 15% descuento esta semana"
                style={{width:'100%',padding:'10px 12px',background:'#ffffff',border:'1px solid #dcdcdc',color:'#111',fontSize:14,fontFamily:'inherit',boxSizing:'border-box'}}/>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <label style={{fontSize:12,color:'#6a6a6a',textTransform:'uppercase',letterSpacing:'0.08em'}}>Cuerpo del email (HTML permitido)</label>
                <button onClick={()=>setPreview(p=>!p)} style={{background:'transparent',border:'1px solid #cccccc',color:'#5a5a5a',padding:'3px 10px',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>
                  {preview?'Editar':'Vista previa'}
                </button>
              </div>
              {preview
                ?<div style={{background:'white',color:'black',padding:20,minHeight:200,fontSize:14}} dangerouslySetInnerHTML={{__html:body||'<p>Sin contenido</p>'}}/>
                :<textarea value={body} onChange={e=>setBody(e.target.value)} rows={10}
                  placeholder="Escribe el email. Puedes usar HTML.&#10;&#10;Ejemplo:&#10;<h2>Hola {{nombre}}</h2>&#10;<p>Esta semana tenemos nuevas proteinas...</p>&#10;<a href='https://tienda.buymuscle.es/tienda'>Ver productos</a>"
                  style={{width:'100%',padding:'10px 12px',background:'#ffffff',border:'1px solid #dcdcdc',color:'#111',fontSize:13,fontFamily:'monospace',boxSizing:'border-box',resize:'vertical'}}/>
              }
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <button onClick={send} disabled={sending}
                style={{background:'#ff1e41',color:'#111',border:'none',padding:'12px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',flex:1}}>
                {sending?'Enviando...':'📤 Enviar a '+subs.length+' suscriptores'}
              </button>
            </div>
            <div style={{marginTop:16,padding:'12px 14px',background:'#ffffff',border:'1px solid #eaeaea',fontSize:12,color:'#888888'}}>
              💡 Para envios masivos con dominio buymuscle.es verifica el dominio en Resend. Los envios salen desde newsletter@buymuscle.es.
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div>
          <div style={{background:'#ffffff',border:'1px solid #eaeaea',padding:20,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'#888888',marginBottom:12}}>Lista de suscriptores</div>
            <div style={{fontSize:32,fontWeight:900,color:'#ff1e41'}}>{subs.length}</div>
            <div style={{fontSize:12,color:'#888888',marginTop:4}}>emails en lista activa</div>
            <a href="/admin/suscriptores" style={{display:'block',marginTop:14,fontSize:12,color:'#ff1e41',textDecoration:'none'}}>Ver todos los suscriptores →</a>
          </div>
          <div style={{background:'#ffffff',border:'1px solid #eaeaea',padding:20}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'#888888',marginBottom:12}}>Campañas enviadas</div>
            {campaigns.length===0?<p style={{fontSize:12,color:'#9a9a9a'}}>Ninguna todavia</p>
            :campaigns.map(c=>(
              <div key={c.id} style={{borderBottom:'1px solid #eaeaea',paddingBottom:10,marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:600,color:'#3a3a3a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.subject}</div>
                <div style={{fontSize:11,color:'#8a8a8a',marginTop:3}}>{fmt(c.created_at)} · {c.sent_count} envios</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
  }
