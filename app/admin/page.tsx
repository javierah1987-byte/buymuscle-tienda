// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const db = createClient(
  'https://awwlbepjxuoxaigztugh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
)

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders:0, revenue:0, pending:0, products:0, lowStock:0, tpv:0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    Promise.all([
      db.from('orders').select('id,total,status,channel,created_at,customer_name,order_number').order('created_at',{ascending:false}).limit(8),
      db.from('products').select('id,active,stock')
    ]).then(([{data:orders},{data:products}])=>{
      const o = orders||[], p = products||[]
      setStats({
        orders: o.length,
        revenue: o.filter(x=>x.status!=='cancelled').reduce((s,x)=>s+Number(x.total),0),
        pending: o.filter(x=>['pending','processing'].includes(x.status)).length,
        products: p.filter(x=>x.active).length,
        lowStock: p.filter(x=>x.active&&x.stock<=5).length,
        tpv: o.filter(x=>x.channel?.startsWith('tpv')).length
      })
    // Ventas por día (últimos 7 días)
    const hoy=new Date();
    const hace7=new Date(hoy);hace7.setDate(hoy.getDate()-6);
    const r7=await fetch(S+'/rest/v1/orders?select=total,created_at&created_at=gte.'+hace7.toISOString()+'&status=neq.cancelled',{headers:{apikey:K,'Authorization':'Bearer '+K}});
    const d7=await r7.json();
    const porDia={};
    for(let i=0;i<7;i++){const d=new Date(hoy);d.setDate(hoy.getDate()-6+i);porDia[d.toISOString().split('T')[0]]=0;}
    (d7||[]).forEach(o=>{const dia=o.created_at?.split('T')[0];if(dia in porDia) porDia[dia]+=Number(o.total||0);});
    setVentasPorDia(Object.entries(porDia).map(([dia,total])=>({dia:dia.slice(5),total})));
    
      setRecent(o.slice(0,6))
      setLoading(false)
    })
  },[])

  const fmt = d => new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})
  const SC = {pending:'#f59e0b',paid:'#22c55e',processing:'#3b82f6',shipped:'#8b5cf6',delivered:'#22c55e',cancelled:'#ef4444'}
  const SL = {pending:'Pendiente',paid:'Pagado',processing:'Procesando',shipped:'Enviado',delivered:'Entregado',cancelled:'Cancelado'}

  const modules = [
    { icon:'📦', label:'Pedidos Online', desc:'Ver, filtrar y gestionar pedidos de la tienda', href:'/admin/pedidos', color:'#ff1e41', badge:stats.pending>0?stats.pending+' pendientes':null },
    { icon:'🏪', label:'TPV — Tienda física', desc:'Punto de venta para ventas presenciales', href:'/tpv', color:'#8b5cf6' },
    { icon:'📊', label:'Gestión de Stock', desc:'Actualizar precios, stock y activar productos', href:'/admin/stock', color:'#3b82f6', badge:stats.lowStock>0?stats.lowStock+' stock bajo':null },
    { icon:'📋', label:'Distribuidores', desc:'Panel de pedidos de distribuidores', href:'/admin/pedidos', color:'#22c55e' },
    { icon:'✉️', label:'Blog', desc:'Configurar plantillas de email', href:'https://resend.com', color:'#f59e0b', external:true },
    { icon:'💼', label:'Holded — Facturas', desc:'Ver y gestionar facturas en Holded', href:'https://app.holded.com', color:'#6366f1', external:true },
    { icon:'🗄️', label:'Base de datos', desc:'Supabase — Tablas y datos en bruto', href:'https://supabase.com/dashboard/project/awwlbepjxuoxaigztugh', color:'#06b6d4', external:true },
    { icon:'🚀', label:'Vercel — Deploys', desc:'Gestión de deploys y variables de entorno', href:'https://vercel.com/javierah1987-3310s-projects/buymuscle-tienda', color:'#111', external:true },
  ]

  return (
    <div style={{background:'#0a0a0a',minHeight:'100vh',color:'white',fontFamily:'var(--font-body,Arial)'}}>
      {/* Header */}
      <div style={{background:'#111',borderBottom:'1px solid #222',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <div style={{color:'#ff1e41',fontWeight:900,fontSize:24,letterSpacing:2}}>BUYMUSCLE</div>
        <div style={{color:'#555',fontSize:13}}>Panel de Administración</div>
        <a href="/" style={{marginLeft:'auto',color:'#555',fontSize:12,textDecoration:'none'}}>← Ir a la tienda</a>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'24px 20px'}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12,marginBottom:24}}>
          {[
            ['💰 Facturación',stats.revenue.toFixed(0)+' €','#22c55e'],
            ['🛒 Pedidos',stats.orders,'#fff'],
            ['⏳ Pendientes',stats.pending,'#f59e0b'],
            ['🏪 Ventas TPV',stats.tpv,'#8b5cf6'],
            ['📦 Productos',stats.products,'#3b82f6'],
            ['⚠️ Stock bajo',stats.lowStock,'#ef4444'],
          ].map(([l,v,c])=>(
            <div key={l} style={{background:'#111',border:'1px solid #222',padding:'16px 12px',textAlign:'center',borderRadius:4}}>
              <div style={{fontSize:11,color:'#555',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>{l}</div>
              <div style={{fontSize:26,fontWeight:900,color:c}}>{loading?'…':v}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:24}}>
          {/* Módulos */}
          <div>
            <h2 style={{fontSize:13,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 12px'}}>Módulos</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {modules.map(m=>(
                <a key={m.label} href={m.href} target={m.external?'_blank':'_self'}
                  style={{background:'#111',border:'1px solid #222',padding:16,textDecoration:'none',color:'white',display:'flex',gap:12,alignItems:'flex-start',transition:'border-color 0.15s',borderLeft:'3px solid '+m.color}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=m.color}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='#222'}>
                  <span style={{fontSize:24,flexShrink:0}}>{m.icon}</span>
                  <div style={{minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:3,display:'flex',alignItems:'center',gap:6}}>
                      {m.label}
                      {m.external&&<span style={{fontSize:9,color:'#555'}}>↗</span>}
                    </div>
                    <div style={{fontSize:11,color:'#555',lineHeight:1.4}}>{m.desc}</div>
                    {m.badge&&<div style={{marginTop:6,fontSize:10,background:m.color+'20',color:m.color,padding:'2px 8px',display:'inline-block',fontWeight:700}}>{m.badge}</div>}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Últimos pedidos */}
          <div>
            <h2 style={{fontSize:13,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 12px'}}>Últimos pedidos</h2>
            <div style={{background:'#111',border:'1px solid #222'}}>
              {loading ? <div style={{padding:24,textAlign:'center',color:'#555'}}>Cargando…</div>
                : recent.map(o=>(
                <div key={o.id} style={{padding:'12px 16px',borderBottom:'1px solid #1a1a1a',display:'flex',alignItems:'center',gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:12,color:'#ff1e41'}}>{o.order_number}</div>
                    <div style={{fontSize:11,color:'#888',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.customer_name}</div>
                    <div style={{fontSize:10,color:'#444'}}>{fmt(o.created_at)}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontWeight:700,fontSize:13}}>{Number(o.total).toFixed(0)} €</div>
                    <div style={{fontSize:10,color:SC[o.status],fontWeight:700,textTransform:'uppercase'}}>{SL[o.status]||o.status}</div>
                  </div>
                </div>
              ))}
              <a href="/admin/pedidos" style={{display:'block',padding:'12px 16px',textAlign:'center',fontSize:12,color:'#ff1e41',textDecoration:'none',borderTop:'1px solid #222'}}>
                Ver todos los pedidos →
              </a>
            </div>

            {/* Accesos rápidos */}
            <h2 style={{fontSize:13,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',margin:'20px 0 12px'}}>Accesos rápidos</h2>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {[
                ['📊 Exportar pedidos CSV', '/admin/pedidos'],
                ['🏪 Abrir TPV', '/tpv'],
                ['📦 Ver stock bajo', '/admin/stock'],
                ['🌐 Ver tienda', '/'],
              ].map(([l,h])=>(
                <a key={l} href={h} style={{background:'#111',border:'1px solid #222',padding:'10px 16px',color:'#ccc',textDecoration:'none',fontSize:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  {l}<span style={{color:'#555'}}>→</span>
                </a>
              ))}
            </div>
          </div>
        
              {/* Nuevos módulos */}
              {[
                {icon:'✍️',title:'Blog',desc:'Gestionar artículos del blog',href:'/admin/blog',color:'#8b5cf6'},
                {icon:'📱',title:'RRSS',desc:'Programar publicaciones sociales',href:'/admin/rrss',color:'#E1306C'},
                {icon:'🏷️',title:'Descuentos',desc:'Códigos de descuento y cupones',href:'/admin/descuentos',color:'#f59e0b'},
                {icon:'📦',title:'Productos',desc:'Editar precios, stock y visibilidad',href:'/admin/productos',color:'#22c55e'},
                {icon:'📊',title:'Suscriptores',desc:'Lista de emails captados',href:'/admin/suscriptores',color:'#3b82f6'},
                {icon:'🛒',title:'Carritos abandonados',desc:'Recuperar ventas perdidas',href:'/admin/abandoned',color:'#ff1e41'},
              ].map(m=>(
                <a key={m.href} href={m.href}
                  style={{display:'block',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',padding:20,textDecoration:'none',transition:'border-color 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=m.color}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                  <div style={{fontSize:28,marginBottom:10}}>{m.icon}</div>
                  <div style={{fontSize:14,fontWeight:700,color:'white',marginBottom:4}}>{m.title}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{m.desc}</div>
                </a>
              ))}</div>
      </div>
    </div>
  )
}
