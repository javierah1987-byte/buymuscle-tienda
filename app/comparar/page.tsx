// @ts-nocheck
'use client'
import{useEffect,useState}from 'react'
import Link from 'next/link'
import{useCart}from '@/lib/cart'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

const ATTS=['Precio','Stock','Calorías / 100g','Proteínas / 100g','Carbohidratos / 100g','Grasas / 100g','Sabores disponibles','Peso / ración','País de fabricación']

export default function Comparar(){
  const{add}=useCart()
  const[search,setSearch]=useState('')
  const[results,setResults]=useState([])
  const[selected,setSelected]=useState([])
  const[loading,setLoading]=useState(false)

  async function buscar(q){
    if(q.length<2){setResults([]);return}
    setLoading(true)
    const r=await fetch(S+'/rest/v1/products?select=id,name,price_incl_tax,sale_price,image_url,stock,description,category&active=eq.true&name=ilike.*'+encodeURIComponent(q)+'*&limit=8',{
      headers:{'apikey':K,'Authorization':'Bearer '+K}
    })
    const d=await r.json()
    setResults(d||[]);setLoading(false)
  }

  function addProduct(p){
    if(selected.length>=3||selected.find(s=>s.id===p.id))return
    setSelected(s=>[...s,p]);setSearch('');setResults([])
  }

  function remove(id){setSelected(s=>s.filter(p=>p.id!==id))}

  return(
    <div style={{background:'#f8f8f8',minHeight:'60vh',fontFamily:'Arial,sans-serif'}}>
      <div style={{background:'#111',color:'white',padding:'50px 20px',textAlign:'center'}}>
        <h1 style={{fontSize:28,fontWeight:900,margin:'0 0 10px',textTransform:'uppercase'}}>Comparador de productos</h1>
        <p style={{color:'rgba(255,255,255,0.65)',fontSize:14,margin:0}}>Compara hasta 3 productos lado a lado</p>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 20px'}}>
        {/* Buscador */}
        {selected.length<3&&<div style={{background:'white',padding:20,border:'1px solid #e8e8e8',marginBottom:24,position:'relative'}}>
          <input value={search} onChange={e=>{setSearch(e.target.value);buscar(e.target.value)}}
            placeholder="Busca un producto para comparar..." style={{width:'100%',padding:'10px 14px',border:'1px solid #ddd',fontSize:14,fontFamily:'inherit',boxSizing:'border-box'}}/>
          {loading&&<div style={{position:'absolute',right:32,top:30,fontSize:12,color:'#aaa'}}>Buscando...</div>}
          {results.length>0&&<div style={{position:'absolute',top:'100%',left:0,right:0,background:'white',border:'1px solid #ddd',zIndex:10,maxHeight:280,overflowY:'auto',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
            {results.map(p=>(
              <div key={p.id} onClick={()=>addProduct(p)} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',cursor:'pointer',borderBottom:'1px solid #f5f5f5'}}
                onMouseEnter={e=>e.currentTarget.style.background='#f9f9f9'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                {p.image_url?<img src={p.image_url} alt={p.name} style={{width:40,height:40,objectFit:'contain',background:'#f9f9f9',flexShrink:0}}/>
                :<div style={{width:40,height:40,background:'#f0f0f0',flexShrink:0}}/>}
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{p.name}</div>
                  <div style={{fontSize:12,color:'#ff1e41',fontWeight:700}}>{Number(p.sale_price||p.price_incl_tax).toFixed(2)} €</div>
                </div>
              </div>
            ))}
          </div>}
        </div>}

        {selected.length===0?<div style={{textAlign:'center',padding:'60px 0',color:'#aaa'}}>
          <div style={{fontSize:56,marginBottom:16}}>🔍</div>
          <p style={{fontSize:15}}>Busca productos para empezar a comparar</p>
        </div>:(
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',background:'white',border:'1px solid #e8e8e8'}}>
              <thead>
                <tr style={{background:'#111'}}>
                  <th style={{padding:'14px 16px',textAlign:'left',color:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:600,width:160}}>Característica</th>
                  {selected.map(p=>(
                    <th key={p.id} style={{padding:'14px 16px',textAlign:'center',color:'white',fontSize:13}}>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                        {p.image_url&&<img src={p.image_url} alt={p.name} style={{width:60,height:60,objectFit:'contain',background:'rgba(255,255,255,0.1)'}}/>}
                        <span style={{fontSize:12,lineHeight:1.3,maxWidth:160,display:'block'}}>{p.name}</span>
                        <button onClick={()=>remove(p.id)} style={{background:'rgba(255,255,255,0.15)',border:'none',color:'white',padding:'2px 10px',fontSize:11,cursor:'pointer',borderRadius:20}}>✕ Quitar</button>
                      </div>
                    </th>
                  ))}
                  {Array.from({length:3-selected.length}).map((_,i)=>(
                    <th key={'empty'+i} style={{padding:'14px 16px',textAlign:'center',color:'rgba(255,255,255,0.3)',fontSize:12,fontStyle:'italic'}}>
                      + Añadir producto
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{background:'#fff8f8'}}>
                  <td style={{padding:'12px 16px',fontWeight:700,fontSize:13,color:'#111',borderBottom:'1px solid #f0f0f0'}}>Precio</td>
                  {selected.map(p=>(
                    <td key={p.id} style={{padding:'12px 16px',textAlign:'center',borderBottom:'1px solid #f0f0f0'}}>
                      <div style={{fontSize:18,fontWeight:900,color:'#ff1e41'}}>{Number(p.sale_price||p.price_incl_tax).toFixed(2)} €</div>
                      {p.sale_price&&p.sale_price<p.price_incl_tax&&<div style={{fontSize:11,color:'#aaa',textDecoration:'line-through'}}>{Number(p.price_incl_tax).toFixed(2)} €</div>}
                    </td>
                  ))}
                  {Array.from({length:3-selected.length}).map((_,i)=><td key={'e'+i} style={{borderBottom:'1px solid #f0f0f0'}}/>)}
                </tr>
                <tr>
                  <td style={{padding:'12px 16px',fontWeight:600,fontSize:13,color:'#555',borderBottom:'1px solid #f0f0f0'}}>Stock</td>
                  {selected.map(p=>(
                    <td key={p.id} style={{padding:'12px 16px',textAlign:'center',borderBottom:'1px solid #f0f0f0'}}>
                      <span style={{color:p.stock>10?'#22c55e':p.stock>0?'#f59e0b':'#ef4444',fontWeight:700,fontSize:13}}>
                        {p.stock>10?'✓ Disponible':p.stock>0?'⚠️ Últimas unidades':'✗ Agotado'}
                      </span>
                    </td>
                  ))}
                  {Array.from({length:3-selected.length}).map((_,i)=><td key={'e'+i} style={{borderBottom:'1px solid #f0f0f0'}}/>)}
                </tr>
                <tr style={{background:'#f9f9f9'}}>
                  <td style={{padding:'12px 16px',fontWeight:600,fontSize:13,color:'#555',borderBottom:'1px solid #f0f0f0'}}>Categoría</td>
                  {selected.map(p=>(
                    <td key={p.id} style={{padding:'12px 16px',textAlign:'center',borderBottom:'1px solid #f0f0f0',fontSize:13,color:'#555'}}>{p.category||'—'}</td>
                  ))}
                  {Array.from({length:3-selected.length}).map((_,i)=><td key={'e'+i} style={{borderBottom:'1px solid #f0f0f0'}}/>)}
                </tr>
                <tr>
                  <td style={{padding:'12px 16px',borderBottom:'1px solid #f0f0f0'}}/>
                  {selected.map(p=>(
                    <td key={p.id} style={{padding:'12px 16px',textAlign:'center',borderBottom:'1px solid #f0f0f0'}}>
                      <button onClick={()=>add({id:p.id,name:p.name,price:Number(p.sale_price||p.price_incl_tax),image:p.image_url,qty:1})}
                        style={{background:'#ff1e41',color:'white',border:'none',padding:'8px 16px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                        🛒 Añadir al carrito
                      </button>
                    </td>
                  ))}
                  {Array.from({length:3-selected.length}).map((_,i)=><td key={'e'+i} style={{borderBottom:'1px solid #f0f0f0'}}/>)}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
  }
