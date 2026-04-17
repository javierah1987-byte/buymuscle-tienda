'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart'

interface Product {
  id: number; name: string; price_incl_tax: number; price_excl_tax: number
  stock: number; image_url: string | null; categories?: { name: string } | null
  is_new?: boolean; on_sale?: boolean; sale_price?: number | null
}

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const cat = product.categories?.name || ''
  const price = product.price_incl_tax
  const onSale = product.on_sale && product.sale_price && product.sale_price < price
  const discountPct = onSale ? Math.round((1 - product.sale_price! / price) * 100) : 0
  const displayPrice = onSale ? product.sale_price! : price
  const inStock = product.stock > 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock) return
    add(product as any, 1, 0)
  }

  return (
    <div style={{ background:'white', position:'relative', display:'flex', flexDirection:'column', transition:'box-shadow 0.2s, transform 0.2s', cursor:'pointer' }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 4px 18px rgba(0,0,0,0.13)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.zIndex='2'; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.zIndex='1'; }}>

      {/* Badges — exactos al original */}
      <div style={{ position:'absolute', top:10, left:10, zIndex:3, display:'flex', flexDirection:'column', gap:4 }}>
        {product.is_new && !onSale && (
          <span style={{ background:'#ffea00', color:'#111', fontSize:10, fontWeight:800, padding:'4px 9px', textTransform:'uppercase', letterSpacing:'0.07em', display:'inline-block' }}>
            NUEVO
          </span>
        )}
        {onSale && (
          <span style={{ background:'var(--red)', color:'white', fontSize:10, fontWeight:800, padding:'4px 9px', textTransform:'uppercase', letterSpacing:'0.07em', display:'inline-block' }}>
            ¡EN OFERTA!
          </span>
        )}
        {onSale && discountPct > 0 && (
          <span style={{ background:'var(--red)', color:'white', fontSize:11, fontWeight:900, padding:'4px 9px', display:'inline-block' }}>
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Imagen con hover */}
      <Link href={`/producto/${product.id}`} style={{ display:'block', overflow:'hidden', background:'#f8f8f8', aspectRatio:'1/1' }}>
        <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url || 'https://placehold.co/300x300/f5f5f5/ccc?text=BM'}
            alt={product.name}
            style={{ width:'85%', height:'85%', objectFit:'contain', transition:'transform 0.3s ease', display:'block' }}
            onMouseEnter={e=>((e.target as HTMLImageElement).style.transform='scale(1.08)')}
            onMouseLeave={e=>((e.target as HTMLImageElement).style.transform='scale(1)')}
          />
        </div>
      </Link>

      {/* Info del producto */}
      <Link href={`/producto/${product.id}`} style={{ padding:'12px 14px 0', textDecoration:'none', color:'inherit', flex:1, display:'flex', flexDirection:'column' }}>
        {cat && (
          <div style={{ fontSize:10, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:4 }}>
            {cat}
          </div>
        )}

        <div style={{ fontSize:13, fontWeight:600, color:'#222', lineHeight:1.35, marginBottom:'auto', paddingBottom:8,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden', minHeight:36 }}>
          {product.name}
        </div>
      </Link>

      {/* Precio y botón */}
      <div style={{ padding:'8px 14px 14px' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:7, marginBottom:9 }}>
          {onSale ? (
            <>
              <span style={{ fontSize:18, fontWeight:900, color:'var(--red)', lineHeight:1 }}>{displayPrice.toFixed(2)} €</span>
              <span style={{ fontSize:12, color:'#bbb', textDecoration:'line-through', fontWeight:400 }}>{price.toFixed(2)} €</span>
            </>
          ) : (
            <span style={{ fontSize:18, fontWeight:700, color:'#555', lineHeight:1 }}>{displayPrice.toFixed(2)} €</span>
          )}
        </div>

        {/* Stock indicator */}
        <div style={{ fontSize:11, marginBottom:10 }}>
          {!inStock
            ? <span style={{ color:'var(--red)', fontWeight:700 }}>● Sin stock</span>
            : product.stock < 5
            ? <span style={{ color:'#fd7e14', fontWeight:700 }}>● Últimas {product.stock} uds</span>
            : <span style={{ color:'#28a745', fontWeight:600 }}>● En stock ({product.stock} uds)</span>
          }
        </div>

        {/* Botón añadir al carrito */}
        <button onClick={handleAddToCart} disabled={!inStock}
          style={{ width:'100%', padding:'9px 0', border:'1px solid var(--red)',
            background:'white', color:'var(--red)', fontSize:12, fontWeight:700,
            cursor:inStock?'pointer':'not-allowed', fontFamily:'var(--font-body)',
            textTransform:'uppercase', letterSpacing:'0.04em',
            transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            opacity:inStock?1:0.5 }}
          onMouseEnter={e=>{ if(inStock){ e.currentTarget.style.background='var(--red)'; e.currentTarget.style.color='white'; }}}
          onMouseLeave={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.color='var(--red)'; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM0 2v2h2l3.6 7.6L4.25 14c-.16.28-.25.61-.25.96C4 16.1 4.9 17 6 17h14v-2H6.42l.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.46 4H5.21l-.94-2H0z"/>
          </svg>
          {inStock ? 'Añadir al carrito' : 'Sin stock'}
        </button>
      </div>
    </div>
  )
}
