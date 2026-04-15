'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase, Product } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

const CAT_TREE = [
  { label:'NUTRICIÓN DEPORTIVA', cats:['Proteínas','Proteína Whey','Proteína Isolatada','Proteína Vegetal','Caseínas','Ganadores de Peso','Barritas Protéicas','Bebidas Protéicas','Snacks Protéicos','Creatinas Monohidratos','Pre-entrenos','Recuperadores','BCAA','Aminoácidos','Glutaminas','Beta Alanina','L-Carnitina','Termogénicos','Carbohidratos','Avenas','Crema de Arroz','Geles Energéticos'] },
  { label:'VITAMINAS Y MINERALES', cats:['Vitaminas','Minerales','Multivitamínicos','Omega 3','Omega 3-6-9','Colágeno','Sistema Inmunológico'] },
  { label:'OBJETIVOS', cats:['Ganar Músculo','Control de Peso','Rendimiento Deportivo','Salud y Bienestar','Quemadores','Prohormonales','Tribulus','ZMA','Cafeína'] },
  { label:'CAPRICHOS FIT', cats:['Caprichos Fit','Mantequillas de Frutos Secos','Pizzas Protéicas','Salsas y Siropes','Alimentos y Snacks'] },
  { label:'SPORT WEAR', cats:['Ropa Deportiva','Camisetas','Sport Wear','StreetFlavour'] },
  { label:'ACCESORIOS', cats:['Accesorios','Shaker','Toallas','Mochilas y Bolsos'] },
  { label:'OTROS', cats:['Veganos','Packs','Bebidas','Bebidas Energéticas','Barritas Energéticas','Hidratos de Carbono','Pre-Pedidos','Ofertas','Novedades'] },
]

function TiendaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [openGroups, setOpenGroups] = useState<Set<number>>(new Set([0,1,2]))

  const cat = searchParams.get('cat') || ''
  const q = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const PER_PAGE = 24

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('products').select('*, categories(name)', {count:'exact'}).eq('active', true)
    if (cat) {
      const {data:catData} = await supabase.from('categories').select('id').eq('name', cat).single()
      if (catData) query = query.eq('category_id', catData.id)
    }
    if (q) query = query.ilike('name', `%${q}%`)
    const {data, count} = await query.order('id', {ascending:false}).range((page-1)*PER_PAGE, page*PER_PAGE-1)
    setProducts((data||[]) as Product[])
    setTotal(count||0)
    setLoading(false)
  }, [cat, q, page])

  useEffect(() => { load() }, [load])

  const toggleGroup = (i:number) => setOpenGroups(prev => { const n=new Set(prev); n.has(i)?n.delete(i):n.add(i); return n })
  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div style={{background:'var(--bg)', minHeight:'100vh'}}>
      <div className="container" style={{paddingTop:'1.5rem', paddingBottom:'3rem'}}>
        <div style={{display:'grid', gridTemplateColumns:'230px 1fr', gap:'1.5rem', alignItems:'start'}}>

          {/* SIDEBAR */}
          <aside style={{background:'var(--surface)', border:'1px solid var(--border)', position:'sticky', top:'120px'}}>
            <div style={{padding:'0.75rem', borderBottom:'1px solid var(--border)'}}>
              <form onSubmit={e => { e.preventDefault(); const val=(e.currentTarget.querySelector('input') as HTMLInputElement).value; router.push(val?`/tienda?q=${encodeURIComponent(val)}`:'/tienda') }}>
                <div style={{display:'flex', gap:4}}>
                  <input defaultValue={q} placeholder="Buscar..." style={{flex:1, padding:'7px 10px', fontSize:13, border:'1px solid var(--border)', margin:0}} name="q"/>
                  <button type="submit" className="btn-primary" style={{padding:'7px 12px', fontSize:12}}>🔍</button>
                </div>
              </form>
            </div>
            {CAT_TREE.map((group, gi) => (
              <div key={gi} style={{borderBottom:'1px solid var(--border)'}}>
                <button onClick={() => toggleGroup(gi)} style={{width:'100%', padding:'10px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text)', background:'none', cursor:'pointer', borderBottom: openGroups.has(gi)?'1px solid var(--border)':'none'}}>
                  {group.label}<span style={{fontSize:10, color:'var(--muted)'}}>{openGroups.has(gi)?'▲':'▼'}</span>
                </button>
                {openGroups.has(gi) && (
                  <div>
                    {group.cats.map(c => (
                      <Link key={c} href={`/tienda?cat=${encodeURIComponent(c)}`}
                        style={{display:'block', padding:'7px 16px', fontSize:13, color: cat===c?'var(--red)':'var(--muted)', fontWeight: cat===c?700:400, borderLeft: cat===c?'3px solid var(--red)':'3px solid transparent', transition:'all 0.12s', background: cat===c?'rgba(255,30,65,0.04)':'transparent'}}>
                        {c}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/tienda" style={{display:'block', padding:'10px 12px', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', color:'var(--red)', textAlign:'center'}}>Ver todos los productos</Link>
          </aside>

          {/* MAIN */}
          <div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:8}}>
              <div>
                <h1 style={{fontSize:22, fontWeight:800, textTransform:'uppercase', margin:0}}>{cat || (q ? `Resultados: "${q}"` : 'Todo el catálogo')}</h1>
                <p style={{fontSize:13, color:'var(--muted)', margin:'2px 0 0'}}>{loading?'Cargando...':`${total} productos`}</p>
              </div>
              {(cat||q) && <Link href="/tienda" style={{fontSize:12, color:'var(--muted)'}}>✕ Quitar filtro</Link>}
            </div>

            {!cat && !q && (
              <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1rem'}}>
                {['Proteínas','Creatinas Monohidratos','Pre-entrenos','BCAA','Vitaminas','Quemadores','Snacks Protéicos','Veganos','StreetFlavour'].map(c => (
                  <Link key={c} href={`/tienda?cat=${encodeURIComponent(c)}`} className="filter-btn">{c}</Link>
                ))}
              </div>
            )}

            {loading ? (
              <div className="products-grid">{Array.from({length:12}).map((_,i) => <div key={i} className="skeleton" style={{height:280}}/>)}</div>
            ) : products.length === 0 ? (
              <div style={{textAlign:'center', padding:'4rem 2rem', color:'var(--muted)'}}>
                <div style={{fontSize:48, marginBottom:'1rem'}}>🔍</div>
                <p style={{fontWeight:700, fontSize:18}}>No se encontraron productos</p>
                <p style={{marginTop:8}}>Prueba otros filtros o <Link href="/tienda" style={{color:'var(--red)'}}>ver todo</Link></p>
              </div>
            ) : (
              <div className="products-grid">{products.map(p => <ProductCard key={p.id} product={p}/>)}</div>
            )}

            {totalPages > 1 && (
              <div style={{display:'flex', justifyContent:'center', gap:'0.5rem', marginTop:'2rem', flexWrap:'wrap'}}>
                {page > 1 && <Link href={`/tienda?cat=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}&page=${page-1}`} className="btn-outline" style={{padding:'8px 16px', fontSize:13}}>← Anterior</Link>}
                {Array.from({length: Math.min(totalPages, 7)}, (_,i) => {
                  const p2 = page <= 4 ? i+1 : page > totalPages-3 ? totalPages-6+i : page-3+i
                  if(p2 < 1 || p2 > totalPages) return null
                  return <Link key={p2} href={`/tienda?cat=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}&page=${p2}`} style={{padding:'8px 14px', fontSize:13, fontWeight:p2===page?700:400, background:p2===page?'var(--red)':'var(--surface)', color:p2===page?'white':'var(--text)', border:'1px solid var(--border)'}}>{p2}</Link>
                })}
                {page < totalPages && <Link href={`/tienda?cat=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}&page=${page+1}`} className="btn-outline" style={{padding:'8px 16px', fontSize:13}}>Siguiente →</Link>}
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
    <Suspense fallback={<div style={{minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center'}}><div style={{fontSize:14, color:'var(--muted)'}}>Cargando tienda...</div></div>}>
      <TiendaContent />
    </Suspense>
  )
          }
