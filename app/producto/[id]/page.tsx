// @ts-nocheck
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import AddToCartSection from '@/components/AddToCartSection'

export const revalidate = 0

export async function generateMetadata({ params }): Promise<Metadata> {
  const { data: p } = await supabase.from('products').select('name,short_description,image_url').eq('id', params.id).single()
  if (!p) return { title: 'Producto | BUYMUSCLE' }
  return {
    title: p.name,
    description: p.short_description || 'Compra ' + p.name + ' en BuyMuscle. Envio rapido a Canarias.',
    openGraph: { title: p.name + ' | BUYMUSCLE', images: p.image_url ? [{ url: p.image_url }] : [] },
  }
}

export default async function ProductoPage({ params }) {
  const { data: product } = await supabase
    .from('products').select('*, categories(name)').eq('id', params.id).single()

  if (!product) notFound()

  const { data: rawVariants } = await supabase
    .from('product_variants')
    .select('*, attribute_values(value, hex_color, attribute_types(name))')
    .eq('product_id', params.id).eq('active', true)

  const { data: related } = await supabase
    .from('products').select('*, categories(name)')
    .eq('category_id', product.category_id).eq('active', true)
    .gt('stock', 0).neq('id', params.id).limit(4)

  // Agrupar variantes por tipo (igual que antes)
  const variantsByType: Record<string, any[]> = {}
  const typeOrder: string[] = []
  for (const v of rawVariants || []) {
    const typeName = v.attribute_values?.attribute_types?.name || 'Variante'
    const val = v.attribute_values?.value || ''
    if (!variantsByType[typeName]) { variantsByType[typeName] = []; typeOrder.push(typeName) }
    variantsByType[typeName].push({ id: v.attribute_values?.id, value: val, hex: v.attribute_values?.hex_color, variantId: v.id, stock: v.stock, priceModifier: v.price_modifier || 0 })
  }
  const hasVariants = Object.keys(variantsByType).length > 0
  const catName = product.categories?.name || ''

  return (
    <div style={{ background: '#f5f5f5', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 20px 3rem' }}>
        <div style={{ fontSize: 12, color: '#999', marginBottom: '1.5rem', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <a href="/" style={{ color: '#999', textDecoration: 'none' }}>Inicio</a><span>›</span>
          <a href="/tienda" style={{ color: '#999', textDecoration: 'none' }}>Tienda</a><span>›</span>
          {catName && <><a href={'/tienda?cat=' + encodeURIComponent(catName)} style={{ color: '#999', textDecoration: 'none' }}>{catName}</a><span>›</span></>}
          <span style={{ color: '#333', fontWeight: 600 }}>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: 'white', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: '#f9f9f9', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
              {product.image_url
                ? <img src={product.image_url} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                : <div style={{ fontSize: 80 }}>📦</div>}
            </div>
          </div>

          <div>
            {catName && <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{catName}</div>}
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111', lineHeight: 1.2, marginBottom: '0.75rem' }}>{product.name}</h1>
            {product.brand && <div style={{ fontSize: 12, color: '#888', marginBottom: '1rem' }}>Marca: <strong>{product.brand}</strong></div>}

            <AddToCartSection
              product={product}
              variantsByType={variantsByType}
              sortedTypes={typeOrder}
              hasVariants={hasVariants}
            />

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1.5rem', fontSize: 12, color: '#777', flexWrap: 'wrap' }}>
              <span>🚚 Envio 24/48h</span>
              <span>✅ Producto original</span>
              <span>🔒 Pago seguro</span>
            </div>
          </div>
        </div>

        {product.description && (
          <div style={{ background: 'white', padding: '1.5rem 2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' }}>Descripcion del producto</h2>
            <div style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        )}

        {related && related.length > 0 && (
          <div style={{ background: 'white', padding: '1.5rem 2rem' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' }}>Productos relacionados</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: '#e0e0e0' }}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
