// @ts-nocheck
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const H={apikey:K,'Authorization':'Bearer '+K}
const PER=50
const sc=s=>s===0?'#ef4444':s<=10?'#f59e0b':'#22c55e'
const inp={padding:'7px 10px',border:'1px solid #333',background:'#1a1a1a',color:'white',fontSize:13,borderRadius:4,width:'100%',fontFamily:'inherit',boxSizing:'border-box'}

export default function AdminProductos(){
  const[prods,setProds]=useState([])
  const[cats,setCats]=useState([])
  const[variants,setVariants]=useState([])
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
      fetch(S+'/rest/v1/products?select=id,name,price_incl_tax,sale_price,stock,active,brand,image_url,category_id,description&order=name.asc'+q+'&limit='+PER+'&offset='+(page*PER),{headers:H}),
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

  async function openEdit(p){
    setEditing({...p})
    // Cargar variantes del producto
    const r=await fetch(S+'/rest/v1/product_variants?select=id,stock,price_modifier,attribute_values(id,value,attribute_types(name))&product_id=eq.'+p.id+'&active=eq.true',{headers:H})
    const v=await r.json()
    setVariants(Array.isArray(v)?v.map(x=>({
      id:x.id,
      stock:x.stock,
      price_modifier:x.price_modifier||0,
      value:x.attribute_values?.value||'',
      type:x.attribute_values?.attribute_types?.name||'Variante',
      attr_val_id:x.attribute_values?.id
    })):[])
  }

  async function save(){
    if(!editing) return
    setSaving(true)
    // Guardar producto
    await fetch(S+'/rest/v1/products?id=eq.'+editing.id,{
      method:'PATCH',
      headers:{...H,'Content-Type':'application/json'},
      body:JSON.stringify({
        name:editing.name,
        brand:editing.brand,
        price_incl_tax:Number(editing.price_incl_tax),
        sale_price:editing.sale_price?Number(editing.sale_price):null,
        stock:editing.stock,
        active:editing.active,
        image_url:editing.image_url||null,
        description:editing.description||null,
        category_id:editing.category_id||null
      })
    })
    // Guardar stock de variantes
    for(const v of variants){
      if(v.id){
        await fetch(S+'/rest/v1/product_variants?id=eq.'+v.id,{
          method:'PATCH',
          headers:{...H,'Content-Type':'application/json'},
          body:JSON.stringify({stock:parseInt(v.stock)||0,price_modifier:parseFloat(v.price_modifier)||0})
        })
      }
    }
    setSaving(false)
    setEditing(null)
    setVariants([])
    setMsg('Guardado correctamente')
    setTimeout(()=>setMsg(''),3000)
    load()
  }

  async function toggleActive(p){
    await fetch(S+'/rest/v1/products?id=eq.'+p.id,{method:'PATCH',headers:{...H,'Content-Type':'application/json'},body:JSON.stringify({active:!p.active})})
    setProds(ps=>(ps||[]).map(x=>x.id===p.id?{...x,active:!p.active}:x))
  }

  const pages=Math.ceil(total/PER)

  return(
    <div style={{background:'#0f0f0f',minHeight:'100vh',color:'white',fontFamily:'Arial,sans-serif'}}>

      {/* MODAL EDICION */}
      {editing&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#1a1a1a',borderRadius:8,width:'100%',maxWidth:800,maxHeight:'90vh',overflowY:'auto',border:'1px solid #333'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid #333',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:'#1a1a1a',zIndex:1}}>
              <h2 style={{margin:0,fontSize:16,fontWeight:800,color:'#ff1e41'}}>Editar: {editing.name?.slice(0,40)}</h2>
              <button onClick={()=>{setEditing(null);setVariants([])}} style={{background:'none',border:'none',color:'#888',fontSize:22,cursor:'pointer',lineHeight:1}}>x</button>
            </div>
            <div style={{padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>

              {/* Nombre */}
              <div style={{gridColumn:'1/-1'}}>
                <label style={{display:'block',fontSize:11,color:'#888',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>Nombre *</label>
                <input value={editing.name||''} onChange={e=>setEditing(v=>({...v,name:e.target.value}))} style={inp}/>
              </div>

              {/* Marca */}
              <div>
                <label style={{display:'block',fontSize:11,color:'#888',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>Marca</label>
                <input value={editing.brand||''} onChange={e=>setEditing(v=>({...v,brand:e.target.value}))} style={inp}/>
              </div>

              {/* Categoría */}
              <div>
                <label style={{display:'block',fontSize:11,color:'#888',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>Categoria</label>
                <select value={editing.category_id||''} onChange={e=>setEditing(v=>({...v,category_id:e.target.value||null}))} style={{...inp,cursor:'pointer'}}>
                  <option value=''>Sin categoria</option>
                  {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* PVP */}
              <div>
                <label style={{display:'block',fontSize:11,color:'#888',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>PVP (EUR incl. IVA) *</label>
                <input type='number' step='0.01' min='0' value={editing.price_incl_tax||''} onChange={e=>setEditing(v=>({...v,price_incl_tax:e.target.value}))} style={inp}/>
              </div>

              {/* Precio oferta */}
              <div>
                <label style={{display:'block',fontSize:11,color:'#888',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>Precio oferta (EUR)</label>
                <input type='number' step='0.01' min='0' value={editing.sale_price||''} onChange={e=>setEditing(v=>({...v,sale_price:e.target.value||null}))} style={inp} placeholder='Vacio = sin oferta'/>
              </div>

              {/* Stock general */}
              <div>
                <label style={{display:'block',fontSize:11,color:'#888',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>Stock general</label>
                <input type='number' min='0' value={editing.stock||0} onChange={e=>setEditing(v=>({...v,stock:parseInt(e.target.value)||0}))} style={inp}/>
              </div>

              {/* Activo */}
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <label style={{fontSize:11,color:'#888',fontWeight:700,textTransform:'uppercase'}}>Estado</label>
                <button onClick={()=>setEditing(v=>({...v,active:!v.active}))}
                  style={{padding:'7px 16px',borderRadius:20,border:'none',cursor:'pointer',fontSize:12,fontWeight:700,
                    background:editing.active?'#14532d':'#450a0a',color:editing.active?'#86efac':'#fca5a5'}}>
                  {editing.active?'Activo':'Inactivo'}
                </button>
              </div>

              {/* Imagen URL */}
              <div style={{gridColumn:'1/-1'}}>
                <label style={{display:'block',fontSize:11,color:'#888',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>URL Imagen</label>
                <input value={editing.image_url||''} onChange={e=>setEditing(v=>({...v,image_url:e.target.value}))} style={inp} placeholder='https://...'/>
                {editing.image_url&&<img src={editing.image_url} alt='' style={{marginTop:8,height:80,objectFit:'contain',background:'#111',borderRadius:4,padding:4}}/>}
              </div>

              {/* Descripcion */}
              <div style={{gridColumn:'1/-1'}}>
                <label style={{display:'block',fontSize:11,color:'#888',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>Descripcion</label>
                <textarea value={editing.description||''} onChange={e=>setEditing(v=>({...v,description:e.target.value}))} rows={4} style={{...inp,resize:'vertical'}}/>
              </div>

              {/* Variantes */}
              {variants.length>0&&(
                <div style={{gridColumn:'1/-1'}}>
                  <label style={{display:'block',fontSize:11,color:'#888',marginBottom:8,fontWeight:700,textTransform:'uppercase'}}>Variantes ({variants.length})</label>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {variants.map((v,i)=>(
                      <div key={v.id} style={{display:'grid',gridTemplateColumns:'1fr 100px 100px',gap:8,alignItems:'center',padding:'8px 10px',background:'#111',borderRadius:4,border:'1px solid #2a2a2a'}}>
                        <div style={{fontSize:13,color:'#ddd'}}><span style={{color:'#888',fontSize:11}}>{v.type}: </span>{v.value}</div>
                        <div>
                          <label style={{display:'block',fontSize:10,color:'#888',marginBottom:2}}>Stock</label>
                          <input type='number' min='0' value={v.stock} onChange={e=>{const nv=[...variants];nv[i]={...nv[i],stock:e.target.value};setVariants(nv)}} style={{...inp,padding:'4px 6px',fontSize:12}}/>
                        </div>
                        <div>
                          <label style={{display:'block',fontSize:10,color:'#888',marginBottom:2}}>+/- EUR</label>
                          <input type='number' step='0.01' value={v.price_modifier} onChange={e=>{const nv=[...variants];nv[i]={...nv[i],price_modifier:e.target.value};setVariants(nv)}} style={{...inp,padding:'4px 6px',fontSize:12}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div style={{padding:'12px 20px',borderTop:'1px solid #333',display:'flex',gap:10,justifyContent:'flex-end',position:'sticky',bottom:0,background:'#1a1a1a'}}>
              <button onClick={()=>{setEditing(null);setVariants([])}} style={{padding:'9px 20px',background:'#333',border:'none',color:'#aaa',borderRadius:4,cursor:'pointer',fontSize:13}}>
                Cancelar
              </button>
              <button onClick={save} disabled={saving}
                style={{padding:'9px 24px',background:'#ff1e41',border:'none',color:'white',borderRadius:4,cursor:'pointer',fontSize:13,fontWeight:700,opacity:saving?0.6:1}}>
                {saving?'Guardando...':'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{background:'#0a0a0a',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #222'}}>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase',color:'#ff1e41'}}>Gestion de Productos</h1>
          <p style={{margin:'3px 0 0',fontSize:12,color:'#888'}}>{total} productos en total</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          {msg&&<span style={{color:'#22c55e',fontSize:13,fontWeight:700}}>{msg}</span>}
          <Link href='/admin/nuevo-producto' style={{background:'#ff1e41',color:'white',padding:'8px 16px',borderRadius:4,textDecoration:'none',fontSize:13,fontWeight:700}}>+ Nuevo</Link>
          <Link href='/admin' style={{color:'#888',fontSize:13,textDecoration:'none'}}>Admin</Link>
        </div>
      </div>

      {/* FILTROS */}
      <div style={{padding:'14px 24px',display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',borderBottom:'1px solid #222',background:'#111'}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} placeholder='Buscar producto...' style={{...inp,width:280}}/>
        {[['all','Todos'],['active','Activos'],['inactive','Inactivos'],['nostock','Sin stock']].map(([f,l])=>(
          <button key={f} onClick={()=>{setFilter(f);setPage(0)}}
            style={{padding:'7px 14px',border:'none',borderRadius:4,cursor:'pointer',fontSize:12,fontWeight:700,
              background:filter===f?'#ff1e41':'#222',color:filter===f?'white':'#aaa'}}>
            {l}
          </button>
        ))}
      </div>

      {/* TABLA */}
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{background:'#0a0a0a',borderBottom:'1px solid #2a2a2a'}}>
              {['Img','Nombre / ID','Marca','PVP','Oferta','Stock','Estado','Acciones'].map(h=>(
                <th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:10,fontWeight:700,color:'#666',textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(prods||[]).map(p=>(
              <tr key={p.id} style={{borderBottom:'1px solid #1a1a1a',transition:'background 0.1s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#151515'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'8px 12px',width:52}}>
                  {p.image_url
                    ?<img src={p.image_url} alt='' style={{width:44,height:44,objectFit:'contain',borderRadius:4,background:'#222'}}/>
                    :<div style={{width:44,height:44,background:'#222',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📦</div>}
                </td>
                <td style={{padding:'8px 12px',maxWidth:240}}>
                  <div style={{fontWeight:600,color:'white',fontSize:13,lineHeight:1.3}}>{p.name}</div>
                  <div style={{fontSize:11,color:'#555',marginTop:2}}>#{p.id}</div>
                </td>
                <td style={{padding:'8px 12px',color:'#888',fontSize:12}}>{p.brand||'—'}</td>
                <td style={{padding:'8px 12px'}}>
                  <span style={{color:'#ff1e41',fontWeight:700}}>{Number(p.price_incl_tax).toFixed(2)} EUR</span>
                </td>
                <td style={{padding:'8px 12px'}}>
                  {p.sale_price?<span style={{color:'#22c55e',fontWeight:600}}>{Number(p.sale_price).toFixed(2)}</span>:<span style={{color:'#444'}}>—</span>}
                </td>
                <td style={{padding:'8px 12px'}}>
                  <span style={{color:sc(p.stock),fontWeight:700,fontSize:14}}>{p.stock}</span>
                </td>
                <td style={{padding:'8px 12px'}}>
                  <button onClick={()=>toggleActive(p)}
                    style={{padding:'4px 12px',borderRadius:20,border:'none',cursor:'pointer',fontSize:11,fontWeight:700,
                      background:p.active?'#14532d':'#450a0a',color:p.active?'#86efac':'#fca5a5'}}>
                    {p.active?'Activo':'Inactivo'}
                  </button>
                </td>
                <td style={{padding:'8px 12px'}}>
                  <button onClick={()=>openEdit(p)}
                    style={{padding:'6px 14px',background:'#1d4ed8',border:'none',color:'white',borderRadius:4,cursor:'pointer',fontSize:12,fontWeight:700}}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {prods.length===0&&(
          <div style={{textAlign:'center',padding:'40px',color:'#555',fontSize:14}}>No hay productos</div>
        )}
      </div>

      {/* PAGINACION */}
      {pages>1&&(
        <div style={{display:'flex',justifyContent:'center',gap:6,padding:'20px',flexWrap:'wrap'}}>
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
