// Cabecera de sección de producto del clon (LOS MÁS VENDIDOS · LAS MEJORES
// PROTEÍNAS): H2 centrado uppercase + divider corto, como el heading+divider
// del PrestaShop.
export default function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
      <h2 style={{ fontSize: 'clamp(20px,2.4vw,28px)', fontWeight: 900, textTransform: 'uppercase', color: '#111', letterSpacing: '0.02em', margin: 0 }}>
        {title}
      </h2>
      <div aria-hidden="true" style={{ width: 70, height: 3, background: '#ff1e41', margin: '12px auto 0' }} />
    </div>
  )
}
