'use client'
import{useEffect,useState}from 'react'
import{useParams}from 'next/navigation'
import{supabase,Product}from '@/lib/supabase'
import{useCart}from '@/lib/cart'
import Link from 'next/link'
export default function ProductoPage(){
  const{id}=useParams();const{add}=useCart()
  const[product,setProduct]=useState<Product|null>(null)
  const[related,setRelated]=useState<Product[]>([])
  const[qty,setQty]=useState(1);const[added,setAdded]=useState(false);const[loading,setLoading]=useState(true)
  useEffect(()=>{
    supabase.from('products').select('*, categories(name)').eq('id',Number(id)).single()
      .then(({data})=>{
        setProduct(data);setLoading(false)
        if(data?.category_id)supabase.from('products').select('*, categories(name)').eq('category_id',data.category_id).eq('active',true).neq('id',data.id).limit(4).then(({data:rel})=>setRelated(rel||[]))
      })
  },[id])
  const handleAdd=()=>{if(!product)return;add(product,qty);setAdded(true);setTimeout(()=>setAdded(false),2000)}
  if(loading)return<div className="container" style={{padding:'5rem 0',color:'var(--muted)'}}>Cargando...</div>
  if(!product)return<div className="container" style={{padding:'5rem 0',textAlign:'center'}}><p style={{color:'var(--muted)',marginBottom:'1.5rem'}}>No encontrado.</p><Link href="/tienda" className="btn-primary">Volver</Link></div>
  const cat=(product as any).categories?.name
  return(
    <div style={{padding:'3rem 0 5rem'}}><div className="container">
      <div style={{display:'flex',gap:8,fontSize:13,color:'var(--muted)',marginBottom:'2rem',alignItems:'center',flexWrap:'wrap'}}>
        <Link href="/" style={{color:'var(--muted)'}}>Inicio</Link><span>/</span>
        <Link href="/tienda" style={{color:'var(--muted)'}}>Tienda</Link>
        {cat&&<><span>/</span><Link href={`/tienda?cat=${encodeURIComponent(cat)}`} style={{color:'var(--muted)'}}>{cat}</Link></>}
        <span>/</span><span style={{color:'var(--white)'}}>{product.name.slice(0,40)}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4rem',alignItems:'start'}}>
        <div style={{background:'var(--dark)',borderRadius:12,padding:'2rem',border:'1px solid var(--border)'}}>
          <img src={product.image_url||'https://placehold.co/600x600/1a1a1a/888?text=BM'} alt={product.name} style={{width:'100%',aspectRatio:'1',objectFit:'contain'}} onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/600x600/1a1a1a/888?text=BM'}}/>
        </div>
        <div>
          {cat&&<div style={{marginBottom:'0.75rem'}}><span className="badge badge-green">{cat}</span></div>}
          <h1 style={{fontFamily:'var(--font-display)',fontSize:'clamp(24px,4vw,38px)',fontWeight:900,textTransform:'uppercase',lineHeight:1.1,marginBottom:'1.5rem'}}>{product.name}</h1>
          <div style={{marginBottom:'2rem',padding:'1.5rem',background:'var(--surface)',borderRadius:8,border:'1px solid var(--border)'}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:48,fontWeight:900,color:'var(--green)',lineHeight:1}}>{product.price_incl_tax.toFixed(2)} €</div>
            <div style={{fontSize:13,color:'var(--muted)',marginTop:6}}>Sin IVA: {product.price_excl_tax.toFixed(2)} € · IVA incluido</div>
          </div>
          <div style={{marginBottom:'2rem',display:'flex',alignItems:'center',gap:10}}>
            {product.stock>0
              ?<><div style={{width:10,height:10,borderRadius:'50%',background:'#4caf50'}}/><span>En stock — {product.stock} unidades</span></>
              :<><div style={{width:10,height:10,borderRadius:'50%',background:'var(--red)'}}/><span style={{color:'var(--red)'}}>Sin stock</span></>}
          </div>
          <div style={{display:'flex',gap:'1rem',marginBottom:'1rem',alignItems:'center'}}>
            <div className="qty-control">
              <button className="qty-btn" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
              <span style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,minWidth:32,textAlign:'center'}}>{qty}</span>
              <button className="qty-btn" onClick={()=>setQty(q=>Math.min(product.stock,q+1))}>+</button>
            </div>
            <button className="btn-primary" style={{flex:1,padding:'14px',fontSize:'16px'}} onClick={handleAdd} disabled={product.stock===0}>
              {added?'✓ Añadido al carrito':'Añadir al carrito'}
            </button>
          </div>
          <div style={{padding:'1rem',background:'rgba(0,230,118,0.05)',borderRadius:6,border:'1px solid rgba(0,230,118,0.15)',fontSize:13,color:'var(--muted)'}}>🚚 Envío en 24h · 🔄 Devoluciones · 🔒 Pago seguro</div>
        </div>
      </div>
      {related.length>0&&(
        <div style={{marginTop:'5rem'}}>
          <h2 className="section-title" style={{fontSize:32,marginBottom:'2rem'}}>PRODUCTOS <span>RELACIONADOS</span></h2>
          <div className="products-grid">
            {related.map((p:any)=>(
              <Link key={p.id} href={`/producto/${p.id}`} className="card product-card">
                <div className="img-wrap"><img src={p.image_url||'https://placehold.co/400x400/1a1a1a/888?text=BM'} alt={p.name} loading="lazy" onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/400x400/1a1a1a/888?text=BM'}}/></div>
                <div className="info"><div className="name">{p.name.slice(0,45)}</div><div className="price">{p.price_incl_tax.toFixed(2)} €</div></div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div></div>
  )
}
