export const revalidate = 0

import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import AddToCartSection from '@/components/AddToCartSection'
import Link from 'next/link'

async function getProduct(id: string) {
  const { data } = await supabase.from('products')
    .select('*, categories(name)')
    .eq('id', id).single()
  return data
}

async function getVariants(productId: string) {
  const { data } = await supabase
    .from('product_variants')
    .select('id, stock, price_modifier, attribute_value_id, attribute_values(value, hex_color, position, attribute_types(name))')
    .eq('product_id', productId).eq('active', true)
  return data || []
}

async function getRelated(categoryId: number, excludeId: number) {
  const { data } = await supabase.from('products')
    .select('*, categories(name)')
    .eq('category_id', categoryId).eq('active', true)
    .neq('id', excludeId).limit(4)
  return data || []
}

export default async function ProductoPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  const [variants, related] = await Promise.all([
    getVariants(params.id),
    getRelated(product.category_id, product.id)
  ])

  const variantsByType: Record<string, any[]> = {}
  for (const v of variants) {
    const av = v.attribute_values as any
    if (!av) continue
    const typeName = av.attribute_types?.name || 'Sabor'
    if (!variantsByType[typeName]) variantsByType[typeName] = []
    if (!variantsByType[typeName].find((x: any) => x.value === av.value)) {
      variantsByType[typeName].push({ id: av.position, value: av.value, hex: av.hex_color, variantId: v.id, stock: v.stock, priceModifier: v.price_modifier })
    }
  }

  const typeOrder = ['Sabor', 'Talla', 'Color']
  const sortedTypes = Object.keys(variantsByType).sort((a, b) => {
    const ai = typeOrder.indexOf(a); const bi = typeOrder.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
  const hasVariants = sortedTypes.length > 0
  const catName = (product.categories as any)?.name || 'Suplemento'
  const stockLow = product.stock > 0 && product.stock <= 10

  return (
    <div style={{background:'white', minHeight:'100vh', paddingBottom:'4rem'}}>
      {/* Breadcrumb */}
      <div style={{background:'#f8f8f8', borderBottom:'1px solid #e8e8e8', padding:'10px 0'}}>
        <div className="container" style={{display:'flex', gap:6, alignItems:'center', fontSize:12, color:'#999'}}>
          <Link href="/" style={{color:'#999', textDecoration:'none'}}>Inicio</Link>
          <span>›</span>
          <Link href="/tienda" style={{color:'#999', textDecoration:'none'}}>Tienda</Link>
          {catName && <>
            <span>›</span>
            <Link href={`/tienda?cat=${encodeURIComponent(catName)}`} style={{color:'#999', textDecoration:'none'}}>{catName}</Link>
          </>}
          <span>›</span>
          <span style={{color:'#333'}}>{product.name.slice(0, 50)}{product.name.length > 50 ? '...' : ''}</span>
        </div>
      </div>

      <div className="container" style={{paddingTop:'2rem'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem', alignItems:'start', background:'white', padding:'1.5rem', border:'1px solid #f0f0f0'}}>

          {/* IMAGEN + thumbnails */}
          <div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:400, background:'white', padding:'1rem', border:'1px solid #f0f0f0', position:'relative'}}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image_url || 'https://placehold.co/500x500/f5f5f5/ccc?text=BuyMuscle'}
                alt={product.name}
                style={{maxWidth:'100%', maxHeight:380, objectFit:'contain'}}
              />
            </div>
            {/* Thumbnails */}
            <div style={{display:'flex', gap:'0.5rem', marginTop:'0.75rem'}}>
              {[product.image_url, product.image_url].filter(Boolean).slice(0,3).map((img, i) => (
                <div key={i} style={{width:72, height:72, border:'1px solid #e8e8e8', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', padding:'4px'}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img!} alt="" style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain'}}/>
                </div>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div>
            {/* Nombre + logo marca */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem'}}>
              <h1 style={{fontSize:'clamp(18px,2.5vw,24px)', fontWeight:700, textTransform:'uppercase', lineHeight:1.2, color:'#111', margin:0, flex:1, paddingRight:'1rem'}}>
                {product.name}
              </h1>
            </div>

            {/* Badge de stock */}
            {product.stock === 0 ? (
              <div style={{display:'inline-block', border:'1px solid var(--red)', color:'var(--red)', fontSize:12, fontWeight:700, padding:'4px 12px', marginBottom:'0.75rem'}}>
                ⚠️ Sin stock
              </div>
            ) : stockLow ? (
              <div style={{display:'inline-block', border:'1px solid var(--red)', color:'var(--red)', fontSize:12, fontWeight:700, padding:'4px 12px', marginBottom:'0.75rem'}}>
                ! Últimas unidades en stock ¡Corre!
              </div>
            ) : (
              <div style={{display:'inline-flex', alignItems:'center', gap:6, color:'#5cb85c', fontSize:13, fontWeight:600, marginBottom:'0.75rem'}}>
                <span style={{width:8, height:8, borderRadius:'50%', background:'#5cb85c', display:'inline-block'}}></span>
                En stock ({product.stock} uds)
              </div>
            )}

            {/* Selector variantes + precio + botón */}
            <AddToCartSection
              product={product as any}
              variantsByType={variantsByType}
              sortedTypes={sortedTypes}
              hasVariants={hasVariants}
            />
          </div>
        </div>

        {/* Relacionados */}
        {related.length > 0 && (
          <section style={{marginTop:'3rem'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', borderBottom:'2px solid var(--red)', paddingBottom:'0.75rem'}}>
              <h2 style={{fontSize:18, fontWeight:800, textTransform:'uppercase', margin:0, color:'#111'}}>
                PRODUCTOS <span style={{color:'var(--red)'}}>RELACIONADOS</span>
              </h2>
              <Link href={`/tienda?cat=${encodeURIComponent(catName)}`} style={{fontSize:13, color:'var(--red)', fontWeight:700, textDecoration:'none', border:'1px solid var(--red)', padding:'6px 16px'}}>
                Ver categoría →
              </Link>
            </div>
            <div className="products-grid">
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
