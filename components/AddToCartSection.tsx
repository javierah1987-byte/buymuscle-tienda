'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'

type Variant = { id:number; value:string; hex?:string; variantId:number; stock:number; priceModifier:number }
interface Props {
  product: { id:number; name:string; price_incl_tax:number; price_excl_tax:number; stock:number; image_url:string|null; description?:string }
  variantsByType: Record<string, Variant[]>
  sortedTypes: string[]
  hasVariants: boolean
}
const LEVEL_COLORS: Record<string,string> = { Bronze:'#cd7f32', Silver:'#a8a9ad', Gold:'#ffd700' }

export default function AddToCartSection({ product, variantsByType, sortedTypes, hasVariants }: Props) {
  const { add } = useCart()
  const { isDistributor, levelName, discountPct } = useAuth()
  const [selected, setSelected] = useState<Record<string,string>>({})
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const allSelected = !hasVariants || sortedTypes.every(t => selected[t])
  const canAdd = product.stock > 0 && allSelected
  const finalPrice = discountPct > 0
    ? product.price_incl_tax * (1 - discountPct / 100)
    : product.price_incl_tax
  const levelColor = levelName ? LEVEL_COLORS[levelName] : 'var(--red)'

  const handleAdd = () => {
    if (!canAdd) return
    add(product as any, qty, discountPct)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      {/* Banner distribuidor */}
      {isDistributor && levelName && (
        <div style={{background:`${levelColor}15`,border:`1px solid ${levelColor}40`,padding:'10px 14px',marginBottom:'1rem',borderRadius:0,display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:18}}>{levelName==='Bronze'?'🥉':levelName==='Silver'?'🥈':'🥇'}</span>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:levelColor,textTransform:'uppercase' as const,letterSpacing:'0.05em'}}>
              Precio distribuidor {levelName} · -{discountPct}%
            </div>
            <div style={{fontSize:12,color:'#666'}}>
              PVP: <s>{product.price_incl_tax.toFixed(2)} €</s> → <strong style={{color:levelColor}}>{finalPrice.toFixed(2)} €</strong>
            </div>
          </div>
        </div>
      )}

      {/* Precio */}
      <div style={{marginBottom:'0.75rem'}}>
        <div style={{fontSize:32,fontWeight:900,color:isDistributor&&levelName?levelColor:'var(--red)',fontFamily:'var(--font-body)',lineHeight:1}}>
          {finalPrice.toFixed(2)} €
        </div>
        {discountPct>0&&<div style={{fontSize:13,color:'#aaa',marginTop:2}}><s>{product.price_incl_tax.toFixed(2)} €</s></div>}
        <div style={{fontSize:12,color:'#888',marginTop:4}}>
          Impuestos incluidos · <strong>Cómpralo ahora y te lo entregamos en 24-48 horas.</strong>
        </div>
      </div>

      <div style={{borderTop:'1px solid #eee',margin:'1rem 0'}}/>

      {/* Selectores */}
      {sortedTypes.map(typeName => {
        const opts = variantsByType[typeName]
        return (
          <div key={typeName} style={{marginBottom:'1rem'}}>
            <label style={{fontSize:13,fontWeight:700,color:'#333',display:'block',marginBottom:'0.4rem',textTransform:'uppercase' as const,letterSpacing:'0.04em'}}>
              {typeName}
            </label>
            {typeName === 'Talla' ? (
              <div style={{display:'flex',gap:6,flexWrap:'wrap' as const}}>
                {opts.map(opt => {
                  const isSel = selected[typeName]===opt.value
                  return (
                    <button key={opt.value} onClick={()=>setSelected(p=>({...p,[typeName]:opt.value}))}
                      style={{padding:'7px 14px',border:isSel?'2px solid var(--red)':'1px solid #ccc',background:isSel?'var(--red)':'white',color:isSel?'white':'#333',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'var(--font-body)',transition:'all 0.1s'}}>
                      {opt.value}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div style={{position:'relative'}}>
                <select
                  value={selected[typeName]||''}
                  onChange={e=>setSelected(p=>({...p,[typeName]:e.target.value}))}
                  style={{width:'100%',maxWidth:400,padding:'10px 14px',fontSize:14,border:'1px solid #ccc',background:'white',color:selected[typeName]?'#333':'#888',fontFamily:'var(--font-body)',cursor:'pointer',margin:0,borderRadius:0,outline:'none'}}>
                  <option value="">-- Selecciona {typeName} --</option>
                  {opts.map(opt=>(
                    <option key={opt.value} value={opt.value}>{opt.value.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )
      })}

      {/* Aviso si no ha seleccionado */}
      {hasVariants && !allSelected && (
        <div style={{background:'#fff8e1',border:'1px solid #ffc107',padding:'8px 12px',fontSize:13,color:'#856404',marginBottom:'1rem',display:'flex',alignItems:'center',gap:6}}>
          <span>⚠️</span> Por favor selecciona {sortedTypes.filter(t=>!selected[t]).join(' y ')}
        </div>
      )}

      {/* Cantidad + Añadir */}
      <div style={{display:'flex',gap:'0.75rem',alignItems:'stretch',marginTop:'1rem'}}>
        {/* Cantidad PrestaShop style */}
        <div style={{display:'flex',flexDirection:'column' as const,border:'1px solid #ccc',width:52,flexShrink:0}}>
          <button onClick={()=>setQty(q=>Math.min(product.stock||99,q+1))}
            style={{flex:1,background:'#f5f5f5',border:'none',borderBottom:'1px solid #eee',cursor:'pointer',fontSize:10,color:'#555',fontFamily:'var(--font-body)',display:'flex',alignItems:'center',justifyContent:'center',padding:'4px 0'}}>▲</button>
          <div style={{flex:2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'#222',background:'white'}}>{qty}</div>
          <button onClick={()=>setQty(q=>Math.max(1,q-1))}
            style={{flex:1,background:'#f5f5f5',border:'none',borderTop:'1px solid #eee',cursor:'pointer',fontSize:10,color:'#555',fontFamily:'var(--font-body)',display:'flex',alignItems:'center',justifyContent:'center',padding:'4px 0'}}>▼</button>
        </div>

        {/* Botón Añadir — SIEMPRE rojo sólido cuando puede añadir */}
        <button onClick={handleAdd}
          style={{flex:1,padding:'0 20px',
            background: !canAdd ? '#ccc' : 'var(--red)',
            color:'white',border:'none',
            fontFamily:'var(--font-body)',fontSize:14,fontWeight:700,
            cursor:canAdd?'pointer':'not-allowed',
            display:'flex',alignItems:'center',justifyContent:'center',gap:10,
            minHeight:52,letterSpacing:'0.02em',
            transition:'background 0.15s',opacity:1}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-17-16v2h2l3.6 7.6L4.25 14c-.16.28-.25.61-.25.96C4 16.1 4.9 17 6 17h14v-2H6.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.46 4H5.21l-.94-2H0z"/>
          </svg>
          {added ? '✓ ¡Añadido!' : product.stock===0 ? 'Sin stock' : 'Añadir al carrito'}
        </button>
      </div>

      {/* Garantías */}
      <div style={{display:'flex',gap:'1.5rem',marginTop:'1.25rem',paddingTop:'1rem',borderTop:'1px solid #eee',flexWrap:'wrap' as const}}>
        {[['🚚','Envío 24/48h'],['🔒','Pago seguro'],['🔄','Devoluciones gratis']].map(([ic,t])=>(
          <span key={t} style={{fontSize:12,color:'#888',display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontSize:14}}>{ic}</span>{t}
          </span>
        ))}
      </div>
    </div>
  )
}
