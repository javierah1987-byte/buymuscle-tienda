// @ts-nocheck
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import AddToCartSection from '@/components/AddToCartSection'

export const revalidate = 0

export async function generateMetadata({ params }): Promise<Metadata> {
  const { data } = await supabase.from('products').select('name,description,image_url').eq('id', params.id).single()
  if (!data) return { title: 'Producto | BUYMUSCLE' }
  return {
    title: data.name + ' | BUYMUSCLE',
    description: data.description?.slice(0, 160) || 'Suplementación deportiva de calidad en BuyMuscle',
    openGraph: { images: data.image_url ? [data.image_url] : [] }
  }
}

export default async function ProductPage({ params }) {
  const { data: p } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('id', params.id)
    .single()

  if (!p) notFound()

  const { data: related } = await supabase
    .from('products')
    .select('id,name,price_incl_tax,sale_price,image_url,stock,active')
    .eq('category_id', p.category_id)
    .eq('active', true)
    .neq('id', p.id)
    .limit(4)

  const price = Number(p.price_incl_tax)
  const salePrice = p.sale_price ? Number(p.sale_price) : null
  const displayPrice = salePrice || price
  const discount = salePrice ? Math.round((1 - salePrice / price) * 100) : null
  const inStock = p.stock > 0
  const catName = p.categories?.name || ''

  return (
    <div style={{ background: '#f8f8f8', minHeight: '60vh', fontFamily: 'var(--font-body,Arial)' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8e8e8', padding: '10px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', fontSize: 12, color: '#999', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ color: '#999', textDecoration: 'none' }}>Inicio</a>
          <span>›</span>
          <a href="/tienda" style={{ color: '#999', textDecoration: 'none' }}>Tienda</a>
          {catName && <><span>›</span><a href={'/tienda'} style={{ color: '#999', textDecoration: 'none' }}>{catName}</a></>}
          <span>›</span>
          <span style={{ color: '#333', fontWeight: 600 }}>{p.name}</span>
        </div>
      </div>

      {/* Main product section */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, background: 'white', padding: 32, marginBottom: 24 }}>

          {/* Imagen */}
          <div style={{ position: 'relative' }}>
            {discount && (
              <div style={{ position: 'absolute', top: 12, left: 12, background: '#ff1e41', color: 'white', padding: '4px 10px', fontSize: 13, fontWeight: 900, zIndex: 1 }}>
                -{discount}%
              </div>
            )}
            {p.image_url
              ? <img src={p.image_url} alt={p.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', background: '#f9f9f9' }} />
              : <div style={{ width: '100%', aspectRatio: '1', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>📦</div>}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {catName && (
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{catName}</div>
            )}

            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111', margin: 0, lineHeight: 1.2, textTransform: 'uppercase' }}>{p.name}</h1>

            {p.brand && <div style={{ fontSize: 13, color: '#888' }}>Marca: <strong style={{ color: '#555' }}>{p.brand}</strong></div>}

            {/* Precio */}
            <div style={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--red)' }}>{displayPrice.toFixed(2)} €</span>
                {salePrice && <span style={{ fontSize: 18, color: '#bbb', textDecoration: 'line-through' }}>{price.toFixed(2)} €</span>}
              </div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>IVA incluido · Envío 24-48h laborables</div>
            </div>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: inStock ? '#22c55e' : '#ef4444' }} />
              <span style={{ fontSize: 13, color: inStock ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                {inStock ? `En stock (${p.stock} uds)` : 'Sin stock'}
              </span>
            </div>

            {/* AddToCart */}
            <AddToCartSection product={p} />

            {/* Badges confianza */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
              {[['🚚','Envío 24-48h','Peninsular y Canarias'],['✅','Producto original','Marca oficial'],['🔒','Pago seguro','100% protegido'],['📞','¿Dudas?','WhatsApp 828 048 310']].map(([icon,t,s])=>(
                <div key={t} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 10px', background: '#f9f9f9', border: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#444' }}>{t}</div>
                    <div style={{ fontSize: 10, color: '#aaa' }}>{s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs descripción */}
        {p.description && (
          <div style={{ background: 'white', marginBottom: 24 }}>
            <div style={{ borderBottom: '2px solid #f0f0f0', padding: '0 24px', display: 'flex', gap: 0 }}>
              <div style={{ padding: '14px 20px', borderBottom: '2px solid var(--red)', fontSize: 13, fontWeight: 700, color: 'var(--red)', marginBottom: -2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Descripción
              </div>
            </div>
            <div style={{ padding: '24px', fontSize: 14, color: '#555', lineHeight: 1.8, maxWidth: 800 }}>
              {p.description.split('\n').map((line, i) => (
                line.trim() ? <p key={i} style={{ margin: '0 0 12px' }}>{line}</p> : <br key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Productos relacionados */}
        {related && related.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16, color: '#111' }}>
              Productos relacionados
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {related.map(r => <ProductCard key={r.id} product={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
