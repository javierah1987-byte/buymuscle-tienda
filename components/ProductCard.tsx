'use client'
import Link from 'next/link'
import { Product } from '@/lib/supabase'
import { useCart } from '@/lib/cart'
import { useState } from 'react'

export default function ProductCard({ product, discountPct = 0 }: { product: Product; discountPct?: number }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const price = discountPct > 0
    ? product.price_incl_tax * (1 - discountPct / 100)
    : product.price_incl_tax

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    add(product, 1, discountPct)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link href={`/producto/${product.id}`} className="card product-card">
      <div className="img-wrap">
        <img
          src={product.image_url || 'https://placehold.co/400x400/f5f5f5/ccc?text=BuyMuscle'}
          alt={product.name}
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f5f5f5/ccc?text=BM' }}
        />
        {/* Badges */}
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {product.stock === 0 && <span className="badge badge-red">Agotado</span>}
          {discountPct > 0 && <span className="badge badge-red">-{discountPct}%</span>}
        </div>
      </div>

      <div className="info">
        <div className="cat">{(product as any).categories?.name || 'Suplemento'}</div>
        <div className="name" title={product.name}>
          {product.name.length > 50 ? product.name.slice(0, 50) + '...' : product.name}
        </div>
        <div className="price-row">
          <div>
            <div className="price">{price.toFixed(2)} €</div>
            {discountPct > 0 && (
              <div style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>
                {product.price_incl_tax.toFixed(2)} €
              </div>
            )}
          </div>
          <button
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: 12 }}
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            {added ? '✓' : product.stock === 0 ? 'Agotado' : 'Añadir'}
          </button>
        </div>
        <div style={{ marginTop: 6 }}>
          {product.stock > 0
            ? <span className="stock-ok">● En stock ({product.stock} uds)</span>
            : <span className="stock-no">● Sin stock</span>}
        </div>
      </div>
    </Link>
  )
}
