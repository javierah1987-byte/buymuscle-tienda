// @ts-nocheck
'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://awwlbepjxuoxaigztugh.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo')
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

const PER_PAGE = 24

const CAT_GROUPS = [
  { label:'Nutricion Deportiva', cats:['Proteinas','Proteina Whey','Proteina Isolatada','Proteina Vegetal','Caseinas','Ganadores de Peso','Barritas Proteicas','Snacks Proteicos','Creatinas Monohidratos','Pre-entrenos','Recuperadores','BCAA','Aminoacidos','Glutaminas','L-Carnitina','Termogenicos'] },
  { label:'Vitaminas y Salud', cats:['Vitaminas','Minerales','Omega 3','Colageno','Sistema Inmunologico'] },
  { label:'Objetivos', cats:['Ganar Musculo','Control de Peso','Quemadores','Rendimiento Deportivo'] },
  { label:'Caprichos Fit', cats:['Alimentos y Snacks','Caprichos Fit','Salsas y Siropes'] },
  { label:'Sport Wear', cats:['Sport Wear','Camisetas','StreetFlavour'] },
  { label:'Otros', cats:['Veganos','Packs','Bebidas','Accesorios'] },
]

const SABORES = ['Chocolate','Vainilla','Fresa','Cookies & Cream','Neutro','Caramelo Salado','Black Cookies','Pistacho','Limon','Platano']

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{borderBottom:'1px solid #e8e8e8'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:'100%',padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'none',border:'none',cursor:'pointer',fontSize:11,fontWeight:800,color:'#222',textTransform:'uppercase',letterSpacing:'0.07em',fontFamily:'var(--font-body)'}}>
        {title}<span style={{fontSize:14,color:'#aaa'}}>{open?'▾':'▸'}</span>
      </button>
      {open && <div style={{padding:'0 14px 12px'}}>{children}</div>}
    </div>
  )
}

function TiendaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const catParam = searchParams.get('cat') || ''
  const pageParam = parseInt(searchParams.get('page') || '1')
  const q = searchParams.get('q') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [brands, setBrands] = useState<string[]>([])
  const [filtroMarcas, setFiltroMarcas] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(200)
  const [search, setSearch] = useState(q)
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(()=>{
    supabase.from('products').select('brand').eq('active',true).not('brand','is',null)
      .then(({data})=>{
        const seen: Record<string,boolean> = {}
        const unique: string[] = []
        ;(data||[]).forEach((p:any)=>{ if(p.brand && !seen[p.brand]){ seen[p.brand]=true; unique.push(p.brand) } })
        setBrands(unique.sort())
      })
  },[])

  const fetchProducts = useCallback(async ()=>{
    setLoading(true)
    let query = supabase.from('products').select('*, categories(name)',{count:'exact'}).eq('active',true).gt('stock',0)
    if(catParam){
      const {data:cd} = await supabase.from('categories').select('id').eq('name',catParam).single()
      if(cd) query = query.eq('category_id',cd.id)
    }
    if(filtroMarcas.length>0) query = query.in('brand',filtroMarcas)
    if(maxPrice<200) query = query.lte('price_incl_tax',maxPrice)
    if(search) query = query.ilike('name',`%${search}%`)
    if(sortBy==='newest') query = query.order('id',{ascending:false})
    else if(sortBy==='price_asc') query = query.order('price_incl_tax',{ascending:true})
    else if(sortBy==='price_desc') query = query.order('price_incl_tax',{ascending:false})
    else query = query.order('name',{ascending:true})
    const from=(pageParam-1)*PER_PAGE
    const {data,count} = await query.range(from,from+PER_PAGE-1)
    setProducts(data||[])
    setTotal(count||0)
    setLoading(false)
  },[catParam,filtroMarcas,maxPrice,search,sortBy,pageParam])

  useEffect(()=>{fetchProducts()},[fetchProducts])

  const totalPages = Math.ceil(total/PER_PAGE)
  const updateUrl = (params)=>{
    const p = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([k,v])=>v?p.set(k,v):p.delete(k))
    p.delete('page')
    router.push('/tienda?'+p.toString())
  }

  return (
    <div style={{maxWidth:1280,margin:'0 auto',padding:'1.25rem 20px 3rem'}}>
      <div style={{fontSize:12,color:'#999',marginBottom:'1rem',display:'flex',gap:6,alignItems:'center'}}>
        <Link href="/" style={{color:'#999',textDecoration:'none'}}>Inicio</Link><span>›</span>
        {catParam ? (
          <><Link href="/tienda" style={{color:'#999',textDecoration:'none'}}>Tienda</Link><span>›</span><span style={{color:'#333',fontWeight:600}}>{catParam}</span></>
        ) : <span style={{color:'#333',fontWeight:600}}>Tienda</span>}
      </div>

      <div>
        {/* t6 BOTÓN FILTRAR MÓVIL */}
        <button onClick={()=>setShowFilters(f=>!f)} style={{display:'none',width:'100%',padding:'10px',background:'white',border:'1px solid #e8e8e8',borderRadius:4,fontWeight:700,fontSize:13,cursor:'pointer',marginBottom:12,textAlign:'left'}} className="btn-filter-mobile">
          {showFilters?'✕ Cerrar filtros':'☰ Filtrar por categoría'}
        </button>
        <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:'1.25rem',alignItems:'start'}} className="tienda-grid">
        {/* SIDEBAR */}
        <aside style={{background:'white',border:'1px solid #e8e8e8',position:'sticky',top:0}} className={showFilters?'sidebar-visible':''} id="tienda-sidebar">
          {CAT_GROUPS.map(group=>(
            <SidebarSection key={group.label} title={group.label}>
              {group.cats.map(cat=>(
                <Link key={cat} href={`/tienda?cat=${encodeURIComponent(cat)}`}
                  style={{display:'block',padding:'5px 0',fontSize:13,color:catParam===cat?'var(--red)':'#555',fontWeight:catParam===cat?700:400,textDecoration:'none'}}>
                  {cat}
                </Link>
              ))}
            </SidebarSection>
          ))}
          {brands.length>0 && (
            <SidebarSection title="Marca">
              <div style={{maxHeight:200,overflowY:'auto'}}>
                {brands.map(m=>(
                  <label key={m} style={{display:'flex',alignItems:'center',gap:8,padding:'3px 0',cursor:'pointer',fontSize:13,color:'#555'}}>
                    <input type="checkbox" checked={filtroMarcas.includes(m)} onChange={()=>setFiltroMarcas(prev=>prev.includes(m)?prev.filter(x=>x!==m):[...prev,m])} style={{width:'auto',accentColor:'var(--red)'}}/>
                    {m}
                  </label>
                ))}
              </div>
            </SidebarSection>
          )}
          <SidebarSection title="Precio max.">
            <input type="range" min={0} max={200} value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))} style={{width:'100%',accentColor:'var(--red)',border:'none',padding:0}}/>
            <div style={{fontSize:12,color:'#888',marginTop:4}}>Hasta {maxPrice} €</div>
          </SidebarSection>
          {(catParam||filtroMarcas.length>0||maxPrice<200)&&(
            <div style={{padding:'12px 14px'}}>
              <button onClick={()=>{setFiltroMarcas([]);setMaxPrice(200);router.push('/tienda')}}
                style={{width:'100%',padding:'8px',background:'#f5f5f5',border:'1px solid #ddd',fontSize:12,cursor:'pointer',fontFamily:'var(--font-body)',color:'#555'}}>
                Limpiar filtros
              </button>
            </div>
          )}
        </aside>

        {/* GRID */}
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',background:'white',padding:'12px 16px',border:'1px solid #e8e8e8'}}>
            <div>
              <h1 style={{fontSize:18,fontWeight:800,textTransform:'uppercase',color:'#111',margin:0}}>{catParam||'TODO EL CATALOGO'}</h1>
              <div style={{fontSize:12,color:'#999',marginTop:2}}>{loading?'Cargando...':total+' productos'}</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <div style={{display:'flex'}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')updateUrl({q:search})}} placeholder="Buscar..." style={{padding:'7px 10px',fontSize:13,border:'1px solid #ddd',borderRight:'none',width:160,fontFamily:'var(--font-body)'}}/>
                <button onClick={()=>updateUrl({q:search})} style={{background:'var(--red)',color:'white',border:'none',padding:'7px 12px',cursor:'pointer',fontSize:13}}>🔍</button>
              </div>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:'7px 10px',fontSize:12,border:'1px solid #ddd',background:'white',fontFamily:'var(--font-body)',cursor:'pointer'}}>
                <option value="newest">Mas recientes</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="name">Nombre A-Z</option>
              </select>
            </div>
          </div>

          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:'1rem'}}>
            {['Proteinas','Creatinas Monohidratos','Pre-entrenos','BCAA','Vitaminas','Quemadores','Snacks Proteicos','Veganos'].map(cat=>(
              <Link key={cat} href={`/tienda?cat=${encodeURIComponent(cat)}`}
                style={{padding:'5px 12px',fontSize:12,border:'1px solid',borderColor:catParam===cat?'var(--red)':'#ddd',background:catParam===cat?'var(--red)':'white',color:catParam===cat?'white':'#555',textDecoration:'none',fontWeight:catParam===cat?700:400}}>
                {cat}
              </Link>
            ))}
          </div>

          {loading ? (
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',background:'#e8e8e8'}}>
              {Array.from({length:8}).map((_,i)=><div key={i} style={{background:'white',height:320}}/>)}
            </div>
          ) : products.length===0 ? (
            <div style={{background:'white',padding:'3rem',textAlign:'center',border:'1px solid #e8e8e8'}}>
              <div style={{fontSize:40,marginBottom:'1rem'}}>🔍</div>
              <h3 style={{fontWeight:700,marginBottom:'0.5rem'}}>Sin resultados</h3>
              <button onClick={()=>{setFiltroMarcas([]);setMaxPrice(200);router.push('/tienda')}} style={{background:'var(--red)',color:'white',border:'none',padding:'10px 24px',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:13,fontWeight:700,textTransform:'uppercase'}}>
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',background:'#e8e8e8'}}>
              {products.map(p=><ProductCard key={p.id} product={p}/>)}
            </div>
          )}

          {totalPages>1 && (
            <div style={{display:'flex',justifyContent:'center',gap:4,marginTop:'1.5rem',flexWrap:'wrap'}}>
              {pageParam>1 && <Link href={`/tienda?${new URLSearchParams({...Object.fromEntries(searchParams),page:String(pageParam-1)})}`} style={{padding:'8px 14px',border:'1px solid #ddd',background:'white',color:'#333',textDecoration:'none',fontSize:13}}>← Anterior</Link>}
              {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p=>(
                <Link key={p} href={`/tienda?${new URLSearchParams({...Object.fromEntries(searchParams),page:String(p)})}`}
                  style={{padding:'8px 14px',border:'1px solid',borderColor:p===pageParam?'var(--red)':'#ddd',background:p===pageParam?'var(--red)':'white',color:p===pageParam?'white':'#333',textDecoration:'none',fontSize:13,fontWeight:p===pageParam?700:400}}>
                  {p}
                </Link>
              ))}
              {pageParam<totalPages && <Link href={`/tienda?${new URLSearchParams({...Object.fromEntries(searchParams),page:String(pageParam+1)})}`} style={{padding:'8px 14px',border:'1px solid #ddd',background:'white',color:'#333',textDecoration:'none',fontSize:13}}>Siguiente →</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TiendaPage() {
  return (
    <Suspense fallback={<div style={{padding:'2rem',textAlign:'center'}}>Cargando...</div>}>
      <TiendaContent/>
    </Suspense>
  )
}
