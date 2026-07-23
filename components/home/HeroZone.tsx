import Link from 'next/link'
import HeroSlider from '@/components/HeroSlider'

// S1 · HERO ZONE compuesta: slider rotativo (~66%) + columna lateral (~33%)
// con DOS medios-banners apilados y FIJOS (no rotan): promo B2C arriba +
// distribuidores B2B abajo. En móvil la columna NO desaparece: baja como
// 2 tarjetas 50/50 justo debajo del slider (clases .hero-zone/.side-banners).
//
// Tratamiento visual (feedback Javier): cada bloque es una TARJETA separada
// (radio + sombra + aire), no una plancha continua. Contraste por naturaleza:
// slider = editorial oscuro · OFERTAS = rojo vibrante de marca · B2B = tarjeta
// clara. Así los 3 bloques se distinguen a primer golpe de vista.
type Banner = { id: number; image_url: string; url: string; title?: string; subtitle?: string }

const CARD_SHADOW = '0 2px 12px rgba(0,0,0,0.10)'

export default function HeroZone({ sliderBanners, b2bImage }: { sliderBanners: Banner[]; b2bImage?: string }) {
  return (
    <section style={{ background: '#f5f5f5', padding: '16px 20px 6px' }}>
      <div className="hero-zone" style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Slider actual, tal cual (banners rotativos editoriales) — envuelto
            en marco de tarjeta para que se lea como pieza propia */}
        <div style={{ minWidth: 0, borderRadius: 12, overflow: 'hidden', boxShadow: CARD_SHADOW }}>
          <HeroSlider initialBanners={sliderBanners as any} />
        </div>

        {/* Columna lateral: dupla apilada fija */}
        <div className="side-banners">
          {/* Lateral SUPERIOR — Promo permanente (B2C): ROJO pleno de marca,
              el golpe de color que lo separa del slider */}
          <Link href="/tienda?ofertas=1" className="side-banner" style={{ textDecoration: 'none', background: 'linear-gradient(135deg,#ff1e41 0%,#e00e31 55%,#b00722 100%)', boxShadow: CARD_SHADOW }}>
            <div style={{ position: 'absolute', right: -26, bottom: -26, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
            {/* Badge de % grande — el visual del promo */}
            <div className="pct-badge" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 74, height: 74, borderRadius: '50%', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#d90429', lineHeight: 1 }}>−50%</span>
              <span style={{ fontSize: 8, fontWeight: 800, color: '#b00722', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>hasta</span>
            </div>
            <div style={{ position: 'relative', padding: '16px 100px 16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, width: '100%' }} className="promo-body">
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Solo online</div>
              <div style={{ fontSize: 'clamp(17px,1.6vw,23px)', fontWeight: 900, color: 'white', lineHeight: 1.05, textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
                Ofertas
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>Proteína, creatina y más, a precio mínimo</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ display: 'inline-block', background: 'white', color: '#d90429', padding: '6px 14px', borderRadius: 4, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ir a ofertas →</span>
              </div>
            </div>
          </Link>

          {/* Lateral INFERIOR — Distribuidores (B2B): tarjeta CLARA, el
              tratamiento profesional que contrasta con la promo y el slider */}
          <Link href="/distribuidores" className="side-banner" style={{ textDecoration: 'none', background: 'white', border: '1px solid #e8e8e8', boxShadow: CARD_SHADOW }}>
            {b2bImage && (
              <div className="b2b-thumb" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '36%', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b2bImage} alt="Distribuidores BuyMuscle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, white 0%, rgba(255,255,255,0) 45%)' }} />
              </div>
            )}
            <div style={{ position: 'relative', padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, width: b2bImage ? '70%' : '100%', zIndex: 1 }} className="b2b-body">
              <div style={{ fontSize: 10, fontWeight: 800, color: '#d90429', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Para gimnasios y tiendas</div>
              <div style={{ fontSize: 'clamp(16px,1.5vw,21px)', fontWeight: 900, color: '#111', lineHeight: 1.1 }}>Hazte distribuidor BuyMuscle</div>
              <div style={{ fontSize: 11, color: '#777', lineHeight: 1.4 }}>Precios B2B y reparto en toda Canarias</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ display: 'inline-block', border: '1.5px solid #111', color: '#111', padding: '5px 13px', borderRadius: 4, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quiero ser distribuidor →</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
