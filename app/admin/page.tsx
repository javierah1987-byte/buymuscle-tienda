// @ts-nocheck
'use client'
import{useEffect,useState}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

const MODULOS=[
  {icon:'📦',title:'Pedidos Online',desc:'Ver y gestionar pedidos',href:'/admin/pedidos',badge:null,color:'#ff1e41'},
  {icon:'🖥️',title:'TPV — Tienda física',desc:'Punto de venta presencial',href:'/tpv',badge:null,color:'#f59e0b'},
  {icon:'📊',title:'Gestión de Stock',desc:'Actualizar precios y stock',href:'/admin/stock',badge:null,color:'#22c55e'},
  {icon:'👥',title:'Distribuidores',desc:'Panel de distribuidores',href:'/distribuidores',badge:null,color:'#3b82f6'},
  {icon:'✍️',title:'Blog',desc:'Gestionar artículos',href:'/admin/blog',badge:null,color:'#8b5cf6'},
  {icon:'📱',title:'RRSS',desc:'Publicaciones sociales',href:'/admin/rrss',badge:null,color:'#E1306C'},
  {icon:'🏷️',title:'Descuentos',desc:'Códigos y cupones',href:'/admin/descuentos',badge:null,color:'#f59e0b'},
  {icon:'📦',title:'Productos',desc:'Editar precio y stock inline',href:'/admin/productos',badge:null,color:'#22c55e'},
  {icon:'📊',title:'Suscriptores',desc:'Emails captados',href:'/admin/suscriptores',badge:null,color:'#3b82f6'},
  {icon:'📧',title:'Email (Resend)',desc:'Plantillas de email',href:'https://resend.com',badge:null,color:'#555'},
  {icon:'🏷️',title:'Holded — Facturas',desc:'Ver facturas en Holded',href:'https://app.holded.com',badge:null,color:'#555'},
  {icon:'🚀',title:'Vercel — Deploys',desc:'Gestión de deploys',href:'https://vercel.com',badge:null,color:'#555'},
]

