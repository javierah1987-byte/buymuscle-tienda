// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'

export default function AdminSuscriptores(){
  const[subs,setSubs]=useState([])
  const[loading,setLoading]=useState(true)
  const[search,setSearch]=useState('')
  const[msg,setMsg]=useState('')

  useEffect(()=>{
    fetch('/api/admin/marketing?t=subscribers')
      .then(async r=>{
        const d=await r.json().catch(()=>({}))
        if(!r.ok||!d.ok){setMsg('Error cargando suscriptores: '+(d.error||('HTTP '+r.status)));setSubs([])}
        else setSubs(Array.isArray(d.rows)?d.rows:[])
        setLoading(false)
      })
      .catch(e=>{setMsg('Error cargando suscriptores: '+String(e?.message||e));setLoading(false)})
  },[])

  function exportCSV(){
    const rows=[['Email','Descuento','Fecha'],...subs.map(s=>[s.email,s.discount_code||'BIENVENIDO10',s.created_at?.split('T')[0]])];
    const csv=rows.map(r=>r.join(',')).join(String.fromCharCode(10));
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download='suscriptores.csv';a.click();
  }

  const filtered=subs.filter(s=>s.email?.toLowerCase().includes(search.toLowerCase()))
  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})

  return(
    <div style={{background:'#111',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#0a0a0a',padding:'20px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div>
          <h1 style={{margin:0,fontSize:20,fontWeight:900,textTransform:'uppercase'}}>📊 Suscriptores Email</h1>
          <p style={{margin:'4px 0 0',fontSize:12,color:'rgba(255,255,255,0.4)'}}>{subs.length} emails captados con BIENVENIDO10</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button onClick={exportCSV} style={{padding:'8px 16px',background:'#ff1e41',color:'white',border:'none',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:'inherit'}}>
            📥 Exportar CSV
          </button>
          <a href="/admin" style={{color:'rgba(255,255,255,0.5)',textDecoration:'none',fontSize:13}}>← Admin</a>
        </div>
      </div>

      <div style={{padding:'24px 32px'}}>
        {msg&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#ef4444',padding:'12px 16px',marginBottom:16,fontSize:13}}>{msg}</div>}
        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
          {[
            {label:'Total suscriptores',val:subs.length,icon:'👥'},
            {label:'Este mes',val:subs.filter(s=>new Date(s.created_at)>new Date(new Date().setDate(1))).length,icon:'📅'},
            {label:'Hoy',val:subs.filter(s=>s.created_at?.startsWith(new Date().toISOString().split('T')[0])).length,icon:'⚡'},
          ].map(k=>(
            <div key={k.label} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:20}}>
              <div style={{fontSize:28,marginBottom:6}}>{k.icon}</div>
              <div style={{fontSize:28,fontWeight:900,color:'#ff1e41'}}>{k.val}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por email..."
          style={{width:'100%',padding:'10px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:14,fontFamily:'inherit',marginBottom:16,boxSizing:'border-box'}}/>

        {loading?<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.4)'}}>Cargando...</div>
        :<table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              {['#','Email','Cupón usado','Fecha suscripción'].map(h=>(
                <th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,textTransform:'uppercase',color:'rgba(255,255,255,0.35)',letterSpacing:'0.08em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <td style={{padding:'10px 12px',fontSize:12,color:'rgba(255,255,255,0.3)'}}>{i+1}</td>
                <td style={{padding:'10px 12px',fontSize:14,fontWeight:600,color:'rgba(255,255,255,0.85)'}}>{s.email}</td>
                <td style={{padding:'10px 12px'}}>
                  <span style={{background:'rgba(255,30,65,0.15)',color:'#ff1e41',padding:'2px 10px',fontSize:12,fontWeight:700,border:'1px solid rgba(255,30,65,0.3)'}}>
                    {s.discount_code||'BIENVENIDO10'}
                  </span>
                </td>
                <td style={{padding:'10px 12px',fontSize:13,color:'rgba(255,255,255,0.5)'}}>{s.created_at?fmt(s.created_at):'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>}
        {!loading&&filtered.length===0&&<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)',fontSize:14}}>No hay suscriptores todavía.</div>}
      </div>
    </div>
  )
                                              }
