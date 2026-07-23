import Link from 'next/link'
import CarouselTrack from './CarouselTrack'

// Patrón editorial PrestaShop: panel de texto + carrusel de producto.
// SOLO para secciones editoriales (Novedades, marca, Sportswear) — si todas
// las secciones llevan panel, el patrón deja de significar nada.
// side: lado del panel de texto en desktop. En móvil el texto SIEMPRE va
// antes que el carrusel (si no, el panel no se lee) — clases .panel-grid.
type Props = {
  side: 'left' | 'right'
  dark?: boolean
  eyebrow: string
  title: React.ReactNode
  body: string
  cta: { href: string; label: string }
  secondary?: { href: string; label: string }
  products: any[]
}

export default function EditorialPanel({ side, dark = false, eyebrow, title, body, cta, secondary, products }: Props) {
  if (!products.length) return null
  const panelBg = dark ? '#111' : 'white'
  const sectionBg = dark ? '#181818' : 'white'

  return (
    <section style={{ background: sectionBg, padding: '2rem 0 2.5rem', borderTop: '1px solid ' + (dark ? '#222' : '#ebebeb') }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <div className={'panel-grid' + (side === 'right' ? ' panel-right' : '')}>

          {/* Panel de texto */}
          <div className={'panel-text' + (dark ? ' panel-text-dark' : '')} style={{
            background: panelBg,
            padding: dark ? '1.75rem 1.5rem' : (side === 'left' ? '0 2rem 0 0' : '0 0 0 2rem'),
            [side === 'left' ? 'borderRight' : 'borderLeft']: dark ? 'none' : '1px solid #ebebeb',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          } as React.CSSProperties}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>{eyebrow}</div>
            <h2 style={{ fontSize: 'clamp(22px,2.2vw,28px)', fontWeight: 900, color: dark ? 'white' : '#111', lineHeight: 1.1, margin: '0 0 0.9rem', textTransform: 'uppercase' }}>{title}</h2>
            <p style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.6)' : '#777', lineHeight: 1.8, margin: '0 0 1.25rem' }}>{body}</p>
            <div>
              <Link href={cta.href} style={{ display: 'inline-block', background: 'var(--red)', color: 'white', padding: '12px 22px', fontWeight: 800, fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {cta.label}
              </Link>
            </div>
            {secondary && (
              <Link href={secondary.href} style={{ marginTop: '0.9rem', fontSize: 12, fontWeight: 700, color: dark ? 'rgba(255,255,255,0.7)' : '#555', textDecoration: 'none' }}>
                {secondary.label}
              </Link>
            )}
          </div>

          {/* Carrusel de producto */}
          <div className="panel-carousel" style={{ [side === 'left' ? 'paddingLeft' : 'paddingRight']: '2rem', minWidth: 0 } as React.CSSProperties}>
            <CarouselTrack products={products} />
          </div>

        </div>
      </div>
    </section>
  )
}
