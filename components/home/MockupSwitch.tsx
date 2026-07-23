import Link from 'next/link'

// Marcador de MOCKUP: identifica la variante en pantalla y permite saltar a la
// otra. SOLO existe en la branch feat/home-redesign (preview para decidir);
// se elimina antes de cualquier paso a producción.
export default function MockupSwitch({ variant }: { variant: 'A' | 'B' }) {
  const other = variant === 'A'
    ? { href: '/home-b', label: 'Ver variante B (conservadora) →' }
    : { href: '/', label: 'Ver variante A (recomendada) →' }
  return (
    <div style={{ position: 'fixed', bottom: 14, left: 14, zIndex: 999, background: 'rgba(17,17,17,0.92)', color: 'white', borderRadius: 8, padding: '8px 12px', fontSize: 11, lineHeight: 1.5, boxShadow: '0 2px 10px rgba(0,0,0,0.3)', maxWidth: 210 }}>
      <div style={{ fontWeight: 800, letterSpacing: '0.06em', color: '#ffb020' }}>🧪 MOCKUP · Variante {variant} {variant === 'A' ? '(recomendada)' : '(conservadora)'}</div>
      <Link href={other.href} style={{ color: '#47daff', textDecoration: 'none', fontWeight: 700 }}>{other.label}</Link>
    </div>
  )
}
