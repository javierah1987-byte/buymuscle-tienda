// @ts-nocheck
import WishlistBtn from '@/components/WishlistBtn'
import ProductReviews from '@/components/ProductReviews'
import ImageGallery from '@/components/ImageGallery'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import AddToCartSection from '@/components/AddToCartSection'

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
  const { data: product } = await supabase.from('products').select('*, categories(name)').eq('id', params.id).single()
  if (!product) notFound()

  const { data: rawVariants } = await supabase
    .from('product_variants')
    .select('*, attribute_values(value, hex_color, attribute_types(name))')
    .eq('product_id', params.id).eq('active', true)

  const { data: related } = await supabase
    .from('products').select('id,name,price_incl_tax,sale_price,image_url,stock,active')
    .eq('category_id', product.category_id).eq('active', true).neq('id', params.id).limit(4)

  const variantsByType: Record<string, any[]> = {}
  const typeOrder: string[] = []
  for (const v of rawVariants || []) {
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

  return (
    <div style={{background:'#f8f8f8',minHeight:'60vh'}}>
      <div style={{background:'white',borderBottom:'1px solid #e8e8e8',padding:'10px 20px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',fontSize:12,color:'#999',display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
          <a href="/" style={{color:'#999',textDecoration:'none'}}>Inicio</a><span>›</span>
          <a href="/tienda" style={{color:'#999',textDecoration:'none'}}>Tienda</a>
          {catName&&<><span>›</span><span style={{color:'#999'}}>{catName}</span></>}
          <span>›</span><span style={{color:'#333',fontWeight:600}}>{product.name}</span>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'24px 20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:32,background:'white',padding:32,marginBottom:24}}>
          <div style={{position:'relative'}}>
            {discount&&<div style={{position:'absolute',top:12,left:12,background:'#ff1e41',color:'white',padding:'4px 10px',fontSize:13,fontWeight:900,zIndex:1}}>-{discount}%</div>}
            {product.image_url
              ? <ImageGallery images={[product.image_url,...(product.extra_images||[])].filter(Boolean)} name={product.name}/>
              : <div style={{width:'100%',aspectRatio:'1',background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:64}}>📦</div>}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {catName&&<div style={{fontSize:11,fontWeight:700,color:'#ff1e41',textTransform:'uppercase',letterSpacing:'0.1em'}}>{catName}</div>}
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
        <h1 style={{fontSize:24,fontWeight:900,color:'#111',margin:0,lineHeight:1.2,textTransform:'uppercase'}}>{product.name}</h1><WishlistBtn productId={product.id} size={28}/></div>
            {product.brand&&<div style={{fontSize:13,color:'#888'}}>Marca: <strong style={{color:'#555'}}>{product.brand}</strong></div>}
            <div style={{borderTop:'1px solid #f0f0f0',borderBottom:'1px solid #f0f0f0',padding:'16px 0'}}>
              <div style={{display:'flex',alignItems:'baseline',gap:12,flexWrap:'wrap'}}>
                <span style={{fontSize:36,fontWeight:900,color:'#ff1e41'}}>{displayPrice.toFixed(2)} €</span>
                {salePrice&&<span style={{fontSize:18,color:'#bbb',textDecoration:'line-through'}}>{price.toFixed(2)} €</span>}
              </div>
              <div style={{fontSize:12,color:'#aaa',marginTop:4}}>IVA incluido · Envío 24-48h</div>
            </div>
            {product.stock>0&&product.stock<=10&&<div style={{background:'#fff3cd',border:'1px solid #ffc107',padding:'8px 14px',marginBottom:12,fontSize:13,fontWeight:700,color:'#856404'}}>
        ⚠️ ¡Solo quedan {product.stock} unidades! Corre antes de que se agote.
      </div>}
      <AddToCartSection product={product} variantsByType={variantsByType} sortedTypes={typeOrder} hasVariants={hasVariants}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[['🚚','Envío 24-48h','Peninsular y Canarias'],['✅','Original','Marca oficial'],['🔒','Seguro','100% protegido'],['📞','¿Dudas?','828 048 310']].map(([i,t,s])=>(
                <div key={t} style={{display:'flex',gap:8,alignItems:'center',padding:'8px 10px',background:'#f9f9f9',border:'1px solid #f0f0f0'}}>
                  <span style={{fontSize:18}}>{i}</span>
                  <div><div style={{fontSize:11,fontWeight:700,color:'#444'}}>{t}</div><div style={{fontSize:10,color:'#aaa'}}>{s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {desc&&(
          <div style={{background:'white',marginBottom:24}}>
            <div style={{borderBottom:'2px solid #f0f0f0',padding:'0 24px'}}>
              <div style={{padding:'14px 0',borderBottom:'2px solid #ff1e41',display:'inline-block',fontSize:13,fontWeight:700,color:'#ff1e41',textTransform:'uppercase',letterSpacing:'0.05em'}}>Descripción</div>
            </div>
            <div style={{padding:'24px',fontSize:14,color:'#555',lineHeight:1.8,maxWidth:800}}>
              {desc.split('\n').filter(l=>l.trim()).map((line,i)=><p key={i} style={{margin:'0 0 10px'}}>{line}</p>)}
            </div>
          </div>
        )}
        {related&&related.length>0&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:900,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:16,color:'#111'}}>Productos relacionados</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
              {related.map(r=><ProductCard key={r.id} product={r}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
