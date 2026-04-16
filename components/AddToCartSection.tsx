'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'

type Variant = { id:number; value:string; hex?:string; variantId:number; stock:number; priceModifier:number }
interface Props {
  product: { id:number; name:string; price_incl_tax:number; price_excl_tax:number; stock:number; image_url:string|null }
  variantsByType: Record<string, Variant[]>
  sortedTypes: string[]
  hasVariants: boolean
}

const LEVEL_COLORS: Record<string, string> = { Bronze:'#cd7f32', Silver:'#a8a9ad', Gold:'#ffd700' }
const LEVEL_ICON: Record<string, string> = { Bronze:'🥉', Silver:'🥈', Gold:'🥇' }

export default function AddToCartSection({ product, variantsByType, sortedTypes, hasVariants }: Props) {
  const { add } = useCart()
  const { isDistributor, levelName, discountPct } = useAuth()
  const [selected, setSelected] = useState<Record<string,string>>({})
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const allSelected = !hasVariants || sortedTypes.every(t => selected[t])
  const canAdd = product.stock > 0 && allSelected
  const finalPrice = discountPct > 0 ? product.price_incl_tax * (1 - discountPct / 100) : product.price_incl_tax
  const priceColor = discountPct > 0 && levelName ? LEVEL_COLORS[levelName] : 'var(--red)'

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
        <div style={{background:`${LEVEL_COLORS[levelName]}10`,border:`1px solid ${LEVEL_COLORS[levelName]}40`,padding:'10px 14px',marginBottom:'1.25rem',display:'flex',alignItems:'center',gap:10,borderRadius:0}}>
          <span style={{fontSize:22}}>{LEVEL_ICON[levelName]}</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:LEVEL_COLORS[levelName],textTransform:'uppercase',letterSpacing:'0.04em'}}>
              Precio distribuidor {levelName} — -{discountPct}%
            </div>
            <div style={{fontSize:12,color:'var(--muted)'}}>
              PVP: <s>{product.price_incl_tax.toFixed(2)} €</s> → Tu precio: <strong style={{color:LEVEL_COLORS[levelName]}}>{finalPrice.toFixed(2)} €</strong>
            </div>
          </div>
        </div>
      )}

      {/* Selectores de variantes */}
      {sortedTypes.map(typeName => {
        const opts = variantsByType[typeName]
        const isColor = typeName === 'Color'
        const isTalla = typeName === 'Talla'
        return (
          <div key={typeName} style={{marginBottom:'1.25rem'}}>
            <div style={{fontSize:13,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.5rem',color:'var(--text)'}}>
              {typeName}{selected[typeName] && <span style={{color:'var(--red)',fontWeight:400,textTransform:'none',marginLeft:8}}>{selected[typeName]}</span>}
            </div>
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
              {opts.map(opt => {
                const isSel = selected[typeName] === opt.value
                if (isColor) return (
                  <button key={opt.value} onClick={() => setSelected(p=>({...p,[typeName]:opt.value}))} title={opt.value}
                    style={{width:30,height:30,borderRadius:'50%',background:opt.hex||'#ccc',border:isSel?'3px solid var(--red)':'2px solid rgba(0,0,0,0.15)',cursor:'pointer',position:'relative',flexShrink:0,transition:'transform 0.12s',transform:isSel?'scale(1.2)':'scale(1)'}}>
                    {isSel && <span style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid white'}}/>}
                  </button>
                )
                if (isTalla) return (
                  <button key={opt.value} onClick={() => setSelected(p=>({...p,[typeName]:opt.value}))}
                    style={{padding:'7px 14px',border:isSel?'2px solid var(--red)':'1px solid var(--border)',background:isSel?'var(--red)':'var(--surface)',color:isSel?'white':'var(--text)',fontFamily:'var(--font-body)',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all 0.12s',minWidth:44,textAlign:'center'}}>
                    {opt.value}
                  </button>
                )
                return (
                  <button key={opt.value} onClick={() => setSelected(p=>({...p,[typeName]:opt.value}))}
                    style={{padding:'6px 12px',border:isSel?'2px solid var(--red)':'1px solid var(--border)',background:isSel?'rgba(255,30,65,0.06)':'var(--surface)',color:isSel?'var(--red)':'var(--muted)',fontFamily:'var(--font-body)',fontSize:12,fontWeight:isSel?700:400,cursor:'pointer',transition:'all 0.12s',whiteSpace:'nowrap'}}>
                    {opt.value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {hasVariants && !allSelected && (
        <div style={{background:'rgba(255,30,65,0.06)',border:'1px solid rgba(255,30,65,0.2)',padding:'8px 12px',fontSize:13,color:'var(--red)',marginBottom:'1rem'}}>
          Por favor selecciona {sortedTypes.filter(t=>!selected[t]).join(' y ')}
        </div>
      )}

      {/* Precio */}
      <div style={{marginBottom:'0.75rem'}}>
        <div style={{fontSize:36,fontWeight:900,color:priceColor,fontFamily:'var(--font-body)',lineHeight:1}}>
          {finalPrice.toFixed(2)} €
        </div>
        {discountPct > 0 && (
          <div style={{fontSize:13,color:'var(--muted)',marginTop:2}}>
            PVP: <s>{product.price_incl_tax.toFixed(2)} €</s>
          </div>
        )}
      </div>

      {/* Cantidad + botón */}
      <div style={{display:'flex',gap:'0.75rem',alignItems:'center',marginTop:'0.5rem'}}>
        <div style={{display:'flex',alignItems:'center',border:'1px solid var(--border)',background:'var(--surface)'}}>
          <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:40,height:46,fontSize:20,color:'var(--text)',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
          <span style={{width:40,textAlign:'center',fontSize:16,fontWeight:700}}>{qty}</span>
          <button onClick={()=>setQty(q=>Math.min(product.stock||99,q+1))} style={{width:40,height:46,fontSize:20,color:'var(--text)',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
        </div>
        <button onClick={handleAdd} disabled={!canAdd} className="btn-primary" style={{flex:1,padding:'12px 24px',fontSize:15,justifyContent:'center'}}>
          {added ? '✓ Añadido al carrito' : product.stock===0 ? 'Sin stock' : 'Añadir al carrito'}
        </button>
      </div>
    </div>
  )
}
