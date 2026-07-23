// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
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
    const r=await fetch('/api/tpv-caja',{credentials:'same-origin'})
    const d=await r.json()
    setSessions(d.sessions||[])
    setOpen(d.open||null)
    setLoading(false)
  }
  async function abrirCaja(){
    const ef=parseFloat(efectivoInicial)||0
    const r=await fetch('/api/tpv-caja',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',
      body:JSON.stringify({cash_open:ef,operator:'admin'})})
    const d=await r.json()
    if(!d.ok){setMsg('Error: '+(d.error||'No se pudo abrir la caja'));setTimeout(()=>setMsg(''),3000);return}
    setMsg('Caja abierta con '+ef.toFixed(2)+' € de efectivo inicial')
    setEfectivoInicial('')
    load()
    setTimeout(()=>setMsg(''),3000)
  }
  async function cerrarCaja(){
    if(!open)return
    const ef=parseFloat(efectivoFinal)||0
    const r=await fetch('/api/tpv-caja',{method:'PATCH',headers:{'Content-Type':'application/json'},credentials:'same-origin',
      body:JSON.stringify({id:open.id,cash_close:ef})})
    const d=await r.json()
    if(!d.ok){setMsg('Error: '+(d.error||'No se pudo cerrar la caja'));setTimeout(()=>setMsg(''),3000);return}
    setMsg('Caja cerrada. Efectivo esperado: '+Number(d.expected_cash||0).toFixed(2)+' € · Real: '+ef.toFixed(2)+' €')
    setEfectivoFinal('')
    load()
    setTimeout(()=>setMsg(''),5000)
  }
  const fmt=d=>d?new Date(d).toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):''
  const TD={padding:'10px 12px',borderBottom:'1px solid #f3f3f3',fontSize:13,color:'#3a3a3a'}
  return(
    <div style={{background:'#f4f5f7',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'#111'}}>
      <div style={{background:'#ffffff',padding:'18px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #eaeaea'}}>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>Apertura / Cierre de caja</h1>
          <p style={{margin:'3px 0 0',fontSize:12,color:'#888888'}}>Control diario de efectivo en tienda</p>
        </div>
        <Link href="/admin" style={{color:'#888888',textDecoration:'none',fontSize:13}}>← Admin</Link>
      </div>
      <div style={{padding:'28px',display:'grid',gridTemplateColumns:'360px 1fr',gap:24}}>
        {/* Panel accion */}
        <div>
          {msg&&<div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',padding:'12px 16px',marginBottom:16,fontSize:13,color:'#22c55e',borderRadius:4}}>{msg}</div>}
          <div style={{background:'#ffffff',border:'1px solid #e6e6e6',padding:24,marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <div style={{width:12,height:12,borderRadius:'50%',background:open?'#22c55e':'#ef4444',flexShrink:0}}/>
              <div>
                <div style={{fontWeight:700,fontSize:16}}>{open?'Caja abierta':'Caja cerrada'}</div>
                {open&&<div style={{fontSize:12,color:'#888888',marginTop:2}}>Desde {fmt(open.opened_at)} · Inicial: {Number(open.cash_open||0).toFixed(2)} €</div>}
              </div>
            </div>
            {!open?(
              <>
                <label style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'#888888',display:'block',marginBottom:8}}>Efectivo en caja al abrir</label>
                <div style={{display:'flex',gap:8}}>
                  <input type="number" value={efectivoInicial} onChange={e=>setEfectivoInicial(e.target.value)} placeholder="0.00" step="0.01"
                    style={{flex:1,padding:'10px',background:'#f3f3f3',border:'1px solid #e0e0e0',color:'#111',fontSize:14,fontFamily:'Arial',outline:'none'}}/>
                  <button onClick={abrirCaja}
                    style={{background:'#22c55e',color:'#111',border:'none',padding:'10px 20px',fontWeight:700,cursor:'pointer',fontFamily:'Arial',fontSize:14,whiteSpace:'nowrap'}}>
                    Abrir caja
                  </button>
                </div>
              </>
            ):(
              <>
                <label style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'#888888',display:'block',marginBottom:8}}>Efectivo real al cerrar</label>
                <div style={{display:'flex',gap:8}}>
                  <input type="number" value={efectivoFinal} onChange={e=>setEfectivoFinal(e.target.value)} placeholder="0.00" step="0.01"
                    style={{flex:1,padding:'10px',background:'#f3f3f3',border:'1px solid #e0e0e0',color:'#111',fontSize:14,fontFamily:'Arial',outline:'none'}}/>
                  <button onClick={cerrarCaja}
                    style={{background:'#ff1e41',color:'#111',border:'none',padding:'10px 20px',fontWeight:700,cursor:'pointer',fontFamily:'Arial',fontSize:14,whiteSpace:'nowrap'}}>
                    Cierre Z
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Historico */}
        <div style={{background:'#ffffff',border:'1px solid #e6e6e6'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid #eaeaea',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'#888888'}}>
            Historico de sesiones
          </div>
          {loading?<div style={{padding:'2rem',textAlign:'center',color:'#9a9a9a'}}>Cargando...</div>
          :sessions.length===0?<div style={{padding:'2rem',textAlign:'center',color:'#9a9a9a'}}>Sin sesiones aun</div>
          :<table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>
              {['Apertura','Cierre','Efectivo inicial','Ventas efectivo','Ventas tarjeta','Descuadre','Estado'].map(h=>(
                <th key={h} style={{...TD,color:'#888888',fontWeight:700,fontSize:11,textTransform:'uppercase'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {sessions.map(s=>{
                const esperado=Number(s.cash_open||0)+Number(s.total_efectivo||0)
                const real=Number(s.cash_close||0)
                const descuadre=s.closed_at?real-esperado:null
                return(
                  <tr key={s.id}>
                    <td style={TD}>{fmt(s.opened_at)}</td>
                    <td style={TD}>{s.closed_at?fmt(s.closed_at):<span style={{color:'#22c55e',fontSize:11}}>ABIERTA</span>}</td>
                    <td style={TD}>{Number(s.cash_open||0).toFixed(2)} €</td>
                    <td style={TD}>{Number(s.total_efectivo||0).toFixed(2)} €</td>
                    <td style={TD}>{Number(s.total_tarjeta||0).toFixed(2)} €</td>
                    <td style={{...TD,color:descuadre===null?'#888':Math.abs(descuadre||0)<0.01?'#22c55e':descuadre>0?'#22c55e':'#ef4444',fontWeight:700}}>
                      {descuadre===null?'—':((descuadre>=0?'+':'')+descuadre.toFixed(2)+' €')}
                    </td>
                    <td style={TD}><span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:s.closed_at?'#eaeaea':'rgba(34,197,94,0.1)',color:s.closed_at?'#888888':'#22c55e'}}>{s.closed_at?'Cerrada':'Abierta'}</span></td>
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
