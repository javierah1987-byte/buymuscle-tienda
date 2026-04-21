// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json'}
export default function AdminCaja(){
  const[sessions,setSessions]=useState([])
  const[open,setOpen]=useState(null)
  const[efectivoInicial,setEfectivoInicial]=useState('')
  const[efectivoFinal,setEfectivoFinal]=useState('')
  const[loading,setLoading]=useState(true)
  const[msg,setMsg]=useState('')
  useEffect(()=>{load()},[])
  async function load(){
    setLoading(true)
    const r=await fetch(S+'/rest/v1/caja_sessions?order=opened_at.desc&limit=30',{headers:h})
    const d=await r.json()
    const ss=Array.isArray(d)?d:[]
    setSessions(ss)
    setOpen(ss.find(s=>!s.closed_at)||null)
    setLoading(false)
  }
  async function abrirCaja(){
    const ef=parseFloat(efectivoInicial)||0
    await fetch(S+'/rest/v1/caja_sessions',{method:'POST',headers:{...h,'Prefer':'return=minimal'},
      body:JSON.stringify({efectivo_inicial:ef,created_by:'admin'})})
    setMsg('Caja abierta con '+ef.toFixed(2)+' € de efectivo inicial')
    setEfectivoInicial('')
    load()
    setTimeout(()=>setMsg(''),3000)
  }
  async function cerrarCaja(){
    if(!open)return
    const ef=parseFloat(efectivoFinal)||0
    // Calcular totales del dia en orders
    const hoy=open.opened_at.split('T')[0]
    const r=await fetch(S+'/rest/v1/orders?created_at=gte.'+hoy+'T00:00:00&channel=eq.tpv_retail&select=total,payment_method',{headers:h})
    const orders=await r.json()
    const totalEf=(Array.isArray(orders)?orders:[]).filter(o=>o.payment_method==='efectivo').reduce((s,o)=>s+Number(o.total||0),0)
    const totalTarjeta=(Array.isArray(orders)?orders:[]).filter(o=>o.payment_method!=='efectivo').reduce((s,o)=>s+Number(o.total||0),0)
    await fetch(S+'/rest/v1/caja_sessions?id=eq.'+open.id,{method:'PATCH',headers:h,
      body:JSON.stringify({closed_at:new Date().toISOString(),efectivo_final:ef,total_efectivo:totalEf,total_tarjeta:totalTarjeta,total_ventas:Array.isArray(orders)?orders.length:0})})
    setMsg('Caja cerrada. Efectivo esperado: '+(open.efectivo_inicial+totalEf).toFixed(2)+' € · Real: '+ef.toFixed(2)+' €')
    setEfectivoFinal('')
    load()
    setTimeout(()=>setMsg(''),5000)
  }
  const fmt=d=>d?new Date(d).toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):''
  const TD={padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:13,color:'rgba(255,255,255,0.8)'}
  return(
    <div style={{background:'#0d0d0d',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#080808',padding:'18px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>Apertura / Cierre de caja</h1>
          <p style={{margin:'3px 0 0',fontSize:12,color:'rgba(255,255,255,0.4)'}}>Control diario de efectivo en tienda</p>
        </div>
        <Link href="/admin" style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:13}}>← Admin</Link>
      </div>
      <div style={{padding:'28px',display:'grid',gridTemplateColumns:'360px 1fr',gap:24}}>
        {/* Panel accion */}
        <div>
          {msg&&<div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',padding:'12px 16px',marginBottom:16,fontSize:13,color:'#22c55e',borderRadius:4}}>{msg}</div>}
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.08)',padding:24,marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <div style={{width:12,height:12,borderRadius:'50%',background:open?'#22c55e':'#ef4444',flexShrink:0}}/>
              <div>
                <div style={{fontWeight:700,fontSize:16}}>{open?'Caja abierta':'Caja cerrada'}</div>
                {open&&<div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2}}>Desde {fmt(open.opened_at)} · Inicial: {Number(open.efectivo_inicial||0).toFixed(2)} €</div>}
              </div>
            </div>
            {!open?(
              <>
                <label style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'rgba(255,255,255,0.4)',display:'block',marginBottom:8}}>Efectivo en caja al abrir</label>
                <div style={{display:'flex',gap:8}}>
                  <input type="number" value={efectivoInicial} onChange={e=>setEfectivoInicial(e.target.value)} placeholder="0.00" step="0.01"
                    style={{flex:1,padding:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:14,fontFamily:'Arial',outline:'none'}}/>
                  <button onClick={abrirCaja}
                    style={{background:'#22c55e',color:'white',border:'none',padding:'10px 20px',fontWeight:700,cursor:'pointer',fontFamily:'Arial',fontSize:14,whiteSpace:'nowrap'}}>
                    Abrir caja
                  </button>
                </div>
              </>
            ):(
              <>
                <label style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'rgba(255,255,255,0.4)',display:'block',marginBottom:8}}>Efectivo real al cerrar</label>
                <div style={{display:'flex',gap:8}}>
                  <input type="number" value={efectivoFinal} onChange={e=>setEfectivoFinal(e.target.value)} placeholder="0.00" step="0.01"
                    style={{flex:1,padding:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:14,fontFamily:'Arial',outline:'none'}}/>
                  <button onClick={cerrarCaja}
                    style={{background:'#ff1e41',color:'white',border:'none',padding:'10px 20px',fontWeight:700,cursor:'pointer',fontFamily:'Arial',fontSize:14,whiteSpace:'nowrap'}}>
                    Cierre Z
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Historico */}
        <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'rgba(255,255,255,0.4)'}}>
            Historico de sesiones
          </div>
          {loading?<div style={{padding:'2rem',textAlign:'center',color:'rgba(255,255,255,0.3)'}}>Cargando...</div>
          :sessions.length===0?<div style={{padding:'2rem',textAlign:'center',color:'rgba(255,255,255,0.3)'}}>Sin sesiones aun</div>
          :<table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>
              {['Apertura','Cierre','Efectivo inicial','Ventas efectivo','Ventas tarjeta','Descuadre','Estado'].map(h=>(
                <th key={h} style={{...TD,color:'rgba(255,255,255,0.4)',fontWeight:700,fontSize:11,textTransform:'uppercase'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {sessions.map(s=>{
                const esperado=Number(s.efectivo_inicial||0)+Number(s.total_efectivo||0)
                const real=Number(s.efectivo_final||0)
                const descuadre=s.closed_at?real-esperado:null
                return(
                  <tr key={s.id}>
                    <td style={TD}>{fmt(s.opened_at)}</td>
                    <td style={TD}>{s.closed_at?fmt(s.closed_at):<span style={{color:'#22c55e',fontSize:11}}>ABIERTA</span>}</td>
                    <td style={TD}>{Number(s.efectivo_inicial||0).toFixed(2)} €</td>
                    <td style={TD}>{Number(s.total_efectivo||0).toFixed(2)} €</td>
                    <td style={TD}>{Number(s.total_tarjeta||0).toFixed(2)} €</td>
                    <td style={{...TD,color:descuadre===null?'#888':Math.abs(descuadre||0)<0.01?'#22c55e':descuadre>0?'#22c55e':'#ef4444',fontWeight:700}}>
                      {descuadre===null?'—':((descuadre>=0?'+':'')+descuadre.toFixed(2)+' €')}
                    </td>
                    <td style={TD}><span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:s.closed_at?'rgba(255,255,255,0.06)':'rgba(34,197,94,0.1)',color:s.closed_at?'rgba(255,255,255,0.4)':'#22c55e'}}>{s.closed_at?'Cerrada':'Abierta'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>}
        </div>
      </div>
    </div>
  )
  }
