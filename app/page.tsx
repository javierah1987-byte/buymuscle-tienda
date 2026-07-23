import ProductCarousel from '@/components/ProductCarousel'
import OfertaDia from '@/components/OfertaDia'
import { getHomeProducts, getHomeBanners, getWeekOffer } from '@/lib/homeData'
import HeroZone from '@/components/home/HeroZone'
import TrustBar from '@/components/home/TrustBar'
import WeekOffer from '@/components/home/WeekOffer'
import QuickCats from '@/components/home/QuickCats'
import StatsBand from '@/components/home/StatsBand'
import EditorialPanel from '@/components/home/EditorialPanel'
import WorldTiles from '@/components/home/WorldTiles'
import Testimonials from '@/components/home/Testimonials'
import BlogSection from '@/components/home/BlogSection'
import MockupSwitch from '@/components/home/MockupSwitch'

// HOME — VARIANTE A (recomendada por dirección creativa).
// Ritmo: PROMO (S1-S3) → NAV (S4-S5) → PRODUCTO (S6) → PROMO (S7) →
// PRODUCTO (S8-S10) → NAV (S11) → CONFIANZA (S12).
// ISR: la home se regenera cada 5 min (catálogo, no sensible al stock en tiempo real)
export const revalidate = 300

// El banner de distribuidores (id 10) deja de rotar en el slider: pasa a ser
// el lateral B2B fijo de la hero zone (la puerta visible a /distribuidores).
const B2B_BANNER_ID = 10

export default async function Home() {
  const [novedades, masVendidos, iogenix, sportswear, banners, weekOffer] = await Promise.all([
    getHomeProducts({ limit: 12, orderBy: 'id' }),
    getHomeProducts({ limit: 8, orderBy: 'stock' }),
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

      {/* S1 · HERO ZONE compuesta: slider (~66%) + dupla lateral fija (~33%) */}
      <HeroZone sliderBanners={sliderBanners as any} b2bImage={b2bImage} />

      {/* S2 · Barra de confianza — pegada al hero */}
      <TrustBar />

      {/* Categorías rápidas — justo encima de la oferta de la semana (petición Javier) */}
      <QuickCats />

      {/* S3 · Oferta de la semana */}
      <WeekOffer product={weekOffer || novedades[0]} />

      {/* S5 · Stats de social proof (solo cifras; los testimonios cierran en S12) */}
      <StatsBand />

      {/* S6 · NOVEDADES — panel de texto + carrusel (patrón editorial) */}
      <EditorialPanel
        side="left"
        eyebrow="Recién llegado"
        title="Novedades"
        body="Lo último en nutrición deportiva, ya en Canarias. Proteínas, creatina y pre-entrenos de marcas oficiales — recién salidos del horno y en tu casa en 24-48h."
        cta={{ href: '/tienda', label: 'Ver novedades →' }}
        products={novedades}
      />

      {/* S7 · OFERTA DEL DÍA — interrupción de urgencia a mitad del scroll */}
      <OfertaDia />

      {/* S8 · Los más vendidos — carrusel simple (no todo lleva panel) */}
      <ProductCarousel
        products={masVendidos}
        title="LOS MAS VENDIDOS"
        titleIcon="🏆"
        href="/tienda"
        hrefLabel="Ver todos →"
      />

      {/* S9 · Panel de MARCA: iO.GENIX — tienda oficial (panel a la derecha) */}
      <EditorialPanel
        side="right"
        eyebrow="Tienda oficial"
        title={<>iO.GENIX <span style={{ color: 'var(--red)' }}>Nutrition</span></>}
        body="La marca que más se mueve en nuestra tienda, con distribución oficial en Canarias. Whey, isolate, creatina Creapure® y más — originales, frescos y al mejor precio de las islas."
        cta={{ href: '/marca/iogenix', label: 'Ver todo iO.GENIX →' }}
        products={iogenix}
      />

      {/* S10 · BM SPORTSWEAR — panel OSCURO (el gesto PrestaShop) */}
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

      {/* S11 · Los mundos BuyMuscle — tiles de navegación permanente */}
      <WorldTiles />

      {/* S12 · Reseñas protagonistas — antes del blog para ganar visibilidad */}
      <Testimonials />

      {/* Blog (SEO/contenido; mantener salvo que Javier diga lo contrario) */}
      <BlogSection />

      <MockupSwitch variant="A" />
    </main>
  )
}
