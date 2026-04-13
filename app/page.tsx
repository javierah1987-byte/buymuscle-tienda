import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

async function getFeatured() {
  const { data } = await supabase.from('products').select('*, categories(name)').eq('active',true).gt('stock',0).order('id',{ascending:false}).limit(8)
  return data || []
}
async function getByCategory(cat:string,limit=4) {
  const{data:catData}=await supabase.from('categories').select('id').eq('name',cat).single()
  if(!catData)return[]
  const{data}=await supabase.from('products').select('*, categories(name)').eq('active',true).eq('category_id',catData.id).gt('stock',0).limit(limit)
  return data||[]
}

const CATS=[
  {name:'Proteínas',emoji:'🥛'},{name:'Creatinas Monohidratos',emoji:'⚡'},
  {name:'Pre-entrenos',emoji:'🔥'},{name:'Vitaminas',emoji:'💊'},
  {name:'BCAA',emoji:'💪'},{name:'Quemadores',emoji:'🎯'},
  {name:'Snacks Protéicos',emoji:'🍫'},{name:'Accesorios',emoji:'🎒'},
]

export default async function Home() {
  const [featured,proteinas,creatinas]=await Promise.all([
    getFeatured(),getByCategory('Proteínas',4),getByCategory('Creatinas Monohidratos',4),
  ])
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container"><div className="hero-content" style={{maxWidth:680}}>
          <div className="hero-eyebrow">Nutrición deportiva · Sevilla</div>
          <h1 className="hero-title">SUPLEMENTACIÓN<br/>DE <span className="accent">ÉLITE</span></h1>
          <p className="hero-subtitle">Más de 300 productos de las mejores marcas mundiales. Proteínas, creatinas, pre-entrenos y mucho más.</p>
          <div className="hero-actions">
            <Link href="/tienda" className="btn-primary" style={{fontSize:15,padding:'13px 32px'}}>Ver catálogo completo</Link>
            <Link href="/distribuidores" className="btn-outline" style={{fontSize:15,padding:'11px 28px'}}>Portal distribuidores</Link>
          </div>
          <div className="hero-stats">
            <div><div className="stat-n">300+</div><div className="stat-l">Productos</div></div>
            <div><div className="stat-n">62</div><div className="stat-l">Categorías</div></div>
            <div><div className="stat-n">24h</div><div className="stat-l">Envío</div></div>
            <div><div className="stat-n">100%</div><div className="stat-l">Originales</div></div>
          </div>
        </div></div>
      </section>

      {/* CATEGORÍAS */}
      <section style={{background:'var(--black)',padding:'1.5rem 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="container">
          <div style={{display:'flex',gap:'0.75rem',overflowX:'auto',scrollbarWidth:'none'}}>
            {CATS.map(c=>(
              <Link key={c.name} href={`/tienda?cat=${encodeURIComponent(c.name)}`} className="cat-pill">
                <span style={{fontSize:18}}>{c.emoji}</span> {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NOVEDADES */}
      <section style={{padding:'3rem 0',background:'var(--bg)'}}>
        <div className="container">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--red)',marginBottom:4}}>BUYMUSCLE</div>
              <h2 className="section-title">NOVEDADES</h2>
            </div>
            <Link href="/tienda" className="btn-outline" style={{fontSize:12,padding:'8px 18px'}}>Ver todo →</Link>
          </div>
          <div className="products-grid">{featured.map((p:any)=><ProductCard key={p.id} product={p}/>)}</div>
        </div>
      </section>

      {/* PROTEÍNAS */}
      {proteinas.length>0&&(
        <section style={{padding:'3rem 0',background:'var(--surface)'}}>
          <div className="container">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--red)',marginBottom:4}}>CATEGORÍA</div>
                <h2 className="section-title">PROTEÍNAS</h2>
              </div>
              <Link href="/tienda?cat=Proteínas" className="btn-outline" style={{fontSize:12,padding:'8px 18px'}}>Ver todas →</Link>
            </div>
            <div className="products-grid">{proteinas.map((p:any)=><ProductCard key={p.id} product={p}/>)}</div>
          </div>
        </section>
      )}

      {/* CREATINAS */}
      {creatinas.length>0&&(
        <section style={{padding:'3rem 0',background:'var(--bg)'}}>
          <div className="container">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--red)',marginBottom:4}}>CATEGORÍA</div>
                <h2 className="section-title">CREATINAS</h2>
              </div>
              <Link href="/tienda?cat=Creatinas Monohidratos" className="btn-outline" style={{fontSize:12,padding:'8px 18px'}}>Ver todas →</Link>
            </div>
            <div className="products-grid">{creatinas.map((p:any)=><ProductCard key={p.id} product={p}/>)}</div>
          </div>
        </section>
      )}

      {/* DISTRIBUIDORES */}
      <section style={{padding:'4rem 0',background:'var(--black)'}}>
        <div className="container">
          <div className="dist-banner">
            <div>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--red)',marginBottom:'0.75rem'}}>PROGRAMA</div>
              <h3 style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:900,textTransform:'uppercase',color:'white',marginBottom:'0.75rem',lineHeight:1.1}}>
                PORTAL DE <span style={{color:'var(--red)'}}>DISTRIBUIDORES</span>
              </h3>
              <p style={{color:'rgba(255,255,255,0.5)',maxWidth:480,lineHeight:1.6,fontSize:14}}>Accede con tus credenciales para ver precios exclusivos según tu nivel. Hasta un 20% de descuento.</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <Link href="/distribuidores/login" className="btn-primary" style={{fontSize:14,padding:'13px 28px',justifyContent:'center'}}>Acceder al portal</Link>
              <Link href="/distribuidores" className="btn-outline" style={{fontSize:13,padding:'10px 24px',justifyContent:'center'}}>Más información</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
      }
