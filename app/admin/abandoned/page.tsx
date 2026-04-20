// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K}
export default function AdminAbandoned(){
  const[carts,setCarts]=useState([])
  const[loading,setLoading]=useState(true)
  const[sending,setSending]=useState(null)
  const[msg,setMsg]=useState('')
  useEffect(()=>{
    fetch(S+'/rest/v1/abandoned_carts?order=created_at.desc&limit=50',{headers:h})
      .then(r=>r.json()).then(d=>{setCarts(d||[]);setLoading(false)}).catch(()=>setLoading(false))
  },[])
  async function sendRecovery(cart){
    setSending(cart.id)
    const r=await fetch('/api/email-confirmacion',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'recovery',email:cart.customer_email,name:cart.customer_name,cart_id:cart.id,items:cart.items,total:cart.total})})
    // Marcar como enviado
    await fetch(S+'/rest/v1/abandoned_carts?id=eq.'+cart.id,{method:'PATCH',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({recovery_email_sent:true,recovery_sent_at:new Date().toISOString()})})
    setCarts(cs=>cs.map(c=>c.id===cart.id?{...c,recovery_email_sent:true}:c))
    setSending(null);setMsg('Email enviado a '+cart.customer_email);setTimeout(()=>setMsg(''),3000)
  }
  const fmt=d=>new Date(d).toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})
  const total=v=>{try{const it=typeof v==='string'?JSON.parse(v):v;return Array.isArray(it)?it.reduce((s,i)=>s+((i.price||0)*(i.qty||1)),0):0}catch{return 0}}
  const count=v=>{try{const it=typeof v==='string'?JSON.parse(v):v;return Array.isArray(it)?it.length:0}catch{return 0}}
  return(
    <div style={{background:'#111',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#0a0a0a',padding:'18px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>🛒 Carritos Abandonados</h1>
          <p style={{margin:'3px 0 0',fontSize:12,color:'rgba(255,255,255,0.4)'}}>{carts.length} carritos sin completar</p>
        </div>
        <a href="/admin" style={{color:'rgba(255,255,255,0.5)',textDecoration:'none',fontSize:13}}>← Admin</a>
      </div>
      <div style={{padding:'20px 28px'}}>
        {msg&&<div style={{background:'#166534',padding:'8px 14px',marginBottom:12,fontSize:13,borderRadius:4}}>{msg}</div>}
        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Total abandonados',val:carts.length,icon:'🛒'},
            {label:'Sin email recovery',val:carts.filter(c=>!c.recovery_email_sent).length,icon:'📧'},
            {label:'Email enviado',val:carts.filter(c=>c.recovery_email_sent).length,icon:'✅'},
            {label:'Valor potencial',val:carts.reduce((s,c)=>s+total(c.items),0).toFixed(0)+' €',icon:'💰'},
          ].map(k=>(
            <div key={k.label} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:16,textAlign:'center'}}>
              <div style={{fontSize:24,marginBottom:4}}>{k.icon}</div>
              <div style={{fontSize:22,fontWeight:900,color:'#ff1e41'}}>{k.val}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.08em',marginTop:2}}>{k.label}</div>
            </div>
          ))}
        </div>
        {loading?<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.4)'}}>Cargando...</div>
        :carts.length===0?<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)',fontSize:14}}>No hay carritos abandonados registrados todavia.</div>
        :<table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              {['Cliente','Email','Productos','Valor','Fecha','Estado','Accion'].map(h=>(
                <th key={h} style={{padding:'9px 12px',textAlign:'left',fontSize:10,fontWeight:700,textTransform:'uppercase',color:'rgba(255,255,255,0.4)',letterSpacing:'0.08em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {carts.map(c=>(
              <tr key={c.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <td style={{padding:'10px 12px',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.85)'}}>{c.customer_name||'Anonimo'}</td>
                <td style={{padding:'10px 12px',fontSize:12,color:'rgba(255,255,255,0.6)'}}>{c.customer_email||'—'}</td>
                <td style={{padding:'10px 12px',fontSize:13,color:'rgba(255,255,255,0.7)'}}>{count(c.items)} producto{count(c.items)!==1?'s':''}</td>
                <td style={{padding:'10px 12px',fontSize:13,fontWeight:700,color:'#ff1e41'}}>{total(c.items).toFixed(2)} €</td>
                <td style={{padding:'10px 12px',fontSize:12,color:'rgba(255,255,255,0.5)'}}>{c.created_at?fmt(c.created_at):'—'}</td>
                <td style={{padding:'10px 12px'}}>
                  {c.recovery_email_sent
                    ?<span style={{fontSize:11,padding:'2px 8px',background:'#166534',color:'#4ade80',fontWeight:600}}>Email enviado</span>
                    :<span style={{fontSize:11,padding:'2px 8px',background:'#7f1d1d',color:'#fca5a5',fontWeight:600}}>Pendiente</span>}
                </td>
                <td style={{padding:'10px 12px'}}>
                  {!c.recovery_email_sent&&c.customer_email&&(
                    <button onClick={()=>sendRecovery(c)} disabled={sending===c.id}
                      style={{padding:'5px 12px',background:'#ff1e41',border:'none',color:'white',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                      {sending===c.id?'Enviando...':'📧 Recuperar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    </div>
  )
      }
