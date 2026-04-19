// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const db = createClient(
  'https://awwlbepjxuoxaigztugh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
)

export default function AdminStock() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState({})
  const [edits, setEdits] = useState({}) // {id: {stock, price, sale_price, active}}
  const [catFilter, setCatFilter] = useState('Todos')
  const [categories, setCategories] = useState([])
  const [showLow, setShowLow] = useState(false)
  const [saved, setSaved] = useState(null) // feedback visual

  useEffect(() => {
    db.from('products').select('*, categories(name)').order('name').limit(1000)
      .then(({ data }) => {
        const prods = data || []
        setProducts(prods)
        const cats = ['Todos', ...new Set(prods.map(p => p.categories?.name).filter(Boolean).sort())]
        setCategories(cats)
        setLoading(false)
      })
  }, [])

  const filtered = products.filter(p => {
    const matchCat = catFilter === 'Todos' || p.categories?.name === catFilter
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
    const matchLow = !showLow || (p.stock <= 5)
    return matchCat && matchSearch && matchLow
  })

  function edit(id, field, val) {
    setEdits(e => ({ ...e, [id]: { ...(e[id] || {}), [field]: val } }))
  }

  function getVal(p, field) {
    return edits[p.id]?.[field] !== undefined ? edits[p.id][field] : p[field]
  }

  async function save(p) {
    const changes = edits[p.id]
    if (!changes) return
    setSaving(s => ({ ...s, [p.id]: true }))
    const update = {}
    if (changes.stock !== undefined) update.stock = Number(changes.stock)
    if (changes.price !== undefined) update.price_incl_tax = Number(changes.price)
    if (changes.sale_price !== undefined) update.sale_price = changes.sale_price === '' ? null : Number(changes.sale_price)
    if (changes.active !== undefined) update.active = changes.active
    await db.from('products').update(update).eq('id', p.id)
    setProducts(ps => ps.map(x => x.id === p.id ? { ...x, ...update } : x))
    setEdits(e => { const n = { ...e }; delete n[p.id]; return n })
    setSaved(p.id)
    setTimeout(() => setSaved(null), 2000)
    setSaving(s => ({ ...s, [p.id]: false }))
  }

  async function toggleActive(p) {
    const newVal = !(edits[p.id]?.active !== undefined ? edits[p.id].active : p.active)
    edit(p.id, 'active', newVal)
  }

  const lowStock = products.filter(p => p.active && p.stock <= 5).length

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '1.5rem 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>📦 Gestión de Stock</h1>
          <a href="/admin/pedidos" style={{ background: '#111', color: 'white', padding: '6px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase' }}>← Pedidos</a>
          <a href="/" style={{ marginLeft: 'auto', fontSize: 12, color: '#888', textDecoration: 'none' }}>← Tienda</a>
        </div>

        {/* Stats rápidas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          {[
            ['Total productos', products.length, '#111'],
            ['Activos', products.filter(p=>p.active).length, '#22c55e'],
            ['Stock bajo (≤5)', lowStock, '#ef4444'],
            ['Sin stock', products.filter(p=>p.stock===0&&p.active).length, '#f59e0b']
          ].map(([l,v,c]) => (
            <div key={l} style={{ background: 'white', padding: '1rem 1.25rem', border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ background: 'white', border: '1px solid #e8e8e8', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar producto..."
            style={{ padding: '6px 10px', border: '1px solid #ddd', fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 200 }} />
          <button onClick={() => setShowLow(!showLow)}
            style={{ padding: '6px 14px', border: '1px solid ' + (showLow?'#ef4444':'#ddd'), background: showLow?'#ef4444':'white', color: showLow?'white':'#666', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            ⚠ Stock bajo ({lowStock})
          </button>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {categories.slice(0, 10).map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                style={{ padding: '4px 10px', border: '1px solid #ddd', background: catFilter===c?'#111':'white', color: catFilter===c?'white':'#666', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div style={{ background: 'white', border: '1px solid #e8e8e8', overflow: 'hidden' }}>
          {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>Cargando productos...</div>
            : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e8e8e8' }}>
                  {['Imagen','Producto','Categoría','Stock','Precio PVP','Precio Oferta','Activo',''].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const hasEdits = !!edits[p.id]
                  const isActive = edits[p.id]?.active !== undefined ? edits[p.id].active : p.active
                  const stock = getVal(p, 'stock')
                  const isSavedNow = saved === p.id
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5', background: isSavedNow?'#f0fff4':hasEdits?'#fffbf0':'white' }}>
                      {/* Imagen */}
                      <td style={{ padding: '6px 12px', width: 48 }}>
                        {p.image_url
                          ? <img src={p.image_url} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4 }} onError={e=>e.target.style.display='none'}/>
                          : <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>}
                      </td>
                      {/* Nombre */}
                      <td style={{ padding: '6px 12px', maxWidth: 220 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
                      </td>
                      {/* Categoría */}
                      <td style={{ padding: '6px 12px', fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>{p.categories?.name || '—'}</td>
                      {/* Stock */}
                      <td style={{ padding: '6px 12px' }}>
                        <input type="number" min="0" value={getVal(p,'stock')}
                          onChange={e => edit(p.id, 'stock', e.target.value)}
                          style={{ width: 70, padding: '4px 6px', border: '1px solid ' + (Number(stock)<=5?'#ef4444':'#ddd'), fontSize: 13, fontWeight: 700, textAlign: 'center', color: Number(stock)===0?'#ef4444':Number(stock)<=5?'#f59e0b':'#111', fontFamily: 'inherit' }}/>
                        {Number(stock) <= 5 && <div style={{ fontSize: 9, color: '#ef4444', marginTop: 2 }}>⚠ BAJO</div>}
                      </td>
                      {/* Precio PVP */}
                      <td style={{ padding: '6px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input type="number" min="0" step="0.01" value={getVal(p,'price')||getVal(p,'price_incl_tax')||''}
                            onChange={e => edit(p.id, 'price', e.target.value)}
                            style={{ width: 80, padding: '4px 6px', border: '1px solid #ddd', fontSize: 12, fontFamily: 'inherit' }}/>
                          <span style={{ fontSize: 11, color: '#aaa' }}>€</span>
                        </div>
                      </td>
                      {/* Precio oferta */}
                      <td style={{ padding: '6px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input type="number" min="0" step="0.01" value={getVal(p,'sale_price')||''}
                            onChange={e => edit(p.id, 'sale_price', e.target.value)}
                            placeholder="—"
                            style={{ width: 80, padding: '4px 6px', border: '1px solid ' + (getVal(p,'sale_price')?'#22c55e':'#ddd'), fontSize: 12, fontFamily: 'inherit' }}/>
                          <span style={{ fontSize: 11, color: '#aaa' }}>€</span>
                        </div>
                      </td>
                      {/* Activo toggle */}
                      <td style={{ padding: '6px 12px' }}>
                        <button onClick={() => toggleActive(p)}
                          style={{ padding: '4px 10px', border: 'none', background: isActive?'#22c55e':'#ddd', color: isActive?'white':'#888', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 20 }}>
                          {isActive ? '✓ ACTIVO' : '✗ INACT.'}
                        </button>
                      </td>
                      {/* Guardar */}
                      <td style={{ padding: '6px 12px' }}>
                        {isSavedNow ? (
                          <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>✓ Guardado</span>
                        ) : hasEdits ? (
                          <button onClick={() => save(p)} disabled={saving[p.id]}
                            style={{ padding: '5px 14px', background: 'var(--red)', color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                            {saving[p.id] ? '⏳' : '💾 Guardar'}
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: '#ddd' }}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #f0f0f0', fontSize: 11, color: '#aaa' }}>
            Mostrando {filtered.length} de {products.length} productos
          </div>
        </div>
      </div>
    </div>
  )
}
