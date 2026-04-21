// @ts-nocheck
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const H={apikey:K,'Authorization':'Bearer '+K}
const PER=50
const sc=s=>s===0?'#ef4444':s<=10?'#f59e0b':'#22c55e'

export default function AdminProductos(){
  const[prods,setProds]=useState([])
  const[cats,setCats]=useState([])
  const[search,setSearch]=useState('')
  const[editing,setEditing]=useState(null)
  const[saving,setSaving]=useState(false)
  const[page,setPage]=useState(0)
  const[total,setTotal]=useState(0)
  const[filter,setFilter]=useState('all')
  const[msg,setMsg]=useState('')

  const load=useCallback(async()=>{
    let q=''
    if(search) q+='&name=ilike.*'+encodeURIComponent(search)+'*'
    if(filter==='active') q+='&active=eq.true'
    if(filter==='inactive') q+='&active=eq.false'
    if(filter==='nostock') q+='&stock=eq.0'
    const[r1,r2]=await Promise.all([
      fetch(S+'/rest/v1/products?select=id,name,price_incl_tax,sale_price,stock,active,brand,image_url,category_id&order=name.asc'+q+'&limit='+PER+'&offset='+(page*PER),{headers:H}),
      fetch(S+'/rest/v1/products?select=count'+q,{headers:{...H,'Prefer':'count=exact','Range':'0-0'}})
    ])
    const d=await r1.json()
    setProds(Array.isArray(d)?d:[])
    const ct=r2.headers.get('content-range')
    if(ct) setTotal(parseInt(ct.split('/')[1]||'0'))
  },[search,page,filter])

  useEffect(()=>{load()},[load])

  useEffect(()=>{
    fetch(S+'/rest/v1/categories?select=id,name&order=name.asc',{headers:H})
      .then(r=>r.json()).then(d=>setCats(Array.isArray(d)?d:[]))
  },[])

  async function save(id,fields){
    setSaving(true)
    await fetch(S+'/rest/v1/products?id=eq.'+id,{method:'PATCH',headers:{...H,'Content-Type':'application/json'},body:JSON.stringify(fields)})
    setSaving(false)
    setEditing(null)
    setMsg('Guardado')
    setTimeout(()=>setMsg(''),2000)
    load()
  }

  async function toggleActive(p){
    await fetch(S+'/rest/v1/products?id=eq.'+p.id,{method:'PATCH',headers:{...H,'Content-Type':'application/json'},body:JSON.stringify({active:!p.active})})
    setProds(ps=>(ps||[]).map(x=>x.id===p.id?{...x,active:!p.active}:x))
  }

  const pages=Math.ceil(total/PER)

  const inp={padding:'6px 8px',border:'1px solid #444',background:'#1a1a1a',color:'white',fontSize:12,borderRadius:3,width:'100%',fontFamily:'inherit'}

  return(
    <div style={{background:'#111',minHeight:'100vh',color:'white'}}>
      <div style={{background:'#0a0a0a',padding:'18px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #222'}}>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase',color:'#ff1e41'}}>Gestion de Productos</h1>
          <p style={{margin:'4px 0 0',fontSize:12,color:'#888'}}>{total} productos en total</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          {msg&&<span style={{color:'#22c55e',fontSize:13}}>{msg}</span>}
          <Link href="/admin/nuevo-producto" style={{background:'#ff1e41',color:'white',padding:'8px 16px',borderRadius:4,textDecoration:'none',fontSize:13,fontWeight:700}}>+ Nuevo producto</Link>
          <Link href="/admin" style={{color:'#888',fontSize:13,textDecoration:'none'}}>Admin</Link>
        </div>
      </div>

      {/* Filtros */}
      <div style={{padding:'16px 24px',display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',borderBottom:'1px solid #222'}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} placeholder="Buscar producto..." style={{...inp,width:260,padding:'8px 12px'}}/>
        {['all','active','inactive','nostock'].map(f=>(
          <button key={f} onClick={()=>{setFilter(f);setPage(0)}}
            style={{padding:'7px 14px',border:'none',borderRadius:4,cursor:'pointer',fontSize:12,fontWeight:700,
              background:filter===f?'#ff1e41':'#222',color:filter===f?'white':'#aaa'}}>
            {f==='all'?'Todos':f==='active'?'Activos':f==='inactive'?'Inactivos':'Sin stock'}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{background:'#0a0a0a',borderBottom:'1px solid #333'}}>
              {['Img','Nombre','Marca','PVP','Oferta','Stock','Estado','Acciones'].map(h=>(
                <th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(prods||[]).map(p=>(
              <tr key={p.id} style={{borderBottom:'1px solid #1a1a1a',background:editing?.id===p.id?'#1a1a1a':'transparent'}}>
                <td style={{padding:'8px 12px'}}>
                  {p.image_url?<img src={p.image_url} alt="" style={{width:40,height:40,objectFit:'contain',borderRadius:4,background:'#222'}}/>:<span style={{fontSize:24}}>📦</span>}
                </td>
                <td style={{padding:'8px 12px',maxWidth:220}}>
                  {editing?.id===p.id?(
                    <input value={editing.name} onChange={e=>setEditing(v=>({...v,name:e.target.value}))} style={inp}/>
                  ):(
                    <div>
                      <div style={{fontWeight:600,color:'white',fontSize:13}}>{p.name}</div>
                      <div style={{fontSize:11,color:'#888'}}>#{p.id}</div>
                    </div>
                  )}
                </td>
                <td style={{padding:'8px 12px',color:'#aaa'}}>
                  {editing?.id===p.id?(
                    <input value={editing.brand||''} onChange={e=>setEditing(v=>({...v,brand:e.target.value}))} style={{...inp,width:100}}/>
                  ):p.brand||'-'}
                </td>
                <td style={{padding:'8px 12px'}}>
                  {editing?.id===p.id?(
                    <input type="number" step="0.01" value={editing.price_incl_tax} onChange={e=>setEditing(v=>({...v,price_incl_tax:e.target.value}))} style={{...inp,width:80}}/>
                  ):<span style={{color:'#ff1e41',fontWeight:700}}>{Number(p.price_incl_tax).toFixed(2)} EUR</span>}
                </td>
                <td style={{padding:'8px 12px',color:'#888'}}>
                  {editing?.id===p.id?(
                    <input type="number" step="0.01" value={editing.sale_price||''} onChange={e=>setEditing(v=>({...v,sale_price:e.target.value||null}))} style={{...inp,width:80}} placeholder="0"/>
                  ):p.sale_price?<span style={{color:'#22c55e'}}>{Number(p.sale_price).toFixed(2)}</span>:'-'}
                </td>
                <td style={{padding:'8px 12px'}}>
                  {editing?.id===p.id?(
                    <input type="number" min="0" value={editing.stock} onChange={e=>setEditing(v=>({...v,stock:parseInt(e.target.value)||0}))} style={{...inp,width:70}}/>
                  ):<span style={{color:sc(p.stock),fontWeight:700}}>{p.stock}</span>}
                </td>
                <td style={{padding:'8px 12px'}}>
                  <button onClick={()=>toggleActive(p)}
                    style={{padding:'4px 10px',borderRadius:20,border:'none',cursor:'pointer',fontSize:11,fontWeight:700,
                      background:p.active?'#14532d':'#450a0a',color:p.active?'#86efac':'#fca5a5'}}>
                    {p.active?'Activo':'Inactivo'}
                  </button>
                </td>
                <td style={{padding:'8px 12px'}}>
                  {editing?.id===p.id?(
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>save(p.id,{name:editing.name,brand:editing.brand,price_incl_tax:Number(editing.price_incl_tax),sale_price:editing.sale_price?Number(editing.sale_price):null,stock:editing.stock})} disabled={saving}
                        style={{padding:'5px 12px',background:'#22c55e',border:'none',color:'white',borderRadius:4,cursor:'pointer',fontSize:12,fontWeight:700}}>
                        {saving?'...':'Guardar'}
                      </button>
                      <button onClick={()=>setEditing(null)}
                        style={{padding:'5px 10px',background:'#333',border:'none',color:'#aaa',borderRadius:4,cursor:'pointer',fontSize:12}}>
                        X
                      </button>
                    </div>
                  ):(
                    <button onClick={()=>setEditing({...p})}
                      style={{padding:'5px 12px',background:'#1d4ed8',border:'none',color:'white',borderRadius:4,cursor:'pointer',fontSize:12,fontWeight:700}}>
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginacion */}
      {pages>1&&(
        <div style={{display:'flex',justifyContent:'center',gap:8,padding:'20px',flexWrap:'wrap'}}>
          {Array.from({length:Math.min(pages,20)},(_,i)=>(
            <button key={i} onClick={()=>setPage(i)}
              style={{width:36,height:36,border:'none',borderRadius:4,cursor:'pointer',fontWeight:700,fontSize:13,
                background:page===i?'#ff1e41':'#222',color:page===i?'white':'#aaa'}}>
              {i+1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
