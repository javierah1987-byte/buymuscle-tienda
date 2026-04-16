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
  const finalPrice = discountPct > 0 ? product.price_incl_tax * (1 - discountPct / 100) : product.price_incl_tax
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
        <div style={{background:`${levelColor}12`,border:`1px solid ${levelColor}40`,padding:'10px 14px',marginBottom:'1rem',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:20}}>{levelName==='Bronze'?'🥉':levelName==='Silver'?'🥈':'🥇'}</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:levelColor,textTransform:'uppercase'}}>Precio distribuidor {levelName} — -{discountPct}%</div>
            <div style={{fontSize:12,color:'var(--muted)'}}>PVP: <s>{product.price_incl_tax.toFixed(2)} €</s> → <strong style={{color:levelColor}}>{finalPrice.toFixed(2)} €</strong></div>
          </div>
        </div>
      )}

      {/* PRECIO — al estilo original (rojo, grande) */}
      <div style={{marginBottom:'0.75rem'}}>
        <div style={{fontSize:30,fontWeight:700,color:isDistributor&&levelName?levelColor:'var(--red)',fontFamily:'var(--font-body)'}}>
          {finalPrice.toFixed(2)} €
        </div>
        {discountPct>0&&<div style={{fontSize:13,color:'var(--muted)'}}>PVP: <s>{product.price_incl_tax.toFixed(2)} €</s></div>}
        <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>
          Impuestos incluidos · <strong>Cómpralo ahora y te lo entregamos en 24-48 horas.</strong>
        </div>
      </div>

      {/* Descripción corta del producto */}
      {(product as any).description && (
        <div style={{fontSize:13,color:'#555',lineHeight:1.7,marginBottom:'1rem',padding:'0.75rem 0',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}
          dangerouslySetInnerHTML={{__html:(product as any).description?.slice(0,400)||''}}/>
      )}

      {/* SELECTORES — dropdown estilo PrestaShop original */}
      {sortedTypes.map(typeName => {
        const opts = variantsByType[typeName]
        const isTalla = typeName === 'Talla'
        return (
          <div key={typeName} style={{marginBottom:'1rem'}}>
            <label style={{fontSize:14,fontWeight:700,color:'var(--text)',display:'block',marginBottom:'0.4rem'}}>
              {typeName}
            </label>
            {isTalla ? (
              /* Tallas: botones al estilo original */
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {opts.map(opt => {
                  const isSel = selected[typeName]===opt.value
                  return (
                    <button key={opt.value} onClick={()=>setSelected(p=>({...p,[typeName]:opt.value}))}
                      style={{padding:'6px 14px',border:isSel?'2px solid var(--red)':'1px solid #ccc',background:isSel?'var(--red)':'white',color:isSel?'white':'#333',fontFamily:'var(--font-body)',fontSize:13,fontWeight:600,cursor:'pointer',transition:'all 0.1s'}}>
                      {opt.value}
                    </button>
                  )
                })}
              </div>
            ) : (
              /* Sabores y otros: dropdown exacto al original */
              <select value={selected[typeName]||''} onChange={e=>setSelected(p=>({...p,[typeName]:e.target.value}))}
                style={{width:'100%',maxWidth:400,padding:'10px 14px',fontSize:14,border:'1px solid #ccc',background:'white',color:'#333',fontFamily:'var(--font-body)',cursor:'pointer',appearance:'auto',margin:0}}>
                <option value="">-- Selecciona {typeName} --</option>
                {opts.map(opt=>(
                  <option key={opt.value} value={opt.value}>{opt.value.toUpperCase()}</option>
                ))}
              </select>
            )}
          </div>
        )
      })}

      {/* Aviso si no ha seleccionado */}
      {hasVariants && !allSelected && (
        <div style={{background:'#fff3cd',border:'1px solid #ffc107',padding:'8px 12px',fontSize:13,color:'#856404',marginBottom:'1rem'}}>
          ⚠️ Por favor selecciona {sortedTypes.filter(t=>!selected[t]).join(' y ')}
        </div>
      )}

      {/* Cantidad + Añadir al carrito — estilo exacto original */}
      <div style={{display:'flex',gap:'0.75rem',alignItems:'stretch',marginTop:'1rem'}}>
        {/* Cantidad con flechas arriba/abajo */}
        <div style={{display:'flex',flexDirection:'column',border:'1px solid #ccc',width:60,flexShrink:0}}>
          <button onClick={()=>setQty(q=>Math.min(product.stock||99,q+1))} style={{flex:1,background:'#f8f8f8',border:'none',borderBottom:'1px solid #ccc',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',color:'#333'}}>▲</button>
          <div style={{flex:2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'#333'}}>{qty}</div>
          <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{flex:1,background:'#f8f8f8',border:'none',borderTop:'1px solid #ccc',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',color:'#333'}}>▼</button>
        </div>

        {/* Botón Añadir al carrito — rojo relleno con icono */}
        <button onClick={handleAdd} disabled={!canAdd}
          style={{flex:1,padding:'0 24px',background:canAdd?'var(--red)':'#ccc',color:'white',border:'none',fontFamily:'var(--font-body)',fontSize:15,fontWeight:700,cursor:canAdd?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'background 0.15s',minHeight:52}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-17-16v2h2l3.6 7.6L4.25 14c-.16.28-.25.61-.25.96C4 16.1 4.9 17 6 17h14v-2H6.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.46 4H5.21l-.94-2H0z"/></svg>
          {added?'✓ Añadido':product.stock===0?'Sin stock':'Añadir al carrito'}
        </button>
      </div>

      {/* Garantías */}
      <div style={{display:'flex',gap:'1rem',marginTop:'1rem',flexWrap:'wrap'}}>
        {['🚚 Envío 24/48h','🔒 Pago seguro','🔄 Devoluciones gratis'].map(b=>(
          <span key={b} style={{fontSize:12,color:'var(--muted)',fontWeight:600}}>{b}</span>
        ))}
      </div>
    </div>
  )
}
