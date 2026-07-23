import Link from 'next/link'

// S11 · Los mundos BuyMuscle — los 4 accesos convertidos en tiles visuales
// (puertas de navegación permanentes con imagen y sitio propio, no apéndice
// de Novedades). Móvil: 2×2 (.world-tiles).
const TILES = [
  {
    href: '/veganos', icon: '🌱', name: 'Veganos', sub: 'Suplementación 100% vegetal',
    bg: 'linear-gradient(135deg,#0d2412 0%,#1a3a1a 60%,#245024 100%)', accent: '#7ed957',
  },
  {
    href: '/streetflavour', icon: '🎽', name: 'StreetFlavour', sub: 'Las camisetas con sabor a calle',
    bg: 'linear-gradient(135deg,#061320 0%,#0a1a2a 60%,#0f2f47 100%)', accent: '#47daff',
    img: 'https://tienda.buymuscle.es/img/cms/BANNER-WEB-1600X630-STREETFLAVOUR.jpg',
  },
  {
    href: '/bm-team', icon: '🏋️', name: 'BM Team', sub: 'Únete al equipo BuyMuscle',
    bg: 'linear-gradient(135deg,#00120a 0%,#001a0d 60%,#003018 100%)', accent: '#00F399',
  },
  {
    href: '/tienda?ofertas=1', icon: '⚡', name: 'Ofertas', sub: 'Descuentos hasta el −50%',
    bg: 'linear-gradient(135deg,#1a0505 0%,#2d0000 60%,#4d0510 100%)', accent: '#ff1e41',
  },
]

export default function WorldTiles() {
  return (
    <section style={{ background: '#f5f5f5', padding: '2rem 20px', borderTop: '1px solid #ebebeb' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: 0 }}>Los mundos BuyMuscle</h2>
          <div style={{ fontSize: 12, color: '#999', marginTop: 3 }}>Cuatro puertas, un mismo entreno</div>
        </div>
        <div className="world-tiles">
          {TILES.map(t => (
            <Link key={t.href} href={t.href} style={{ position: 'relative', overflow: 'hidden', height: 150, borderRadius: 6, textDecoration: 'none', background: t.bg, display: 'flex' }}>
              {t.img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.img} alt={t.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
              )}
              <div style={{ position: 'relative', padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%' }}>
                <span style={{ fontSize: 30, lineHeight: 1, marginBottom: 8 }}>{t.icon}</span>
                <div style={{ fontWeight: 900, fontSize: 17, color: 'white', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{t.sub}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: t.accent, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Entrar →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
