import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

async function getProducts(cat?: string, limit = 8) {
  let q = supabase.from('products').select('*, categories(name)').eq('active', true).gt('stock', 0)
  if (cat) {
    const { data: catData } = await supabase.from('categories').select('id').eq('name', cat).single()
    if (catData) q = q.eq('category_id', catData.id)
  }
  const { data } = await q.order('id', { ascending: false }).limit(limit)
  return data || []
}

const QUICK_CATS = [
  { name: 'Proteínas', icon: '🥛', slug: 'Proteínas' },
  { name: 'Creatinas', icon: '⚡', slug: 'Creatinas Monohidratos' },
  { name: 'Pre-entrenos', icon: '🔥', slug: 'Pre-entrenos' },
  { name: 'BCAA', icon: '💪', slug: 'BCAA' },
  { name: 'Vitaminas', icon: '💊', slug: 'Vitaminas' },
  { name: 'Quemadores', icon: '🎯', slug: 'Quemadores' },
  { name: 'Sport Wear', icon: '👕', slug: 'Sport Wear' },
  { name: 'Veganos', icon: '🌱', slug: 'Veganos' },
  { name: 'Snacks', icon: '🍫', slug: 'Snacks Protéicos' },
  { name: 'Gainers', icon: '💥', slug: 'Ganadores de Peso' },
]

export default async function Home() {
  const [novedades, proteinas, preEntrenos] = await Promise.all([
    getProducts(undefined, 8),
    getProducts('Proteínas', 4),
    getProducts('Pre-entrenos', 4),
  ])

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>

      {/* ═══ HERO BANNER ═══ */}
      <section style={{ background: '#111', borderBottom: '3px solid var(--red)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 0, minHeight: 380 }}>
            {/* Banner principal */}
            <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0505 100%)', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', background: 'radial-gradient(ellipse at right, rgba(255,30,65,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                Nuevos sabores disponibles
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: 'white', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: '1rem' }}>
                SUPLEMENTACIÓN<br />DE <span style={{ color: 'var(--red)' }}>ÉLITE</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7, maxWidth: 420, marginBottom: '1.5rem' }}>
                Más de 300 productos de las mejores marcas mundiales. Proteínas, creatinas, pre-entrenos y mucho más.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/tienda" style={{ background: 'var(--red)', color: 'white', padding: '12px 28px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ver catálogo
                </Link>
                <Link href="/tienda?cat=Proteínas" style={{ background: 'transparent', color: 'white', padding: '11px 24px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Proteínas →
                </Link>
              </div>
              {/* Stats */}
              <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
                {[['300+','Productos'], ['24h','Envío'], ['100%','Originales'], ['3','Niveles VIP']].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--red)' }}>{n}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Banner BM VIP lateral — exacto al original */}
            <div style={{ background: 'linear-gradient(160deg, #1a1208 0%, #2d1f00 50%, #0a0a0a 100%)', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#FBEC96', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>ÚNETE AHORA</div>
              <div style={{ fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 900, color: '#FBEC96', lineHeight: 1, marginBottom: '0.25rem', fontStyle: 'italic' }}>BMVIP</div>
              <div style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 900, color: 'white', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>BUYMUSCLE</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: 240 }}>
                Beneficios Exclusivos · Transforma tu experiencia de compra
              </div>
              <Link href="/distribuidores" style={{ background: '#FBEC96', color: '#111', padding: '10px 24px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                DESCUBRE CÓMO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CATEGORÍAS RÁPIDAS ═══ */}
      <section style={{ background: 'white', borderBottom: '1px solid #e8e8e8', padding: '0' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
            {QUICK_CATS.map(cat => (
              <Link key={cat.name} href={`/tienda?cat=${encodeURIComponent(cat.slug)}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '14px 18px', fontSize: 11, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.04em', textDecoration: 'none', borderRight: '1px solid #f0f0f0', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s' }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NOVEDADES ═══ */}
      <section style={{ padding: '2.5rem 0', background: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '2px solid #f0f0f0', paddingBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>BUYMUSCLE</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: 0, letterSpacing: '0.02em' }}>NOVEDADES</h2>
            </div>
            <Link href="/tienda" style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, textDecoration: 'none', border: '1px solid var(--red)', padding: '6px 16px' }}>
              Ver todo →
            </Link>
          </div>
          <div className="products-grid">
            {novedades.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ═══ BANNER DISTRIBUIDORES ═══ */}
      <section style={{ background: '#111', padding: '3rem 0', borderTop: '3px solid var(--red)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>PROGRAMA EXCLUSIVO</div>
              <h3 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 900, textTransform: 'uppercase', color: 'white', marginBottom: '0.75rem', lineHeight: 1.1 }}>
                PORTAL DE <span style={{ color: 'var(--red)' }}>DISTRIBUIDORES</span>
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 500, lineHeight: 1.7, fontSize: 14 }}>
                Accede con tus credenciales para ver precios exclusivos según tu nivel. Hasta un 20% de descuento automático en todos los productos.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                {[['🥉 Bronze', '-10%', '#cd7f32'], ['🥈 Silver', '-15%', '#a8a9ad'], ['🥇 Gold', '-20%', '#ffd700']].map(([n, d, c]) => (
                  <div key={n} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${c}40`, padding: '8px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c as string }}>{n}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/distribuidores/login" style={{ background: 'var(--red)', color: 'white', padding: '14px 32px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.05em' }}>
                Acceder al portal
              </Link>
              <Link href="/distribuidores" style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', padding: '12px 28px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.05em' }}>
                Más información
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROTEÍNAS ═══ */}
      {proteinas.length > 0 && (
        <section style={{ padding: '2.5rem 0', background: '#f5f5f5' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '2px solid #e8e8e8', paddingBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>CATEGORÍA</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: 0 }}>PROTEÍNAS</h2>
              </div>
              <Link href="/tienda?cat=Proteínas" style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, textDecoration: 'none', border: '1px solid var(--red)', padding: '6px 16px' }}>
                Ver todas →
              </Link>
            </div>
            <div className="products-grid">
              {proteinas.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ═══ PRE-ENTRENOS ═══ */}
      {preEntrenos.length > 0 && (
        <section style={{ padding: '2.5rem 0', background: 'white' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '2px solid #f0f0f0', paddingBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>CATEGORÍA</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: 0 }}>PRE-ENTRENOS</h2>
              </div>
              <Link href="/tienda?cat=Pre-entrenos" style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, textDecoration: 'none', border: '1px solid var(--red)', padding: '6px 16px' }}>
                Ver todas →
              </Link>
            </div>
            <div className="products-grid">
              {preEntrenos.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
