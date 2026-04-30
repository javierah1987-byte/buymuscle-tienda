// @ts-nocheck
'use client'
import{useState}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json'}
export default function Devoluciones(){
  const[num,setNum]=useState('')
  const[order,setOrder]=useState(null)
  const[lines,setLines]=useState([])
  const[selected,setSelected]=useState({})
  const[loading,setLoading]=useState(false)
  const[msg,setMsg]=useState('')
  const[done,setDone]=useState(false)
  async function buscar(){
    if(!num.trim())return
    setLoading(true);setOrder(null);setLines([]);setSelected({});setDone(false)
    const r=await fetch(S+'/rest/v1/orders?order_number=eq.'+num.trim().toUpperCase()+'&select=*',{headers:h})
    const d=await r.json()
    const o=Array.isArray(d)&&d.length>0?d[0]:null
    if(!o){setMsg('Pedido no encontrado');setLoading(false);return}
    setOrder(o)
    const lr=await fetch(S+'/rest/v1/order_lines?order_id=eq.'+o.id+'&select=*',{headers:h})
    const ls=await lr.json()
    setLines(Array.isArray(ls)?ls:[])
    const sel={}
    ;(Array.isArray(ls)?ls:[]).forEach(l=>{sel[l.id]=0})
    setSelected(sel)
    setLoading(false)
  }
  async function procesar(){
    const itemsADevolver=lines.filter(l=>selected[l.id]>0)
    if(itemsADevolver.length===0){setMsg('Selecciona al menos un producto a devolver');return}
    setLoading(true)
    // Reponer stock
    // FIX: Reponer stock sumando al actual
    for(const l of itemsADevolver){
      const rp=await fetch(S+'/rest/v1/products?id=eq.'+l.product_id+'&select=stock',{headers:h})
      const dp=await rp.json()
      const curStock=Array.isArray(dp)&&dp[0]?Number(dp[0].stock||0):0
      await fetch(S+'/rest/v1/products?id=eq.'+l.product_id,{method:'PATCH',headers:h,
        body:JSON.stringify({stock:curStock+Number(selected[l.id]||0)})}).catch(()=>{});
    }}).catch(()=>{})
    ))
    // Guardar registro de devolución
    const totalDev=itemsADevolver.reduce((s,l)=>s+(Number(l.unit_price||0)*selected[l.id]),0)
    await fetch(S+'/rest/v1/devoluciones',{method:'POST',headers:{...h,'Prefer':'return=minimal'},
      body:JSON.stringify({
        order_number:order.order_number,
        order_id:order.id,
        items:itemsADevolver.map(l=>({product_id:l.product_id,product_name:l.product_name,qty_dev:selected[l.id],unit_price:l.unit_price})),
        total_devuelto:totalDev,
        method:'efectivo',
        motivo:'Devolución desde admin',
        operator:'Admin',
        created_at:new Date().toISOString()
      })
    }).catch(()=>{})
    // Marcar pedido como devuelto parcialmente
    await fetch(S+'/rest/v1/orders?id=eq.'+order.id,{method:'PATCH',headers:h,
      body:JSON.stringify({status:'returned',notes:'Devolucion: '+itemsADevolver.map(l=>l.product_name+'('+selected[l.id]+')').join(', ')})})
    setMsg('Devolucion procesada. Stock repuesto. Total a reembolsar: '+totalDev.toFixed(2)+' €')
    setDone(true);setLoading(false)
  }
  const TD={padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:13,color:'rgba(255,255,255,0.8)'}
  return(
    <div style={{background:'#0d0d0d',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#080808',padding:'18px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div><h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>Devoluciones</h1>
        <p style={{margin:'3px 0 0',fontSize:12,color:'rgba(255,255,255,0.4)'}}>Busca un pedido y selecciona qué devolver</p></div>
        <Link href="/admin" style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:13}}>← Admin</Link>
      </div>
      <div style={{padding:'28px',maxWidth:900}}>
        {msg&&<div style={{background:done?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',border:'1px solid',borderColor:done?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)',padding:'12px 16px',marginBottom:16,fontSize:13,color:done?'#22c55e':'#ef4444'}}>{msg}</div>}
        <div style={{display:'flex',gap:12,marginBottom:24}}>
          <input value={num} onChange={e=>setNum(e.target.value)} onKeyDown={e=>e.key==='Enter'&&buscar()} placeholder="Número de pedido (ej: BM-ABC123)"
            style={{flex:1,padding:'12px 16px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:14,fontFamily:'Arial',outline:'none'}}/>
          <button onClick={buscar} disabled={loading}
            style={{background:'#ff1e41',color:'white',border:'none',padding:'12px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'Arial'}}>
            {loading?'Buscando...':'Buscar'}
          </button>
        </div>
        {order&&(
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.08)',padding:20,marginBottom:16}}>
            <div style={{display:'flex',gap:24,marginBottom:16,flexWrap:'wrap'}}>
              <div><div style={{fontSize:11,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:4}}>Pedido</div><div style={{fontWeight:700,color:'#ff1e41'}}>{order.order_number}</div></div>
              <div><div style={{fontSize:11,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:4}}>Cliente</div><div>{order.customer_name}</div></div>
              <div><div style={{fontSize:11,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:4}}>Total</div><div style={{fontWeight:700,color:'#22c55e'}}>{Number(order.total||0).toFixed(2)} €</div></div>
              <div><div style={{fontSize:11,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:4}}>Estado</div><div style={{fontSize:12,padding:'2px 10px',background:'rgba(255,255,255,0.06)',display:'inline-block'}}>{order.status}</div></div>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>
                <th style={{...TD,color:'rgba(255,255,255,0.4)',fontWeight:700,fontSize:11,textTransform:'uppercase'}}>Producto</th>
                <th style={{...TD,color:'rgba(255,255,255,0.4)',fontWeight:700,fontSize:11,textTransform:'uppercase',textAlign:'center'}}>Comprado</th>
                <th style={{...TD,color:'rgba(255,255,255,0.4)',fontWeight:700,fontSize:11,textTransform:'uppercase',textAlign:'center'}}>A devolver</th>
                <th style={{...TD,color:'rgba(255,255,255,0.4)',fontWeight:700,fontSize:11,textTransform:'uppercase',textAlign:'right'}}>Reembolso</th>
              </tr></thead>
              <tbody>
                {lines.map(l=>(
                  <tr key={l.id}>
                    <td style={TD}>{l.product_name}</td>
                    <td style={{...TD,textAlign:'center'}}>{l.quantity}</td>
                    <td style={{...TD,textAlign:'center'}}>
                      <input type="number" min={0} max={l.quantity} value={selected[l.id]||0}
                        onChange={e=>setSelected(s=>({...s,[l.id]:Math.min(l.quantity,Math.max(0,parseInt(e.target.value)||0))}))}
                        style={{width:60,padding:'4px 8px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:13,fontFamily:'Arial',textAlign:'center',outline:'none'}}/>
                    </td>
                    <td style={{...TD,textAlign:'right',color:'#22c55e',fontWeight:700}}>
                      {(Number(l.unit_price||0)*(selected[l.id]||0)).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:16,fontWeight:700,color:'#22c55e'}}>
                Total a reembolsar: {lines.reduce((s,l)=>s+(Number(l.unit_price||0)*(selected[l.id]||0)),0).toFixed(2)} €
              </div>
              {!done&&<button onClick={procesar} disabled={loading}
                style={{background:'#22c55e',color:'white',border:'none',padding:'12px 28px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'Arial'}}>
                Procesar devolución
              </button>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
      }
