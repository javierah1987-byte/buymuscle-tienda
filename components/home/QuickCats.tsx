import Link from 'next/link'

// S4 · Categorías rápidas — navegación para quien viene a tiro fijo.
const QUICK_CATS = [
  { name: 'Proteinas', icon: '🥛', slug: 'Proteinas' },
  { name: 'Creatinas', icon: '⚡', slug: 'Creatinas Monohidratos' },
  { name: 'Pre-entrenos', icon: '🔥', slug: 'Pre-entrenos' },
  { name: 'BCAA', icon: '💪', slug: 'BCAA' },
  { name: 'Vitaminas', icon: '💊', slug: 'Vitaminas' },
  { name: 'Quemadores', icon: '🎯', slug: 'Quemadores' },
  { name: 'Sport Wear', icon: '👕', slug: 'Sport Wear' },
  { name: 'Veganos', icon: '🌱', slug: 'Veganos' },
  { name: 'Snacks', icon: '🍫', slug: 'Snacks Proteicos' },
  { name: 'Gainers', icon: '💥', slug: 'Ganadores de Peso' },
]

export default function QuickCats() {
  return (
    <section style={{ background: 'white', borderBottom: '1px solid #ebebeb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', overflowX: 'auto' }}>
          {QUICK_CATS.map(cat => (
            <Link key={cat.name} href={`/tienda?cat=${encodeURIComponent(cat.slug)}`} className="cat-bar-link">
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
