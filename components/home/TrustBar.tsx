// S2 · Barra de confianza — los 4 pilares literales (mandato: no tocar el
// contenido). Pegada al hero: es el reductor de fricción nº1 y debe verse
// antes de que la página pida nada. Móvil: grid 2×2 compacto (.trust-bar-grid).
// Tratamiento CLARO: entre el hero y la oferta oscura de debajo actúa de
// separador — la única masa oscura de la parte alta es la promo, que así destaca.
export default function TrustBar() {
  return (
    <section style={{ background: 'white', padding: '14px 20px', borderTop: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb' }}>
      <div className="trust-bar-grid" style={{ maxWidth: 1280, margin: '0 auto' }}>
        {[
          { icon: '🚀', t: 'Envío 24-48h', s: 'Canarias y Peninsula' },
          { icon: '✅', t: 'Marca oficial', s: '100% productos originales' },
          { icon: '💰', t: 'Precio mínimo', s: 'Si lo encuentras más barato, igualamos el precio' },
          { icon: '🔄', t: 'Devolución 14 días', s: 'Sin preguntas' },
        ].map(({ icon, t, s }) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#111' }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: '0.04em' }}>{t}</div>
              <div style={{ fontSize: 10, color: '#8a8a8a', marginTop: 1 }}>{s}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
