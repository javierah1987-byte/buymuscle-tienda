import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import HeroSlider from '@/components/HeroSlider'

const BG_VIDEO_3 = 'https://tienda.buymuscle.es/img/cms/bg-video-BM-3.mp4'

async function getProducts(cat?: string, limit = 8) {
  let q = supabase.from('products').select('*, categories(name)').eq('active', true).gt('stock', 0)
  if (cat) {
    const { data: cd } = await supabase.from('categories').select('id').eq('name', cat).single()
    if (cd) q = q.eq('category_id', cd.id)
  }
  const { data } = await q.order('id', { ascending: false }).limit(limit)
  return data || []
}

const QUICK_CATS = [
  { name:'Proteínas',    icon:'🥛', slug:'Proteínas' },
  { name:'Creatinas',   icon:'⚡', slug:'Creatinas Monohidratos' },
  { name:'Pre-entrenos',icon:'🔥', slug:'Pre-entrenos' },
  { name:'BCAA',        icon:'💪', slug:'BCAA' },
  { name:'Vitaminas',   icon:'💊', slug:'Vitaminas' },
  { name:'Quemadores',  icon:'🎯', slug:'Quemadores' },
  { name:'Sport Wear',  icon:'👕', slug:'Sport Wear' },
  { name:'Veganos',     icon:'🌱', slug:'Veganos' },
  { name:'Snacks',      icon:'🍫', slug:'Snacks Protéicos' },
  { name:'Gainers',     icon:'💥', slug:'Ganadores de Peso' },
]

