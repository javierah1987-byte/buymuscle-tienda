import Link from 'next/link'

// Listas compactas 50/50 del pie de la home (clon de los bloques "New products"
// / "Hot sales" del PrestaShop, títulos en castellano): miniatura + nombre +
// precio, 5 filas por columna.
export default function MiniList({ title, products }: { title: string; products: any[] }) {
  if (!products.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid #ebebeb', padding: '1.25rem 1.25rem 0.5rem' }}>
      <h2 style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: '0 0 4px', letterSpacing: '0.03em' }}>{title}</h2>
      <div aria-hidden="true" style={{ width: 44, height: 3, background: '#ff1e41', marginBottom: 6 }} />
      {products.map(p => {
        const price = Number(p.price_incl_tax)
        const sale = p.sale_price ? Number(p.sale_price) : null
        return (
          <Link key={p.id} href={'/producto/' + p.id}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid #f0f0f0', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 64, height: 64, flexShrink: 0, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {p.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.name} loading="lazy" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#222', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.name}
              </div>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: sale ? '#ff1e41' : '#111' }}>{(sale ?? price).toFixed(2)} €</span>
                {sale && <span style={{ fontSize: 12, color: '#aaa', textDecoration: 'line-through' }}>{price.toFixed(2)} €</span>}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
