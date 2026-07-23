import Link from 'next/link'

// S5 · Stats de social proof — solo las 4 cifras, en banda compacta.
// La valoración media enlaza a las reseñas del cierre (#resenas): las cifras
// prometen, las reseñas con nombre lo cuentan.
export default function StatsBand() {
  const STATS = [
    { n: '+500', l: 'Clientes en Canarias' },
    { n: '316', l: 'Productos disponibles' },
    { n: '24h', l: 'Envio express' },
  ]
  return (
    <section style={{ background: '#f9f9f9', padding: '1rem 20px', borderBottom: '1px solid #ebebeb' }}>
      <div className="stats-band" style={{ maxWidth: 1280, margin: '0 auto' }}>
        {STATS.map(({ n, l }) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 900, fontSize: 'clamp(20px,2.5vw,28px)', color: '#ff1e41', lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{l}</div>
          </div>
        ))}
        {/* 4.9★ clicable → reseñas (padding = tap target cómodo) */}
        <Link href="#resenas" style={{ textAlign: 'center', textDecoration: 'none', padding: '4px 10px', margin: '-4px -10px', display: 'block' }}>
          <div style={{ fontWeight: 900, fontSize: 'clamp(20px,2.5vw,28px)', color: '#ff1e41', lineHeight: 1 }}>4.9★</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>Valoracion media <span style={{ color: '#ff1e41', fontWeight: 700 }}>· ver reseñas ↓</span></div>
        </Link>
      </div>
    </section>
  )
}
