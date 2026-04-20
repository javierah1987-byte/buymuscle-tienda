// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K}
export default function Metricas(){
  const[data,setData]=useState({orders:[],lines:[],prods:[],subs:0})
  const[period,setPeriod]=useState(30)
  const[loading,setLoading]=useState(true)
  useEffect(()=>{load()},[period])
  async function load(){
    setLoading(true)
    const since=new Date(Date.now()-period*86400000).toISOString()
    const[r1,r2,r3,r4]=await Promise.all([
      fetch(S+'/rest/v1/orders?created_at=gte.'+since+'&order=created_at.asc',{headers:h}),
      fetch(S+'/rest/v1/order_lines?select=product_name,quantity,unit_price',{headers:h}),
      fetch(S+'/rest/v1/products?active=eq.true&select=id,name,stock,price_incl_tax,brand,category',{headers:h}),
      fetch(S+'/rest/v1/email_subscribers?select=count',{headers:{...h,'Prefer':'count=exact','Range':'0-0'}}),
    ])
    const[ords,lines,prods]=await Promise.all([r1.json(),r2.json(),r3.json()])
    const subsCount=parseInt(r4.headers.get('content-range')?.split('/')[1]||'0')
    setData({orders:Array.isArray(ords)?ords:[],lines:Array.isArray(lines)?lines:[],prods:Array.isArray(prods)?prods:[],subs:subsCount})
    setLoading(false)
  }
  const ords=data.orders
  const facturacion=ords.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+Number(o.total||0),0)
  const ticket=ords.length>0?facturacion/ords.length:0
  const canales={web:ords.filter(o=>o.channel==='online_retail').length,dist:ords.filter(o=>o.channel?.includes('distributor')).length,tpv:ords.filter(o=>o.channel==='tpv_retail').length}
  // Top productos por lineas
  const prodCount={}
  data.lines.forEach(l=>{const k=l.product_name||'?';prodCount[k]=(prodCount[k]||0)+(l.quantity||1)})
  const topProds=Object.entries(prodCount).sort((a,b)=>b[1]-a[1]).slice(0,10)
  // Ventas por dia
  const diasMap={}
  const hoy=new Date()
  for(let i=0;i<Math.min(period,14);i++){const d=new Date(hoy);d.setDate(hoy.getDate()-13+i);diasMap[d.toISOString().split('T')[0]]=0}
  ords.forEach(o=>{const d=o.created_at?.split('T')[0];if(d in diasMap)diasMap[d]+=Number(o.total||0)})
  const diasArr=Object.entries(diasMap).map(([d,v])=>({d:d.slice(5),v}))
  const maxV=Math.max(...diasArr.map(x=>x.v),1)
  // Stock bajo
  const stockBajo=data.prods.filter(p=>(p.stock||0)<=10).sort((a,b)=>(a.stock||0)-(b.stock||0))
  const BS={fontSize:12,padding:'3px 8px',borderRadius:12,fontWeight:600}
  return(
    <div style={{background:'#0d0d0d',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#080808',padding:'18px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>📊 Metricas avanzadas</h1>
          <p style={{margin:'3px 0 0',fontSize:12,color:'rgba(255,255,255,0.4)'}}>Analisis de rendimiento de la tienda</p>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {[7,14,30,90].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)}
              style={{padding:'6px 12px',border:'1px solid',borderColor:period===p?'#ff1e41':'rgba(255,255,255,0.15)',background:period===p?'rgba(255,30,65,0.15)':'transparent',color:'white',fontSize:12,cursor:'pointer',fontFamily:'Arial'}}>
              {p}d
            </button>
          ))}
          <Link href="/admin" style={{marginLeft:8,color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:13}}>← Admin</Link>
        </div>
      </div>
      {loading?<div style={{textAlign:'center',padding:'4rem',color:'rgba(255,255,255,0.4)'}}>Cargando datos...</div>:
      <div style={{padding:'20px 28px'}}>
        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[
            {l:'Facturacion',v:facturacion.toFixed(0)+' €',c:'#22c55e',i:'💰'},
            {l:'Pedidos',v:ords.length,c:'white',i:'📦'},
            {l:'Ticket medio',v:ticket.toFixed(0)+' €',c:'#8b5cf6',i:'📊'},
            {l:'Suscriptores',v:data.subs,c:'#3b82f6',i:'📧'},
            {l:'Cancelados',v:ords.filter(o=>o.status==='cancelled').length,c:ords.filter(o=>o.status==='cancelled').length>0?'#ef4444':'white',i:'❌'},
          ].map(k=>(
            <div key={k.l} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:'16px',textAlign:'center'}}>
              <div style={{fontSize:20,marginBottom:4}}>{k.i}</div>
              <div style={{fontSize:22,fontWeight:900,color:k.c}}>{k.v}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:2}}>{k.l}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16}}>
          {/* Grafico ventas */}
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',padding:20}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)',marginBottom:16}}>Ventas ultimos {Math.min(period,14)} dias</div>
            <div style={{display:'flex',alignItems:'flex-end',gap:4,height:120}}>
              {diasArr.map((d,i)=>{
                const hh=Math.max(4,Math.round((d.v/maxV)*108))
                return(
                  <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                    {d.v>0&&<div style={{fontSize:8,color:'rgba(255,255,255,0.4)'}}>{d.v.toFixed(0)}</div>}
                    <div style={{width:'100%',height:hh,background:i===diasArr.length-1?'#ff1e41':'rgba(255,30,65,0.35)',borderRadius:'2px 2px 0 0'}}/>
                    <div style={{fontSize:8,color:'rgba(255,255,255,0.3)',whiteSpace:'nowrap'}}>{d.d}</div>
                  </div>
                )
              })}
            </div>
          </div>
          {/* Por canal */}
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',padding:20}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)',marginBottom:16}}>Ventas por canal</div>
            {[{l:'Web particular',v:canales.web,c:'#3b82f6'},{l:'Distribuidores',v:canales.dist,c:'#f59e0b'},{l:'TPV fisica',v:canales.tpv,c:'#22c55e'}].map(c=>(
              <div key={c.l} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:13,color:'rgba(255,255,255,0.7)'}}>{c.l}</span><span style={{fontSize:13,fontWeight:700,color:c.c}}>{c.v}</span></div>
                <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:3}}>
                  <div style={{height:'100%',width:(ords.length>0?c.v/ords.length*100:0)+'%',background:c.c,borderRadius:3}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          {/* Top productos */}
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',padding:20}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)',marginBottom:14}}>Top 10 productos mas vendidos</div>
            {topProds.length===0?<p style={{color:'rgba(255,255,255,0.3)',fontSize:13}}>Sin datos</p>
            :topProds.map(([name,qty],i)=>(
              <div key={name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{display:'flex',gap:10,alignItems:'center',minWidth:0}}>
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.3)',width:18,flexShrink:0}}>#{i+1}</span>
                  <span style={{fontSize:12,color:'rgba(255,255,255,0.7)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</span>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:'#ff1e41',flexShrink:0,marginLeft:8}}>{qty} ud</span>
              </div>
            ))}
          </div>
          {/* Stock critico */}
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',padding:20}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)',marginBottom:14}}>
              ⚠️ Stock critico — {stockBajo.length} productos
            </div>
            {stockBajo.length===0?<p style={{color:'rgba(255,255,255,0.3)',fontSize:13}}>Todo en orden</p>
            :stockBajo.slice(0,12).map(p=>(
              <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <span style={{fontSize:12,color:'rgba(255,255,255,0.7)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{p.name}</span>
                <span style={{...BS,background:p.stock===0?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.15)',color:p.stock===0?'#ef4444':'#f59e0b',flexShrink:0,marginLeft:8}}>{p.stock===0?'SIN STOCK':p.stock+' ud'}</span>
              </div>
            ))}
            <Link href="/admin/stock" style={{display:'block',marginTop:14,fontSize:12,color:'#ff1e41',textDecoration:'none',textAlign:'center'}}>Gestionar stock →</Link>
          </div>
        </div>
      </div>}
    </div>
  )
    }
