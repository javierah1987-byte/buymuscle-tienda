// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

export default function AdminProductos(){
  const[products,setProducts]=useState([])
  const[search,setSearch]=useState('')
  const[editing,setEditing]=useState(null)
  const[saving,setSaving]=useState(false)
  const[page,setPage]=useState(0)
  const[total,setTotal]=useState(0)
  const[msg,setMsg]=useState('')
  const PER=20

  useEffect(()=>{load()},[page,search])

  async function load(){
    const q=search?'&name=ilike.*'+encodeURIComponent(search)+'*':''
    const [r1,r2]=await Promise.all([
      fetch(S+'/rest/v1/products?select=id,name,price_incl_tax,sale_price,stock,active,category,image_url,brand&order=name.asc'+q+'&limit='+PER+'&offset='+(page*PER),{headers:{'apikey':K,'Authorization':'Bearer '+K}}),
      fetch(S+'/rest/v1/products?select=count'+q,{headers:{'apikey':K,'Authorization':'Bearer '+K,'Prefer':'count=exact','Range':'0-0'}})
    ])
    const d=await r1.json();setProducts(d||[])
    const ct=r2.headers.get('content-range');
    if(ct) setTotal(parseInt(ct.split('/')[1]||'0'))
  }

  async function save(id,fields){
    setSaving(true)
    await fetch(S+'/rest/v1/products?id=eq.'+id,{
      method:'PATCH',headers:{'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json'},
      body:JSON.stringify(fields)
    })
    setMsg('✅ Guardado')
    setTimeout(()=>setMsg(''),2500)
    setSaving(false);setEditing(null);load()
  }

  async function toggleActive(p){
    await fetch(S+'/rest/v1/products?id=eq.'+p.id,{
      method:'PATCH',headers:{'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json'},
      body:JSON.stringify({active:!p.active})
    })
    setProducts(ps=>ps.map(x=>x.id===p.id?{...x,active:!p.active}:x))
  }

  const pages=Math.ceil(total/PER)
  const stockColor=s=>s===0?'#ef4444':s<=10?'#f59e0b':'#22c55e'

  return(
    <div style={{background:'#111',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#0a0a0a',padding:'20px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div>
          <h1 style={{margin:0,fontSize:20,fontWeight:900,textTransform:'uppercase'}}>📦 Gestión de Productos</h1>
          <p style={{margin:'4px 0 0',fontSize:12,color:'rgba(255,255,255,0.4)'}}>{total} productos en total</p>
        </div>
        <a href="/admin" style={{color:'rgba(255,255,255,0.5)',textDecoration:'none',fontSize:13}}>← Volver al admin</a>
      </div>

      <div style={{padding:'20px 32px'}}>
        {msg&&<div style={{background:'#166534',padding:'10px 16px',marginBottom:16,fontSize:13,borderRadius:4}}>{msg}</div>}

        {/* Buscador */}
        <div style={{marginBottom:20,display:'flex',gap:12,alignItems:'center'}}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} placeholder="Buscar producto..."
            style={{flex:1,padding:'10px 14px',background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:14,fontFamily:'inherit'}}/>
          <span style={{fontSize:13,color:'rgba(255,255,255,0.4)'}}>Página {page+1}/{pages||1}</span>
        </div>

        {/* Tabla */}
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                {['Imagen','Nombre','Categoría','Precio','Stock','Activo','Acciones'].map(h=>(
                  <th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,textTransform:'uppercase',color:'rgba(255,255,255,0.4)',letterSpacing:'0.08em'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p=>(
                <tr key={p.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 0.1s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'10px 12px',width:56}}>
                    {p.image_url?<img src={p.image_url} alt={p.name} style={{width:44,height:44,objectFit:'contain',background:'#1a1a1a'}}/>
                    :<div style={{width:44,height:44,background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📦</div>}
                  </td>
                  <td style={{padding:'10px 12px'}}>
                    {editing===p.id?(
                      <input defaultValue={p.name} id={'name_'+p.id}
                        style={{background:'#1a1a1a',border:'1px solid #ff1e41',color:'white',padding:'4px 8px',fontSize:13,width:'100%',fontFamily:'inherit'}}/>
                    ):<span style={{fontSize:13,color:'rgba(255,255,255,0.85)',fontWeight:600}}>{p.name}</span>}
                  </td>
                  <td style={{padding:'10px 12px',fontSize:12,color:'rgba(255,255,255,0.5)'}}>{p.category}</td>
                  <td style={{padding:'10px 12px'}}>
                    {editing===p.id?(
                      <div style={{display:'flex',flexDirection:'column',gap:4}}>
                        <input defaultValue={p.price_incl_tax} id={'price_'+p.id} placeholder="PVP" type="number" step="0.01"
                          style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.1)',color:'white',padding:'4px 8px',fontSize:12,width:90,fontFamily:'inherit'}}/>
                        <input defaultValue={p.sale_price||''} id={'sale_'+p.id} placeholder="Oferta" type="number" step="0.01"
                          style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.1)',color:'#ff1e41',padding:'4px 8px',fontSize:12,width:90,fontFamily:'inherit'}}/>
                      </div>
                    ):(
                      <div>
                        {p.sale_price&&p.sale_price<p.price_incl_tax&&<span style={{color:'#ff1e41',fontWeight:700,fontSize:14}}>{Number(p.sale_price).toFixed(2)} €</span>}
                        <div style={{fontSize:p.sale_price&&p.sale_price<p.price_incl_tax?11:14,color:p.sale_price&&p.sale_price<p.price_incl_tax?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.85)',textDecoration:p.sale_price&&p.sale_price<p.price_incl_tax?'line-through':'none',fontWeight:700}}>
                          {Number(p.price_incl_tax).toFixed(2)} €
                        </div>
                      </div>
                    )}
                  </td>
                  <td style={{padding:'10px 12px'}}>
                    {editing===p.id?(
                      <input defaultValue={p.stock} id={'stock_'+p.id} type="number"
                        style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.1)',color:'white',padding:'4px 8px',fontSize:13,width:70,fontFamily:'inherit'}}/>
                    ):(
                      <span style={{fontSize:13,fontWeight:700,color:stockColor(p.stock||0)}}>
                        {p.stock===0?'❌ Agotado':p.stock<=10?'⚠️ '+p.stock:p.stock}
                      </span>
                    )}
                  </td>
                  <td style={{padding:'10px 12px'}}>
                    <button onClick={()=>toggleActive(p)}
                      style={{padding:'4px 12px',border:'none',background:p.active?'#166534':'#7f1d1d',color:'white',fontSize:12,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
                      {p.active?'✓ Activo':'✗ Oculto'}
                    </button>
                  </td>
                  <td style={{padding:'10px 12px'}}>
                    {editing===p.id?(
                      <div style={{display:'flex',gap:6}}>
                        <button onClick={()=>save(p.id,{
                          name:document.getElementById('name_'+p.id)?.value,
                          price_incl_tax:parseFloat(document.getElementById('price_'+p.id)?.value)||p.price_incl_tax,
                          sale_price:document.getElementById('sale_'+p.id)?.value?parseFloat(document.getElementById('sale_'+p.id).value):null,
                          stock:parseInt(document.getElementById('stock_'+p.id)?.value)||0
                        })} disabled={saving}
                          style={{padding:'5px 12px',border:'none',background:'#ff1e41',color:'white',fontSize:12,cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>
                          {saving?'...':'Guardar'}
                        </button>
                        <button onClick={()=>setEditing(null)}
                          style={{padding:'5px 10px',border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'rgba(255,255,255,0.5)',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
                          ✕
                        </button>
                      </div>
                    ):(
                      <button onClick={()=>setEditing(p.id)}
                        style={{padding:'5px 12px',border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'rgba(255,255,255,0.7)',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
                        ✏️ Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:24}}>
          <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}
            style={{padding:'8px 16px',border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'white',cursor:'pointer',fontFamily:'inherit',opacity:page===0?0.3:1}}>
            ← Anterior
          </button>
          {Array.from({length:Math.min(5,pages)}).map((_,i)=>{
            const pg=Math.max(0,page-2)+i
            if(pg>=pages) return null
            return(
              <button key={pg} onClick={()=>setPage(pg)}
                style={{padding:'8px 14px',border:'1px solid',borderColor:pg===page?'#ff1e41':'rgba(255,255,255,0.15)',background:pg===page?'#ff1e41':'transparent',color:'white',cursor:'pointer',fontFamily:'inherit',fontWeight:pg===page?700:400}}>
                {pg+1}
              </button>
            )
          })}
          <button onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page>=pages-1}
            style={{padding:'8px 16px',border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'white',cursor:'pointer',fontFamily:'inherit',opacity:page>=pages-1?0.3:1}}>
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  )
    }
