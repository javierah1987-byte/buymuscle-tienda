// @ts-nocheck
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import { useState } from 'react'

// Helper: proxy para imágenes con hotlink protection.
// Usa la Edge Function de Supabase (IPs de París) en lugar de /api/img,
// cuyas IPs de Vercel a veces bloquea el LiteSpeed de tienda.buymuscle.es.
function proxyImg(url: string | null | undefined): string {
  if (!url) return '/placeholder.jpg'
  if (url.includes('tienda.buymuscle.es')) {
    return 'https://awwlbepjxuoxaigztugh.supabase.co/functions/v1/image-proxy?url=' + encodeURIComponent(url)
  }
  return url
}


export default function ProductCard({ product }) {
  const { add } = useCart()
  const { isDistributor, discountPct, overrides } = useAuth()
  const [adding, setAdding] = useState(false)
  const cat = product.categories?.name || ''
  const price = Number(product.price_incl_tax)
  const salePrice = product.on_sale && product.sale_price ? Number(product.sale_price) : null
  const displayPrice = salePrice || price
  // % de distribuidor EFECTIVO: el override por producto manda sobre el % de grupo (igual que el
  // servidor en orderCore) → el precio mostrado coincide con el cobrado. Sin override, el % de grupo.
  const effPct = isDistributor ? (overrides?.[product.id] ?? discountPct) : 0
  const distPrice = effPct ? Math.round(displayPrice * (1 - effPct/100) * 100)/100 : displayPrice
  const hasStock = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 5
  const hasVariants = product.has_variants || false
  const discount = salePrice ? Math.round((1 - salePrice/price)*100) : 0

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!hasStock) return
    add({ id: product.id, name: product.name, price: distPrice, image: product.image_url, variant: '', stock: product.stock, qty: 1 })
    setAdding(true)
    setTimeout(() => setAdding(false), 1500)
  }

  return (
    <Link href={'/producto/'+product.id} className="product-card-link" style={{ textDecoration:'none', color:'inherit', display:'flex', flexDirection:'column', background:'white', position:'relative', borderRadius:4, overflow:'hidden', border:'1px solid #f0f0f0', transition:'box-shadow 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>

      {/* Badges */}
      <div style={{ position:'absolute', top:8, left:8, zIndex:2, display:'flex', flexDirection:'column', gap:4 }}>
        {product.is_new && <span style={{ background:'#22c55e', color:'white', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:2, textTransform:'uppercase' }}>NUEVO</span>}
        {salePrice && <span style={{ background:'var(--red)', color:'white', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:2, textTransform:'uppercase' }}>-{discount}%</span>}
        {!hasStock && <span style={{ background:'#888', color:'white', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:2, textTransform:'uppercase' }}>AGOTADO</span>}
      </div>

      {/* Imagen optimizada con next/image */}
      <div style={{ background:'#f9f9f9', aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:'1rem', position:'relative' }}>
        {product.image_url ? (
          <Image
            src={proxyImg(product.image_url)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit:'contain', transition:'transform 0.3s', padding:'0.5rem' }}
            onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
            onMouseLeave={e=>e.target.style.transform='scale(1)'}
          />
        ) : (
          <div aria-hidden="true" style={{ fontSize:48, opacity:0.3 }}>📦</div>
        )}
        {lowStock && (
          <div style={{ position:'absolute', bottom:6, left:0, right:0, textAlign:'center', zIndex:3 }}>
            <span style={{ background:'rgba(239,68,68,0.9)', color:'white', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10 }}>
              ¡Solo {product.stock} uds!
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'0.875rem', flex:1, display:'flex', flexDirection:'column' }}>
        {cat && <div style={{ fontSize:10, fontWeight:800, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>{cat}</div>}
        <div className="product-card-name" style={{ fontSize:13, fontWeight:700, color:'#111', lineHeight:1.35, marginBottom:6, flex:1, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {product.name}
        </div>
        {/* Sin estrellas fantasma: la tarjeta NO muestra valoración inventada. Las
            reseñas reales (product_reviews, moderadas) se ven en la ficha del producto. */}
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:'0.75rem', flexWrap:'wrap' }}>
          <span className="product-card-price" style={{ fontSize:21, fontWeight:900, color:'var(--red)', letterSpacing:'-0.03em' }}>{distPrice.toFixed(2)} €</span>
          {effPct
            ? <span style={{ fontSize:12, color:'#bbb', textDecoration:'line-through' }}>{displayPrice.toFixed(2)} €</span>
            : salePrice ? <span style={{ fontSize:12, color:'#bbb', textDecoration:'line-through' }}>{price.toFixed(2)} €</span> : null}
          {effPct ? <span style={{ fontSize:10, fontWeight:800, color:'#b8860b' }}>-{effPct}% distrib.</span> : null}
        </div>
        {hasVariants ? (
          <div className="product-card-btn" style={{ width:'100%', padding:'9px 8px', border:'none', background:'var(--red)', color:'white', fontSize:12, fontWeight:700, textAlign:'center', borderRadius:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>
            Ver opciones →
          </div>
        ) : (
          <button onClick={handleAdd} disabled={!hasStock}
            style={{ width:'100%', padding:'9px 8px', border:'none', background: adding ? '#22c55e' : hasStock ? 'var(--red)' : '#f0f0f0', color: 'white', fontSize:12, fontWeight:700, cursor: hasStock ? 'pointer' : 'not-allowed', fontFamily:'var(--font-body)', textTransform:'uppercase', letterSpacing:'0.05em', transition:'all 0.15s', borderRadius:2 }}>
            {adding ? '✓ Añadido' : !hasStock ? 'Sin stock' : '🛒 Al carrito'}
          </button>
        )}
      </div>
    </Link>
  )
}
