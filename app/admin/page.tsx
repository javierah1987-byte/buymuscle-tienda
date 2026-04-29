// @ts-nocheck
'use client'
import{useEffect,useState}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K}
const MODULOS=[
  {icon:'➕',t:'Nuevo Producto',d:'Añadir producto al catalogo',href:'/admin/nuevo-producto',c:'#ff6b35'},
  {icon:'📦',t:'Pedidos Online',d:'Ver y gestionar pedidos',href:'/admin/pedidos',c:'#ff1e41'},
  {icon:'🖥️',t:'TPV Tienda fisica',d:'Punto de venta presencial',href:'/tpv',c:'#f59e0b'},
  {icon:'📊',t:'Gestion de Stock',d:'Actualizar precios y stock',href:'/admin/stock',c:'#22c55e'},
  {icon:'👥',t:'Distribuidores',d:'Panel de distribuidores',href:'/distribuidores',c:'#3b82f6'},
  {icon:'✍️',t:'Blog',d:'Gestionar articulos',href:'/admin/blog',c:'#8b5cf6'},
  {icon:'📱',t:'RRSS',d:'Publicaciones sociales',href:'/admin/rrss',c:'#E1306C'},
  {icon:'🏷️',t:'Descuentos',d:'Codigos y cupones',href:'/admin/descuentos',c:'#f59e0b'},
  {icon:'📦',t:'Productos',d:'Editar precio y stock inline',href:'/admin/productos',c:'#22c55e'},
  {icon:'📊',t:'Suscriptores',d:'Emails captados',href:'/admin/suscriptores',c:'#3b82f6'},
  {icon:'🛒',t:'Carritos Abandonados',d:'Recuperar ventas perdidas',href:'/admin/abandoned',c:'#ff1e41'},
  {icon:'📧',t:'Newsletter',d:'Enviar emails a suscriptores',href:'/admin/newsletter',c:'#3b82f6'},
  {icon:'🛒',t:'Carritos abandonados',d:'Recuperar ventas perdidas',href:'/admin/abandoned',c:'#ff1e41'},
  {icon:'📧',t:'Email (Resend)',d:'Plantillas de email',href:'https://resend.com',c:'#555',ext:true},
  {icon:'👥',t:'Clientes',d:'Historial y CRM',href:'/admin/clientes',c:'#8b5cf6'},
  {icon:'⭐',t:'Reseñas',d:'Aprobar / rechazar',href:'/admin/resenas',c:'#f59e0b'},
  {icon:'📊',t:'Métricas',d:'KPIs avanzados',href:'/admin/metricas',c:'#22c55e'},
  {icon:'🎯',t:'Precios masivos',d:'Subir/bajar por marca',href:'/admin/precios',c:'#ef4444'},
  {icon:'💰',t:'Caja',d:'Apertura y cierre Z',href:'/admin/caja',c:'#059669'},
  {icon:'🔄',t:'Devoluciones',d:'Gestionar devoluciones',href:'/admin/devoluciones',c:'#dc2626'},
  {icon:'🏷️',t:'Holded Facturas',d:'Ver facturas en Holded',href:'https://app.holded.com',c:'#555',ext:true},
]
export default function AdminDashboard(){
  const[stats,setStats]=useState({facturacion:0,pedidos:0,pendientes:0,tpv:0,productos:0,stockBajo:0,ticketMedio:0})
  const[orders,setOrders]=useState([])
  const[ventas7,setVentas7]=useState([])
  const[selected,setSelected]=useState([])
  const[bulkStatus,setBulkStatus]=useState('shipped')
  const[saving,setSaving]=useState(false)
  const[msg,setMsg]=useState('')

  useEffect(()=>{load();},[])
  useEffect(()=>{
    if(stats.pendientes>0){
      document.title='✱ ('+stats.pendientes+') Admin - BuyMuscle'
      // a4: Notificación browser si hay pendientes nuevos
      if(stats.pendientes > 0 && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('BuyMuscle Admin', {body: stats.pendientes+' pedido'+( stats.pendientes>1?'s':'')+' pendiente'+( stats.pendientes>1?'s':''), icon: '/icon'})
      }
    } else {
      document.title='Admin - BuyMuscle'
    }
  },[stats.pendientes])

  async function load(){
    try{
      const [r1,r2,r3,r4,r5]=await Promise.all([
        fetch(S+'/rest/v1/orders?select=id,total,status,created_at,customer_name,customer_email&order=created_at.desc&limit=15',{headers:h}),
        fetch(S+'/rest/v1/orders?select=total,status',{headers:h}),
        fetch(S+'/rest/v1/products?select=count&active=eq.true',{headers:{...h,'Prefer':'count=exact','Range':'0-0'}}),
        fetch(S+'/rest/v1/products?select=count&stock=lte.10&active=eq.true',{headers:{...h,'Prefer':'count=exact','Range':'0-0'}}),
        fetch(S+'/rest/v1/orders?select=total,created_at&status=neq.cancelled',{headers:h}),
      ])
      const os=await r1.json()
      const all=await r2.json()
      const prodCt=parseInt(r3.headers.get('content-range')?.split('/')[1]||'0')
      const stCt=parseInt(r4.headers.get('content-range')?.split('/')[1]||'0')
      const v7data=await r5.json()
      setOrders(os||[])
      const filt=(all||[]).filter(o=>o.status!=='cancelled')
      const facturacion=filt.reduce((s,o)=>s+Number(o.total||0),0)
      const pendientes=(all||[]).filter(o=>o.status==='pending').length
      const tpv=(all||[]).filter(o=>o.status==='tpv').length
      const ticketMedio=filt.length>0?facturacion/filt.length:0
      setStats({facturacion,pedidos:(all||[]).length,pendientes,tpv,productos:prodCt,stockBajo:stCt,ticketMedio})
      // Ventas 7 dias
      const hoy=new Date()
      const mapa={}
      for(let i=0;i<7;i++){const d=new Date(hoy);d.setDate(hoy.getDate()-6+i);mapa[d.toISOString().split('T')[0]]=0}
      const hace7=new Date(hoy);hace7.setDate(hoy.getDate()-6)
      ;(v7data||[]).filter(o=>new Date(o.created_at)>=hace7).forEach(o=>{const d=o.created_at?.split('T')[0];if(d in mapa) mapa[d]+=Number(o.total||0)})
      setVentas7(Object.entries(mapa).map(([dia,total])=>({dia:dia.slice(5),total})))
    }catch(e){console.error(e)}
  }

  async function bulkUpdate(){
    if(!selected.length)return
    setSaving(true)
    await Promise.all(selected.map(id=>
      fetch(S+'/rest/v1/orders?id=eq.'+id,{method:'PATCH',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({status:bulkStatus})})
    ))
    setOrders(o=>o.map(x=>selected.includes(x.id)?{...x,status:bulkStatus}:x))
    setSelected([]);setSaving(false);setMsg('Estado actualizado')
    setTimeout(()=>setMsg(''),2500)
  }

  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short'})
  const SC={pending:'#f59e0b',processing:'#3b82f6',shipped:'#8b5cf6',delivered:'#22c55e',cancelled:'#ef4444',tpv:'#555'}
  const SL={pending:'Pendiente',processing:'Preparando',shipped:'Enviado',delivered:'Entregado',cancelled:'Cancelado',tpv:'TPV'}
  const maxV=Math.max(...ventas7.map(v=>v.total),1)

  return(
    <div style={{background:'#0d0d0d',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#080808',padding:'16px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <span style={{fontSize:20,fontWeight:900,color:'#ff1e41',letterSpacing:'-1px'}}>BUYMUSCLE</span>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.35)'}}>{stats.pendientes>0?'Panel de Administracion ('+stats.pendientes+' pendientes)':'Panel de Administracion'}</span>
        </div>
        <a href="/tienda" style={{fontSize:12,color:'rgba(255,255,255,0.4)',textDecoration:'none'}}>Ir a la tienda →</a>
      </div>

      <div style={{maxWidth:1400,margin:'0 auto',padding:'20px 20px'}}>
        {msg&&<div style={{background:'#166534',padding:'8px 16px',marginBottom:12,fontSize:13,borderRadius:4}}>{msg}</div>}

        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:10,marginBottom:18}} className="admin-kpis">
          {[
            {label:'FACTURACION',val:stats.facturacion.toFixed(0)+' €',icon:'💰',c:'#22c55e'},
            {label:'PEDIDOS',val:stats.pedidos,icon:'📦',c:'white',href:'/admin/pedidos'},
            {label:'PENDIENTES',val:stats.pendientes,icon:'⏳',c:stats.pendientes>0?'#f59e0b':'white',href:'/admin/pedidos?status=pending'},
            {label:'VENTAS TPV',val:stats.tpv,icon:'🛒',c:'white',href:'/tpv'},
            {label:'PRODUCTOS',val:stats.productos,icon:'📋',c:'#3b82f6',href:'/admin/productos'},
            {label:'STOCK BAJO',val:stats.stockBajo,icon:'⚠️',c:stats.stockBajo>50?'#ef4444':'#f59e0b',href:'/admin/stock'},
            {label:'TICKET MEDIO',val:stats.ticketMedio.toFixed(0)+' €',icon:'📈',c:'#8b5cf6'},
          ].map(k=>(
            <div key={k.label} onClick={function(){if(k.href)window.location.href=k.href}} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:'14px 12px',textAlign:'center',cursor:k.href?'pointer':'default'}}>
              <div style={{fontSize:18,marginBottom:4}}>{k.icon}</div>
              <div style={{fontSize:20,fontWeight:900,color:k.c}}>{k.val}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:2}}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Grafico 7 dias */}
        {ventas7.length>0&&<div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',padding:18,marginBottom:18}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)'}}>📈 Ventas ultimos 7 dias</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>
              Total: <strong style={{color:'white'}}>{ventas7.reduce((s,v)=>s+v.total,0).toFixed(0)} €</strong>
              {' · '}Media: <strong style={{color:'white'}}>{(ventas7.reduce((s,v)=>s+v.total,0)/7).toFixed(0)} €/dia</strong>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:6,height:80}}>
            {ventas7.map((v,i)=>{
              const hh=Math.max(4,Math.round((v.total/maxV)*72))
              return(
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  {v.total>0&&<div style={{fontSize:9,color:'rgba(255,255,255,0.5)'}}>{v.total.toFixed(0)}</div>}
                  <div style={{width:'100%',height:hh,background:i===6?'#ff1e41':'rgba(255,30,65,0.3)',borderRadius:'2px 2px 0 0'}}/>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.3)'}}>{v.dia}</div>
                </div>
              )
            })}
          </div>
        </div>}

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
          {/* Pedidos con cambio masivo */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              {/* a5 COMPARATIVA */}
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:20}}>
          {[
            {label:'Facturacion',val:stats.facturacion.toFixed(0)+' €',c:'#22c55e'},
            {label:'Ticket medio',val:stats.ticketMedio.toFixed(0)+' €',c:'#8b5cf6'},
            {label:'Pendientes',val:String(stats.pendientes),c:stats.pendientes>0?'#f59e0b':'#555'},
            {label:'Stock bajo',val:stats.stockBajo+' refs',c:stats.stockBajo>50?'#ef4444':'#f59e0b'},
          ].map(function(m){return(
            <div key={m.label} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',padding:'10px 16px',borderRadius:4,flex:1,minWidth:120}}>
              <div style={{fontSize:9,color:'#666',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.06em'}}>{m.label}</div>
              <div style={{fontSize:18,fontWeight:800,color:m.c}}>{m.val}</div>
            </div>
          )})}
        </div>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)'}}>📋 Ultimos pedidos</div>
              <Link href="/admin/pedidos" style={{fontSize:12,color:'#ff1e41',textDecoration:'none'}}>Ver todos →</Link>
            </div>
            {selected.length>0&&<div style={{background:'rgba(255,30,65,0.1)',border:'1px solid rgba(255,30,65,0.3)',padding:'8px 12px',marginBottom:8,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <span style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>{selected.length} seleccionado{selected.length!==1?'s':''}</span>
              <select value={bulkStatus} onChange={e=>setBulkStatus(e.target.value)}
                style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.2)',color:'white',padding:'3px 8px',fontSize:12,fontFamily:'inherit',flex:1}}>
                <option value="processing">📦 Preparando</option>
                <option value="shipped">🚚 Enviado</option>
                <option value="delivered">✅ Entregado</option>
                <option value="cancelled">❌ Cancelado</option>
              </select>
              <button onClick={bulkUpdate} disabled={saving}
                style={{background:'#ff1e41',color:'white',border:'none',padding:'4px 12px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                {saving?'...':'Aplicar'}
              </button>
              <button onClick={()=>setSelected([])} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.5)',padding:'4px 8px',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>✕</button>
            </div>}
            <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)'}}>
              {orders.map(o=>{
                const isSel=selected.includes(o.id)
                return(
                  <div key={o.id} onClick={()=>setSelected(s=>isSel?s.filter(x=>x!==o.id):[...s,o.id])}
                    style={{display:'flex',alignItems:'center',gap:8,padding:'9px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',background:isSel?'rgba(255,30,65,0.08)':'transparent'}}>
                    <div style={{width:14,height:14,border:'1px solid',borderColor:isSel?'#ff1e41':'rgba(255,255,255,0.2)',background:isSel?'#ff1e41':'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9}}>
                      {isSel?'✓':''}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.85)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {o.customer_name||o.customer_email||'BM-'+o.id?.slice(0,6).toUpperCase()}
                      </div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.35)'}}>{fmt(o.created_at)}</div>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:'#ff1e41',flexShrink:0}}>{Number(o.total||0).toFixed(0)} €</div>
                    <span style={{fontSize:10,padding:'2px 7px',background:(SC[o.status]||'#555')+'20',color:SC[o.status]||'#555',border:'1px solid '+(SC[o.status]||'#555')+'40',flexShrink:0,fontWeight:600}}>
                      {SL[o.status]||o.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Modulos */}
          {/* a5: Comparativa métricas */}
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',padding:'16px',marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)',marginBottom:12}}>📊 RESUMEN PERIODO</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
              {[
                {label:'Facturacion total',val:stats.facturacion.toFixed(0)+' €',color:'#ff1e41',icon:'💰'},
                {label:'Ticket medio',val:stats.ticketMedio.toFixed(0)+' €',color:'#8b5cf6',icon:'🎫'},
                {label:'Productos activos',val:stats.productos,color:'#22c55e',icon:'📦'},
              ].map(function(m){return(
                <div key={m.label} style={{textAlign:'center',padding:'10px 6px',background:'rgba(255,255,255,0.02)',borderRadius:4}}>
                  <div style={{fontSize:20,marginBottom:4}}>{m.icon}</div>
                  <div style={{fontSize:20,fontWeight:900,color:m.color,lineHeight:1}}>{m.val}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',marginTop:4,textTransform:'uppercase'}}>{m.label}</div>
                </div>
              )})}
            </div>
          </div>

          <div>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)',marginBottom:10}}>⚡ MODULOS</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {MODULOS.map(m=>(
                <a key={m.href} href={m.href} target={m.ext?'_blank':undefined}
                  style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:'12px 14px',textDecoration:'none',display:'block',transition:'border-color 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=m.c}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                  <div style={{fontSize:18,marginBottom:4}}>{m.icon}</div>
                  <div style={{fontSize:12,fontWeight:700,color:'white',marginBottom:1}}>{m.t}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.35)'}}>{m.d}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