export default async function Home() {
  const [novedades, proteinas, preEntrenos] = await Promise.all([
    getProducts(undefined, 8),
    getProducts('Proteínas', 4),
    getProducts('Pre-entrenos', 4),
  ])

  return (
    <div style={{ background:'#f5f5f5' }}>

      {/* HERO SLIDER con vídeo de fondo bg-video-BM-2.mp4 */}
      <HeroSlider />

      {/* BARRA DE CATEGORÍAS */}
      <section style={{ background:'white', borderBottom:'1px solid #ebebeb', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px' }}>
          <div style={{ display:'flex', overflowX:'auto' }}>
            {QUICK_CATS.map(cat => (
              <Link key={cat.name} href={`/tienda?cat=${encodeURIComponent(cat.slug)}`}
                className="cat-bar-link">
                <span style={{ fontSize:22 }}>{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BUYMUSCLE / Nutrición deportiva + Novedades */}
      <section style={{ background:'white', padding:'2.5rem 0 3rem', borderBottom:'1px solid #ebebeb' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'2.5rem', alignItems:'start' }}>
            <div style={{ paddingRight:'2rem', borderRight:'1px solid #ebebeb' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'0.4rem' }}>BUYMUSCLE</div>
              <h2 style={{ fontSize:26, fontWeight:900, textTransform:'uppercase', color:'#111', lineHeight:1.1, marginBottom:'1rem' }}>
                Nutrición<br/>deportiva
              </h2>
              <p style={{ fontSize:13, color:'#777', lineHeight:1.8, marginBottom:'1.5rem' }}>
                Compra suplementos deportivos en Canarias con BuyMuscle. Proteínas, creatina, aminoácidos y pre-entrenos de marcas líderes como IO.Genix, GN Nutrition y más.
              </p>
              <Link href="/tienda" style={{ fontSize:13, fontWeight:700, color:'var(--red)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                Ver todo el catálogo →
              </Link>
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', borderBottom:'2px solid #f0f0f0', paddingBottom:'0.75rem' }}>
                <div style={{ fontSize:17, fontWeight:800, textTransform:'uppercase', color:'#111', letterSpacing:'0.02em' }}>NOVEDADES</div>
                <Link href="/tienda" style={{ fontSize:12, color:'var(--red)', fontWeight:700, textDecoration:'none', border:'1px solid var(--red)', padding:'5px 14px' }}>Ver todo →</Link>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'#ebebeb' }}>
                {novedades.slice(0,4).map((p:any) => <ProductCard key={p.id} product={p}/>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DISTRIBUIDORES — con vídeo bg-video-BM-3.mp4 de fondo, igual que el original */}
      <section style={{ position:'relative', padding:'3.5rem 0', overflow:'hidden', borderTop:'3px solid var(--red)' }}>
        {/* Vídeo de fondo */}
        <video autoPlay muted loop playsInline
          style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
            minWidth:'100%', minHeight:'100%', width:'auto', height:'auto',
            objectFit:'cover', zIndex:0, opacity:0.5, filter:'brightness(0.5) saturate(1.1)' }}>
          <source src={BG_VIDEO_3} type="video/mp4"/>
        </video>
        {/* Overlay oscuro */}
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1 }}/>
        {/* Contenido */}
        <div style={{ position:'relative', zIndex:2, maxWidth:1280, margin:'0 auto', padding:'0 20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'3rem', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:'0.6rem' }}>PROGRAMA EXCLUSIVO</div>
              <h3 style={{ fontSize:'clamp(24px,3.5vw,42px)', fontWeight:900, textTransform:'uppercase', color:'white', lineHeight:1.05, marginBottom:'1.25rem' }}>
                PORTAL DE <span style={{ color:'var(--red)' }}>DISTRIBUIDORES</span>
              </h3>
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:14, lineHeight:1.7, maxWidth:480, marginBottom:'1.5rem' }}>
                Accede a descuentos exclusivos de hasta un 20% en todos nuestros productos. Elige tu nivel y empieza a ahorrar.
              </p>
              <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                {[['🥉 Bronze','-10%','#cd7f32'],['🥈 Silver','-15%','#a8a9ad'],['🥇 Gold','-20%','#ffd700']].map(([n,d,c])=>(
                  <div key={n} style={{ background:'rgba(255,255,255,0.06)', border:`1px solid ${c}50`, padding:'10px 20px', textAlign:'center', backdropFilter:'blur(4px)' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:c as string, textTransform:'uppercase', letterSpacing:'0.06em' }}>{n}</div>
                    <div style={{ fontSize:22, fontWeight:900, color:'white', lineHeight:1 }}>{d}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:2 }}>descuento</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', minWidth:200 }}>
              <Link href="/distribuidores/login"
                style={{ background:'var(--red)', color:'white', padding:'14px 28px',
                  fontFamily:'var(--font-body)', fontSize:14, fontWeight:700, textDecoration:'none',
                  textTransform:'uppercase', textAlign:'center', letterSpacing:'0.04em',
                  transition:'background 0.15s, transform 0.1s', display:'block' }}>
                Acceder al portal
              </Link>
              <Link href="/distribuidores"
                style={{ background:'transparent', color:'rgba(255,255,255,0.6)', padding:'12px 24px',
                  fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, textDecoration:'none',
                  border:'1px solid rgba(255,255,255,0.2)', textTransform:'uppercase', textAlign:'center', display:'block' }}>
                Más información
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROTEÍNAS */}
      {proteinas.length > 0 && (
        <section style={{ padding:'2.5rem 0', background:'#f5f5f5' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', borderBottom:'2px solid #e0e0e0', paddingBottom:'0.75rem' }}>
              <h2 style={{ fontSize:17, fontWeight:800, textTransform:'uppercase', color:'#111', margin:0 }}>PROTEÍNAS</h2>
              <Link href="/tienda?cat=Proteínas" style={{ fontSize:12, color:'var(--red)', fontWeight:700, textDecoration:'none', border:'1px solid var(--red)', padding:'5px 14px' }}>Ver todas →</Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'#e0e0e0' }}>
              {proteinas.map((p:any) => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        </section>
      )}

      {/* PRE-ENTRENOS */}
      {preEntrenos.length > 0 && (
        <section style={{ padding:'2.5rem 0', background:'white', borderTop:'1px solid #ebebeb' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', borderBottom:'2px solid #f0f0f0', paddingBottom:'0.75rem' }}>
              <h2 style={{ fontSize:17, fontWeight:800, textTransform:'uppercase', color:'#111', margin:0 }}>PRE-ENTRENOS</h2>
              <Link href="/tienda?cat=Pre-entrenos" style={{ fontSize:12, color:'var(--red)', fontWeight:700, textDecoration:'none', border:'1px solid var(--red)', padding:'5px 14px' }}>Ver todos →</Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'#e0e0e0' }}>
              {preEntrenos.map((p:any) => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
