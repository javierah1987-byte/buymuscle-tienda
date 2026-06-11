// @ts-nocheck
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import BrandProductCard from './BrandProductCard'

// Server Component con ISR: la página se regenera como mucho cada 5 minutos
// en lugar de hacer 2 fetches en cascada desde el navegador.
export const revalidate = 300

async function getBrandData(slug) {
  const { data: brands } = await supabase.from('brands').select('*').eq('slug', slug).limit(1)
  const brand = brands?.[0] || null
  if (!brand) return { brand: null, products: [] }
  // La query de productos depende del nombre de la marca, por lo que no puede
  // ir en paralelo con la de la marca; ambas se resuelven en el servidor y
  // quedan cacheadas por ISR.
  const { data: products } = await supabase
    .from('products')
    .select('id,name,price_incl_tax,sale_price,image_url,stock')
    .eq('active', true)
    .ilike('brand', '%' + brand.name + '%')
    .order('name', { ascending: true })
    .limit(80)
  return { brand, products: products || [] }
}

export default async function MarcaPage({ params }) {
  const slug = String(params?.slug || '')
  const { brand, products } = await getBrandData(slug)

  if (!brand) return (
    <div style={{padding:'5rem 2rem',textAlign:'center',fontFamily:'Arial,sans-serif',color:'#333'}}>
      <h1 style={{marginBottom:16}}>Marca no encontrada</h1>
      <Link href="/tienda" style={{color:'#ff1e41',textDecoration:'none',fontWeight:700,padding:'10px 24px',border:'2px solid #ff1e41',display:'inline-block'}}>Ver tienda</Link>
    </div>
  )

  const name = brand?.name || slug.toUpperCase()
  return (
    <div style={{fontFamily:'Arial,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#000 0%,#1a1a1a 50%,#000 100%)',padding:'60px 32px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at center,rgba(255,30,65,0.15) 0%,transparent 70%)'}}/>
        <div style={{position:'relative'}}>
          <div style={{display:'inline-block',background:'rgba(255,30,65,0.1)',border:'1px solid rgba(255,30,65,0.3)',padding:'4px 16px',fontSize:12,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'#ff1e41',marginBottom:16}}>MARCA OFICIAL</div>
          <h1 style={{margin:'0 0 12px',fontSize:'clamp(36px,7vw,72px)',fontWeight:900,textTransform:'uppercase',letterSpacing:'-2px',color:'white'}}>{name.toUpperCase()}</h1>
          {brand?.description&&<p style={{margin:0,fontSize:16,color:'rgba(255,255,255,0.6)',maxWidth:600,marginInline:'auto'}}>{brand.description}</p>}
          <div style={{marginTop:24,fontSize:14,color:'rgba(255,255,255,0.4)'}}>{products.length} productos disponibles</div>
        </div>
      </div>
      <div style={{background:'#f5f5f5',padding:'10px 32px',fontSize:13,color:'#666',display:'flex',gap:8,alignItems:'center'}}>
        <Link href="/" style={{color:'#666',textDecoration:'none'}}>Inicio</Link><span>/</span>
        <Link href="/tienda" style={{color:'#666',textDecoration:'none'}}>Tienda</Link><span>/</span>
        <span style={{color:'#ff1e41',fontWeight:600}}>{name}</span>
      </div>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'32px 24px'}}>
        {products.length===0?<div style={{textAlign:'center',padding:'3rem'}}>
          <p style={{color:'#aaa',fontSize:16,marginBottom:16}}>No hay productos de {name} disponibles en este momento.</p>
          <Link href="/tienda" style={{color:'#ff1e41',textDecoration:'none',fontWeight:700,padding:'10px 24px',border:'2px solid #ff1e41',display:'inline-block'}}>Ver toda la tienda</Link>
        </div>
        :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:20}}>
          {products.map(p=><BrandProductCard key={p.id} p={p}/>)}
        </div>}
      </div>
    </div>
  )
}
