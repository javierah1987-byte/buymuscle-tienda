// @ts-nocheck
'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const { add } = useCart()
  const [adding, setAdding] = useState(false)
  const cat = product.categories?.name || ''
  const price = Number(product.price_incl_tax)
  const salePrice = product.on_sale && product.sale_price ? Number(product.sale_price) : null
  const displayPrice = salePrice || price
  const hasStock = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 5
  const hasVariants = product.has_variants || false
  // Calcular % descuento
  const discount = salePrice ? Math.round((1 - salePrice/price)*100) : 0

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!hasStock) return
    add({ id: product.id, name: product.name, price: displayPrice, image: product.image_url, variant: '', qty: 1 })
    setAdding(true)
    setTimeout(() => setAdding(false), 1500)
  }

  return (
    <Link href={'/producto/'+product.id} style={{ textDecoration:'none', color:'inherit', display:'flex', flexDirection:'column', background:'white', position:'relative', borderRadius:4, overflow:'hidden', border:'1px solid #f0f0f0', transition:'box-shadow 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
      
      {/* Badges */}
      <div style={{ position:'absolute', top:8, left:8, zIndex:2, display:'flex', flexDirection:'column', gap:4 }}>
        {product.is_new && <span style={{ background:'#22c55e', color:'white', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:2, textTransform:'uppercase' }}>NUEVO</span>}
        {salePrice && <span style={{ background:'var(--red)', color:'white', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:2, textTransform:'uppercase' }}>-{discount}%</span>}
        {!hasStock && <span style={{ background:'#888', color:'white', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:2, textTransform:'uppercase' }}>AGOTADO</span>}
      </div>

      {/* Imagen */}
      <div style={{ background:'#f9f9f9', aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:'1rem', position:'relative' }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} loading='lazy' decoding='async' style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', transition:'transform 0.3s' }}
              onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
              onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
          : <div style={{ fontSize:48, opacity:0.3 }}>📦</div>}
        {/* Alerta stock bajo t1 */}
        {lowStock && (
          <div style={{ position:'absolute', bottom:6, left:0, right:0, textAlign:'center' }}>
            <span style={{ background:'rgba(239,68,68,0.9)', color:'white', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10 }}>
              ¡Solo {product.stock} uds!
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'0.75rem', flex:1, display:'flex', flexDirection:'column' }}>
        {cat && <div style={{ fontSize:10, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>{cat}</div>}
        
        <div style={{ fontSize:13, fontWeight:600, color:'#111', lineHeight:1.35, marginBottom:6, flex:1, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {product.name}
        </div>

        {/* Rating t1 */}
        <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:6 }}>
          <div style={{ color:'#f59e0b', fontSize:11, letterSpacing:1 }}>★★★★★</div>
          <span style={{ fontSize:10, color:'#aaa' }}>(Sé el primero)</span>
        </div>

        {/* Precio t2 — precio tachado si hay oferta */}
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:'0.75rem' }}>
          <span style={{ fontSize:19, fontWeight:900, color:'var(--red)', letterSpacing:'-0.02em' }}>{displayPrice.toFixed(2)} €</span>
          {salePrice && <span style={{ fontSize:12, color:'#bbb', textDecoration:'line-through' }}>{price.toFixed(2)} €</span>}
        </div>

        {/* Botón t5 — diferenciado variantes */}
        {hasVariants ? (
          <div style={{ width:'100%', padding:'8px', border:'1px solid var(--red)', background:'transparent', color:'var(--red)', fontSize:12, fontWeight:700, textAlign:'center', borderRadius:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>
            Elegir sabor
          </div>
        ) : (
          <button onClick={handleAdd} disabled={!hasStock}
            style={{ width:'100%', padding:'8px', border: adding ? 'none' : '1px solid var(--red)', background: adding ? '#22c55e' : hasStock ? 'transparent' : '#f0f0f0', color: adding ? 'white' : hasStock ? 'var(--red)' : '#aaa', fontSize:12, fontWeight:700, cursor: hasStock ? 'pointer' : 'not-allowed', fontFamily:'var(--font-body)', textTransform:'uppercase', letterSpacing:'0.05em', transition:'all 0.15s', borderRadius:2 }}>
            {adding ? '✓ Añadido' : !hasStock ? 'Sin stock' : '🛒 Añadir'}
          </button>
        )}
      </div>
    </Link>
  )
}
