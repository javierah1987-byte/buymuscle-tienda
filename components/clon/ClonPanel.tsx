import Link from 'next/link'

// Panel editorial NEGRO — calca el gesto del PrestaShop (secciones Novedades y
// BM Sportswear): tarjeta #000 con eyebrow rojo #ff1e41, título blanco, texto
// gris claro y botón outline blanco. padding 2em como el original.
export default function ClonPanel({ eyebrow, title, text, ctaLabel, ctaHref }: {
  eyebrow: string
  title: string
  text: string
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <div style={{ background: '#000', padding: '2em', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ color: '#ff1e41', fontSize: 15, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
        {eyebrow}
      </div>
      <h2 style={{ color: 'white', fontSize: 'clamp(24px,2.6vw,34px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 14px', textTransform: 'uppercase' }}>
        {title}
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.7, margin: '0 0 22px' }}>
        {text}
      </p>
      <div>
        <Link href={ctaHref} className="clon-btn-outline">{ctaLabel}</Link>
      </div>
    </div>
  )
}
