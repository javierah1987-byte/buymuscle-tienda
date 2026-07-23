import Link from 'next/link'

// S3 · Oferta de la semana — ancla promocional estable de la parte alta.
// Precio tachado + badge de % de ahorro: el descuento sin referencia no
// convierte. product: fila con CARD_COLUMNS (getWeekOffer o fallback).
export default function WeekOffer({ product }: { product: any }) {
  if (!product) return null
  const price = Number(product.price_incl_tax)
  const sale = product.sale_price ? Number(product.sale_price) : null
  const pct = sale ? Math.round((1 - sale / price) * 100) : 0

  return (
    <section style={{ background: 'linear-gradient(135deg,#111 0%,#1a0a0a 50%,#2a0808 100%)', padding: 0, overflow: 'hidden', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 0, minHeight: 120, flexWrap: 'wrap' }} className="h2-banner">
        <div style={{ flex: 1, padding: '24px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#ff1e41', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>⚡ OFERTA DE LA SEMANA</div>
          <div style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 8 }}>
            {product.name.slice(0, 40)}{product.name.length > 40 ? '...' : ''}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: 'white' }}>{(sale ?? price).toFixed(2)} €</span>
            {sale && <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>{price.toFixed(2)} €</span>}
            {pct > 0 && <span style={{ background: '#ff1e41', color: 'white', fontSize: 12, fontWeight: 800, padding: '3px 8px', borderRadius: 10 }}>−{pct}%</span>}
          </div>
          <Link href={'/producto/' + product.id} style={{ display: 'inline-block', background: '#ff1e41', color: 'white', padding: '11px 28px', fontWeight: 800, fontSize: 13, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Comprar ahora →
          </Link>
        </div>
        <div style={{ width: 'clamp(140px,25vw,260px)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(255,30,65,0.3))' }} loading="eager" />
          )}
        </div>
      </div>
    </section>
  )
}
