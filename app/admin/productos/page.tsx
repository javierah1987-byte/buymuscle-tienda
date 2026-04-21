// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K}
const sc=s=>s===0?'#ef4444':s<=10?'#f59e0b':'#22c55e'
export default function AdminProductos(){
  const[prods,setProds]=useState([])
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
    const[r1,r2]=await Promise.all([
      fetch(S+'/rest/v1/products?select=id,name,price_incl_tax,sale_price,stock,active,brand,image_url,category_id&order=name.asc'+q+'&limit='+PER+'&offset='+(page*PER),{headers:h}),
      fetch(S+'/rest/v1/products?select=count'+q,{headers:{...h,'Prefer':'count=exact','Range':'0-0'}})
    ])
    const d=await r1.json();setProds(Array.isArray(d)?d:[])
    const ct=r2.headers.get('content-range');if(ct) setTotal(parseInt(ct.split('/')[1]||'0'))
  }
  async function save(id,fields){
    setSaving(true)
    await fetch(S+'/rest/v1/products?id=eq.'+id,{method:'PATCH',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify(fields)})
    setMsg('Guardado');setTimeout(()=>setMsg(''),2000)
    setSaving(false);setEditing(null);load()
  }
  async function toggleActive(p){
    await fetch(S+'/rest/v1/products?id=eq.'+p.id,{method:'PATCH',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({active:!p.active})})
    setProds(ps=>ps.map(x=>x.id===p.id?{...x,active:!p.active}:x))
  }
  const pages=Math.ceil(total/PER)
  return(
    <div style={{background:'#111',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#0a0a0a',padding:'18px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>📦 Gestion de Productos</h1>
          <p style={{margin:'3px 0 0',fontSize:12,color:'rgba(255,255,255,0.4)'}}>{total} productos</p>
        </div>
        <a href="/admin" style={{color:'rgba(255,255,255,0.5)',textDecoration:'none',fontSize:13}}>← Admin</a>
      </div>
      <div style={{padding:'18px 28px'}}>
        {msg&&<div style={{background:'#166534',padding:'8px 14px',marginBottom:12,fontSize:13,borderRadius:4}}>{msg}</div>}
        <div style={{marginBottom:16,display:'flex',gap:12}}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} placeholder="Buscar producto..."
            style={{flex:1,padding:'9px 12px',background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:13,fontFamily:'inherit'}}/>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.4)',alignSelf:'center'}}>Pag {page+1}/{pages||1}</span>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                {['Img','Nombre','Cat','PVP','Oferta','Stock','Activo',''].map(h=>(
                  <th key={h} style={{padding:'8px 10px',textAlign:'left',fontSize:10,fontWeight:700,textTransform:'uppercase',color:'rgba(255,255,255,0.4)',letterSpacing:'0.08em'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(prods||[]).map(p=>(
                <tr key={p.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'8px 10px',width:50}}>
                    {p.image_url?<img src={p.image_url} alt="" style={{width:40,height:40,objectFit:'contain',background:'#1a1a1a'}}/>
                    :<div style={{width:40,height:40,background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>📦</div>}
                  </td>
                  <td style={{padding:'8px 10px',maxWidth:220}}>
                    {editing===p.id?<input id={'n_'+p.id} defaultValue={p.name} style={{background:'#1a1a1a',border:'1px solid #ff1e41',color:'white',padding:'3px 6px',fontSize:12,width:'100%',fontFamily:'inherit'}}/>
                    :<span style={{fontSize:12,color:'rgba(255,255,255,0.85)',fontWeight:600,display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span>}
                  </td>
                  <td style={{padding:'8px 10px',fontSize:11,color:'rgba(255,255,255,0.4)'}}>{(p.category_id?'Cat#'+p.category_id:'—'}</td>
                  <td style={{padding:'8px 10px'}}>
                    {editing===p.id?<input id={'p_'+p.id} defaultValue={p.price_incl_tax} type="number" step="0.01"
                      style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.1)',color:'white',padding:'3px 6px',fontSize:12,width:75,fontFamily:'inherit'}}/>
                    :<span style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.8)'}}>{Number(p.price_incl_tax||0).toFixed(2)} €</span>}
                  </td>
                  <td style={{padding:'8px 10px'}}>
                    {editing===p.id?<input id={'s_'+p.id} defaultValue={p.sale_price||''} type="number" step="0.01" placeholder="Oferta"
                      style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.1)',color:'#ff1e41',padding:'3px 6px',fontSize:12,width:75,fontFamily:'inherit'}}/>
                    :<span style={{fontSize:12,color:'#ff1e41',fontWeight:700}}>{p.sale_price?Number(p.sale_price).toFixed(2)+' €':'-'}</span>}
                  </td>
                  <td style={{padding:'8px 10px'}}>
                    {editing===p.id?<input id={'k_'+p.id} defaultValue={p.stock} type="number"
                      style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.1)',color:'white',padding:'3px 6px',fontSize:12,width:60,fontFamily:'inherit'}}/>
                    :<span style={{fontSize:13,fontWeight:700,color:sc(p.stock||0)}}>{p.stock===0?'❌ 0':p.stock<=10?'⚠️ '+p.stock:p.stock}</span>}
                  </td>
                  <td style={{padding:'8px 10px'}}>
                    <button onClick={()=>toggleActive(p)}
                      style={{padding:'3px 10px',border:'none',background:p.active?'#166534':'#7f1d1d',color:'white',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
                      {p.active?'Activo':'Oculto'}
                    </button>
                  </td>
                  <td style={{padding:'8px 10px'}}>
                    {editing===p.id?(
                      <div style={{display:'flex',gap:4}}>
                        <button onClick={()=>save(p.id,{
                          name:document.getElementById('n_'+p.id)?.value,
                          price_incl_tax:parseFloat(document.getElementById('p_'+p.id)?.value)||p.price_incl_tax,
                          sale_price:document.getElementById('s_'+p.id)?.value?parseFloat(document.getElementById('s_'+p.id).value):null,
                          stock:parseInt(document.getElementById('k_'+p.id)?.value)||0
                        })} disabled={saving}
                          style={{padding:'4px 10px',border:'none',background:'#ff1e41',color:'white',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>
                          {saving?'...':'OK'}
                        </button>
                        <button onClick={()=>setEditing(null)}
                          style={{padding:'4px 8px',border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'rgba(255,255,255,0.5)',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>✕</button>
                      </div>
                    ):<button onClick={()=>setEditing(p.id)}
                        style={{padding:'4px 10px',border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'rgba(255,255,255,0.7)',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>✏️</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:18}}>
          <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}
            style={{padding:'7px 14px',border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'white',cursor:'pointer',fontFamily:'inherit',opacity:page===0?0.3:1}}>← Ant</button>
          {Array.from({length:Math.min(5,pages)}).map((_,i)=>{
            const pg=Math.max(0,page-2)+i;if(pg>=pages)return null
            return<button key={pg} onClick={()=>setPage(pg)}
              style={{padding:'7px 12px',border:'1px solid',borderColor:pg===page?'#ff1e41':'rgba(255,255,255,0.15)',background:pg===page?'#ff1e41':'transparent',color:'white',cursor:'pointer',fontFamily:'inherit',fontWeight:pg===page?700:400}}>{pg+1}</button>
          })}
          <button onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page>=pages-1}
            style={{padding:'7px 14px',border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'white',cursor:'pointer',fontFamily:'inherit',opacity:page>=pages-1?0.3:1}}>Sig →</button>
        </div>
      </div>
    </div>
  )
}
