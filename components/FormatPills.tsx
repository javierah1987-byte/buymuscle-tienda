// @ts-nocheck
// MOCKUP F0 · ADR-BM-001 (Opción A+ formato×sabor, estilo LifePro).
// Pills de FORMATO: cada una navega a la ficha del producto HERMANO (cada formato ya es su
// propio producto → cambian foto+precio+stock+barcode al navegar). Link con prefetch para
// que el salto se perciba instantáneo. Server component — sin estado, la pill activa es
// la ficha en la que estás.
import Link from 'next/link'

export default function FormatPills({ items = [], activeId }) {
  if (!items || items.length < 2) return null
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        Formato
      </label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {items.map(it => {
          const active = it.id === activeId
          const pill = (
            <div style={{
              border: active ? '2px solid #ff1e41' : '2px solid #e5e5e5',
              background: active ? '#fff5f6' : '#fff',
              padding: '8px 14px', borderRadius: 6, textAlign: 'center', minWidth: 82,
              opacity: it.stock > 0 ? 1 : 0.45, transition: 'border-color 0.15s'
            }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#111', lineHeight: 1.1 }}>{it.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: active ? '#ff1e41' : '#666', marginTop: 3 }}>
                {Number(it.price).toFixed(2)} €
              </div>
              {it.stock <= 0 && <div style={{ fontSize: 10, color: '#999', marginTop: 1 }}>Agotado</div>}
            </div>
          )
          return active
            ? <div key={it.id} aria-current="true">{pill}</div>
            : <Link key={it.id} href={'/producto/' + it.id} prefetch={true} style={{ textDecoration: 'none' }} aria-label={'Ver formato ' + it.label}>{pill}</Link>
        })}
      </div>
    </div>
  )
}
