'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart'

type Variant = { id:number; value:string; hex?:string; variantId:number; stock:number; priceModifier:number }

interface Props {
  product: { id:number; name:string; price_incl_tax:number; price_excl_tax:number; stock:number; image_url:string|null }
  variantsByType: Record<string, Variant[]>
  sortedTypes: string[]
  hasVariants: boolean
}

export default function AddToCartSection({ product, variantsByType, sortedTypes, hasVariants }: Props) {
  const { add } = useCart()
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const allSelected = !hasVariants || sortedTypes.every(t => selected[t])
  const canAdd = product.stock > 0 && allSelected

  const handleAdd = () => {
    if (!canAdd) return
    add(product as any, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      {/* Selectores de variantes */}
      {sortedTypes.map(typeName => {
        const opts = variantsByType[typeName]
        const isTalla = typeName === 'Talla'
        const isColor = typeName === 'Color'
        const isSabor = typeName === 'Sabor'
        return (
          <div key={typeName} style={{marginBottom:'1.25rem'}}>
            <div style={{fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem', color:'var(--text)'}}>
              {typeName}
              {selected[typeName] && <span style={{color:'var(--red)', fontWeight:400, textTransform:'none', marginLeft:8}}>{selected[typeName]}</span>}
            </div>
            <div style={{display:'flex', gap:'0.4rem', flexWrap:'wrap'}}>
              {opts.map(opt => {
                const isSel = selected[typeName] === opt.value
                if (isColor) {
                  return (
                    <button key={opt.value} onClick={() => setSelected(p => ({...p, [typeName]: opt.value}))}
                      title={opt.value}
                      style={{width:30, height:30, borderRadius:'50%', background: opt.hex||'#ccc', border: isSel?'3px solid var(--red)':'2px solid rgba(0,0,0,0.15)', cursor:'pointer', position:'relative', flexShrink:0, transition:'transform 0.12s', transform: isSel?'scale(1.2)':'scale(1)'}}>
                      {isSel && <span style={{position:'absolute', inset:0, borderRadius:'50%', border:'2px solid white'}}></span>}
                    </button>
                  )
                }
                if (isTalla) {
                  return (
                    <button key={opt.value} onClick={() => setSelected(p => ({...p, [typeName]: opt.value}))}
                      style={{padding:'7px 14px', border: isSel?'2px solid var(--red)':'1px solid var(--border)', background: isSel?'var(--red)':'var(--surface)', color: isSel?'white':'var(--text)', fontFamily:'var(--font-body)', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.12s', minWidth:44, textAlign:'center'}}>
                      {opt.value}
                    </button>
                  )
                }
                // Sabor y otros — botones de texto
                return (
                  <button key={opt.value} onClick={() => setSelected(p => ({...p, [typeName]: opt.value}))}
                    style={{padding:'6px 12px', border: isSel?'2px solid var(--red)':'1px solid var(--border)', background: isSel?'rgba(255,30,65,0.06)':'var(--surface)', color: isSel?'var(--red)':'var(--muted)', fontFamily:'var(--font-body)', fontSize:12, fontWeight: isSel?700:400, cursor:'pointer', transition:'all 0.12s', whiteSpace:'nowrap'}}>
                    {opt.value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Aviso si hay variantes y no ha seleccionado */}
      {hasVariants && !allSelected && (
        <div style={{background:'rgba(255,30,65,0.06)', border:'1px solid rgba(255,30,65,0.2)', padding:'8px 12px', fontSize:13, color:'var(--red)', marginBottom:'1rem'}}>
          Por favor selecciona {sortedTypes.filter(t=>!selected[t]).join(' y ')}
        </div>
      )}

      {/* Cantidad + Añadir */}
      <div style={{display:'flex', gap:'0.75rem', alignItems:'center', marginTop:'0.5rem'}}>
        <div style={{display:'flex', alignItems:'center', border:'1px solid var(--border)', background:'var(--surface)'}}>
          <button onClick={() => setQty(q => Math.max(1, q-1))}
            style={{width:40, height:46, fontSize:20, color:'var(--text)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>−</button>
          <span style={{width:40, textAlign:'center', fontSize:16, fontWeight:700}}>{qty}</span>
          <button onClick={() => setQty(q => Math.min(product.stock||99, q+1))}
            style={{width:40, height:46, fontSize:20, color:'var(--text)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>+</button>
        </div>
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="btn-primary"
          style={{flex:1, padding:'12px 24px', fontSize:15, justifyContent:'center'}}>
          {added ? '✓ Añadido al carrito' : product.stock === 0 ? 'Sin stock' : 'Añadir al carrito'}
        </button>
      </div>
    </div>
  )
}
