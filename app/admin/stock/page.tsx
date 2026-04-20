// @ts-nocheck
'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const db = createClient(
  'https://awwlbepjxuoxaigztugh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
)

function FacturaModal({ onClose, allProducts, onStockUpdated }) {
  const [step, setStep] = useState('upload')
  const [loadingMsg, setLoadingMsg] = useState('')
  const [items, setItems] = useState([])
  const [resultMsg, setResultMsg] = useState('')
  const [manualText, setManualText] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef()

  async function callAI(b64, mediaType, textContent) {
    setStep('loading'); setLoadingMsg('Analizando con IA...')
    try {
      const content = b64
        ? [{ type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } },
           { type: 'text', text: 'Eres asistente de una tienda de suplementacion deportiva en España. Analiza esta factura y extrae productos con cantidades. Devuelve SOLO JSON valido: {"productos":[{"nombre":"nombre","cantidad":50}]}' }]
        : [{ type: 'text', text: 'Extrae productos y cantidades de este albaran. Devuelve SOLO JSON: {"productos":[{"nombre":"nombre","cantidad":50}]}\n\n' + textContent }]
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content }] })
      })
      const data = await resp.json()
      const text = data.content?.[0]?.text || '{}'
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      matchProducts(parsed.productos || [])
    } catch(e) { alert('Error: ' + e.message); setStep('upload') }
  }

  function matchProducts(productos) {
    setLoadingMsg('Buscando en catalogo...')
    const matched = productos.map(p => {
      const name = p.nombre.toLowerCase()
      const match = allProducts.find(db => {
        const dbName = db.name.toLowerCase()
        const words = name.split(' ').filter(w => w.length > 3)
        return words.filter(w => dbName.includes(w)).length >= Math.min(2, words.length)
      })
      return { invoiceName: p.nombre, cantidad: p.cantidad, matched: match || null,
               currentStock: match?.stock ?? null, newStock: match ? (match.stock + p.cantidad) : null, selected: !!match }
    })
    setItems(matched)
    setResultMsg(matched.length + ' productos detectados · ' + matched.filter(i=>i.matched).length + ' encontrados')
    setStep('results')
  }

  async function handleFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => callAI(e.target.result.split(',')[1], file.type, null)
    reader.readAsDataURL(file)
  }

  function toggleItem(idx, checked) { setItems(prev => prev.map((it,i) => i===idx ? {...it,selected:checked} : it)) }
  function updateQty(idx, val) {
    const qty = parseInt(val)||0
    setItems(prev => prev.map((it,i) => i===idx ? {...it, cantidad:qty, newStock: it.matched?(it.currentStock+qty):null} : it))
  }

  async function applyStock() {
    const toApply = items.filter(i => i.selected && i.matched)
    if (!toApply.length) return
    let ok = 0
    for (const item of toApply) {
      const { error } = await db.from('products').update({ stock: item.newStock }).eq('id', item.matched.id)
      if (!error) ok++
    }
    setResultMsg(ok + ' productos actualizados correctamente')
    setStep('success'); onStockUpdated()
  }

  const S = {
    overlay: { position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' },
    modal: { background:'white',borderRadius:8,width:'100%',maxWidth:700,maxHeight:'88vh',overflow:'auto',padding:'24px' },
    dropZone: { border:'2px dashed '+(isDragging?'#ff1e41':'#ddd'),borderRadius:8,padding:'2rem',textAlign:'center',cursor:'pointer',background:isDragging?'#fff0f2':'#fafafa',transition:'all 0.2s' },
    row: { display:'grid',gridTemplateColumns:'1fr 80px 80px 120px',gap:8,alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f5f5f5' },
    btnRed: { background:'#ff1e41',color:'white',border:'none',padding:'10px 20px',borderRadius:6,fontSize:13,cursor:'pointer',fontWeight:700,fontFamily:'inherit' },
    btnGray: { background:'none',border:'1px solid #ddd',padding:'8px 16px',borderRadius:6,fontSize:13,cursor:'pointer',fontFamily:'inherit',color:'#333' }
  }

  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.modal}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div>
            <h2 style={{margin:0,fontSize:18,fontWeight:900}}>📥 Stock desde factura</h2>
            <p style={{margin:'4px 0 0',fontSize:12,color:'#999'}}>Sube foto o PDF del albaran del proveedor</p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#aaa',lineHeight:1}}>✕</button>
        </div>

        {step==='upload' && <>
          <div style={S.dropZone} onClick={()=>fileRef.current?.click()}
            onDragOver={e=>{e.preventDefault();setIsDragging(true)}}
            onDragLeave={()=>setIsDragging(false)}
            onDrop={e=>{e.preventDefault();setIsDragging(false);handleFile(e.dataTransfer.files[0])}}>
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
            <div style={{fontSize:36,marginBottom:8}}>📄</div>
            <p style={{margin:0,fontWeight:700,fontSize:14,color:'#333'}}>Arrastra la factura aqui</p>
            <p style={{margin:'4px 0 0',fontSize:12,color:'#aaa'}}>o haz clic para seleccionar · JPG, PNG, PDF</p>
          </div>
          <div style={{textAlign:'center',margin:'16px 0',fontSize:12,color:'#bbb'}}>— o escribe los productos manualmente —</div>
          <textarea value={manualText} onChange={e=>setManualText(e.target.value)}
            placeholder="Ej: 50 unidades Whey Protein 1kg Scitec, 30 Creatina 300g..."
            style={{width:'100%',minHeight:80,padding:10,border:'1px solid #ddd',borderRadius:6,fontSize:13,fontFamily:'inherit',resize:'vertical',boxSizing:'border-box',color:'#333'}}/>
          <button style={{...S.btnGray,marginTop:8}} onClick={()=>manualText.trim()&&callAI(null,null,manualText)}>
            Analizar texto
          </button>
        </>}

        {step==='loading' && <div style={{textAlign:'center',padding:'3rem'}}>
          <div style={{width:40,height:40,border:'3px solid #f0f0f0',borderTopColor:'#ff1e41',borderRadius:'50%',margin:'0 auto 16px',animation:'spin 0.8s linear infinite'}}/>
          <p style={{color:'#888',fontSize:14}}>{loadingMsg}</p>
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>}

        {step==='results' && <>
          <p style={{fontSize:13,color:'#888',marginBottom:12}}>{resultMsg}</p>
          <div style={{border:'1px solid #f0f0f0',borderRadius:6,overflow:'hidden',marginBottom:16}}>
            <div style={{...S.row,padding:'8px 12px',background:'#f9f9f9',borderBottom:'1px solid #e8e8e8'}}>
              <span style={{fontSize:11,color:'#aaa',textTransform:'uppercase',letterSpacing:'0.05em'}}>Producto</span>
              <span style={{fontSize:11,color:'#aaa',textTransform:'uppercase',textAlign:'right'}}>Uds</span>
              <span style={{fontSize:11,color:'#aaa',textTransform:'uppercase',textAlign:'right'}}>Actual</span>
              <span style={{fontSize:11,color:'#aaa',textTransform:'uppercase',textAlign:'right'}}>Nuevo</span>
            </div>
            <div style={{padding:'0 12px'}}>
              {items.map((item,idx)=>(
                <div key={idx} style={{...S.row,opacity:item.selected?1:0.45}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
                    <input type="checkbox" checked={item.selected} onChange={e=>toggleItem(idx,e.target.checked)} disabled={!item.matched} style={{accentColor:'#ff1e41',flexShrink:0}}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#333'}}>{item.matched?.name||item.invoiceName}</div>
                      {!item.matched&&<div style={{fontSize:10,color:'#f59e0b'}}>⚠ No encontrado</div>}
                    </div>
                  </div>
                  <input type="number" min="0" value={item.cantidad} onChange={e=>updateQty(idx,e.target.value)} disabled={!item.matched}
                    style={{width:'100%',padding:'4px 6px',fontSize:12,textAlign:'right',border:'1px solid #e8e8e8',borderRadius:4}}/>
                  <span style={{fontSize:12,textAlign:'right',color:'#888'}}>{item.currentStock??'—'}</span>
                  <span style={{fontSize:13,textAlign:'right',fontWeight:700,color:item.newStock!==null?'#22c55e':'#ccc'}}>
                    {item.newStock!==null?'+'+item.cantidad+' → '+item.newStock:'—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button style={S.btnGray} onClick={()=>setStep('upload')}>← Nueva</button>
            <button style={{...S.btnRed,opacity:items.filter(i=>i.selected&&i.matched).length?1:0.4}}
              onClick={applyStock} disabled={!items.filter(i=>i.selected&&i.matched).length}>
              ✓ Aplicar ({items.filter(i=>i.selected&&i.matched).length} productos)
            </button>
          </div>
        </>}

        {step==='success' && <div style={{textAlign:'center',padding:'2rem'}}>
          <div style={{fontSize:56,marginBottom:12}}>✅</div>
          <h3 style={{margin:'0 0 8px',fontSize:18,color:'#333'}}>Stock actualizado</h3>
          <p style={{color:'#888',fontSize:14,marginBottom:20}}>{resultMsg}</p>
          <div style={{display:'flex',gap:8,justifyContent:'center'}}>
            <button style={S.btnGray} onClick={()=>{setStep('upload');setManualText('');setItems([])}}>Otra factura</button>
            <button style={S.btnRed} onClick={onClose}>Cerrar</button>
          </div>
        </div>}
      </div>
    </div>
  )
}

export default function AdminStock() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState({})
  const [edits, setEdits] = useState({})
  const [catFilter, setCatFilter] = useState('Todos')
  const [categories, setCategories] = useState([])
  const [showLow, setShowLow] = useState(false)
  const [saved, setSaved] = useState(null)
  const [showFactura, setShowFactura] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    db.from('products').select('*, categories(name)').order('name').limit(1000)
      .then(({ data }) => {
        const prods = data || []
        setProducts(prods)
        const cats = ['Todos', ...new Set(prods.map(p => p.categories?.name).filter(Boolean).sort())]
        setCategories(cats)
        setLoading(false)
      })
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = products.filter(p => {
    const matchCat = catFilter === 'Todos' || p.categories?.name === catFilter
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
    const matchLow = !showLow || p.stock <= 5
    return matchCat && matchSearch && matchLow
  })

  function edit(id, field, val) { setEdits(e => ({ ...e, [id]: { ...(e[id]||{}), [field]: val } })) }
  function getVal(p, field) { return edits[p.id]?.[field] !== undefined ? edits[p.id][field] : p[field] }

  async function save(p) {
    const changes = edits[p.id]; if (!changes) return
    setSaving(s => ({ ...s, [p.id]: true }))
    const update = {}
    if (changes.stock !== undefined) update.stock = Number(changes.stock)
    if (changes.price !== undefined) update.price_incl_tax = Number(changes.price)
    if (changes.sale_price !== undefined) update.sale_price = changes.sale_price===''?null:Number(changes.sale_price)
    if (changes.active !== undefined) update.active = changes.active
    await db.from('products').update(update).eq('id', p.id)
    setProducts(ps => ps.map(x => x.id===p.id ? {...x,...update} : x))
    setEdits(e => { const n={...e}; delete n[p.id]; return n })
    setSaved(p.id); setTimeout(()=>setSaved(null), 2000)
    setSaving(s => ({ ...s, [p.id]: false }))
  }

  const lowStock = products.filter(p => p.active && p.stock <= 5).length

  return (
    <div style={{ background:'#f5f5f5', minHeight:'100vh', padding:'1.5rem 20px' }}>
      {showFactura && <FacturaModal onClose={()=>setShowFactura(false)} allProducts={products} onStockUpdated={load}/>}
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
          <h1 style={{ fontSize:20, fontWeight:900, textTransform:'uppercase', margin:0 }}>📦 Gestión de Stock</h1>
          <button onClick={()=>setShowFactura(true)}
            style={{ background:'#ff1e41', color:'white', border:'none', padding:'8px 18px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, borderRadius:4 }}>
            📥 Subir factura
          </button>
          <a href="/admin/pedidos" style={{ background:'#111', color:'white', padding:'6px 14px', fontSize:12, fontWeight:700, textDecoration:'none', textTransform:'uppercase' }}>← Pedidos</a>
          <a href="/" style={{ marginLeft:'auto', fontSize:12, color:'#888', textDecoration:'none' }}>← Tienda</a>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.75rem', marginBottom:'1rem' }}>
          {[['Total',products.length,'#111'],['Activos',products.filter(p=>p.active).length,'#22c55e'],
            ['Stock bajo (≤5)',lowStock,'#ef4444'],['Sin stock',products.filter(p=>p.stock===0&&p.active).length,'#f59e0b']
          ].map(([l,v,c])=>(
            <div key={l} style={{ background:'white', padding:'1rem 1.25rem', border:'1px solid #e8e8e8' }}>
              <div style={{ fontSize:11, color:'#999', textTransform:'uppercase', marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:24, fontWeight:900, color:c }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ background:'white', border:'1px solid #e8e8e8', padding:'0.75rem 1rem', marginBottom:'1rem', display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar producto..."
            style={{ padding:'6px 10px', border:'1px solid #ddd', fontSize:13, fontFamily:'inherit', flex:1, minWidth:200 }}/>
          <button onClick={()=>setShowLow(!showLow)}
            style={{ padding:'6px 14px', border:'1px solid '+(showLow?'#ef4444':'#ddd'), background:showLow?'#ef4444':'white', color:showLow?'white':'#666', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            ⚠ Stock bajo ({lowStock})
          </button>
          <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
            {categories.slice(0,10).map(c=>(
              <button key={c} onClick={()=>setCatFilter(c)}
                style={{ padding:'4px 10px', border:'1px solid #ddd', background:catFilter===c?'#111':'white', color:catFilter===c?'white':'#666', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textTransform:'uppercase' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background:'white', border:'1px solid #e8e8e8', overflow:'hidden' }}>
          {loading ? <div style={{ padding:'3rem', textAlign:'center', color:'#aaa' }}>Cargando productos...</div>
            : <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f9f9f9', borderBottom:'1px solid #e8e8e8' }}>
                  {['Imagen','Producto','Categoría','Stock','Precio PVP','Precio Oferta','Activo',''].map(h=>(
                    <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#888', letterSpacing:'0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p=>{
                  const hasEdits = !!edits[p.id]
                  const isActive = edits[p.id]?.active !== undefined ? edits[p.id].active : p.active
                  const stock = getVal(p,'stock')
                  const isSavedNow = saved === p.id
                  return (
                    <tr key={p.id} style={{ borderBottom:'1px solid #f5f5f5', background:isSavedNow?'#f0fff4':hasEdits?'#fffbf0':'white' }}>
                      <td style={{ padding:'6px 12px', width:48 }}>
                        {p.image_url
                          ? <img src={p.image_url} alt="" style={{ width:40, height:40, objectFit:'contain', borderRadius:4 }} onError={e=>e.target.style.display='none'}/>
                          : <div style={{ width:40, height:40, background:'#f0f0f0', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>📦</div>}
                      </td>
                      <td style={{ padding:'6px 12px', maxWidth:220 }}>
                        <div style={{ fontSize:12, fontWeight:600, lineHeight:1.3 }}>{p.name}</div>
                      </td>
                      <td style={{ padding:'6px 12px', fontSize:11, color:'#888' }}>{p.categories?.name||'—'}</td>
                      <td style={{ padding:'6px 12px' }}>
                        <input type="number" min="0" value={getVal(p,'stock')} onChange={e=>edit(p.id,'stock',e.target.value)}
                          style={{ width:70, padding:'4px 6px', border:'1px solid '+(Number(stock)<=5?'#ef4444':'#ddd'), fontSize:13, fontWeight:700, textAlign:'center', color:Number(stock)===0?'#ef4444':Number(stock)<=5?'#f59e0b':'#111', fontFamily:'inherit' }}/>
                        {Number(stock)<=5 && <div style={{ fontSize:9, color:'#ef4444', marginTop:2 }}>⚠ BAJO</div>}
                      </td>
                      <td style={{ padding:'6px 12px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <input type="number" min="0" step="0.01" value={getVal(p,'price')||getVal(p,'price_incl_tax')||''} onChange={e=>edit(p.id,'price',e.target.value)}
                            style={{ width:80, padding:'4px 6px', border:'1px solid #ddd', fontSize:12, fontFamily:'inherit' }}/>
                          <span style={{ fontSize:11, color:'#aaa' }}>€</span>
                        </div>
                      </td>
                      <td style={{ padding:'6px 12px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <input type="number" min="0" step="0.01" value={getVal(p,'sale_price')||''} onChange={e=>edit(p.id,'sale_price',e.target.value)}
                            placeholder="—" style={{ width:80, padding:'4px 6px', border:'1px solid '+(getVal(p,'sale_price')?'#22c55e':'#ddd'), fontSize:12, fontFamily:'inherit' }}/>
                          <span style={{ fontSize:11, color:'#aaa' }}>€</span>
                        </div>
                      </td>
                      <td style={{ padding:'6px 12px' }}>
                        <button onClick={()=>edit(p.id,'active',!isActive)}
                          style={{ padding:'4px 10px', border:'none', background:isActive?'#22c55e':'#ddd', color:isActive?'white':'#888', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', borderRadius:20 }}>
                          {isActive?'✓ ACTIVO':'✗ INACT.'}
                        </button>
                      </td>
                      <td style={{ padding:'6px 12px' }}>
                        {isSavedNow
                          ? <span style={{ fontSize:11, color:'#22c55e', fontWeight:700 }}>✓ Guardado</span>
                          : hasEdits
                          ? <button onClick={()=>save(p)} disabled={saving[p.id]}
                              style={{ padding:'5px 14px', background:'#ff1e41', color:'white', border:'none', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                              {saving[p.id]?'⏳':'💾 Guardar'}
                            </button>
                          : <span style={{ fontSize:11, color:'#ddd' }}>—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>}
          <div style={{ padding:'0.75rem 1rem', borderTop:'1px solid #f0f0f0', fontSize:11, color:'#aaa' }}>
            Mostrando {filtered.length} de {products.length} productos
          </div>
        </div>
      </div>
    </div>
  )
}
