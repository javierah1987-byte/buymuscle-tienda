'use client'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  price_incl_tax: number
  price_excl_tax: number
  stock: number
  image_url: string | null
  categories?: { name: string } | null
  is_new?: boolean
  on_sale?: boolean
  sale_price?: number | null
}

export default function ProductCard({ product }: { product: Product }) {
  const cat = product.categories?.name || ''
  const price = product.price_incl_tax
  const isNew = product.is_new
  const onSale = product.on_sale && product.sale_price
  const discount = onSale ? Math.round((1 - product.sale_price!/price)*100) : 0

  return (
    <Link href={`/producto/${product.id}`} style={{ textDecoration:'none', color:'inherit', display:'block', background:'white', position:'relative' }}>
      {/* Badges exactos al original */}
      <div style={{ position:'absolute', top:10, left:10, zIndex:3, display:'flex', flexDirection:'column', gap:4 }}>
        {isNew && !onSale && (
          <span style={{ background:'#ffea00', color:'#111', fontSize:10, fontWeight:800, padding:'3px 8px', textTransform:'uppercase', letterSpacing:'0.06em' }}>
            NUEVO
          </span>
        )}
        {onSale && (
          <span style={{ background:'var(--red)', color:'white', fontSize:10, fontWeight:800, padding:'3px 8px', textTransform:'uppercase', letterSpacing:'0.06em' }}>
            ¡EN OFERTA!
          </span>
        )}
        {onSale && discount > 0 && (
          <span style={{ background:'var(--red)', color:'white', fontSize:10, fontWeight:800, padding:'3px 8px' }}>
            -{discount}%
          </span>
        )}
      </div>

      {/* Imagen */}
      <div style={{ overflow:'hidden', background:'#f8f8f8', aspectRatio:'1/1', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url || 'https://placehold.co/300x300/f5f5f5/ccc?text=BM'}
          alt={product.name}
          style={{ width:'85%', height:'85%', objectFit:'contain', transition:'transform 0.3s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </div>

      {/* Info */}
      <div style={{ padding:'12px 14px 14px' }}>
        {cat && (
          <div style={{ fontSize:10, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>
            {cat}
          </div>
        )}
        <div style={{ fontSize:13, fontWeight:600, color:'#222', lineHeight:1.35, marginBottom:8, minHeight:36,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {product.name}
        </div>

        {/* Precio */}
        <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
          {onSale ? (
            <>
              <span style={{ fontSize:16, fontWeight:800, color:'var(--red)' }}>{product.sale_price!.toFixed(2)} €</span>
              <span style={{ fontSize:12, color:'#bbb', textDecoration:'line-through' }}>{price.toFixed(2)} €</span>
            </>
          ) : (
            <span style={{ fontSize:16, fontWeight:700, color:'#626262' }}>{price.toFixed(2)} €</span>
          )}
        </div>

        {/* Stock */}
        <div style={{ marginTop:6, fontSize:11 }}>
          {product.stock === 0 ? (
            <span style={{ color:'var(--red)', fontWeight:600 }}>● Sin stock</span>
          ) : product.stock < 5 ? (
            <span style={{ color:'#fd7e14', fontWeight:600 }}>● Últimas {product.stock} uds</span>
          ) : (
            <span style={{ color:'#28a745', fontWeight:600 }}>● En stock ({product.stock} uds)</span>
          )}
        </div>

        {/* Botón añadir */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); }}
          style={{ width:'100%', marginTop:10, padding:'9px 0', background:'white', color:'var(--red)',
            border:'1px solid var(--red)', fontSize:12, fontWeight:700, cursor:'pointer',
            fontFamily:'var(--font-body)', textTransform:'uppercase', letterSpacing:'0.04em',
            transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--red)'; e.currentTarget.style.color='white'; }}
          onMouseLeave={e => { e.currentTarget.style.background='white'; e.currentTarget.style.color='var(--red)'; }}>
          🛒 Añadir al carrito
        </button>
      </div>
    </Link>
  )
}
