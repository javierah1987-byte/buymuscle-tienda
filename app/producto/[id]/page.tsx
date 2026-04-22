// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import WishlistBtn from '@/components/WishlistBtn'
import ProductReviews from '@/components/ProductReviews'
import AddToCartSection from '@/components/AddToCartSection'
import ProductCard from '@/components/ProductCard'
import ImageGallery from '@/components/ImageGallery'
import Script from 'next/script'

const supabase = createClient('https://awwlbepjxuoxaigztugh.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo')
export const revalidate = 0

export async function generateMetadata({ params }): Promise<Metadata> {
  const { data: p } = await supabase.from('products').select('name,description,image_url').eq('id', params.id).single()
  if (!p) return { title: 'Producto | BUYMUSCLE' }
  return {
    title: p.name + ' | BUYMUSCLE',
    alternates: { canonical: 'https://buymuscle-tienda.vercel.app/producto/' + params.id },
    description: (p.description||'').slice(0,160)||'Suplementacion deportiva BuyMuscle',
    openGraph: { images: p.image_url ? [{ url: p.image_url }] : [] }
  }
}

export default async function ProductoPage({ params }) {
  const [prodRes, variantsRes, reviewsRes] = await Promise.all([
    supabase.from('products').select('*, categories(name)').eq('id', params.id).single(),
    supabase.from('product_variants').select('*, attribute_values(value, hex_color, attribute_types(name))').eq('product_id', params.id).eq('active', true),
    supabase.from('product_reviews').select('*').eq('product_id', params.id).order('created_at', { ascending: false }).limit(10)
  ])
  const product = prodRes.data
  if (!product) notFound()
  const rawVariants = variantsRes.data || []
  const reviews = reviewsRes.data || []
  const { data: related } = await supabase.from('products').select('id,name,price_incl_tax,sale_price,image_url,stock,active').eq('category_id', product.category_id).eq('active', true).neq('id', params.id).limit(4)
  const variantsByType = {}
  const typeOrder = []
  for (const v of rawVariants) {
    const typeName = v.attribute_values?.attribute_types?.name || 'Variante'
    if (!variantsByType[typeName]) { variantsByType[typeName] = []; typeOrder.push(typeName) }
    variantsByType[typeName].push({ id: v.attribute_values?.id, value: v.attribute_values?.value||'', hex: v.attribute_values?.hex_color, variantId: v.id, stock: v.stock, priceModifier: v.price_modifier||0 })
  }
  const hasVariants = Object.keys(variantsByType).length > 0
  const catName = product.categories?.name || ''
  const price = Number(product.price_incl_tax)
  const salePrice = product.sale_price ? Number(product.sale_price) : null
  const displayPrice = salePrice || price
  const discount = salePrice ? Math.round((1 - salePrice/price)*100) : null
  const desc = product.description || ''
  const images = [product.image_url].filter(Boolean)
  const avgRating = reviews.length>0 ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null
  const jsonLd = {
    '@context':'https://schema.org','@type':'Product',
    name:product.name, description:desc.slice(0,300)||product.name, image:images[0]||'',
    brand:{'@type':'Brand',name:product.brand||'BuyMuscle'},
    offers:{'@type':'Offer',url:'https://buymuscle-tienda.vercel.app/producto/'+params.id,priceCurrency:'EUR',price:displayPrice.toFixed(2),availability:product.stock>0?'https://schema.org/InStock':'https://schema.org/OutOfStock',seller:{'@type':'Organization',name:'BuyMuscle'}},
    ...(avgRating&&reviews.length>=1?{aggregateRating:{'@type':'AggregateRating',ratingValue:avgRating,reviewCount:reviews.length}}:{})
  }
  return (
    <div style={{background:'#f8f8f8',minHeight:'60vh'}}>
      <Script id="product-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
      <div style={{background:'white',borderBottom:'1px solid #e8e8e8',padding:'10px 20px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',fontSize:12,color:'#999',display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
          <a href="/" style={{color:'#999',textDecoration:'none'}}>Inicio</a><span>›</span>
          <a href="/tienda" style={{color:'#999',textDecoration:'none'}}>Tienda</a>
          {catName&&<><span>›</span><span style={{color:'#999'}}>{catName}</span></>}
          <span>›</span><span style={{color:'#333',fontWeight:600}}>{product.name}</span>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'24px 20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:32,background:'white',padding:24,marginBottom:24}}>
          <ImageGallery images={images} name={product.name}/>
          <div>
            {catName&&<div style={{fontSize:12,fontWeight:700,color:'#ff1e41',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>{catName}</div>}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <h1 style={{fontSize:22,fontWeight:900,color:'#111',textTransform:'uppercase',margin:0,lineHeight:1.2}}>{product.name}</h1>
              <WishlistBtn productId={product.id} size={28}/>
            </div>
            {product.brand&&<div style={{fontSize:13,color:'#888',marginBottom:16}}>Marca: <strong style={{color:'#555'}}>{product.brand}</strong></div>}
            {discount&&<div style={{display:'inline-block',background:'#ff1e41',color:'white',fontSize:12,fontWeight:700,padding:'3px 8px',marginBottom:8}}>-{discount}%</div>}
            {product.stock>0&&product.stock<=10&&<div style={{background:'#fff3cd',border:'1px solid #ffc107',padding:'8px 14px',marginBottom:12,fontSize:13,fontWeight:700,color:'#856404'}}>
              ⚠️ ¡Solo quedan {product.stock} unidades! Corre antes de que se agote.
            </div>}
            <AddToCartSection product={product} variantsByType={variantsByType} sortedTypes={typeOrder} hasVariants={hasVariants}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:16}}>
              {[['🚚','Envío 24-48h','Peninsular y Canarias'],['✅','Original','Marca oficial'],['🔒','Seguro','100% protegido'],['📞','¿Dudas?','828 048 310']].map(([i,t,s])=>(
                <div key={t} style={{display:'flex',gap:8,alignItems:'center',padding:'8px 10px',background:'#f9f9f9',border:'1px solid #f0f0f0'}}>
                  <span style={{fontSize:18}}>{i}</span>
                  <div><div style={{fontSize:11,fontWeight:700,color:'#444'}}>{t}</div><div style={{fontSize:10,color:'#aaa'}}>{s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {desc&&<div style={{background:'white',marginBottom:24}}>
          <div style={{borderBottom:'2px solid #f0f0f0',padding:'0 24px'}}>
            <div style={{padding:'14px 0',borderBottom:'2px solid #ff1e41',display:'inline-block',fontSize:13,fontWeight:700,color:'#ff1e41',textTransform:'uppercase',letterSpacing:'0.05em'}}>Descripción</div>
          </div>
          <div style={{padding:'24px',fontSize:14,color:'#555',lineHeight:1.8,maxWidth:800}}>
            {desc.split('\n').filter(l=>l.trim()).map((line,i)=><p key={i} style={{margin:'0 0 10px'}}>{line}</p>)}
          </div>
        </div>}
        <ProductReviews productId={product.id} initialReviews={reviews}/>
        {related&&related.length>0&&<div style={{marginTop:24}}>
          <h2 style={{fontSize:16,fontWeight:900,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:16,color:'#111'}}>Productos relacionados</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {related.map(r=><ProductCard key={r.id} product={r}/>)}
          </div>
        </div>}
      </div>
    </div>
  )
}
