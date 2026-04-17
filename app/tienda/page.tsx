'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase, Product } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

const PER_PAGE = 24

const CAT_GROUPS = [
  { label:'NutriciÃ³n Deportiva', cats:['ProteÃ­nas','ProteÃ­na Whey','ProteÃ­na Isolatada','ProteÃ­na Vegetal','CaseÃ­nas','Ganadores de Peso','Barritas ProtÃ©icas','Snacks ProtÃ©icos','Creatinas Monohidratos','Pre-entrenos','Recuperadores','BCAA','AminoÃ¡cidos','Glutaminas','L-Carnitina','TermogÃ©nicos'] },
  { label:'Vitaminas y Salud', cats:['Vitaminas','Minerales','Omega 3','ColÃ¡geno','Sistema InmunolÃ³gico'] },
  { label:'Objetivos', cats:['Ganar MÃºsculo','Control de Peso','Quemadores','Rendimiento Deportivo'] },
  { label:'Caprichos Fit', cats:['Alimentos y Snacks','Caprichos Fit','Salsas y Siropes'] },
  { label:'Sport Wear', cats:['Sport Wear','Camisetas','StreetFlavour'] },
  { label:'Otros', cats:['Veganos','Packs','Bebidas','Pre-Pedidos','Accesorios'] },
]

const SABORES_COMUNES = ['Chocolate','Vainilla','Fresa','Cookies & Cream','Neutro','Caramelo Salado','Black Cookies','Pistacho','LimÃ³n','PlÃ¡tano']

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{borderBottom:'1px solid #e8e8e8'}}>
      <button onClick={() => setOpen(o => !o)} style={{width:'100%',padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',fontFamily:'var(--font-body)',fontSize:12,fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'#111',background:'none',border:'none',cursor:'pointer'}}>
        {title}
        <span style={{fontSize:9,color:'#999'}}>{open ? 'â¼' : 'â¶'}</span>
      </button>
      {open && <div style={{padding:'4px 14px 12px'}}>{children}</div>}
    </div>
  )
}

function TiendaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [marcas, setMarcas] = useState<string[]>([])
  // Usar array en lugar de Set para compatibilidad TS
  const [openGroups, setOpenGroups] = useState<number[]>([0])
  const [filtroMarcas, setFiltroMarcas] = useState<string[]>([])
  const [filtroSabores, setFiltroSabores] = useState<string[]>([])
  const [filtroDisp, setFiltroDisp] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState(200)

  const cat = searchParams.get('cat') || ''
  const q = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const isGroupOpen = (i: number) => openGroups.includes(i)
  const toggleGroup = (i: number) => setOpenGroups(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  useEffect(() => {
    async function loadMarcas() {
      let query = supabase.from('products').select('brand').eq('active', true).not('brand', 'is', null)
      if (cat) {
        const { data: catData } = await supabase.from('categories').select('id').eq('name', cat).single()
        if (catData) query = (query as any).eq('category_id', catData.id)
      }
      const { data } = await query
      const uniqueBrands = Array.from(new Set((data || []).map((p: any) => p.brand).filter(Boolean))).sort() as string[]
      setMarcas(uniqueBrands)
    }
    loadMarcas()
    setFiltroMarcas([])
    setFiltroSabores([])
    setFiltroDisp('')
  }, [cat])

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('products').select('*, categories(name)', { count: 'exact' }).eq('active', true)
    if (cat) {
      const { data: catData } = await supabase.from('categories').select('id').eq('name', cat).single()
      if (catData) query = query.eq('category_id', catData.id)
    }
    if (q) query = query.ilike('name', `%${q}%`)
    if (filtroMarcas.length > 0) query = query.in('brand', filtroMarcas)
    if (filtroDisp === 'stock') query = query.gt('stock', 0)
    if (filtroDisp === 'agotado') query = query.eq('stock', 0)
    query = query.lte('price_incl_tax', maxPrice)
    const { data, count } = await query.order('id', { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
    setProducts((data || []) as Product[])
    setTotal(count || 0)
    setLoading(false)
  }, [cat, q, page, filtroMarcas, filtroDisp, maxPrice])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / PER_PAGE)
  const hasFilters = filtroMarcas.length > 0 || filtroSabores.length > 0 || filtroDisp !== '' || maxPrice < 200

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8e8e8', padding: '10px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#999' }}>
          <Link href="/" style={{ color: '#999', textDecoration: 'none' }}>Inicio</Link>
          <span>âº</span>
          <Link href="/tienda" style={{ color: '#999', textDecoration: 'none' }}>Tienda</Link>
          {cat && <><span>âº</span><span style={{ color: '#333', fontWeight: 600 }}>{cat}</span></>}
          {q && <><span>âº</span><span style={{ color: '#333', fontWeight: 600 }}>"{q}"</span></>}
        </div>
      </div>

      <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.25rem', alignItems: 'start' }}>

          {/* SIDEBAR */}
          <aside style={{ background: 'white', border: '1px solid #e8e8e8', position: 'sticky', top: 8 }}>
            {CAT_GROUPS.map((group, gi) => (
              <div key={gi} style={{ borderBottom: '1px solid #e8e8e8' }}>
                <button onClick={() => toggleGroup(gi)} style={{ width: '100%', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#111', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {group.label}
                  <span style={{ fontSize: 9, color: '#aaa' }}>{isGroupOpen(gi) ? 'â¼' : 'â¶'}</span>
                </button>
                {isGroupOpen(gi) && (
                  <div style={{ paddingBottom: 6 }}>
                    {group.cats.map(c => (
                      <Link key={c} href={`/tienda?cat=${encodeURIComponent(c)}`}
                        style={{ display: 'block', padding: '5px 14px 5px 20px', fontSize: 13, color: cat === c ? 'var(--red)' : '#555', fontWeight: cat === c ? 700 : 400, borderLeft: cat === c ? '3px solid var(--red)' : '3px solid transparent', background: cat === c ? 'rgba(255,30,65,0.03)' : 'transparent', textDecoration: 'none' }}>
                        {c}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {marcas.length > 0 && (
              <SidebarSection title="Marca">
                {marcas.slice(0, 8).map(m => (
                  <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0', fontSize: 13, color: '#444', cursor: 'pointer' }}>
                    <input type="checkbox" checked={filtroMarcas.includes(m)} onChange={() => setFiltroMarcas(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} style={{ accentColor: 'var(--red)', cursor: 'pointer' }} />
                    {m}
                  </label>
                ))}
              </SidebarSection>
            )}

            <SidebarSection title="Precio">
              <input type="range" min={0} max={200} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--red)', marginTop: 4 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginTop: 4 }}>
                <span>1,00 â¬</span><span style={{ fontWeight: 600 }}>{maxPrice},00 â¬</span>
              </div>
            </SidebarSection>

            <SidebarSection title="Sabores">
              {SABORES_COMUNES.map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0', fontSize: 13, color: '#444', cursor: 'pointer' }}>
                  <input type="checkbox" checked={filtroSabores.includes(s)} onChange={() => setFiltroSabores(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} style={{ accentColor: 'var(--red)', cursor: 'pointer' }} />
                  {s}
                </label>
              ))}
            </SidebarSection>

            <SidebarSection title="Disponibilidad">
              {([['', 'Todos'], ['stock', 'En stock'], ['agotado', 'Agotados']] as [string,string][]).map(([val, lbl]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0', fontSize: 13, color: '#444', cursor: 'pointer' }}>
                  <input type="radio" name="disp" checked={filtroDisp === val} onChange={() => setFiltroDisp(val)} style={{ accentColor: 'var(--red)', cursor: 'pointer' }} />
                  {lbl}
                </label>
              ))}
            </SidebarSection>

            {hasFilters && (
              <div style={{ padding: '10px 12px' }}>
                <button onClick={() => { setFiltroMarcas([]); setFiltroSabores([]); setFiltroDisp(''); setMaxPrice(200) }}
                  style={{ width: '100%', padding: '7px', background: 'none', border: '1px solid #ccc', color: '#666', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                  â Quitar filtros
                </button>
              </div>
            )}
          </aside>

          {/* CONTENIDO */}
          <div>
            <div style={{ background: 'white', border: '1px solid #e8e8e8', padding: '14px 16px', marginBottom: '1px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 8 }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, textTransform: 'uppercase' as const, margin: 0, color: '#111' }}>
                  {cat || (q ? `"${q}"` : 'Todo el catÃ¡logo')}
                </h1>
                <p style={{ fontSize: 12, color: '#999', margin: '2px 0 0' }}>{loading ? 'Cargando...' : `${total} producto${total !== 1 ? 's' : ''}`}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
                {(cat || q) && <Link href="/tienda" style={{ fontSize: 12, color: '#999', textDecoration: 'none', border: '1px solid #e8e8e8', padding: '5px 10px' }}>â Quitar filtro</Link>}
                <form onSubmit={e => { e.preventDefault(); const val = (e.currentTarget.querySelector('input') as HTMLInputElement).value; router.push(val ? `/tienda?q=${encodeURIComponent(val)}` : '/tienda') }} style={{ display: 'flex' }}>
                  <input defaultValue={q} placeholder="Buscar..." name="q" style={{ padding: '6px 10px', fontSize: 12, border: '1px solid #ddd', borderRight: 'none', width: 160, margin: 0, outline: 'none' }} />
                  <button type="submit" style={{ padding: '6px 12px', background: 'var(--red)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 13 }}>ð</button>
                </form>
              </div>
            </div>

            {!cat && !q && (
              <div style={{ background: 'white', border: '1px solid #e8e8e8', borderTop: 'none', padding: '10px 14px', marginBottom: '1px', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                {['ProteÃ­nas','Creatinas Monohidratos','Pre-entrenos','BCAA','Vitaminas','Quemadores','Snacks ProtÃ©icos','Veganos'].map(c => (
                  <Link key={c} href={`/tienda?cat=${encodeURIComponent(c)}`} style={{ padding: '5px 14px', border: '1px solid #ddd', fontSize: 12, fontWeight: 600, color: '#444', textDecoration: 'none', background: 'white' }}>{c}</Link>
                ))}
              </div>
            )}

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#e8e8e8', marginTop: '1px' }}>
                {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ background: 'white', height: 320 }} />)}
              </div>
            ) : products.length === 0 ? (
              <div style={{ background: 'white', textAlign: 'center', padding: '4rem 2rem', marginTop: '1px', border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 48, marginBottom: '1rem' }}>ð</div>
                <p style={{ fontWeight: 700, fontSize: 18, color: '#111' }}>No se encontraron productos</p>
                <p style={{ marginTop: 8, color: '#999' }}>Prueba otros filtros o <Link href="/tienda" style={{ color: 'var(--red)' }}>ver todo</Link></p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#e8e8e8', marginTop: '1px' }}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginTop: '1.5rem', flexWrap: 'wrap' as const }}>
                {page > 1 && <Link href={`/tienda?cat=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}&page=${page - 1}`} style={{ padding: '8px 14px', fontSize: 13, border: '1px solid #ddd', background: 'white', color: '#333', textDecoration: 'none' }}>â Anterior</Link>}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p2 = page <= 4 ? i + 1 : page > totalPages - 3 ? totalPages - 6 + i : page - 3 + i
                  if (p2 < 1 || p2 > totalPages) return null
                  return <Link key={p2} href={`/tienda?cat=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}&page=${p2}`} style={{ padding: '8px 14px', fontSize: 13, border: '1px solid #ddd', background: p2 === page ? 'var(--red)' : 'white', color: p2 === page ? 'white' : '#333', fontWeight: p2 === page ? 700 : 400, textDecoration: 'none' }}>{p2}</Link>
                })}
                {page < totalPages && <Link href={`/tienda?cat=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}&page=${page + 1}`} style={{ padding: '8px 14px', fontSize: 13, border: '1px solid #ddd', background: 'white', color: '#333', textDecoration: 'none' }}>Siguiente â</Link>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TiendaPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: 14, color: '#999' }}>Cargando tienda...</div></div>}>
      <TiendaContent />
    </Suspense>
  )
}
