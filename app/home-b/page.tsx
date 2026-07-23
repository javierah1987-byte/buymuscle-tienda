import ProductCarousel from '@/components/ProductCarousel'
import OfertaDia from '@/components/OfertaDia'
import { getHomeProducts, getHomeBanners, getWeekOffer } from '@/lib/homeData'
import HeroZone from '@/components/home/HeroZone'
import TrustBar from '@/components/home/TrustBar'
import WeekOffer from '@/components/home/WeekOffer'
import QuickCats from '@/components/home/QuickCats'
import EditorialPanel from '@/components/home/EditorialPanel'
import WorldTiles from '@/components/home/WorldTiles'
import BlogSection from '@/components/home/BlogSection'
import MockupSwitch from '@/components/home/MockupSwitch'

// HOME — VARIANTE B (conservadora): mover lo mínimo respecto a la home actual.
// Solo aplica S1 (hero zone), S6 (novedades → panel+carrusel), S9-S10 (paneles
// iO.GENIX y Sportswear) y S11 (tiles). Oferta del día, barra de confianza,
// stats+testimonios y los carruseles de categoría se quedan donde están hoy.
export const revalidate = 300

// Mockup interno para decidir variante — fuera del índice de buscadores.
export const metadata = { robots: { index: false, follow: false } }

const B2B_BANNER_ID = 10

export default async function HomeB() {
  const [novedades, masVendidos, proteinas, preEntrenos, veganos, iogenix, sportswear, banners, weekOffer] = await Promise.all([
    getHomeProducts({ limit: 12, orderBy: 'id' }),
    getHomeProducts({ limit: 8, orderBy: 'stock' }),
    getHomeProducts({ cat: 'Proteinas', limit: 8, orderBy: 'id' }),
    getHomeProducts({ cat: 'Pre-entrenos', limit: 8, orderBy: 'id' }),
    getHomeProducts({ cat: 'Veganos', limit: 8, orderBy: 'id' }),
    getHomeProducts({ brand: 'iO.GENIX', limit: 12, orderBy: 'stock' }),
    getHomeProducts({ cat: 'Camisetas', limit: 12, orderBy: 'id' }),
    getHomeBanners(),
    getWeekOffer(),
  ])

  const sliderBanners = banners.filter((b: any) => b.id !== B2B_BANNER_ID)
  const b2bImage = (banners as any[]).find(b => b.id === B2B_BANNER_ID)?.image_url

  return (
    <main style={{ background: '#f5f5f5' }}>
      <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>BuyMuscle — Tienda de Suplementación Deportiva en Canarias</h1>

      {/* S1 · HERO ZONE compuesta (único cambio de la parte alta) */}
      <HeroZone sliderBanners={sliderBanners as any} b2bImage={b2bImage} />

      {/* Oferta de la semana — posición actual */}
      <WeekOffer product={weekOffer || novedades[0]} />

      {/* Propuesta de valor — posición actual */}
      <TrustBar />

      {/* Social proof — posición y contenido actuales (stats + testimonios juntos) */}
      <section style={{ background: '#f9f9f9', padding: '1.25rem 20px', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 'clamp(20px,4vw,56px)', flexWrap: 'wrap', alignItems: 'center' }} className="social-proof-stats">
            {([{ n: '+500', l: 'Clientes en Canarias' }, { n: '316', l: 'Productos disponibles' }, { n: '24h', l: 'Envio express' }, { n: '4.9★', l: 'Valoracion media' }]).map(({ n, l }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: 'clamp(20px,2.5vw,28px)', color: '#ff1e41', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }} className="social-proof-reviews">
            {([{ t: 'La mejor tienda de suplementacion de Canarias. Envio en 24h.', a: 'Carlos M.' }, { t: 'Precios imbatibles y atencion al cliente 10/10.', a: 'Laura G.' }, { t: 'Productos originales y bien embalados. Repito seguro.', a: 'Marta R.' }]).map(({ t, a }) => (
              <div key={a} style={{ background: 'white', border: '1px solid #ebebeb', borderRadius: 8, padding: '10px 12px', maxWidth: 200, fontSize: 12 }}>
                <div style={{ color: '#f59e0b', fontSize: 12, marginBottom: 3 }}>★★★★★</div>
                <div style={{ color: '#666', lineHeight: 1.4, fontStyle: 'italic' }}>&quot;{t}&quot;</div>
                <div style={{ fontWeight: 700, color: '#111', marginTop: 5, fontSize: 10 }}>— {a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías rápidas — posición actual */}
      <QuickCats />

      {/* Oferta del día — posición actual */}
      <OfertaDia />

      {/* S6 · NOVEDADES → panel + carrusel (los 4 botones pasan a los tiles) */}
      <EditorialPanel
        side="left"
        eyebrow="Recién llegado"
        title="Novedades"
        body="Lo último en nutrición deportiva, ya en Canarias. Proteínas, creatina y pre-entrenos de marcas oficiales — recién salidos del horno y en tu casa en 24-48h."
        cta={{ href: '/tienda', label: 'Ver novedades →' }}
        products={novedades}
      />

      {/* Los más vendidos — como está */}
      <ProductCarousel
        products={masVendidos}
        title="LOS MAS VENDIDOS"
        titleIcon="🏆"
        href="/tienda"
        hrefLabel="Ver todos →"
      />

      {/* Proteínas — se mantiene */}
      <ProductCarousel
        products={proteinas}
        title="LAS MEJORES PROTEINAS"
        titleIcon="🥛"
        href="/tienda?cat=Proteinas"
        hrefLabel="Ver todas →"
      />

      {/* S9 · Panel iO.GENIX — nuevo */}
      <EditorialPanel
        side="right"
        eyebrow="Tienda oficial"
        title={<>iO.GENIX <span style={{ color: 'var(--red)' }}>Nutrition</span></>}
        body="La marca que más se mueve en nuestra tienda, con distribución oficial en Canarias. Whey, isolate, creatina Creapure® y más — originales, frescos y al mejor precio de las islas."
        cta={{ href: '/marca/iogenix', label: 'Ver todo iO.GENIX →' }}
        products={iogenix}
      />

      {/* S10 · BM SPORTSWEAR — panel oscuro (sustituye al banner estático) */}
      <EditorialPanel
        side="left"
        dark
        eyebrow="La ropa de la casa"
        title={<>BM <span style={{ color: '#47daff' }}>Sportswear</span></>}
        body="Viste como entrenas. Camisetas y prendas de corte urbano y relajado, para el gym y para la calle. Diseño propio BuyMuscle."
        cta={{ href: '/sport-wear', label: 'Ver colección →' }}
        secondary={{ href: '/streetflavour', label: '¿Buscas StreetFlavour? →' }}
        products={sportswear}
      />

      {/* Pre-entrenos — se mantiene */}
      <ProductCarousel
        products={preEntrenos}
        title="PRE-ENTRENOS"
        titleIcon="🔥"
        href="/tienda?cat=Pre-entrenos"
        hrefLabel="Ver todos →"
      />

      {/* Veganos — se mantiene */}
      {veganos.length > 0 && (
        <ProductCarousel
          products={veganos}
          title="VEGANOS"
          titleIcon="🌱"
          href="/veganos"
          hrefLabel="Ver todos →"
        />
      )}

      {/* S11 · Los mundos BuyMuscle — tiles (los botones que salen de Novedades) */}
      <WorldTiles />

      {/* Blog — como está */}
      <BlogSection />

      <MockupSwitch variant="B" />
    </main>
  )
}
