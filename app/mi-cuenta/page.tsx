// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K}
const STAT={pending:'⏳ Pendiente',processing:'📦 Preparando',shipped:'🚚 Enviado',delivered:'✅ Entregado',cancelled:'❌ Cancelado'}
export default function MiCuenta(){
  const[email,setEmail]=useState('')
  const[step,setStep]=useState('login')
  const[orders,setOrders]=useState([])
  const[reviews,setReviews]=useState([])
  const[loading,setLoading]=useState(false)
  const[points,setPoints]=useState(0)
  const[msg,setMsg]=useState('')
  // Recuperar email de localStorage
  useEffect(()=>{const e=localStorage.getItem('bm_customer_email');if(e){setEmail(e);loadData(e)}},[])
  async function loadData(e){
    setLoading(true)
    const[ordRes,revRes]=await Promise.all([
      fetch(S+'/rest/v1/orders?customer_email=eq.'+encodeURIComponent(e)+'&order=created_at.desc&limit=20',{headers:h}),
      fetch(S+'/rest/v1/product_reviews?customer_email=eq.'+encodeURIComponent(e)+'&order=created_at.desc',{headers:h})
    ])
    const ords=await ordRes.json();const revs=await revRes.json()
    setOrders(Array.isArray(ords)?ords:[])
    setReviews(Array.isArray(revs)?revs:[])
    const totalPts=(Array.isArray(ords)?ords:[]).filter(o=>o.status==='delivered').reduce((s,o)=>s+Math.floor(Number(o.total||0)),0)
    setPoints(totalPts)
    setLoading(false);setStep('dashboard')
  }
  function login(){
    if(!email.includes('@')){setMsg('Introduce un email valido');return}
    localStorage.setItem('bm_customer_email',email);loadData(email)
  }
  function logout(){localStorage.removeItem('bm_customer_email');setEmail('');setOrders([]);setStep('login')}
  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})
  if(step==='login') return(
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Arial,sans-serif',background:'#f5f5f5',padding:'2rem'}}>
      <div style={{width:'100%',maxWidth:420,background:'white',padding:'40px',boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <Link href="/" style={{fontSize:28,fontWeight:900,fontStyle:'italic',color:'#ff1e41',textDecoration:'none'}}>BUYMUSCLE</Link>
          <p style={{margin:'8px 0 0',color:'#888',fontSize:14}}>Accede con tu email para ver tus pedidos</p>
        </div>
        {msg&&<div style={{background:'#fff3f3',border:'1px solid #ffcdd2',padding:'10px 14px',marginBottom:16,fontSize:13,color:'#c62828'}}>{msg}</div>}
        <div style={{marginBottom:16}}>
          <label style={{fontSize:12,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:6}}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}
            placeholder="tu@email.com" type="email"
            style={{width:'100%',padding:'12px',border:'1px solid #ddd',fontSize:14,fontFamily:'Arial',boxSizing:'border-box'}}/>
        </div>
        <button onClick={login} disabled={loading}
          style={{width:'100%',background:'#ff1e41',color:'white',border:'none',padding:'14px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'Arial'}}>
          {loading?'Buscando...':'Ver mis pedidos'}
        </button>
        <p style={{textAlign:'center',marginTop:16,fontSize:13,color:'#888'}}>No necesitas contrasena. Usa el email con el que compraste.</p>
        <div style={{marginTop:24,paddingTop:24,borderTop:'1px solid #eee',textAlign:'center'}}>
          <Link href="/distribuidores/login" style={{color:'#ff1e41',fontSize:13,textDecoration:'none',fontWeight:600}}>¿Eres distribuidor? Accede aqui →</Link>
        </div>
      </div>
    </div>
  )
  return(
    <div style={{fontFamily:'Arial,sans-serif',background:'#f5f5f5',minHeight:'100vh'}}>
      <div style={{background:'#111',padding:'20px 32px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <Link href="/" style={{fontSize:22,fontWeight:900,fontStyle:'italic',color:'#ff1e41',textDecoration:'none'}}>BUYMUSCLE</Link>
          <span style={{color:'rgba(255,255,255,0.5)',marginLeft:16,fontSize:14}}>Mi cuenta</span>
        </div>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <span style={{color:'rgba(255,255,255,0.6)',fontSize:13}}>{email}</span>
          <button onClick={logout} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.6)',padding:'6px 14px',fontSize:12,cursor:'pointer',fontFamily:'Arial'}}>Salir</button>
        </div>
      </div>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 20px'}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:28}}>
          {[
            {icon:'📦',label:'Pedidos',val:orders.length},
            {icon:'✅',label:'Entregados',val:orders.filter(o=>o.status==='delivered').length},
            {icon:'🎁',label:'Puntos acumulados',val:points+' pts'},
          ].map(s=>(
            <div key={s.label} style={{background:'white',padding:'20px 24px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',display:'flex',gap:16,alignItems:'center'}}>
              <span style={{fontSize:28}}>{s.icon}</span>
              <div><div style={{fontSize:22,fontWeight:900,color:'#ff1e41'}}>{s.val}</div><div style={{fontSize:12,color:'#888',textTransform:'uppercase',letterSpacing:'0.08em'}}>{s.label}</div></div>
            </div>
          ))}
        </div>
        {/* Programa puntos */}
        <div style={{background:'linear-gradient(135deg,#ff1e41,#c41230)',padding:'20px 24px',marginBottom:24,color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><div style={{fontSize:16,fontWeight:700}}>🎁 Programa de fidelizacion</div><div style={{fontSize:13,opacity:0.85,marginTop:4}}>Acumulas 1 punto por cada euro en pedidos entregados. Canjea 100 pts = 1€ de descuento.</div></div>
          <div style={{textAlign:'right',flexShrink:0}}><div style={{fontSize:32,fontWeight:900}}>{points}</div><div style={{fontSize:11,opacity:0.8}}>PUNTOS</div></div>
        </div>
        {/* Pedidos */}
        <div style={{background:'white',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
          <div style={{padding:'20px 24px',borderBottom:'1px solid #f0f0f0',fontWeight:700,fontSize:16}}>Mis pedidos</div>
          {loading?<div style={{padding:40,textAlign:'center',color:'#aaa'}}>Cargando...</div>
          :orders.length===0?<div style={{padding:40,textAlign:'center'}}>
            <p style={{color:'#aaa',marginBottom:16}}>Aun no tienes pedidos con este email.</p>
            <Link href="/tienda" style={{color:'#ff1e41',fontWeight:700,textDecoration:'none',padding:'10px 24px',border:'2px solid #ff1e41',display:'inline-block'}}>Ir a la tienda</Link>
          </div>
          :orders.map(o=>(
            <div key={o.id} style={{padding:'16px 24px',borderBottom:'1px solid #f5f5f5',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
              <div>
                <div style={{fontWeight:700,color:'#ff1e41',fontSize:15}}>{o.order_number}</div>
                <div style={{fontSize:12,color:'#888',marginTop:2}}>{o.created_at?fmt(o.created_at):''} &middot; {o.payment_method||'Tarjeta'}</div>
              </div>
              <div style={{textAlign:'center'}}><span style={{fontSize:13,padding:'4px 10px',background:'#f5f5f5',borderRadius:20}}>{STAT[o.status]||o.status}</span></div>
              <div style={{fontWeight:700,fontSize:16}}>{Number(o.total||0).toFixed(2)} €</div>
              <Link href={'/pedido-confirmado?n='+o.order_number} style={{color:'#ff1e41',fontSize:13,textDecoration:'none',fontWeight:600}}>Ver detalles →</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
    }
