export const revalidate = 0
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import AddToCartSection from '@/components/AddToCartSection'
import Link from 'next/link'

async function getProduct(id: string) {
  const { data } = await supabase
    .from('products')
    .select('*, categories(id, name)')
    .eq('id', parseInt(id))
    .single()
  return data
}

async function getVariants(productId: number) {
  const { data } = await supabase
    .from('product_variants')
    .select('*, attribute_values(value, hex_color, attribute_types(name))')
    .eq('product_id', productId)
    .eq('active', true)
    .gt('stock', 0)
  return data || []
}

async function getRelated(categoryId: number, excludeId: number) {
  const { data } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .eq('active', true)
    .gt('stock', 0)
    .limit(4)
  return data || []
}

export default async function ProductoPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  if (!product) return notFound()

  const variants = await getVariants(product.id)
  const related = await getRelated(product.category_id, product.id)

  // Agrupar variantes por tipo
  const variantsByType: Record<string, any[]> = {}
  variants.forEach((v: any) => {
    const typeName = v.attribute_values?.attribute_types?.name || 'Opción'
    if (!variantsByType[typeName]) variantsByType[typeName] = []
    variantsByType[typeName].push({
      id: v.id,
      value: v.attribute_values?.value || '',
      hex: v.attribute_values?.hex_color,
      variantId: v.id,
      stock: v.stock,
      priceModifier: v.price_modifier || 0
    })
  })
  const sortedTypes = Object.keys(variantsByType)
  const hasVariants = sortedTypes.length > 0

  const catName = (product.categories as any)?.name || ''
  const catId = product.category_id

  return (
    <div style={{ background:'#f5f5f5', minHeight:'80vh' }}>
      {/* Breadcrumb */}
      <div style={{ background:'white', borderBottom:'1px solid #ebebeb' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'10px 20px' }}>
          <div style={{ display:'flex', gap:6, alignItems:'center', fontSize:12, color:'#999' }}>
            <Link href="/" style={{ color:'#999', textDecoration:'none' }}>Inicio</Link>
            <span>›</span>
            <Link href="/tienda" style={{ color:'#999', textDecoration:'none' }}>Tienda</Link>
            {catName && <>
              <span>›</span>
              <Link href={`/tienda?cat=${encodeURIComponent(catName)}`} style={{ color:'#999', textDecoration:'none' }}>{catName}</Link>
            </>}
            <span>›</span>
            <span style={{ color:'#333', fontWeight:600 }}>{product.name.slice(0,50)}</span>
          </div>
        </div>
      </div>

      {/* Ficha de producto */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'1.5rem 20px 2.5rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 480px', gap:'2.5rem', alignItems:'start', background:'white', border:'1px solid #ebebeb', padding:'2rem' }}>

          {/* Galería */}
          <div>
            {/* Imagen principal */}
            <div style={{ border:'1px solid #f0f0f0', background:'#f8f8f8', display:'flex', alignItems:'center', justifyContent:'center', height:460, marginBottom:'0.75rem', overflow:'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image_url || 'https://placehold.co/500x500/f5f5f5/ccc?text=BM'}
                alt={product.name}
                style={{ maxWidth:'85%', maxHeight:'85%', objectFit:'contain', transition:'transform 0.3s' }}
                onMouseEnter={e=>((e.target as HTMLImageElement).style.transform='scale(1.05)')}
                onMouseLeave={e=>((e.target as HTMLImageElement).style.transform='scale(1)')}
              />
            </div>
            {/* Thumbnails si hay más imágenes */}
            <div style={{ display:'flex', gap:8 }}>
              {[product.image_url, product.image_url].filter(Boolean).slice(0,4).map((img, i) => (
                <div key={i} style={{ width:72, height:72, border:'1px solid #e0e0e0', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f8f8', cursor:'pointer', overflow:'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img!} alt="" style={{ maxWidth:'90%', maxHeight:'90%', objectFit:'contain' }}/>
                </div>
              ))}
            </div>
          </div>

          {/* Info + AddToCart */}
          <div>
            {/* Categoría */}
            {catName && (
              <Link href={`/tienda?cat=${encodeURIComponent(catName)}`}
                style={{ fontSize:11, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.1em', textDecoration:'none', display:'block', marginBottom:8 }}>
                {catName}
              </Link>
            )}

            {/* Nombre */}
            <h1 style={{ fontSize:'clamp(18px,2.5vw,26px)', fontWeight:900, color:'#111', textTransform:'uppercase', lineHeight:1.15, marginBottom:'1rem' }}>
              {product.name}
            </h1>

            {/* Separador */}
            <div style={{ borderTop:'1px solid #f0f0f0', marginBottom:'1rem' }}/>

            {/* AddToCart con variantes */}
            <AddToCartSection
              product={product}
              variantsByType={variantsByType}
              sortedTypes={sortedTypes}
              hasVariants={hasVariants}
            />

            {/* Descripción si existe */}
            {product.description && (
              <div style={{ marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid #f0f0f0' }}>
                <h3 style={{ fontSize:13, fontWeight:700, textTransform:'uppercase', color:'#333', letterSpacing:'0.05em', marginBottom:'0.75rem' }}>Descripción</h3>
                <div style={{ fontSize:13, color:'#666', lineHeight:1.8 }}
                  dangerouslySetInnerHTML={{ __html: product.description }}/>
              </div>
            )}

            {/* Info de entrega */}
            <div style={{ marginTop:'1.5rem', background:'#f9f9f9', border:'1px solid #ebebeb', padding:'1rem 1.25rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                {[
                  ['🚚', 'Entrega 24/48h', 'En pedidos antes de las 14h'],
                  ['🔒', 'Pago seguro', 'SSL · Tarjeta · Bizum'],
                  ['🔄', 'Devoluciones', '14 días sin preguntas'],
                  ['✅', '100% Original', 'Producto garantizado'],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#333' }}>{title}</div>
                      <div style={{ fontSize:11, color:'#999' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {related.length > 0 && (
          <div style={{ marginTop:'2.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', borderBottom:'2px solid #e0e0e0', paddingBottom:'0.75rem' }}>
              <h2 style={{ fontSize:17, fontWeight:800, textTransform:'uppercase', color:'#111', margin:0 }}>
                PRODUCTOS <span style={{ color:'var(--red)' }}>RELACIONADOS</span>
              </h2>
              {catId && (
                <Link href={`/tienda?cat=${encodeURIComponent(catName)}`}
                  style={{ fontSize:12, color:'var(--red)', fontWeight:700, textDecoration:'none', border:'1px solid var(--red)', padding:'5px 14px' }}>
                  Ver categoría →
                </Link>
              )}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'#e0e0e0' }}>
              {related.map((p: any) => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
