import ProductCard from '@/components/ProductCard'
import OfertaDia from '@/components/OfertaDia'
import ClonHero from '@/components/clon/ClonHero'
import ClonPanel from '@/components/clon/ClonPanel'
import SectionHeader from '@/components/clon/SectionHeader'
import MiniList from '@/components/clon/MiniList'
import BrandsStrip from '@/components/clon/BrandsStrip'
import ClonBlog from '@/components/clon/ClonBlog'
import CarouselTrack from '@/components/home/CarouselTrack'
import TrustBar from '@/components/home/TrustBar'
import WeekOffer from '@/components/home/WeekOffer'
import Testimonials from '@/components/home/Testimonials'
import { getHomeProducts, getWeekOffer, getNovedadesProteinas, getByCategoryIds, PROTEIN_CAT_IDS } from '@/lib/homeData'

// HOME CLON — réplica fiel de la home del PrestaShop (tienda.buymuscle.es),
// sección a sección y en su orden, con el catálogo servido desde nuestra BD.
// Sobre el esqueleto clonado se intercalan las piezas propias que gustan:
// TrustBar · Oferta de la semana · Oferta del día (countdown) · Reseñas.
export const revalidate = 300

// Categorías de ropa/complementos BM (sportswear); las familias de proteína
// viven en lib/homeData (PROTEIN_CAT_IDS, compartidas con novedades).
const SPORTSWEAR_CATS = [33, 34, 53, 69, 153, 164, 165, 190, 191, 192, 193, 67, 68]

export default async function Home() {
  // Novedades (feedback Javier): solo proteínas nuevas — botes iO.GENIX, fila homogénea.
  const [novedades, masVendidos, sportswear, proteinas, weekOffer] = await Promise.all([
    getNovedadesProteinas(10),
    getHomeProducts({ limit: 12, orderBy: 'stock' }),
    getByCategoryIds(SPORTSWEAR_CATS, 12),
    getByCategoryIds(PROTEIN_CAT_IDS, 12),
    getWeekOffer(),
  ])

  return (
    <main style={{ background: '#f5f5f5' }}>
      <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        BuyMuscle — Tienda de Suplementación Deportiva en Canarias
      </h1>

      {/* S1 · HERO (clon): slider de campañas 66% + banner lateral 33% */}
      <ClonHero />

      {/* + NUESTRO: barra de confianza pegada al hero */}
      <div style={{ marginTop: 16 }}>
        <TrustBar />
      </div>

      {/* S2 · NOVEDADES (clon): panel negro BUYMUSCLE + carrusel */}
      <section style={{ padding: '2.5rem 20px' }}>
        <div className="clon-panel-grid" style={{ maxWidth: 1280, margin: '0 auto' }}>
          <ClonPanel
            eyebrow="BUYMUSCLE"
            title="Nutrición deportiva"
            text="Compra suplementos deportivos en Canarias con BuyMuscle. Proteínas, creatina, aminoácidos y pre-entrenos de marcas líderes como IO.Genix para mejorar tu rendimiento, recuperación y objetivos fitness. Calidad, precio y envíos rápidos."
            ctaLabel="VER PRODUCTOS"
            ctaHref="/tienda"
          />
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: '0 0 4px' }}>Novedades</h2>
            <div aria-hidden="true" style={{ width: 44, height: 3, background: '#ff1e41', marginBottom: 14 }} />
            <CarouselTrack products={novedades} autoplayMs={4000} />
          </div>
        </div>
      </section>

      {/* + NUESTRO: oferta de la semana (con fallback si no hay on_sale) */}
      <WeekOffer product={weekOffer || masVendidos[0]} />

      {/* S3 · LOS MÁS VENDIDOS (clon): grid 12 sobre fondo degradado */}
      <section style={{ background: 'radial-gradient(at center center, #e9e9e9 0%, #ffffff 72%)', padding: '50px 20px 60px', margin: '40px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeader title="Los más vendidos" />
          <div className="clon-grid-12">
            {masVendidos.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* + NUESTRO: oferta del día con countdown, interrupción a mitad de scroll */}
      <OfertaDia />

      {/* S4 · BM SPORTSWEAR (clon): panel negro + carrusel de prendas */}
      {sportswear.length > 0 && (
        <section style={{ padding: '2.5rem 20px' }}>
          <div className="clon-panel-grid" style={{ maxWidth: 1280, margin: '0 auto' }}>
            <ClonPanel
              eyebrow="LA ROPA DE LA CASA"
              title="BM Sportswear"
              text="Descubre BM Sportswear, la línea de moda sport de BuyMuscle. Camisetas y prendas de estilo relajado y urbano, perfectas para un look deportivo sin renunciar a la comodidad. Diseños modernos y versátiles, ideales para el día a día. Viste con estilo y marca la diferencia con la esencia sport de BuyMuscle."
              ctaLabel="VER PRODUCTOS"
              ctaHref="/sport-wear"
            />
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: '0 0 4px' }}>BM Sportswear</h2>
              <div aria-hidden="true" style={{ width: 44, height: 3, background: '#ff1e41', marginBottom: 14 }} />
              <CarouselTrack products={sportswear} autoplayMs={4500} />
            </div>
          </div>
        </section>
      )}

      {/* S5 · BLOG (clon): los 6 posts reales */}
      <ClonBlog />

      {/* S6 · LAS MEJORES PROTEÍNAS (clon): grid 12 sobre degradado inverso */}
      <section style={{ background: 'linear-gradient(180deg, #ffffff 0%, #e9e9e9 100%)', padding: '60px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeader title="Las mejores proteínas" />
          <div className="clon-grid-12">
            {proteinas.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* S7 · listas compactas 50/50 (clon de New products / Hot sales) */}
      <section style={{ padding: '2.5rem 20px', background: '#f5f5f5' }}>
        <div className="clon-minis" style={{ maxWidth: 1280, margin: '0 auto' }}>
          <MiniList title="Productos nuevos" products={novedades.slice(0, 5)} />
          <MiniList title="Los más deseados" products={masVendidos.slice(0, 5)} />
        </div>
      </section>

      {/* S8 · MARCAS (clon): marquee con los 17 logos reales */}
      <BrandsStrip />

      {/* + NUESTRO: reseñas con avatares + CTA WhatsApp, cierre de confianza */}
      <Testimonials />
    </main>
  )
}
