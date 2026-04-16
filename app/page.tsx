import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import HeroSlider from '@/components/HeroSlider'

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
  { name:'Proteínas',     icon:'🥛', slug:'Proteínas' },
  { name:'Creatinas',    icon:'⚡', slug:'Creatinas Monohidratos' },
  { name:'Pre-entrenos', icon:'🔥', slug:'Pre-entrenos' },
  { name:'BCAA',         icon:'💪', slug:'BCAA' },
  { name:'Vitaminas',    icon:'💊', slug:'Vitaminas' },
  { name:'Quemadores',   icon:'🎯', slug:'Quemadores' },
  { name:'Sport Wear',   icon:'👕', slug:'Sport Wear' },
  { name:'Veganos',      icon:'🌱', slug:'Veganos' },
  { name:'Snacks',       icon:'🍫', slug:'Snacks Protéicos' },
  { name:'Gainers',      icon:'💥', slug:'Ganadores de Peso' },
]

export default async function Home() {
  const [novedades, proteinas, preEntrenos] = await Promise.all([
    getProducts(undefined, 8),
    getProducts('Proteínas', 4),
    getProducts('Pre-entrenos', 4),
  ])

  return (
    <div style={{ background:'#f5f5f5' }}>

      {/* SLIDER con imágenes reales de tienda.buymuscle.es */}
      <HeroSlider />

      {/* Categorías rápidas */}
      <section style={{ background:'white', borderBottom:'1px solid #ebebeb' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px' }}>
          <div style={{ display:'flex', overflowX:'auto' }}>
            {QUICK_CATS.map(cat => (
              <Link key={cat.name} href={`/tienda?cat=${encodeURIComponent(cat.slug)}`}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                  padding:'14px 20px', fontSize:11, fontWeight:700, color:'#444',
                  textTransform:'uppercase', letterSpacing:'0.05em', textDecoration:'none',
                  borderRight:'1px solid #f0f0f0', whiteSpace:'nowrap', flexShrink:0 }}>
                <span style={{ fontSize:22 }}>{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BUYMUSCLE / Nutrición deportiva + Novedades */}
      <section style={{ background:'white', padding:'2rem 0 2.5rem', borderBottom:'1px solid #ebebeb' }}>
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
              <Link href="/tienda" style={{ fontSize:13, fontWeight:700, color:'var(--red)', textDecoration:'none' }}>
                Ver todo el catálogo →
              </Link>
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', borderBottom:'2px solid #f0f0f0', paddingBottom:'0.75rem' }}>
                <div style={{ fontSize:17, fontWeight:800, textTransform:'uppercase', color:'#111' }}>NOVEDADES</div>
                <Link href="/tienda" style={{ fontSize:12, color:'var(--red)', fontWeight:700, textDecoration:'none', border:'1px solid var(--red)', padding:'5px 14px' }}>Ver todo →</Link>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'#ebebeb' }}>
                {novedades.slice(0,4).map((p:any) => <ProductCard key={p.id} product={p}/>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Distribuidores */}
      <section style={{ background:'#111', padding:'2.5rem 0', borderTop:'3px solid var(--red)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'3rem', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'0.5rem' }}>PROGRAMA EXCLUSIVO</div>
              <h3 style={{ fontSize:'clamp(22px,3vw,36px)', fontWeight:900, textTransform:'uppercase', color:'white', lineHeight:1.1, marginBottom:'1rem' }}>
                PORTAL DE <span style={{ color:'var(--red)' }}>DISTRIBUIDORES</span>
              </h3>
              <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                {[['🥉 Bronze','-10%','#cd7f32'],['🥈 Silver','-15%','#a8a9ad'],['🥇 Gold','-20%','#ffd700']].map(([n,d,c])=>(
                  <div key={n} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${c}35`, padding:'8px 18px', textAlign:'center' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:c as string }}>{n}</div>
                    <div style={{ fontSize:18, fontWeight:900, color:'white' }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', minWidth:190 }}>
              <Link href="/distribuidores/login" style={{ background:'var(--red)', color:'white', padding:'13px 24px', fontFamily:'var(--font-body)', fontSize:13, fontWeight:700, textDecoration:'none', textTransform:'uppercase', textAlign:'center', letterSpacing:'0.04em' }}>
                Acceder al portal
              </Link>
              <Link href="/distribuidores" style={{ background:'transparent', color:'rgba(255,255,255,0.5)', padding:'11px 20px', fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, textDecoration:'none', border:'1px solid rgba(255,255,255,0.15)', textTransform:'uppercase', textAlign:'center' }}>
                Más información
              </Link>
            </div>
          </div>
        </div>
      </section>

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
