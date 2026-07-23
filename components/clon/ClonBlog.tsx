import Link from 'next/link'

// Blog — clon de la sección del PrestaShop: los 6 posts reales con sus
// portadas (rehospedadas en clon-home/). Los artículos viven en el blog de la
// tienda actual; se abren en pestaña nueva. La cabecera enlaza al /blog propio.
const CDN = 'https://awwlbepjxuoxaigztugh.supabase.co/storage/v1/object/public/product-images/clon-home/'
const BASE_BLOG = 'https://tienda.buymuscle.es'

const POSTS = [
  { img: 'blog-115.jpg', fecha: '3 marzo 2026', titulo: 'Proteína sin lactosa: qué opciones elegir si la proteína te cae pesada o tienes intolerancia', href: '/blog/news/proteina-sin-lactosa-que-opciones-elegir-si-la-proteina-te-cae-pesada-o-tienes-intolerancia' },
  { img: 'blog-114.jpg', fecha: '18 febrero 2026', titulo: 'Suplementación para deportes de resistencia: running, ciclismo o trail en Canarias', href: '/blog/news/suplementacion-para-deportes-de-resistencia-lo-que-necesitas-si-haces-running-ciclismo-o-trail-en-canarias' },
  { img: 'blog-113.jpg', fecha: '2 febrero 2026', titulo: '¿Qué tomar antes de entrenar? Opciones naturales y suplementos para energía', href: '/blog/news/que-tomar-antes-de-entrenar-opciones-naturales-y-suplementos-antes-de-entrenar-para-energia' },
  { img: 'blog-112.jpg', fecha: '21 enero 2026', titulo: 'Errores en etapa de volumen muscular: lo que debes evitar al empezar en el gimnasio', href: '/blog/news/errores-en-etapa-de-volumen-muscular-lo-que-debes-evitar-al-empezar-en-el-gimnasio' },
  { img: 'blog-111.jpg', fecha: '7 enero 2026', titulo: 'Creatina monohidratada: por qué es el suplemento más buscado en España en 2025', href: '/blog/news/creatina-monohidratada-por-que-es-el-suplemento-mas-buscado-en-espana-en-2025' },
  { img: 'blog-53.jpg', fecha: '26 diciembre 2025', titulo: 'Cómo combinar suplementos deportivos: lo que sí y lo que no', href: '/blog/news/como-combinar-suplementos-deportivos-lo-que-si-y-lo-que-no' },
]

export default function ClonBlog() {
  return (
    <section style={{ background: '#f5f5f5', padding: '3rem 20px', borderTop: '1px solid #ebebeb' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(18px,2vw,24px)', fontWeight: 900, textTransform: 'uppercase', color: '#111', margin: 0 }}>Nuestro blog</h2>
            <div aria-hidden="true" style={{ width: 54, height: 3, background: '#ff1e41', marginTop: 10 }} />
          </div>
          <Link href="/blog" style={{ fontSize: 12, color: '#ff1e41', fontWeight: 700, textDecoration: 'none', border: '1px solid #ff1e41', padding: '6px 16px' }}>
            Ver todos →
          </Link>
        </div>
        <div className="clon-blog-grid">
          {POSTS.map(post => (
            <a key={post.href} href={BASE_BLOG + post.href} target="_blank" rel="noopener noreferrer"
              style={{ background: 'white', border: '1px solid #ebebeb', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
              <div style={{ aspectRatio: '16 / 9', overflow: 'hidden', background: '#eee' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CDN + post.img} alt={post.titulo} loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ padding: '1rem 1.1rem 1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>{post.fecha}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.45, margin: 0, flex: 1 }}>{post.titulo}</h3>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#ff1e41', marginTop: 10 }}>Leer más →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
