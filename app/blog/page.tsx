'use client'
import Link from 'next/link'

const BASE_BLOG = 'https://tienda.buymuscle.es/blog/news/'
const BASE_IMG = 'https://tienda.buymuscle.es/img/cms/'

const ARTICULOS = [
  {
    titulo: 'Proteina sin lactosa: que opciones elegir si la proteina te cae pesada o tienes intolerancia',
    slug: 'proteina-sin-lactosa-que-opciones-elegir-si-la-proteina-te-cae-pesada-o-tienes-intolerancia',
    img: 'blog-proteina-lactosa.jpg',
    fecha: 'Marzo 3, 2026',
    categoria: 'Nutricion',
    resumen: 'Descubre las mejores proteinas sin lactosa disponibles en BuyMuscle y como elegir la que mejor se adapta a tu cuerpo y objetivos.',
  },
  {
    titulo: 'Suplementacion para deportes de resistencia: lo que necesitas si haces running, ciclismo o trail en Canarias',
    slug: 'suplementacion-para-deportes-de-resistencia-lo-que-necesitas-si-haces-running-ciclismo-o-trail-en-canarias',
    img: 'blog-resistencia.jpg',
    fecha: 'Febrero 18, 2026',
    categoria: 'Suplementacion',
    resumen: 'Guia completa de suplementacion para atletas de resistencia en Canarias. Electrolitos, carbohidratos y proteinas para tu rendimiento.',
  },
  {
    titulo: 'Que tomar antes de entrenar? Opciones naturales y suplementos antes de entrenar para energia',
    slug: 'que-tomar-antes-de-entrenar-opciones-naturales-y-suplementos-antes-de-entrenar-para-energia',
    img: 'blog-pre-entreno.jpg',
    fecha: 'Febrero 2, 2026',
    categoria: 'Pre-entreno',
    resumen: 'Conoce las mejores opciones para maximizar tu energia antes del entrenamiento, desde cafeina natural hasta pre-entrenos profesionales.',
  },
  {
    titulo: 'Creatina: guia completa para entender como funciona y cuanta tomar',
    slug: 'creatina-guia-completa',
    img: 'blog-creatina.jpg',
    fecha: 'Enero 20, 2026',
    categoria: 'Suplementacion',
    resumen: 'Todo lo que necesitas saber sobre la creatina: tipos, dosis, beneficios y como tomarla correctamente para ganar musculo.',
  },
  {
    titulo: 'Proteina whey vs proteina vegana: cual es mejor para tus objetivos',
    slug: 'proteina-whey-vs-vegana',
    img: 'blog-proteina-vegana.jpg',
    fecha: 'Enero 8, 2026',
    categoria: 'Nutricion',
    resumen: 'Comparativa completa entre proteina de suero de leche y proteinas vegetales para que elijas la mas adecuada segun tus metas.',
  },
  {
    titulo: 'Los mejores ejercicios para aumentar masa muscular segun la ciencia',
    slug: 'mejores-ejercicios-masa-muscular',
    img: 'blog-ejercicios.jpg',
    fecha: 'Diciembre 15, 2025',
    categoria: 'Entrenamiento',
    resumen: 'Descubre que dice la ciencia sobre los ejercicios mas efectivos para hipertrofia y como estructurar tu rutina para ganar masa.',
  },
]

const CATS = ['Todos', 'Nutricion', 'Suplementacion', 'Pre-entreno', 'Entrenamiento']

