// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
export default function AdminAbandoned(){
  const[carts,setCarts]=useState([])
  const[loading,setLoading]=useState(true)
  const[sending,setSending]=useState(null)
  const[msg,setMsg]=useState('')
  const[err,setErr]=useState('')
  useEffect(()=>{
    fetch('/api/admin/marketing?t=abandoned')
      .then(async r=>{
        const d=await r.json().catch(()=>({}))
        if(!r.ok||!d.ok){setErr('Error cargando carritos: '+(d.error||('HTTP '+r.status)));setCarts([])}
        else setCarts(Array.isArray(d.rows)?d.rows:[])
        setLoading(false)
      })
      .catch(e=>{setErr('Error cargando carritos: '+String(e?.message||e));setLoading(false)})
  },[])
  // La tabla usa email + cart_data (jsonb) + total
  const parseItems=v=>{try{const it=typeof v==='string'?JSON.parse(v):v;if(Array.isArray(it))return it;if(it&&Array.isArray(it.items))return it.items;return[]}catch{return[]}}
  const total=c=>{const t=Number(c.total||0);if(t>0)return t;return parseItems(c.cart_data).reduce((s,i)=>s+((Number(i.price)||0)*(Number(i.qty)||1)),0)}
  const count=c=>parseItems(c.cart_data).length
  async function sendRecovery(cart){
    if(!cart.email)return
    setSending(cart.id);setErr('')
    const items=parseItems(cart.cart_data)
    const r=await fetch('/api/email-confirmacion',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'recovery',order_id:cart.id,customer_email:cart.email,customer_name:'cliente',cart_id:cart.id,items,total:total(cart)})})
    const d=await r.json().catch(()=>({}))
    if(!r.ok||d.error){
      setErr('Error enviando email: '+(d.error||('HTTP '+r.status)))
      setSending(null);setTimeout(()=>setErr(''),4000);return
    }
    // Marcar como enviado vía ruta admin (la anon key no tiene UPDATE en RLS)
    const m=await fetch('/api/admin/marketing',{method:'PATCH',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({t:'abandoned',id:cart.id,fields:{recovery_email_sent:true,recovery_sent_at:new Date().toISOString()}})})
    const md=await m.json().catch(()=>({}))
    if(!m.ok||!md.ok){
      setErr('Email enviado pero no se pudo marcar: '+(md.error||('HTTP '+m.status)))
      setSending(null);setTimeout(()=>setErr(''),4000);return
    }
    setCarts(cs=>cs.map(c=>c.id===cart.id?{...c,recovery_email_sent:true}:c))
    setSending(null);setMsg('Email enviado a '+cart.email);setTimeout(()=>setMsg(''),3000)
  }
  const fmt=d=>new Date(d).toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})
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
        {err&&<div style={{background:'#7f1d1d',padding:'8px 14px',marginBottom:12,fontSize:13,borderRadius:4,color:'#fca5a5'}}>{err}</div>}
        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Total abandonados',val:carts.length,icon:'🛒'},
            {label:'Sin email recovery',val:carts.filter(c=>!c.recovery_email_sent).length,icon:'📧'},
            {label:'Email enviado',val:carts.filter(c=>c.recovery_email_sent).length,icon:'✅'},
            {label:'Valor potencial',val:carts.reduce((s,c)=>s+total(c),0).toFixed(0)+' €',icon:'💰'},
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
              {['Email','Productos','Valor','Fecha','Estado','Accion'].map(h=>(
                <th key={h} style={{padding:'9px 12px',textAlign:'left',fontSize:10,fontWeight:700,textTransform:'uppercase',color:'rgba(255,255,255,0.4)',letterSpacing:'0.08em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {carts.map(c=>(
              <tr key={c.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <td style={{padding:'10px 12px',fontSize:12,color:'rgba(255,255,255,0.6)'}}>{c.email||'—'}</td>
                <td style={{padding:'10px 12px',fontSize:13,color:'rgba(255,255,255,0.7)'}}>{count(c)} producto{count(c)!==1?'s':''}</td>
                <td style={{padding:'10px 12px',fontSize:13,fontWeight:700,color:'#ff1e41'}}>{total(c).toFixed(2)} €</td>
                <td style={{padding:'10px 12px',fontSize:12,color:'rgba(255,255,255,0.5)'}}>{c.created_at?fmt(c.created_at):'—'}</td>
                <td style={{padding:'10px 12px'}}>
                  {c.recovery_email_sent
                    ?<span style={{fontSize:11,padding:'2px 8px',background:'#166534',color:'#4ade80',fontWeight:600}}>Email enviado</span>
                    :<span style={{fontSize:11,padding:'2px 8px',background:'#7f1d1d',color:'#fca5a5',fontWeight:600}}>Pendiente</span>}
                </td>
                <td style={{padding:'10px 12px'}}>
                  {!c.recovery_email_sent&&c.email&&(
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
