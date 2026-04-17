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

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!hasStock) return
    add({ id: product.id, name: product.name, price: displayPrice, image: product.image_url, variant: '', qty: 1 })
    setAdding(true)
    setTimeout(() => setAdding(false), 1500)
  }

  return (
    <Link href={'/producto/'+product.id} style={{ textDecoration:'none', color:'inherit', display:'flex', flexDirection:'column', background:'white', position:'relative' }}>
      <div style={{ position:'absolute', top:8, left:8, zIndex:2, display:'flex', flexDirection:'column', gap:4 }}>
        {product.is_new && <span style={{ background:'#22c55e', color:'white', fontSize:10, fontWeight:700, padding:'2px 7px', textTransform:'uppercase' }}>NUEVO</span>}
        {salePrice && <span style={{ background:'var(--red)', color:'white', fontSize:10, fontWeight:700, padding:'2px 7px', textTransform:'uppercase' }}>OFERTA</span>}
        {!hasStock && <span style={{ background:'#888', color:'white', fontSize:10, fontWeight:700, padding:'2px 7px', textTransform:'uppercase' }}>AGOTADO</span>}
      </div>
      <div style={{ background:'#f9f9f9', aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:'1rem' }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', transition:'transform 0.3s' }} onMouseEnter={e=>{e.target.style.transform='scale(1.05)'}} onMouseLeave={e=>{e.target.style.transform='scale(1)'}}/>
          : <div style={{ fontSize:48, opacity:0.3 }}>📦</div>}
      </div>
      <div style={{ padding:'0.875rem', flex:1, display:'flex', flexDirection:'column' }}>
        {cat && <div style={{ fontSize:10, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{cat}</div>}
        <div style={{ fontSize:13, fontWeight:600, color:'#111', lineHeight:1.35, marginBottom:'0.5rem', flex:1, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{product.name}</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:'0.75rem' }}>
          <span style={{ fontSize:16, fontWeight:900, color:'var(--red)' }}>{displayPrice.toFixed(2)} €</span>
          {salePrice && <span style={{ fontSize:12, color:'#bbb', textDecoration:'line-through' }}>{price.toFixed(2)} €</span>}
        </div>
        <button onClick={handleAdd} disabled={!hasStock}
          style={{ width:'100%', padding:'8px', border: adding ? 'none' : '1px solid var(--red)', background: adding ? '#22c55e' : hasStock ? 'transparent' : '#f0f0f0', color: adding ? 'white' : hasStock ? 'var(--red)' : '#aaa', fontSize:12, fontWeight:700, cursor: hasStock ? 'pointer' : 'not-allowed', fontFamily:'var(--font-body)', textTransform:'uppercase', letterSpacing:'0.05em', transition:'all 0.15s' }}>
          {adding ? '✓ Añadido' : !hasStock ? 'Sin stock' : '🛒 Añadir'}
        </button>
      </div>
    </Link>
  )
}
