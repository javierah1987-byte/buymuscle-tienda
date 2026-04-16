'use client'
import Link from 'next/link'
import { Product } from '@/lib/supabase'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import { useState } from 'react'

const LEVEL_COLORS: Record<string,string> = { Bronze:'#cd7f32', Silver:'#a8a9ad', Gold:'#ffd700' }

export default function ProductCard({ product, discountPct: forcedDiscount }: { product: Product; discountPct?: number }) {
  const { add } = useCart()
  const { discountPct: authDiscount, levelName } = useAuth()
  const [added, setAdded] = useState(false)
  const [hovered, setHovered] = useState(false)

  const discountPct = forcedDiscount !== undefined ? forcedDiscount : authDiscount
  const price = discountPct > 0 ? product.price_incl_tax * (1 - discountPct / 100) : product.price_incl_tax
  const catName = (product as any).categories?.name || ''

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    add(product, 1, discountPct)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div style={{background:'white',border:'1px solid #e8e8e8',position:'relative',transition:'box-shadow 0.2s',boxShadow:hovered?'0 2px 12px rgba(0,0,0,0.12)':'none'}}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>

      {/* Badges */}
      <div style={{position:'absolute',top:8,left:8,zIndex:2,display:'flex',flexDirection:'column',gap:4}}>
        {product.stock === 0 && (
          <span style={{background:'#ff2958',color:'white',fontSize:11,fontWeight:700,padding:'2px 8px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Agotado</span>
        )}
        {discountPct > 0 && (
          <span style={{background:'#ff2958',color:'white',fontSize:11,fontWeight:700,padding:'2px 8px'}}>-{discountPct}%</span>
        )}
      </div>

      {/* Imagen */}
      <Link href={`/producto/${product.id}`} style={{display:'block'}}>
        <div style={{padding:'1rem',display:'flex',alignItems:'center',justifyContent:'center',minHeight:200,background:'white',overflow:'hidden'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url || 'https://placehold.co/300x300/f5f5f5/ccc?text=BuyMuscle'}
            alt={product.name}
            style={{maxWidth:'100%',maxHeight:180,objectFit:'contain',transition:'transform 0.3s',transform:hovered?'scale(1.05)':'scale(1)'}}
          />
        </div>
      </Link>

      {/* Info */}
      <div style={{padding:'0.75rem',borderTop:'1px solid #f0f0f0'}}>
        {/* Categoría */}
        {catName && (
          <div style={{fontSize:11,color:'#999',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>{catName}</div>
        )}

        {/* Nombre */}
        <Link href={`/producto/${product.id}`}
          style={{fontSize:14,fontWeight:600,color:'#111',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as any,overflow:'hidden',textDecoration:'none',marginBottom:'0.5rem',display:'block'}}>
          {product.name}
        </Link>

        {/* Precio */}
        <div style={{marginBottom:'0.75rem'}}>
          <div style={{fontSize:16,fontWeight:700,color:discountPct>0&&levelName?LEVEL_COLORS[levelName]:'#626262'}}>
            {price.toFixed(2)} €
          </div>
          {discountPct > 0 && (
            <div style={{fontSize:12,color:'#999',textDecoration:'line-through'}}>{product.price_incl_tax.toFixed(2)} €</div>
          )}
        </div>

        {/* Stock */}
        <div style={{fontSize:11,color:product.stock>0?'#5cb85c':'#d9534f',marginBottom:'0.75rem',fontWeight:600}}>
          {product.stock > 0 ? `● En stock (${product.stock} uds)` : '● Sin stock'}
        </div>

        {/* Botón Añadir — outline rojo fondo blanco, exacto al original */}
        <button onClick={handleAdd} disabled={product.stock===0}
          style={{width:'100%',padding:'8px 15px',background:'white',border:'1px solid var(--red)',color:added?'white':'var(--red)',fontFamily:'var(--font-body)',fontSize:13,fontWeight:700,cursor:product.stock===0?'not-allowed':'pointer',transition:'all 0.15s',display:'flex',alignItems:'center',justifyContent:'center',gap:6,opacity:product.stock===0?0.5:1,..( added?{background:'var(--red)'}:{})}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-17-16v2h2l3.6 7.6L4.25 14c-.16.28-.25.61-.25.96C4 16.1 4.9 17 6 17h14v-2H6.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.46 4H5.21l-.94-2H0z"/></svg>
          {added ? '✓ Añadido' : product.stock===0 ? 'Sin stock' : 'Añadir al carrito'}
        </button>
      </div>
    </div>
  )
}
