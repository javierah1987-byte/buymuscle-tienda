// @ts-nocheck
'use client'
import{useEffect,useState}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const STATUS:any={pending:'⏳ Pendiente',processing:'📦 Preparando',shipped:'🚚 Enviado',delivered:'✅ Entregado',cancelled:'❌ Cancelado'}
export default function MisPedidos(){
  const[email,setEmail]=useState('')
  const[orders,setOrders]=useState(null)
  const[loading,setLoading]=useState(false)
  const[open,setOpen]=useState(null)
  async function buscar(e){
    e.preventDefault();if(!email)return;setLoading(true)
    const r=await fetch(S+'/rest/v1/orders?customer_email=eq.'+encodeURIComponent(email.toLowerCase())+'&order=created_at.desc&select=*,order_lines(*)',{
      headers:{'apikey':K,'Authorization':'Bearer '+K}
    })
    const d=await r.json()
    setOrders(Array.isArray(d)?d:[]);setLoading(false)
  }
  const fmt=(d:string)=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})
  return(
    <div style={{background:'#f8f8f8',minHeight:'60vh',fontFamily:'Arial,sans-serif'}}>
      <div style={{background:'#111',color:'white',padding:'50px 20px',textAlign:'center'}}>
        <h1 style={{fontSize:28,fontWeight:900,margin:'0 0 10px',textTransform:'uppercase'}}>Mis Pedidos</h1>
        <p style={{color:'rgba(255,255,255,0.65)',fontSize:14,margin:0}}>Consulta el estado de tus pedidos</p>
      </div>
      <div style={{maxWidth:700,margin:'0 auto',padding:'40px 20px'}}>
        <div style={{background:'white',padding:28,border:'1px solid #e8e8e8',marginBottom:24}}>
          <h3 style={{fontSize:14,fontWeight:700,textTransform:'uppercase',margin:'0 0 16px'}}>Buscar por email</h3>
          <form onSubmit={buscar} style={{display:'flex',gap:10}}>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" required
              style={{flex:1,padding:'10px 14px',border:'1px solid #ddd',fontSize:14,fontFamily:'inherit'}}/>
            <button type="submit" disabled={loading}
              style={{background:'#ff1e41',color:'white',border:'none',padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
              {loading?'Buscando...':'Ver pedidos'}
            </button>
          </form>
        </div>
        {orders===null?null
        :orders.length===0?<div style={{background:'white',padding:28,border:'1px solid #e8e8e8',textAlign:'center',color:'#aaa'}}>
          <div style={{fontSize:40,marginBottom:12}}>📭</div>
          <p style={{margin:0,fontSize:14}}>No encontramos pedidos con ese email.</p>
        </div>
        :orders.map(o=>(
          <div key={o.id} style={{background:'white',border:'1px solid #e8e8e8',marginBottom:12,overflow:'hidden'}}>
            <div style={{padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',borderBottom:open===o.id?'1px solid #f0f0f0':'none'}}
              onClick={()=>setOpen(open===o.id?null:o.id)}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'#111'}}>Pedido #{o.id?.slice(0,8).toUpperCase()}</div>
                <div style={{fontSize:12,color:'#aaa',marginTop:2}}>{fmt(o.created_at)} · {o.order_lines?.length||0} producto{o.order_lines?.length!==1?'s':''}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:13,fontWeight:700,color:'#ff1e41'}}>{Number(o.total||0).toFixed(2)} €</span>
                <span style={{fontSize:12,padding:'3px 10px',background:'#f5f5f5',borderRadius:20,color:'#555'}}>{STATUS[o.status]||o.status}</span>
                <span style={{color:'#aaa',fontSize:16}}>{open===o.id?'▲':'▼'}</span>
              </div>
            </div>
            {open===o.id&&(
              <div style={{padding:'16px 20px'}}>
                {(o.order_lines||[]).map((l:any,i:number)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f9f9f9',fontSize:13}}>
                    <span style={{color:'#333'}}>{l.product_name} {l.variant?'('+l.variant+')':''} × {l.qty}</span>
                    <span style={{fontWeight:600}}>{Number(l.unit_price*l.qty).toFixed(2)} €</span>
                  </div>
                ))}
                <div style={{marginTop:12,padding:'10px',background:'#f9f9f9',fontSize:12,color:'#666'}}>
                  {o.shipping_address&&<p style={{margin:'0 0 4px'}}><strong>Envío:</strong> {o.shipping_address}</p>}
                  {o.tracking_number&&<p style={{margin:0}}><strong>Seguimiento:</strong> {o.tracking_number}</p>}
                </div>
                <Link href="/tienda" style={{display:'inline-block',marginTop:12,background:'#111',color:'white',padding:'8px 16px',textDecoration:'none',fontSize:12,fontWeight:700}}>
                  Volver a comprar →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
          }
