import Link from 'next/link'
import HeroSlider from '@/components/HeroSlider'

// S1 · HERO ZONE compuesta: slider rotativo (~66%) + columna lateral (~33%)
// con DOS medios-banners apilados y FIJOS (no rotan): promo B2C arriba +
// distribuidores B2B abajo. En móvil la columna NO desaparece: baja como
// 2 tarjetas 50/50 justo debajo del slider (clases .hero-zone/.side-banners).
type Banner = { id: number; image_url: string; url: string; title?: string; subtitle?: string }

export default function HeroZone({ sliderBanners, b2bImage }: { sliderBanners: Banner[]; b2bImage?: string }) {
  return (
    <section style={{ background: '#f5f5f5', padding: '10px 20px 0' }}>
      <div className="hero-zone" style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Slider actual, tal cual (banners rotativos editoriales) */}
        <div style={{ minWidth: 0 }}>
          <HeroSlider initialBanners={sliderBanners as any} />
        </div>

        {/* Columna lateral: dupla apilada fija */}
        <div className="side-banners">
          {/* Lateral SUPERIOR — Promo permanente (B2C, conversión directa) */}
          <Link href="/tienda?ofertas=1" className="side-banner" style={{ textDecoration: 'none', background: 'linear-gradient(135deg,#1a0505 0%,#3d0505 55%,#6b0a14 100%)' }}>
            <div style={{ position: 'absolute', right: -18, top: -18, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,30,65,0.18)' }} />
            <div style={{ position: 'relative', padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, width: '100%' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#ff8095', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Solo online</div>
              <div style={{ fontSize: 'clamp(17px,1.6vw,23px)', fontWeight: 900, color: 'white', lineHeight: 1.05, textTransform: 'uppercase' }}>
                Ofertas <span style={{ color: '#ff1e41' }}>hasta −50%</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>Proteína, creatina y más, a precio mínimo</div>
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ir a ofertas →</div>
            </div>
          </Link>

          {/* Lateral INFERIOR — Distribuidores (B2B, segmentación). Texto HTML
              sobre imagen de fondo (editable sin rehacer el asset). */}
          <Link href="/distribuidores" className="side-banner" style={{ textDecoration: 'none', background: '#0d0d0d' }}>
            {b2bImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b2bImage} alt="Distribuidores BuyMuscle" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 100%)' }} />
            <div style={{ position: 'relative', padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, width: '100%' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#ff1e41', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Para gimnasios y tiendas</div>
              <div style={{ fontSize: 'clamp(16px,1.5vw,21px)', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>Hazte distribuidor BuyMuscle</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>Precios B2B y reparto en toda Canarias</div>
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quiero ser distribuidor →</div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
