// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import type { Metadata } from 'next'
import WishlistBtn from '@/components/WishlistBtn'
import ProductReviews from '@/components/ProductReviews'
import ProductTabs from '@/components/ProductTabs'
import AddToCartSection from '@/components/AddToCartSection'
import ProductCard from '@/components/ProductCard'
import ImageGallery from '@/components/ImageGallery'
import ProductoGrid from '@/components/ProductoGrid'
import Script from 'next/script'
import { SITE_URL } from '@/lib/site'

const supabase = createClient('https://awwlbepjxuoxaigztugh.supabase.co',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
// ISR: la página se regenera cada 60 s. El stock mostrado puede tener hasta 1 min
// de antigüedad, pero el checkout valida stock de forma autoritativa (sin_stock 409),
// así que una insignia "disponible" ligeramente obsoleta no causa sobreventa.
export const revalidate = 60

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
    alternates: { canonical: SITE_URL + '/producto/' + params.id },
    description: desc,
    openGraph: { title: p.name + ' | BuyMuscle', description: desc, type: 'website', url: SITE_URL + '/producto/' + params.id, images: p.image_url ? [{ url: p.image_url }] : [] }
  }
}

export default async function ProductoPage({ params }) {
  const [product, variantsRes, reviewsRes] = await Promise.all([
    getProduct(params.id),
    supabase.from('product_variants').select('*, attribute_values(value, hex_color, attribute_types(name))').eq('product_id', params.id).eq('active', true),
    // Mismo filtro/orden que el fetch cliente de ProductReviews para que las listas coincidan
    supabase.from('product_reviews').select('id,name,rating,comment,created_at').eq('product_id', params.id).eq('verified', true).order('created_at', { ascending: false })
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
    variantsByType[typeName].push({ id: v.attribute_values?.id, value: v.attribute_values?.value||'', hex: v.attribute_values?.hex_color, variantId: v.id, stock: v.stock, priceModifier: v.price_modifier||0, image: v.image_url||null, images: v.images||null })
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
    offers:{'@type':'Offer',url:SITE_URL+'/producto/'+params.id,priceCurrency:'EUR',price:displayPrice.toFixed(2),availability:product.stock>0?'https://schema.org/InStock':'https://schema.org/OutOfStock',seller:{'@type':'Organization',name:'BuyMuscle'}},
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
        <ProductoGrid>
          <ImageGallery images={images} name={product.name}/>
          <div>
            {catName&&<div style={{fontSize:12,fontWeight:700,color:'#ff1e41',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>{catName}</div>}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <h1 style={{fontSize:22,fontWeight:900,color:'#111',textTransform:'uppercase',margin:0,lineHeight:1.2}}>{product.name}</h1>
              <WishlistBtn productId={product.id} size={28}/>
            </div>
            {product.brand&&<div style={{fontSize:13,color:'#888',marginBottom:16}}>Marca: <strong style={{color:'#555'}}>{product.brand}</strong></div>}
            {discount&&<div style={{display:'inline-block',background:'#ff1e41',color:'white',fontSize:12,fontWeight:700,padding:'3px 8px',marginBottom:8}}>-{discount}%</div>}
            {product.stock > 0 && (
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 12px',background:'#f0fff4',border:'1px solid #bbf7d0',borderRadius:4,marginBottom:8}}>
                <span style={{fontSize:14}}>✅</span>
                <span style={{fontSize:12,color:'#166534',fontWeight:600}}>En stock · Envío 24-48h a Canarias y Península</span>
              </div>
            )}
            {product.stock>0&&product.stock<=10&&<div style={{background:'#fff3cd',border:'1px solid #ffc107',padding:'8px 14px',marginBottom:12,fontSize:13,fontWeight:700,color:'#856404'}}>
              Solo quedan {product.stock} unidades!
            </div>}
            <AddToCartSection product={product} variantsByType={variantsByType} sortedTypes={typeOrder} hasVariants={hasVariants}/>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:10,marginTop:18}}>
              {[['🚚','Envío 24-48h','Península y Canarias','#fff0f2'],['✅','100% Original','Marca oficial','#eefaf0'],['🔒','Pago seguro','Compra protegida','#eef3fb']].map(([ic,t,s,bg])=>(
                <div key={t} style={{display:'flex',gap:11,alignItems:'center',padding:'12px 13px',background:'#fff',border:'1px solid #ececec',borderRadius:11,boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
                  <div style={{width:40,height:40,borderRadius:10,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{ic}</div>
                  <div style={{minWidth:0}}><div style={{fontSize:12.5,fontWeight:800,color:'#1a1a1a',lineHeight:1.2}}>{t}</div><div style={{fontSize:11,color:'#999',marginTop:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s}</div></div>
                </div>
              ))}
            </div>
            <a href="https://wa.me/34828048310" target="_blank" rel="noopener noreferrer" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',gap:2,marginTop:10,padding:'14px',background:'linear-gradient(135deg,#ff1e41,#d4132f)',borderRadius:12,boxShadow:'0 3px 12px rgba(255,30,65,0.28)',textDecoration:'none'}}>
              <div style={{fontSize:22}}>💬</div>
              <div style={{fontSize:14,fontWeight:800,color:'#fff'}}>¿Dudas? Escríbenos</div>
              <div style={{fontSize:12.5,color:'rgba(255,255,255,0.92)',fontWeight:600}}>WhatsApp · 828 048 310</div>
            </a>
          </div>
        </ProductoGrid>
        <ProductTabs description={desc} reviews={reviews} productId={product.id}/>
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
