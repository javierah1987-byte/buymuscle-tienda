import Link from 'next/link'

// Blog de la home (compartido por ambas variantes del mockup).
const BASE_BLOG = 'https://tienda.buymuscle.es'

const BLOG_POSTS = [
  { titulo: 'Proteina sin lactosa: que opciones elegir si la proteina te cae pesada', href: '/blog/news/proteina-sin-lactosa-que-opciones-elegir-si-la-proteina-te-cae-pesada-o-tienes-intolerancia', img: '/modules/ph_simpleblog/covers/115-thumb.jpg', fecha: 'Marzo 3, 2026', cat: 'Nutricion' },
  { titulo: 'Suplementacion para deportes de resistencia: running, ciclismo o trail en Canarias', href: '/blog/news/suplementacion-para-deportes-de-resistencia-lo-que-necesitas-si-haces-running-ciclismo-o-trail-en-canarias', img: '/modules/ph_simpleblog/covers/114-thumb.jpg', fecha: 'Febrero 18, 2026', cat: 'Suplementacion' },
  { titulo: 'Que tomar antes de entrenar? Opciones naturales y suplementos para energia', href: '/blog/news/que-tomar-antes-de-entrenar-opciones-naturales-y-suplementos-antes-de-entrenar-para-energia', img: '/modules/ph_simpleblog/covers/113-thumb.jpg', fecha: 'Febrero 2, 2026', cat: 'Pre-entreno' },
]

export default function BlogSection() {
  return (
    <section style={{ padding: '2.5rem 0', background: '#f5f5f5', borderTop: '1px solid #ebebeb' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: 0 }}>NUESTRO BLOG</h2>
            <div style={{ fontSize: 12, color: '#999', marginTop: 3 }}>Nutricion deportiva, entrenamiento y suplementacion</div>
          </div>
          <Link href="/blog" style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, textDecoration: 'none', border: '1px solid var(--red)', padding: '5px 14px' }}>Ver todos →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#e0e0e0' }}>
          {BLOG_POSTS.map(post => (
            <a key={post.href} href={BASE_BLOG + post.href} target="_blank" rel="noopener noreferrer"
              style={{ background: 'white', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 180, overflow: 'hidden', background: '#f0f0f0', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BASE_BLOG + post.img} alt={post.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#f0f0f0', color: '#666', padding: '2px 8px', textTransform: 'uppercase' }}>{post.cat}</span>
                  <span style={{ fontSize: 11, color: '#bbb' }}>{post.fecha}</span>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.4, margin: '0 0 0.5rem', flex: 1 }}>{post.titulo}</h3>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>Leer mas →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
