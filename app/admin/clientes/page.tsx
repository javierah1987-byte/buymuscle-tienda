// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K}
export default function AdminClientes(){
  const[clientes,setClientes]=useState([])
  const[q,setQ]=useState('')
  const[sel,setSel]=useState(null)
  const[orders,setOrders]=useState([])
  const[loading,setLoading]=useState(true)
  useEffect(()=>{
    fetch(S+'/rest/v1/orders?select=customer_email,customer_name,customer_phone,total,status,created_at,channel&order=created_at.desc',{headers:h})
      .then(r=>r.json()).then(rows=>{
        if(!Array.isArray(rows)){setLoading(false);return}
        const map={}
        rows.forEach(o=>{
          const e=o.customer_email||'sin-email'
          if(!map[e]) map[e]={email:e,name:o.customer_name||'',phone:o.customer_phone||'',orders:0,total:0,last:''}
          map[e].orders++
          map[e].total+=Number(o.total||0)
          if(!map[e].last||o.created_at>map[e].last) map[e].last=o.created_at
        })
        setClientes(Object.values(map).sort((a,b)=>b.total-a.total))
        setLoading(false)
      })
  },[])
  async function verDetalle(c){
    setSel(c);setOrders([])
    const r=await fetch(S+'/rest/v1/orders?customer_email=eq.'+encodeURIComponent(c.email)+'&order=created_at.desc',{headers:h})
    const d=await r.json()
    setOrders(Array.isArray(d)?d:[])
  }
  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})
  const filtered=clientes.filter(c=>(c.name+c.email+c.phone).toLowerCase().includes(q.toLowerCase()))
  const TH={padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'rgba(255,255,255,0.4)',borderBottom:'1px solid rgba(255,255,255,0.08)'}
  const TD={padding:'12px 14px',fontSize:13,color:'white',borderBottom:'1px solid rgba(255,255,255,0.05)'}
  const STAT={pending:'⏳',processing:'📦',shipped:'🚚',delivered:'✅',cancelled:'❌'}
  return(
    <div style={{background:'#0d0d0d',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#080808',padding:'18px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div><h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>👥 Clientes</h1>
          <p style={{margin:'3px 0 0',fontSize:12,color:'rgba(255,255,255,0.4)'}}>{clientes.length} clientes registrados</p>
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nombre, email o teléfono..."
            style={{padding:'8px 14px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:13,fontFamily:'Arial',width:280}}/>
          <Link href="/admin" style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:13}}>← Admin</Link>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:sel?'1fr 380px':'1fr',gap:0,height:'calc(100vh - 70px)'}}>
        <div style={{overflow:'auto'}}>
          {loading?<div style={{padding:40,textAlign:'center',color:'rgba(255,255,255,0.4)'}}>Cargando...</div>:
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><th style={TH}>Cliente</th><th style={TH}>Email</th><th style={TH}>Pedidos</th><th style={TH}>Total gastado</th><th style={TH}>Último pedido</th><th style={TH}></th></tr></thead>
            <tbody>{filtered.map((c,i)=>(
              <tr key={i} onClick={()=>verDetalle(c)} style={{cursor:'pointer',background:sel?.email===c.email?'rgba(255,30,65,0.08)':'transparent'}}>
                <td style={TD}>
                  <div style={{fontWeight:700,color:c.name?'white':'rgba(255,255,255,0.4)'}}>{c.name||'Sin nombre'}</div>
                  {c.phone&&<div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:2}}>{c.phone}</div>}
                </td>
                <td style={{...TD,color:'rgba(255,255,255,0.6)',fontFamily:'monospace',fontSize:12}}>{c.email}</td>
                <td style={TD}><span style={{background:'rgba(255,30,65,0.15)',color:'#ff6b85',padding:'2px 8px',borderRadius:12,fontSize:12,fontWeight:700}}>{c.orders}</span></td>
                <td style={{...TD,fontWeight:700,color:'#22c55e'}}>{c.total.toFixed(2)} €</td>
                <td style={{...TD,color:'rgba(255,255,255,0.5)',fontSize:12}}>{c.last?fmt(c.last):'-'}</td>
                <td style={TD}><button onClick={e=>{e.stopPropagation();verDetalle(c)}} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.6)',padding:'4px 10px',fontSize:11,cursor:'pointer',fontFamily:'Arial'}}>Ver</button></td>
              </tr>
            ))}</tbody>
          </table>}
        </div>
        {sel&&(
          <div style={{borderLeft:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.02)',overflow:'auto',padding:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:700}}>{sel.name||'Cliente'}</h3>
              <button onClick={()=>setSel(null)} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.4)',fontSize:18,cursor:'pointer'}}>×</button>
            </div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:16,lineHeight:1.8}}>
              📧 {sel.email}<br/>
              {sel.phone&&<>📞 {sel.phone}<br/></>}
              🛒 {sel.orders} pedidos · 💰 {sel.total.toFixed(2)} €
            </div>
            <div style={{marginBottom:12,fontWeight:700,fontSize:12,textTransform:'uppercase',letterSpacing:'0.08em',color:'rgba(255,255,255,0.4)'}}>Historial de pedidos</div>
            {orders.length===0?<div style={{color:'rgba(255,255,255,0.3)',fontSize:13}}>Cargando...</div>
            :orders.map((o,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:'10px 12px',marginBottom:6,borderRadius:4}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{color:'#ff1e41',fontWeight:700,fontSize:13}}>{o.order_number}</span>
                  <span style={{fontSize:13,fontWeight:700,color:'#22c55e'}}>{Number(o.total||0).toFixed(2)} €</span>
                </div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',display:'flex',justifyContent:'space-between'}}>
                  <span>{STAT[o.status]||''} {o.status}</span>
                  <span>{o.created_at?fmt(o.created_at):''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
      }
