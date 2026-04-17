// @ts-nocheck
'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'

type Variant = { id:number; value:string; hex?:string; variantId:number; stock:number; priceModifier:number }

interface Props {
  product: { id:number; name:string; price_incl_tax:number; sale_price?:number; on_sale?:boolean; stock:number; image_url:string|null }
  variantsByType: Record<string, Variant[]>
  sortedTypes: string[]
  hasVariants: boolean
}

const LEVEL_COLORS = { Bronze:'#cd7f32', Silver:'#a8a9ad', Gold:'#ffd700' }

export default function AddToCartSection({ product, variantsByType, sortedTypes, hasVariants }: Props) {
  const { add } = useCart()
  const { isDistributor, levelName, discountPct } = useAuth()
  const [selected, setSelected] = useState<Record<string,Variant>>({})
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const basePrice = product.on_sale && product.sale_price ? Number(product.sale_price) : Number(product.price_incl_tax)
  const discountedPrice = isDistributor && discountPct ? basePrice * (1 - discountPct / 100) : basePrice
  const allTypesSelected = hasVariants ? sortedTypes.every(t => selected[t]) : true

  const selectedVariant = hasVariants && sortedTypes.length > 0 ? selected[sortedTypes[0]] : null
  const variantLabel = sortedTypes.map(t => selected[t]?.value).filter(Boolean).join(' / ')
  const variantStock = selectedVariant ? selectedVariant.stock : product.stock
  const inStock = variantStock > 0

  const handleAdd = () => {
    if (hasVariants && !allTypesSelected) return
    add({
      id: product.id,
      name: product.name,
      price: discountedPrice,
      image: product.image_url,
      variant: variantLabel,
      qty,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      {/* Precio */}
      <div style={{ marginBottom:'1rem' }}>
        {isDistributor && discountPct && (
          <div style={{ fontSize:12, fontWeight:700, color:LEVEL_COLORS[levelName]||'#ffd700', marginBottom:4 }}>
            🏅 PRECIO DISTRIBUIDOR {levelName?.toUpperCase()} -{discountPct}%
            <span style={{ marginLeft:8, color:'#bbb', textDecoration:'line-through', fontWeight:400 }}>
              PVP: {basePrice.toFixed(2)} €
            </span>
          </div>
        )}
        <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
          <span style={{ fontSize:32, fontWeight:900, color:'var(--red)' }}>{discountedPrice.toFixed(2)} €</span>
          {product.on_sale && product.sale_price && !isDistributor && (
            <span style={{ fontSize:16, color:'#bbb', textDecoration:'line-through' }}>{Number(product.price_incl_tax).toFixed(2)} €</span>
          )}
        </div>
        <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>IVA incluido · Compralo ahora y te lo entregamos en 24-48 horas.</div>
      </div>

      {/* Selectores de variante */}
      {sortedTypes.map(typeName => (
        <div key={typeName} style={{ marginBottom:'1rem' }}>
          <label style={{ display:'block', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>
            {typeName}
          </label>
          <select
            value={selected[typeName]?.id || ''}
            onChange={e => {
              const v = variantsByType[typeName].find(v => String(v.id) === e.target.value)
              setSelected(prev => v ? { ...prev, [typeName]: v } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== typeName)))
            }}
            style={{ width:'100%', padding:'10px 12px', border:'1px solid #ddd', fontSize:13, background:'white', cursor:'pointer', fontFamily:'var(--font-body)', outline:'none' }}>
            <option value=''>-- Selecciona {typeName} --</option>
            {variantsByType[typeName].map(v => (
              <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                {v.value}{v.stock <= 0 ? ' (sin stock)' : ''}
              </option>
            ))}
          </select>
          {hasVariants && !selected[typeName] && (
            <div style={{ marginTop:6, padding:'8px 12px', background:'#fff8e1', border:'1px solid #ffd54f', fontSize:12, color:'#b8860b' }}>
              ⚠️ Por favor selecciona {typeName}
            </div>
          )}
        </div>
      ))}

      {/* Cantidad */}
      <div style={{ display:'flex', gap:'1rem', marginBottom:'1rem', alignItems:'center' }}>
        <div style={{ display:'flex', border:'1px solid #e0e0e0', alignItems:'center' }}>
          <button onClick={() => setQty(q => Math.max(1,q-1))}
            style={{ width:36, height:40, border:'none', background:'none', cursor:'pointer', fontSize:18, color:'#555' }}>−</button>
          <span style={{ width:44, textAlign:'center', fontSize:15, fontWeight:700 }}>{qty}</span>
          <button onClick={() => setQty(q => Math.min(variantStock, q+1))}
            style={{ width:36, height:40, border:'none', background:'none', cursor:'pointer', fontSize:18, color:'#555' }}>+</button>
        </div>
        <div style={{ fontSize:11, color:'#888' }}>
          {inStock
            ? <span style={{ color:'#22c55e' }}>● En stock ({variantStock} uds)</span>
            : <span style={{ color:'#ef4444' }}>● Sin stock</span>}
        </div>
      </div>

      {/* Botón */}
      <button
        onClick={handleAdd}
        disabled={!inStock || (hasVariants && !allTypesSelected)}
        style={{ width:'100%', padding:'14px', border:'none', fontFamily:'var(--font-body)', fontSize:14, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', cursor: inStock && allTypesSelected ? 'pointer' : 'not-allowed',
          background: added ? '#22c55e' : inStock && allTypesSelected ? 'var(--red)' : '#ccc', color:'white', transition:'background 0.2s' }}>
        {added ? '✓ Añadido al carrito' : !inStock ? 'Sin stock' : !allTypesSelected ? 'Selecciona opciones' : '🛒 Añadir al carrito'}
      </button>
    </div>
  )
}
