// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import type { Metadata } from 'next'
import WishlistBtn from '@/components/WishlistBtn'
import ProductReviews from '@/components/ProductReviews'
import AddToCartSection from '@/components/AddToCartSection'
import ProductCard from '@/components/ProductCard'
import ImageGallery from '@/components/ImageGallery'
import Script from 'next/script'

const supabase = createClient('https://awwlbepjxuoxaigztugh.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo')
export const revalidate = 0

const getProduct = cache(async (id) => {
  const { data } = await supabase.from('products').select('*, categories(name)').eq('id', id).single()
  return data
})

export async function generateMetadata({ params }): Promise<Metadata> {
  const p = await getProduct(params.id)
  if (!p) return { title: 'Producto | BuyMuscle' }
  const price = p.sale_price ? Number(p.sale_price) : Number(p.price_incl_tax)
  const desc = p.description 
    ? p.description.slice(0, 155).replace(/<[^>]+>/g, '')
    : p.name + ' — ' + (p.brand ? 'Marca ' + p.brand + '. ' : '') + 'Disponible en BuyMuscle Canarias. Envío 24-48h · IVA incluido · Precio: ' + price.toFixed(2) + '€.'
  return {
    title: p.name,
    alternates: { canonical: 'https://buymuscle-tienda.vercel.app/producto/' + params.id },
    description: (p.description||'').slice(0,160)||'Suplementacion deportiva BuyMuscle',
    openGraph: { images: p.image_url ? [{ url: p.image_url }] : [] }
  }
}

export default async function ProductoPage({ params }) {
  const [product, variantsRes, reviewsRes] = await Promise.all([
    getProduct(params.id),
    supabase.from('product_variants').select('*, attribute_values(value, hex_color, attribute_types(name))').eq('product_id', params.id).eq('active', true),
    supabase.from('product_reviews').select('*').eq('product_id', params.id).order('created_at', { ascending: false }).limit(10)
  ])
  if (!product) notFound()
  const rawVariants = variantsRes.data || []
  const reviews = reviewsRes.data || []
  // p6: Relacionados por categoría + brand como fallback
  const relatedPromise = supabase.from('products').select('id,name,price_incl_tax,sale_price,image_url,stock,active,brand').eq('category_id', product.category_id).eq('active', true).gt('stock', 0).neq('id', params.id).order('id', {ascending: false}).limit(8)
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
  const images = (product.images && product.images.length > 0 ? product.images : [product.image_url]).filter(Boolean)
  const avgRating = reviews.length>0 ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null
  const { data: related } = await relatedPromise
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
          <a href="/" style={{color:'#999',textDecoration:'none'}}>Inicio</a><span>&rsaquo;</span>
          <a href="/tienda" style={{color:'#999',textDecoration:'none'}}>Tienda</a>
          {catName&&<><span>&rsaquo;</span><span style={{color:'#999'}}>{catName}</span></>}
          <span>&rsaquo;</span><span style={{color:'#333',fontWeight:600}}>{product.name}</span>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'24px 20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:32,background:'white',padding:24,marginBottom:24}} className="producto-grid">
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
              Solo quedan {product.stock} unidades!
            </div>}
            <AddToCartSection product={product} variantsByType={variantsByType} sortedTypes={typeOrder} hasVariants={hasVariants}/>
            {/* p7 COMPARTIR WHATSAPP */}
            <a href={'https://wa.me/?text='+encodeURIComponent('Mira este producto: '+product.name+' '+String(typeof window!=='undefined'?window.location.href:'https://buymuscle-tienda.vercel.app/producto/'+product.id))}
              target="_blank" rel="noopener noreferrer"
              style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:10,padding:'10px 16px',border:'1px solid #25d366',borderRadius:4,background:'white',color:'#25d366',fontSize:13,fontWeight:700,textDecoration:'none',width:'100%',boxSizing:'border-box',transition:'all 0.15s'}}
              onMouseEnter={function(e){e.currentTarget.style.background='#25d366';e.currentTarget.style.color='white'}}
              onMouseLeave={function(e){e.currentTarget.style.background='white';e.currentTarget.style.color='#25d366'}}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Compartir en WhatsApp
            </a>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:16}}>
              {[['Envio 24-48h','Peninsular y Canarias'],['Original','Marca oficial'],['Seguro','100% protegido'],['Dudas?','828 048 310']].map(([t,s])=>(
                <div key={t} style={{display:'flex',gap:8,alignItems:'center',padding:'8px 10px',background:'#f9f9f9',border:'1px solid #f0f0f0'}}>
                  <div><div style={{fontSize:11,fontWeight:700,color:'#444'}}>{t}</div><div style={{fontSize:10,color:'#aaa'}}>{s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {desc&&<div style={{background:'white',marginBottom:24}}>
          <div style={{borderBottom:'2px solid #f0f0f0',padding:'0 24px'}}>
            <div style={{padding:'14px 0',borderBottom:'2px solid #ff1e41',display:'inline-block',fontSize:13,fontWeight:700,color:'#ff1e41',textTransform:'uppercase',letterSpacing:'0.05em'}}>Descripcion</div>
          </div>
          <div style={{padding:'24px',fontSize:14,color:'#555',lineHeight:1.8,maxWidth:800}}>
            {desc.split('\n').filter(l=>l.trim()).map((line,i)=><p key={i} style={{margin:'0 0 10px'}}>{line}</p>)}
          </div>
        </div>}
        <ProductReviews productId={product.id} initialReviews={reviews}/>
        {related&&related.length>0&&<div style={{marginTop:24}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:10,borderBottom:'2px solid #ff1e41'}}>
            <span style={{fontSize:16}}>🔥</span>
            <h3 style={{margin:0,fontSize:15,fontWeight:800,textTransform:'uppercase',color:'#111'}}>Complementa tu compra</h3>
            <span style={{fontSize:12,color:'#888',fontWeight:400,marginLeft:'auto'}}>También se lleva con {product.name.split(' ')[0]}</span>
          </div>
          <h2 style={{fontSize:16,fontWeight:900,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:16,color:'#111'}}>Productos relacionados</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {related.map(r=><ProductCard key={r.id} product={r}/>)}
          </div>
        </div>}
      </div>
    </div>
  )
}
