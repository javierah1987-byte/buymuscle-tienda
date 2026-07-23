// @ts-nocheck
'use client'
import{useState}from 'react'
import Link from 'next/link'
import { authHeaders } from '@/lib/supabaseBrowser'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
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
    const r=await fetch(S+'/rest/v1/orders?order_number=eq.'+num.trim().toUpperCase()+'&select=*',{headers:await authHeaders({'Content-Type':'application/json'})})
    const d=await r.json()
    const o=Array.isArray(d)&&d.length>0?d[0]:null
    if(!o){setMsg('Pedido no encontrado');setLoading(false);return}
    setOrder(o)
    const lr=await fetch(S+'/rest/v1/order_lines?order_id=eq.'+o.id+'&select=*',{headers:await authHeaders({'Content-Type':'application/json'})})
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
    setLoading(true);setMsg('')
    try{
      // Procesar en servidor: registra la devolución, repone stock y genera
      // la rectificativa en Holded (service role en /api/tpv-return).
      const r=await fetch('/api/tpv-return',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          order_number:order.order_number,
          items:itemsADevolver.map(l=>({line_id:l.id,product_id:l.product_id,product_name:l.product_name,qty_dev:Number(selected[l.id]||0),unit_price:l.unit_price})),
          method:'efectivo',
          motivo:'Devolución desde admin'
        })})
      const d=await r.json().catch(()=>({}))
      if(!r.ok||!d.ok){
        setMsg('Error al procesar la devolución: '+(d.error||('HTTP '+r.status)))
        setLoading(false)
        return
      }
      // Marcar pedido como devuelto (funciona con la sesión admin vía RLS)
      await fetch(S+'/rest/v1/orders?id=eq.'+order.id,{method:'PATCH',headers:await authHeaders({'Content-Type':'application/json'}),
        body:JSON.stringify({status:'returned',notes:'Devolucion: '+itemsADevolver.map(l=>l.product_name+'('+selected[l.id]+')').join(', ')})}).catch(()=>{})
      setMsg('Devolución procesada. Stock repuesto'+(d.creditNoteId?' y rectificativa creada en Holded':'')+'. Total a reembolsar: '+Number(d.total||0).toFixed(2)+' €')
      setDone(true)
    }catch(e){
      setMsg('Error al procesar la devolución: '+String(e?.message||e))
    }
    setLoading(false)
  }
  const TD={padding:'10px 12px',borderBottom:'1px solid #f3f3f3',fontSize:13,color:'#3a3a3a'}
  return(
    <div style={{background:'#f4f5f7',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'#111'}}>
      <div style={{background:'#ffffff',padding:'18px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #eaeaea'}}>
        <div><h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>Devoluciones</h1>
        <p style={{margin:'3px 0 0',fontSize:12,color:'#888888'}}>Busca un pedido y selecciona qué devolver</p></div>
        <Link href="/admin" style={{color:'#888888',textDecoration:'none',fontSize:13}}>← Admin</Link>
      </div>
      <div style={{padding:'28px',maxWidth:900}}>
        {msg&&<div style={{background:done?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',border:'1px solid',borderColor:done?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)',padding:'12px 16px',marginBottom:16,fontSize:13,color:done?'#22c55e':'#ef4444'}}>{msg}</div>}
        <div style={{display:'flex',gap:12,marginBottom:24}}>
          <input value={num} onChange={e=>setNum(e.target.value)} onKeyDown={e=>e.key==='Enter'&&buscar()} placeholder="Número de pedido (ej: BM-ABC123)"
            style={{flex:1,padding:'12px 16px',background:'#f3f3f3',border:'1px solid #e0e0e0',color:'#111',fontSize:14,fontFamily:'Arial',outline:'none'}}/>
          <button onClick={buscar} disabled={loading}
            style={{background:'#ff1e41',color:'#111',border:'none',padding:'12px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'Arial'}}>
            {loading?'Buscando...':'Buscar'}
          </button>
        </div>
        {order&&(
          <div style={{background:'#ffffff',border:'1px solid #e6e6e6',padding:20,marginBottom:16}}>
            <div style={{display:'flex',gap:24,marginBottom:16,flexWrap:'wrap'}}>
              <div><div style={{fontSize:11,color:'#888888',textTransform:'uppercase',marginBottom:4}}>Pedido</div><div style={{fontWeight:700,color:'#ff1e41'}}>{order.order_number}</div></div>
              <div><div style={{fontSize:11,color:'#888888',textTransform:'uppercase',marginBottom:4}}>Cliente</div><div>{order.customer_name}</div></div>
              <div><div style={{fontSize:11,color:'#888888',textTransform:'uppercase',marginBottom:4}}>Total</div><div style={{fontWeight:700,color:'#22c55e'}}>{Number(order.total||0).toFixed(2)} €</div></div>
              <div><div style={{fontSize:11,color:'#888888',textTransform:'uppercase',marginBottom:4}}>Estado</div><div style={{fontSize:12,padding:'2px 10px',background:'#eaeaea',display:'inline-block'}}>{order.status}</div></div>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>
                <th style={{...TD,color:'#888888',fontWeight:700,fontSize:11,textTransform:'uppercase'}}>Producto</th>
                <th style={{...TD,color:'#888888',fontWeight:700,fontSize:11,textTransform:'uppercase',textAlign:'center'}}>Comprado</th>
                <th style={{...TD,color:'#888888',fontWeight:700,fontSize:11,textTransform:'uppercase',textAlign:'center'}}>A devolver</th>
                <th style={{...TD,color:'#888888',fontWeight:700,fontSize:11,textTransform:'uppercase',textAlign:'right'}}>Reembolso</th>
              </tr></thead>
              <tbody>
                {lines.map(l=>(
                  <tr key={l.id}>
                    <td style={TD}>{l.product_name}</td>
                    <td style={{...TD,textAlign:'center'}}>{l.quantity}</td>
                    <td style={{...TD,textAlign:'center'}}>
                      <input type="number" min={0} max={l.quantity} value={selected[l.id]||0}
                        onChange={e=>setSelected(s=>({...s,[l.id]:Math.min(l.quantity,Math.max(0,parseInt(e.target.value)||0))}))}
                        style={{width:60,padding:'4px 8px',background:'#f3f3f3',border:'1px solid #e0e0e0',color:'#111',fontSize:13,fontFamily:'Arial',textAlign:'center',outline:'none'}}/>
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
                style={{background:'#22c55e',color:'#111',border:'none',padding:'12px 28px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'Arial'}}>
                Procesar devolución
              </button>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
      }