export default function BlogPage() {
  return (
    <div style={{ background:'#f5f5f5', minHeight:'100vh' }}>
      {/* Hero */}
      <section style={{ background:'#111', padding:'3rem 20px', borderBottom:'3px solid var(--red)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:8 }}>BUYMUSCLE</div>
            <h1 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:900, color:'white', textTransform:'uppercase', margin:0 }}>
              NUESTRO <span style={{ color:'var(--red)' }}>BLOG</span>
            </h1>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, marginTop:'0.75rem' }}>
              Consejos de nutricion, entrenamiento y suplementacion deportiva
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, textAlign:'right' }}>
            <div style={{ fontSize:28, fontWeight:900, color:'var(--red)' }}>{ARTICULOS.length}+</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Articulos</div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ background:'white', borderBottom:'1px solid #ebebeb' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'10px 20px' }}>
          <div style={{ display:'flex', gap:6, alignItems:'center', fontSize:12, color:'#999' }}>
            <Link href="/" style={{ color:'#999', textDecoration:'none' }}>Inicio</Link>
            <span>›</span>
            <span style={{ color:'#333', fontWeight:600 }}>Blog</span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 20px' }}>
        {/* Filtros por categoria */}
        <div style={{ display:'flex', gap:8, marginBottom:'2rem', flexWrap:'wrap' }}>
          {CATS.map(cat => (
            <span key={cat} style={{ padding:'6px 16px', fontSize:12, fontWeight:700, border:'1px solid', borderColor: cat==='Todos' ? 'var(--red)' : '#ddd', background: cat==='Todos' ? 'var(--red)' : 'white', color: cat==='Todos' ? 'white' : '#555', cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.04em' }}>
              {cat}
            </span>
          ))}
        </div>

        {/* Articulo destacado (primero) */}
        <a href={BASE_BLOG + ARTICULOS[0].slug} target="_blank" rel="noopener noreferrer"
          style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, background:'white', border:'1px solid #ebebeb', textDecoration:'none', color:'inherit', marginBottom:'2rem', overflow:'hidden' }}
          onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; }}>
          <div style={{ background:'#111', display:'flex', alignItems:'center', justifyContent:'center', minHeight:280, overflow:'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BASE_IMG + ARTICULOS[0].img} alt={ARTICULOS[0].titulo}
              style={{ width:'100%', height:'100%', objectFit:'cover' }}
              onError={e=>{ (e.target as HTMLImageElement).src='https://placehold.co/600x400/111/ff1e41?text=BuyMuscle+Blog'; }}/>
          </div>
          <div style={{ padding:'2.5rem', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <span style={{ background:'var(--red)', color:'white', fontSize:10, fontWeight:700, padding:'3px 10px', textTransform:'uppercase', letterSpacing:'0.08em', display:'inline-block', marginBottom:'1rem', width:'fit-content' }}>
              DESTACADO · {ARTICULOS[0].categoria}
            </span>
            <h2 style={{ fontSize:'clamp(18px,2vw,24px)', fontWeight:800, color:'#111', lineHeight:1.3, marginBottom:'1rem' }}>
              {ARTICULOS[0].titulo}
            </h2>
            <p style={{ fontSize:13, color:'#777', lineHeight:1.8, marginBottom:'1.5rem' }}>{ARTICULOS[0].resumen}</p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:11, color:'#bbb' }}>📅 {ARTICULOS[0].fecha}</span>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--red)' }}>Leer mas →</span>
            </div>
          </div>
        </a>

        {/* Grid de articulos */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'#e0e0e0', marginBottom:'2rem' }}>
          {ARTICULOS.slice(1).map((art) => (
            <a key={art.slug} href={BASE_BLOG + art.slug} target="_blank" rel="noopener noreferrer"
              style={{ background:'white', textDecoration:'none', color:'inherit', display:'flex', flexDirection:'column', transition:'box-shadow 0.2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.zIndex='2'; e.currentTarget.style.position='relative'; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; e.currentTarget.style.zIndex='1'; }}>
              {/* Imagen */}
              <div style={{ height:200, background:'#111', overflow:'hidden', flexShrink:0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BASE_IMG + art.img} alt={art.titulo}
                  style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s' }}
                  onError={e=>{ (e.target as HTMLImageElement).src='https://placehold.co/400x200/111/ff1e41?text=BuyMuscle+Blog'; }}
                  onMouseEnter={e=>{ (e.target as HTMLImageElement).style.transform='scale(1.05)'; }}
                  onMouseLeave={e=>{ (e.target as HTMLImageElement).style.transform='scale(1)'; }}/>
              </div>
              {/* Info */}
              <div style={{ padding:'1.25rem', flex:1, display:'flex', flexDirection:'column' }}>
                <span style={{ background:'#f5f5f5', color:'#666', fontSize:10, fontWeight:700, padding:'2px 8px', textTransform:'uppercase', letterSpacing:'0.06em', display:'inline-block', marginBottom:'0.75rem', width:'fit-content' }}>
                  {art.categoria}
                </span>
                <h3 style={{ fontSize:14, fontWeight:700, color:'#111', lineHeight:1.4, marginBottom:'0.75rem', flex:1,
                  display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                  {art.titulo}
                </h3>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto', paddingTop:'0.75rem', borderTop:'1px solid #f0f0f0' }}>
                  <span style={{ fontSize:11, color:'#bbb' }}>📅 {art.fecha}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--red)' }}>Leer →</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA ver mas en blog original */}
        <div style={{ textAlign:'center', padding:'2rem', background:'white', border:'1px solid #ebebeb' }}>
          <p style={{ color:'#777', fontSize:14, marginBottom:'1rem' }}>
            Descubre todos nuestros articulos sobre nutricion deportiva, entrenamiento y suplementacion
          </p>
          <a href="https://tienda.buymuscle.es/blog" target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-block', background:'var(--red)', color:'white', padding:'12px 32px', fontSize:13, fontWeight:700, textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.05em' }}>
            Ver todos los articulos →
          </a>
        </div>
      </div>
    </div>
  )
}
