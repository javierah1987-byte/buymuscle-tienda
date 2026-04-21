// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json'}
const BRANDS=['BuyMuscle','MVP','IO.Genix','Applied Nutrition','GN Nutrition','BioTechUSA','Scitec','HSN','Quamtrax','PurePharma']
export default function AdminPrecios(){
  const[brand,setBrand]=useState('MVP')
  const[pct,setPct]=useState(0)
  const[type,setType]=useState('increase')
  const[preview,setPreview]=useState([])
  const[loading,setLoading]=useState(false)
  const[msg,setMsg]=useState('')
  const[count,setCount]=useState(0)
  async function loadPreview(){
    setLoading(true)
    const r=await fetch(S+'/rest/v1/products?brand=ilike.%25'+encodeURIComponent(brand)+'%25&active=eq.true&select=id,name,price_incl_tax,sale_price&order=name.asc&limit=10',{headers:h})
    const d=await r.json()
    const all=await fetch(S+'/rest/v1/products?brand=ilike.%25'+encodeURIComponent(brand)+'%25&active=eq.true&select=count',{headers:{...h,'Prefer':'count=exact','Range':'0-0'}})
    const total=parseInt(all.headers.get('content-range')?.split('/')[1]||'0')
    setCount(total)
    const factor=type==='increase'?(1+pct/100):(1-pct/100)
    setPreview(Array.isArray(d)?d.map(p=>({...p,newPrice:Number(p.price_incl_tax)*factor})):[])
    setLoading(false)
  }
  async function apply(){
    if(!pct||pct<=0){setMsg('Introduce un porcentaje mayor que 0');return}
    setLoading(true)
    const factor=type==='increase'?(1+pct/100):(1-pct/100)
    const r=await fetch(S+'/rest/v1/rpc/update_brand_prices',{method:'POST',headers:h,
      body:JSON.stringify({brand_pattern:'%'+brand+'%',factor:parseFloat(factor.toFixed(4))})})
    if(r.ok||r.status===200){
      setMsg('Precios actualizados correctamente para '+brand+' ('+count+' productos)')
      loadPreview()
    } else {
      // Fallback: actualizar via API uno a uno
      const all2=await fetch(S+'/rest/v1/products?brand=ilike.%25'+encodeURIComponent(brand)+'%25&active=eq.true&select=id,price_incl_tax',{headers:h})
      const prods=await all2.json()
      let done=0
      for(const p of(Array.isArray(prods)?prods:[])){
        const np=Math.round(Number(p.price_incl_tax)*factor*100)/100
        await fetch(S+'/rest/v1/products?id=eq.'+p.id,{method:'PATCH',headers:h,body:JSON.stringify({price_incl_tax:np})})
        done++
      }
      setMsg('Actualizados '+done+' productos de '+brand)
      loadPreview()
    }
    setLoading(false)
    setTimeout(()=>setMsg(''),5000)
  }
  useEffect(()=>{if(pct>0)loadPreview()},[brand,pct,type])
  const TD={padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:13}
  return(
    <div style={{background:'#0d0d0d',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'white'}}>
      <div style={{background:'#080808',padding:'18px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>Editor de precios por marca</h1>
          <p style={{margin:'3px 0 0',fontSize:12,color:'rgba(255,255,255,0.4)'}}>Sube o baja precios en masa sin tocar cada producto</p>
        </div>
        <Link href="/admin" style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:13}}>← Admin</Link>
      </div>
      <div style={{padding:'28px',display:'grid',gridTemplateColumns:'340px 1fr',gap:24}}>
        <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.08)',padding:24}}>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'rgba(255,255,255,0.4)',display:'block',marginBottom:8}}>Marca</label>
            <select value={brand} onChange={e=>setBrand(e.target.value)}
              style={{width:'100%',padding:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:14,fontFamily:'Arial',outline:'none'}}>
              {BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'rgba(255,255,255,0.4)',display:'block',marginBottom:8}}>Operacion</label>
            <div style={{display:'flex',gap:0}}>
              {[['increase','Subir precio'],['decrease','Bajar precio']].map(([v,l])=>(
                <button key={v} onClick={()=>setType(v)}
                  style={{flex:1,padding:'10px',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',fontFamily:'Arial',fontSize:13,fontWeight:700,
                    background:type===v?'rgba(255,30,65,0.2)':'transparent',
                    color:type===v?'#ff1e41':'rgba(255,255,255,0.5)'}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <label style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'rgba(255,255,255,0.4)',display:'block',marginBottom:8}}>Porcentaje (%)</label>
            <div style={{display:'flex',gap:6,marginBottom:8}}>
              {[2,5,10,15,20].map(p=>(
                <button key={p} onClick={()=>setPct(p)}
                  style={{flex:1,padding:'8px 0',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',fontFamily:'Arial',fontSize:13,fontWeight:700,
                    background:pct===p?'rgba(255,30,65,0.2)':'rgba(255,255,255,0.04)',
                    color:pct===p?'#ff1e41':'rgba(255,255,255,0.5)'}}>
                  {p}%
                </button>
              ))}
            </div>
            <input type="number" value={pct} min={0} max={80} onChange={e=>setPct(Number(e.target.value))} placeholder="O introduce % manual"
              style={{width:'100%',padding:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:14,fontFamily:'Arial',outline:'none',boxSizing:'border-box'}}/>
          </div>
          {msg&&<div style={{padding:'10px 14px',marginBottom:16,fontSize:13,background:msg.includes('correctamente')||msg.includes('Actualizados')?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',border:'1px solid',borderColor:msg.includes('correctamente')||msg.includes('Actualizados')?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)',color:msg.includes('correctamente')||msg.includes('Actualizados')?'#22c55e':'#ef4444'}}>{msg}</div>}
          <button onClick={apply} disabled={loading||pct<=0}
            style={{width:'100%',background:pct>0?'#ff1e41':'rgba(255,255,255,0.05)',color:'white',border:'none',padding:'14px',fontSize:15,fontWeight:700,cursor:pct>0?'pointer':'not-allowed',fontFamily:'Arial',opacity:loading?0.6:1}}>
            {loading?'Procesando...':type==='increase'?'Subir '+pct+'% a '+count+' productos':'Bajar '+pct+'% a '+count+' productos'}
          </button>
        </div>
        <div>
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.08)',padding:20}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'rgba(255,255,255,0.4)',marginBottom:14}}>
              Vista previa primeros 10 productos de {brand} {pct>0?'('+type+' '+pct+'%)':''}
            </div>
            {loading?<div style={{textAlign:'center',padding:'2rem',color:'rgba(255,255,255,0.3)'}}>Cargando...</div>
            :preview.length===0?<div style={{textAlign:'center',padding:'2rem',color:'rgba(255,255,255,0.3)'}}>Selecciona marca y porcentaje para ver la preview</div>
            :<table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>
                <th style={{...TD,color:'rgba(255,255,255,0.4)',fontWeight:700,fontSize:11,textTransform:'uppercase'}}>Producto</th>
                <th style={{...TD,color:'rgba(255,255,255,0.4)',fontWeight:700,fontSize:11,textTransform:'uppercase',textAlign:'right'}}>Precio actual</th>
                <th style={{...TD,color:'rgba(255,255,255,0.4)',fontWeight:700,fontSize:11,textTransform:'uppercase',textAlign:'right'}}>Nuevo precio</th>
                <th style={{...TD,color:'rgba(255,255,255,0.4)',fontWeight:700,fontSize:11,textTransform:'uppercase',textAlign:'right'}}>Diferencia</th>
              </tr></thead>
              <tbody>
                {preview.map(p=>{
                  const old=Number(p.price_incl_tax||0)
                  const diff=p.newPrice-old
                  return(
                    <tr key={p.id}>
                      <td style={{...TD,color:'rgba(255,255,255,0.8)',maxWidth:280}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div></td>
                      <td style={{...TD,textAlign:'right',color:'rgba(255,255,255,0.5)'}}>{old.toFixed(2)} €</td>
                      <td style={{...TD,textAlign:'right',fontWeight:700,color:'white'}}>{p.newPrice.toFixed(2)} €</td>
                      <td style={{...TD,textAlign:'right',color:diff>0?'#ef4444':'#22c55e',fontWeight:700}}>
                        {diff>0?'+':''}{diff.toFixed(2)} €
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>}
          </div>
        </div>
      </div>
    </div>
  )
                           }
