import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

async function getFeatured() {
  const { data } = await supabase.from('products').select('*, categories(name)').eq('active',true).gt('stock',0).order('id',{ascending:false}).limit(8)
  return data || []
}
const CATS = [
  {name:'Proteínas',emoji:'🥛',desc:'Whey, Isolate, Caseína'},
  {name:'Creatinas Monohidratos',emoji:'⚡',desc:'Monohidrato, Creapure®'},
  {name:'Pre-entrenos',emoji:'🔥',desc:'Energía y potencia'},
  {name:'Vitaminas',emoji:'💊',desc:'Salud y bienestar'},
  {name:'BCAA',emoji:'💪',desc:'Aminoácidos ramificados'},
  {name:'Quemadores',emoji:'🎯',desc:'Control de peso'},
]
export default async function Home() {
  const featured = await getFeatured()
  return (
    <>
      <section className="hero">
        <div className="container"><div className="hero-content">
          <div className="hero-eyebrow">Suplementación Profesional · Sevilla</div>
          <h1 className="hero-title">LLEVA TU<br/>ENTRENAMIENTO<br/>AL <span className="accent">LÍMITE</span></h1>
          <p className="hero-subtitle">Suplementación deportiva de calidad profesional. Más de 300 productos para particulares y distribuidores.</p>
          <div className="hero-actions">
            <Link href="/tienda" className="btn-primary">Ver catálogo</Link>
            <Link href="/distribuidores" className="btn-outline">Portal distribuidores</Link>
          </div>
          <div className="hero-stats">
            <div><div className="stat-n">300+</div><div className="stat-l">Productos</div></div>
            <div><div className="stat-n">62</div><div className="stat-l">Categorías</div></div>
            <div><div className="stat-n">24h</div><div className="stat-l">Envío</div></div>
          </div>
        </div></div>
      </section>
      <section style={{padding:'5rem 0'}}>
        <div className="container">
          <h2 className="section-title">CATEGORÍAS <span>TOP</span></h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',gap:'1rem',marginTop:'2rem'}}>
            {CATS.map(c=>(
              <Link key={c.name} href={`/tienda?cat=${encodeURIComponent(c.name)}`} className="card" style={{padding:'1.5rem',textAlign:'center',display:'block'}}>
                <div style={{fontSize:'36px',marginBottom:'12px'}}>{c.emoji}</div>
                <div style={{fontFamily:'var(--font-display)',fontSize:'17px',fontWeight:700,textTransform:'uppercase',marginBottom:'4px'}}>{c.name}</div>
                <div style={{fontSize:'13px',color:'var(--muted)'}}>{c.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section style={{padding:'0 0 5rem'}}>
        <div className="container">
          <h2 className="section-title">ÚLTIMAS <span>NOVEDADES</span></h2>
          <div className="products-grid" style={{marginTop:'2rem'}}>{featured.map((p:any)=><ProductCard key={p.id} product={p}/>)}</div>
        </div>
      </section>
      <section style={{padding:'0 0 5rem'}}>
        <div className="container">
          <div className="dist-banner">
            <div>
              <h3 className="section-title" style={{fontSize:'36px',marginBottom:'0.75rem'}}>PORTAL DE <span>DISTRIBUIDORES</span></h3>
              <p style={{color:'var(--muted)',maxWidth:'480px'}}>Accede con tus credenciales para ver precios exclusivos. Hasta un 20% de descuento.</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <Link href="/distribuidores/login" className="btn-primary">Acceder como distribuidor</Link>
              <Link href="/distribuidores" className="btn-outline" style={{textAlign:'center'}}>Más información</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
