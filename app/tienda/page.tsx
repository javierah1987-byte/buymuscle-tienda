'use client'
import{useEffect,useState,useCallback,Suspense}from 'react'
import{supabase}from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import{useSearchParams,useRouter}from 'next/navigation'
function TiendaInner(){
  const sp=useSearchParams(),router=useRouter()
  const catParam=sp.get('cat')||''
  const[products,setProducts]=useState<any[]>([])
  const[categories,setCategories]=useState<any[]>([])
  const[loading,setLoading]=useState(true)
  const[search,setSearch]=useState(sp.get('q')||'')
  const[sortBy,setSortBy]=useState('default')
  const[showInStock,setShowInStock]=useState(false)
  useEffect(()=>{supabase.from('categories').select('*').order('name').then(({data})=>setCategories(data||[]))},[])
  const load=useCallback(async()=>{
    setLoading(true)
    let q=supabase.from('products').select('*, categories(name)').eq('active',true)
    if(catParam){const cat=categories.find((c:any)=>c.name===catParam);if(cat)q=q.eq('category_id',cat.id)}
    if(search)q=q.ilike('name',`%${search}%`)
    if(showInStock)q=q.gt('stock',0)
    if(sortBy==='price_asc')q=q.order('price_incl_tax',{ascending:true})
    else if(sortBy==='price_desc')q=q.order('price_incl_tax',{ascending:false})
    else if(sortBy==='name')q=q.order('name',{ascending:true})
    else q=q.order('id',{ascending:false})
    const{data}=await q.limit(200)
    setProducts(data||[]);setLoading(false)
  },[catParam,search,sortBy,showInStock,categories])
  useEffect(()=>{if(categories.length>0)load()},[load,categories])
  const setCategory=(name:string)=>{const p=new URLSearchParams();if(name)p.set('cat',name);if(search)p.set('q',search);router.push(`/tienda?${p.toString()}`)}
  const TOPS=['Proteínas','Creatinas Monohidratos','Pre-entrenos','Vitaminas','BCAA','Quemadores','Proteína Isolatada','Ropa Deportiva','Packs']
  return(
    <div style={{padding:'3rem 0'}}><div className="container">
      <h1 className="section-title" style={{marginBottom:'0.5rem'}}>{catParam?<span>{catParam}</span>:<>TODO EL <span>CATÁLOGO</span></>}</h1>
      <p style={{color:'var(--muted)',marginBottom:'1.5rem'}}>{loading?'...':`${products.length} productos`}{catParam&&<> · <button onClick={()=>setCategory('')} style={{color:'var(--green)',background:'none',border:'none',cursor:'pointer',textDecoration:'underline',fontSize:'14px'}}>Ver todo</button></>}</p>
      <div style={{display:'flex',gap:'1rem',marginBottom:'1.5rem',flexWrap:'wrap',alignItems:'center'}}>
        <form onSubmit={e=>{e.preventDefault();const p=new URLSearchParams();if(catParam)p.set('cat',catParam);if(search)p.set('q',search);router.push(`/tienda?${p.toString()}`)}} style={{flex:1,minWidth:200,display:'flex',gap:'8px'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar producto..." style={{flex:1}}/>
          <button type="submit" className="btn-primary" style={{padding:'12px 20px',whiteSpace:'nowrap'}}>Buscar</button>
        </form>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{width:'auto',minWidth:160}}>
          <option value="default">Más recientes</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
          <option value="name">Nombre A-Z</option>
        </select>
        <label style={{display:'flex',alignItems:'center',gap:8,color:'var(--muted)',fontSize:14,margin:0,cursor:'pointer',whiteSpace:'nowrap'}}>
          <input type="checkbox" checked={showInStock} onChange={e=>setShowInStock(e.target.checked)} style={{width:'auto'}}/>Solo en stock
        </label>
      </div>
      <div className="filters">
        <button className={`filter-btn ${!catParam?'active':''}`} onClick={()=>setCategory('')}>Todos</button>
        {TOPS.map(c=><button key={c} className={`filter-btn ${catParam===c?'active':''}`} onClick={()=>setCategory(c)}>{c}</button>)}
      </div>
      {loading?(<div className="products-grid">{Array.from({length:12}).map((_,i)=><div key={i} className="card" style={{aspectRatio:'1/1.4'}}><div className="skeleton" style={{height:'60%'}}/><div style={{padding:'1rem',display:'flex',flexDirection:'column',gap:8}}><div className="skeleton" style={{height:12,width:'60%'}}/><div className="skeleton" style={{height:16,width:'90%'}}/></div></div>)}</div>
      ):products.length===0?(<div style={{textAlign:'center',padding:'5rem 0',color:'var(--muted)'}}><div style={{fontSize:48,marginBottom:'1rem'}}>🔍</div><p>No se encontraron productos.</p><button className="btn-outline" style={{marginTop:'1.5rem'}} onClick={()=>{setSearch('');setCategory('')}}>Limpiar</button></div>
      ):(<div className="products-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>)}
    </div></div>
  )
}
export default function TiendaPage(){
  return <Suspense fallback={<div className="container" style={{padding:'5rem 0',color:'var(--muted)'}}>Cargando...</div>}><TiendaInner/></Suspense>
}