export default function AdminDashboard(){
  const[stats,setStats]=useState({facturacion:0,pedidos:0,pendientes:0,tpv:0,productos:0,stockBajo:0})
  const[orders,setOrders]=useState([])
  const[ventas7,setVentas7]=useState([])
  const[selected,setSelected]=useState([])
  const[bulkStatus,setBulkStatus]=useState('shipped')
  const[saving,setSaving]=useState(false)

  useEffect(()=>{load()},[])

  async function load(){
    try{
      const [r1,r2,r3,r4,r5]=await Promise.all([
        fetch(S+'/rest/v1/orders?select=id,total,status,created_at,customer_name,customer_email&order=created_at.desc&limit=20',{headers:{apikey:K,'Authorization':'Bearer '+K}}),
        fetch(S+'/rest/v1/orders?select=total,status',{headers:{apikey:K,'Authorization':'Bearer '+K}}),
        fetch(S+'/rest/v1/products?select=count&active=eq.true',{headers:{apikey:K,'Authorization':'Bearer '+K,'Prefer':'count=exact','Range':'0-0'}}),
        fetch(S+'/rest/v1/products?select=count&stock=lte.10&active=eq.true',{headers:{apikey:K,'Authorization':'Bearer '+K,'Prefer':'count=exact','Range':'0-0'}}),
        fetch(S+'/rest/v1/orders?select=total,created_at&created_at=gte.'+(()=>{const d=new Date();d.setDate(d.getDate()-6);return d.toISOString();})()+'&status=neq.cancelled',{headers:{apikey:K,'Authorization':'Bearer '+K}}),
      ])
      const ordersAll=await r1.json()
      const allOrders=await r2.json()
      const prodCt=r3.headers.get('content-range')?.split('/')[1]||'0'
      const stockCt=r4.headers.get('content-range')?.split('/')[1]||'0'
      const v7=await r5.json()
      setOrders(ordersAll||[])
      const facturacion=(allOrders||[]).filter(o=>o.status!=='cancelled').reduce((s,o)=>s+Number(o.total||0),0)
      const pendientes=(allOrders||[]).filter(o=>o.status==='pending').length
      const tpv=(allOrders||[]).filter(o=>o.status==='tpv').length
      setStats({facturacion,pedidos:(allOrders||[]).length,pendientes,tpv,productos:parseInt(prodCt),stockBajo:parseInt(stockCt)})
      // Ventas por día
      const hoy=new Date()
      const mapa={}
      for(let i=0;i<7;i++){const d=new Date(hoy);d.setDate(hoy.getDate()-6+i);mapa[d.toISOString().split('T')[0]]=0}
      ;(v7||[]).forEach(o=>{const d=o.created_at?.split('T')[0];if(d in mapa) mapa[d]+=Number(o.total||0)})
      setVentas7(Object.entries(mapa).map(([dia,total])=>({dia:dia.slice(5),total})))
    }catch(e){console.error(e)}
  }

  async function bulkUpdate(){
    if(!selected.length)return
    setSaving(true)
    await Promise.all(selected.map(id=>
      fetch(S+'/rest/v1/orders?id=eq.'+id,{method:'PATCH',headers:{apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json'},body:JSON.stringify({status:bulkStatus})})
    ))
    setOrders(o=>o.map(x=>selected.includes(x.id)?{...x,status:bulkStatus}:x))
    setSelected([]);setSaving(false)
  }

  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short'})
  const STATUS_COLOR={pending:'#f59e0b',processing:'#3b82f6',shipped:'#8b5cf6',delivered:'#22c55e',cancelled:'#ef4444',tpv:'#555'}
  const STATUS_LABEL={pending:'Pendiente',processing:'Preparando',shipped:'Enviado',delivered:'Entregado',cancelled:'Cancelado',tpv:'TPV'}
  const maxVenta=Math.max(...ventas7.map(v=>v.total),1)

  return(
    <div style={{background:'#0d0d0d',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      {/* Header */}
      <div style={{background:'#080808',padding:'18px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{fontSize:22,fontWeight:900,color:'#ff1e41',letterSpacing:'-1px'}}>BUYMUSCLE</span>
          <span style={{fontSize:13,color:'rgba(255,255,255,0.35)'}}>Panel de Administración</span>
        </div>
        <a href="/tienda" style={{fontSize:13,color:'rgba(255,255,255,0.4)',textDecoration:'none'}}>← Ir a la tienda</a>
      </div>

      <div style={{maxWidth:1400,margin:'0 auto',padding:'24px 24px'}}>
        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'FACTURACIÓN',val:stats.facturacion.toFixed(0)+' €',icon:'💰',color:'#22c55e'},
            {label:'PEDIDOS',val:stats.pedidos,icon:'📦',color:'white'},
            {label:'PENDIENTES',val:stats.pendientes,icon:'⏳',color:stats.pendientes>0?'#f59e0b':'white'},
            {label:'VENTAS TPV',val:stats.tpv,icon:'🛒',color:'white'},
            {label:'PRODUCTOS',val:stats.productos,icon:'📋',color:'#3b82f6'},
            {label:'STOCK BAJO',val:stats.stockBajo,icon:'⚠️',color:stats.stockBajo>50?'#ef4444':'#f59e0b'},
          ].map(k=>(
            <div key={k.label} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:'16px 18px',textAlign:'center'}}>
              <div style={{fontSize:20,marginBottom:4}}>{k.icon}</div>
              <div style={{fontSize:22,fontWeight:900,color:k.color}}>{k.val}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:2}}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Gráfico ventas 7 días */}
        {ventas7.length>0&&<div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',padding:20,marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)'}}>📈 Ventas últimos 7 días</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>
              Total: <strong style={{color:'white'}}>{ventas7.reduce((s,v)=>s+v.total,0).toFixed(2)} €</strong>
              {' · '}Media: <strong style={{color:'white'}}>{(ventas7.reduce((s,v)=>s+v.total,0)/7).toFixed(2)} €/día</strong>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:6,height:90}}>
            {ventas7.map((v,i)=>{
              const h=Math.max(6,Math.round((v.total/maxVenta)*80))
              const isToday=i===6
              return(
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  {v.total>0&&<div style={{fontSize:9,color:'rgba(255,255,255,0.5)',fontWeight:600}}>{v.total.toFixed(0)}€</div>}
                  <div style={{width:'100%',height:h,background:isToday?'#ff1e41':'rgba(255,30,65,0.3)',borderRadius:'2px 2px 0 0'}}/>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.3)'}}>{v.dia}</div>
                </div>
              )
            })}
          </div>
        </div>}

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          {/* Últimos pedidos con cambio masivo */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)'}}>📋 Últimos pedidos</div>
              <Link href="/admin/pedidos" style={{fontSize:12,color:'#ff1e41',textDecoration:'none'}}>Ver todos →</Link>
            </div>
            {/* Cambio masivo */}
            {selected.length>0&&<div style={{background:'rgba(255,30,65,0.1)',border:'1px solid rgba(255,30,65,0.3)',padding:'10px 14px',marginBottom:10,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <span style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>{selected.length} seleccionado{selected.length!==1?'s':''}</span>
              <select value={bulkStatus} onChange={e=>setBulkStatus(e.target.value)}
                style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.2)',color:'white',padding:'4px 8px',fontSize:12,fontFamily:'inherit',flex:1}}>
                <option value="processing">📦 Preparando</option>
                <option value="shipped">🚚 Enviado</option>
                <option value="delivered">✅ Entregado</option>
                <option value="cancelled">❌ Cancelado</option>
              </select>
              <button onClick={bulkUpdate} disabled={saving}
                style={{background:'#ff1e41',color:'white',border:'none',padding:'5px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                {saving?'...':'Aplicar'}
              </button>
              <button onClick={()=>setSelected([])} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.5)',padding:'5px 10px',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>✕</button>
            </div>}
            <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)'}}>
              {orders.slice(0,10).map(o=>{
                const isSel=selected.includes(o.id)
                return(
                  <div key={o.id} onClick={()=>setSelected(s=>isSel?s.filter(x=>x!==o.id):[...s,o.id])}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',background:isSel?'rgba(255,30,65,0.08)':'transparent',transition:'background 0.1s'}}>
                    <div style={{width:16,height:16,border:'1px solid',borderColor:isSel?'#ff1e41':'rgba(255,255,255,0.2)',background:isSel?'#ff1e41':'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10}}>
                      {isSel?'✓':''}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.85)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {o.customer_name||o.customer_email||'BM-'+o.id?.slice(0,8).toUpperCase()}
                      </div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>{fmt(o.created_at)}</div>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:'#ff1e41',flexShrink:0}}>{Number(o.total||0).toFixed(0)} €</div>
                    <span style={{fontSize:10,padding:'2px 8px',background:(STATUS_COLOR[o.status]||'#555')+'20',color:STATUS_COLOR[o.status]||'#555',border:'1px solid '+(STATUS_COLOR[o.status]||'#555')+'40',flexShrink:0,fontWeight:600}}>
                      {STATUS_LABEL[o.status]||o.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Módulos */}
          <div>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)',marginBottom:12}}>⚡ MÓDULOS</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {MODULOS.map(m=>(
                <a key={m.href} href={m.href} target={m.href.startsWith('http')?'_blank':undefined}
                  style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:'14px 16px',textDecoration:'none',display:'block',transition:'border-color 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=m.color}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                  <div style={{fontSize:20,marginBottom:6}}>{m.icon}</div>
                  <div style={{fontSize:13,fontWeight:700,color:'white',marginBottom:2}}>{m.title}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>{m.desc}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
