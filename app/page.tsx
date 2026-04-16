import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

async function getProducts(cat?: string, limit = 8) {
  let q = supabase.from('products').select('*, categories(name)').eq('active', true).gt('stock', 0)
  if (cat) {
    const { data: catData } = await supabase.from('categories').select('id').eq('name', cat).single()
    if (catData) q = q.eq('category_id', catData.id)
  }
  const { data } = await q.order('id', { ascending: false }).limit(limit)
  return data || []
}

const QUICK_CATS = [
  { name:'Proteínas', icon:'🥛', slug:'Proteínas' },
  { name:'Creatinas', icon:'⚡', slug:'Creatinas Monohidratos' },
  { name:'Pre-entrenos', icon:'🔥', slug:'Pre-entrenos' },
  { name:'BCAA', icon:'💪', slug:'BCAA' },
  { name:'Vitaminas', icon:'💊', slug:'Vitaminas' },
  { name:'Quemadores', icon:'🎯', slug:'Quemadores' },
  { name:'Sport Wear', icon:'👕', slug:'Sport Wear' },
  { name:'Veganos', icon:'🌱', slug:'Veganos' },
  { name:'Snacks', icon:'🍫', slug:'Snacks Protéicos' },
  { name:'Gainers', icon:'💥', slug:'Ganadores de Peso' },
]

export default async function Home() {
  const [novedades, proteinas, preEntrenos] = await Promise.all([
    getProducts(undefined, 8),
    getProducts('Proteínas', 4),
    getProducts('Pre-entrenos', 4),
  ])

  return (
    <div style={{ background: '#f5f5f5' }}>

      {/* ══ HERO — doble columna exacta al original ══ */}
      <section style={{ background: '#000' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', minHeight: 380 }}>

            {/* Banner principal */}
            <div style={{ background: 'linear-gradient(135deg, #050505 0%, #180303 100%)', padding: '2.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(255,30,65,0.12) 0%, transparent 70%)', pointerEvents:'none' }}/>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'0.6rem' }}>Nuevos sabores disponibles</div>
              <h1 style={{ fontSize:'clamp(30px,4vw,52px)', fontWeight:900, color:'white', textTransform:'uppercase', lineHeight:1.05, marginBottom:'1rem' }}>
                SUPLEMENTACIÓN<br/>DE <span style={{ color:'var(--red)' }}>ÉLITE</span>
              </h1>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, lineHeight:1.7, maxWidth:400, marginBottom:'1.5rem' }}>
                Más de 300 productos de las mejores marcas mundiales. Proteínas, creatinas, pre-entrenos y mucho más.
              </p>
              <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                <Link href="/tienda" style={{ background:'var(--red)', color:'white', padding:'12px 28px', fontFamily:'var(--font-body)', fontSize:14, fontWeight:700, textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.04em' }}>
                  Ver catálogo
                </Link>
                <Link href="/tienda?cat=Proteínas" style={{ background:'transparent', color:'white', padding:'11px 22px', fontFamily:'var(--font-body)', fontSize:14, fontWeight:700, textDecoration:'none', border:'1px solid rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.04em' }}>
                  Proteínas →
                </Link>
              </div>
              <div style={{ display:'flex', gap:'2.5rem', marginTop:'2rem', paddingTop:'1.25rem', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                {[['300+','Productos'],['24h','Envío'],['100%','Originales'],['3','Niveles VIP']].map(([n,l])=>(
                  <div key={l}>
                    <div style={{ fontSize:22, fontWeight:900, color:'var(--red)', lineHeight:1 }}>{n}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner BM VIP */}
            <div style={{ background:'linear-gradient(160deg, #1a1208 0%, #2a1c00 60%, #0a0a0a 100%)', padding:'2rem 2rem', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', borderLeft:'1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#FBEC96', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'0.4rem' }}>ÚNETE AHORA</div>
              <div style={{ fontSize:'clamp(32px,3vw,44px)', fontWeight:900, color:'#FBEC96', lineHeight:0.9, marginBottom:'0.2rem', fontStyle:'italic' }}>BMVIP</div>
              <div style={{ fontSize:'clamp(18px,2vw,26px)', fontWeight:900, color:'white', textTransform:'uppercase', marginBottom:'1rem', letterSpacing:'0.04em' }}>BUYMUSCLE</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.6, marginBottom:'1.5rem', maxWidth:220 }}>
                Beneficios Exclusivos<br/>Transforma tu experiencia de compra
              </div>
              <Link href="/distribuidores" style={{ background:'#FBEC96', color:'#111', padding:'10px 24px', fontFamily:'var(--font-body)', fontSize:13, fontWeight:700, textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.04em' }}>
                DESCUBRE CÓMO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Barra de categorías rápidas ══ */}
      <section style={{ background:'white', borderBottom:'1px solid #e8e8e8' }}>
        <div className="container">
          <div style={{ display:'flex', overflowX:'auto', scrollbarWidth:'none' as const }}>
            {QUICK_CATS.map(cat => (
              <Link key={cat.name} href={`/tienda?cat=${encodeURIComponent(cat.slug)}`}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'13px 18px', fontSize:11, fontWeight:700, color:'#444', textTransform:'uppercase', letterSpacing:'0.04em', textDecoration:'none', borderRight:'1px solid #f0f0f0', whiteSpace:'nowrap', flexShrink:0 }}>
                <span style={{ fontSize:20 }}>{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Sección "BUYMUSCLE / Nutrición deportiva" — idéntica al original ══ */}
      <section style={{ background:'white', borderBottom:'1px solid #e8e8e8', padding:'2.5rem 0' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'2.5rem', alignItems:'start' }}>
            {/* Bloque izquierdo */}
            <div style={{ paddingRight:'2rem', borderRight:'1px solid #e8e8e8' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'0.5rem' }}>BUYMUSCLE</div>
              <h2 style={{ fontSize:'clamp(20px,2.5vw,28px)', fontWeight:900, textTransform:'uppercase', color:'#111', lineHeight:1.1, marginBottom:'0.75rem' }}>Nutrición<br/>deportiva</h2>
              <p style={{ fontSize:13, color:'#777', lineHeight:1.7, marginBottom:'1.25rem' }}>
                Compra suplementos deportivos en Canarias con BuyMuscle. Proteínas, creatina, aminoácidos y pre-entrenos de marcas líderes como IO.Genix, GN Nutrition, Amix y más.
              </p>
              <Link href="/tienda" style={{ fontSize:13, fontWeight:700, color:'var(--red)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                Ver todo el catálogo →
              </Link>
            </div>

            {/* Novedades */}
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <div style={{ fontSize:18, fontWeight:800, textTransform:'uppercase', color:'#111', letterSpacing:'0.02em' }}>
                  NOVEDADES
                </div>
                <Link href="/tienda" style={{ fontSize:12, color:'var(--red)', fontWeight:700, textDecoration:'none', border:'1px solid var(--red)', padding:'5px 14px' }}>
                  Ver todo →
                </Link>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'#e8e8e8' }}>
                {novedades.slice(0,4).map((p:any) => <ProductCard key={p.id} product={p}/>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Distribuidores banner ══ */}
      <section style={{ background:'#111', padding:'2.5rem 0', borderTop:'3px solid var(--red)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'3rem', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'0.5rem' }}>PROGRAMA EXCLUSIVO</div>
              <h3 style={{ fontSize:'clamp(20px,3vw,34px)', fontWeight:900, textTransform:'uppercase', color:'white', marginBottom:'0.75rem', lineHeight:1.1 }}>
                PORTAL DE <span style={{ color:'var(--red)' }}>DISTRIBUIDORES</span>
              </h3>
              <p style={{ color:'rgba(255,255,255,0.4)', maxWidth:500, lineHeight:1.7, fontSize:13, marginBottom:'1.25rem' }}>
                Hasta un 20% de descuento automático en todos los productos según tu nivel.
              </p>
              <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' as const }}>
                {[['🥉 Bronze','-10%','#cd7f32'],['🥈 Silver','-15%','#a8a9ad'],['🥇 Gold','-20%','#ffd700']].map(([n,d,c])=>(
                  <div key={n} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${c}35`, padding:'8px 16px', textAlign:'center' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:c }}>{n}</div>
                    <div style={{ fontSize:17, fontWeight:900, color:'white' }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column' as const, gap:'0.75rem', minWidth:180 }}>
              <Link href="/distribuidores/login" style={{ background:'var(--red)', color:'white', padding:'13px 24px', fontFamily:'var(--font-body)', fontSize:13, fontWeight:700, textDecoration:'none', textTransform:'uppercase', textAlign:'center', letterSpacing:'0.04em' }}>
                Acceder al portal
              </Link>
              <Link href="/distribuidores" style={{ background:'transparent', color:'rgba(255,255,255,0.5)', padding:'11px 20px', fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, textDecoration:'none', border:'1px solid rgba(255,255,255,0.12)', textTransform:'uppercase', textAlign:'center', letterSpacing:'0.04em' }}>
                Más información
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Proteínas ══ */}
      {proteinas.length > 0 && (
        <section style={{ padding:'2.5rem 0', background:'#f5f5f5' }}>
          <div className="container">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', borderBottom:'2px solid #e8e8e8', paddingBottom:'0.75rem' }}>
              <h2 style={{ fontSize:18, fontWeight:800, textTransform:'uppercase', color:'#111', margin:0 }}>PROTEÍNAS</h2>
              <Link href="/tienda?cat=Proteínas" style={{ fontSize:12, color:'var(--red)', fontWeight:700, textDecoration:'none', border:'1px solid var(--red)', padding:'5px 14px' }}>Ver todas →</Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'#e8e8e8' }}>
              {proteinas.map((p:any) => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        </section>
      )}

      {/* ══ Pre-entrenos ══ */}
      {preEntrenos.length > 0 && (
        <section style={{ padding:'2.5rem 0', background:'white' }}>
          <div className="container">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', borderBottom:'2px solid #f0f0f0', paddingBottom:'0.75rem' }}>
              <h2 style={{ fontSize:18, fontWeight:800, textTransform:'uppercase', color:'#111', margin:0 }}>PRE-ENTRENOS</h2>
              <Link href="/tienda?cat=Pre-entrenos" style={{ fontSize:12, color:'var(--red)', fontWeight:700, textDecoration:'none', border:'1px solid var(--red)', padding:'5px 14px' }}>Ver todos →</Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'#e8e8e8' }}>
              {preEntrenos.map((p:any) => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
