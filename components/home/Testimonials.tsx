// S12 · Cierre de confianza — los 3 testimonios 5★ (movidos desde arriba) +
// CTA final de contacto. Última duda resuelta → última puerta abierta.
// El enlace de WhatsApp reutiliza el número YA publicado en la web
// (components/WhatsAppButton.tsx) — no se publica ningún dato nuevo.
const REVIEWS = [
  { t: 'La mejor tienda de suplementacion de Canarias. Envio en 24h.', a: 'Carlos M.' },
  { t: 'Precios imbatibles y atencion al cliente 10/10.', a: 'Laura G.' },
  { t: 'Productos originales y bien embalados. Repito seguro.', a: 'Marta R.' },
]

const WA_MSG = encodeURIComponent('Hola BuyMuscle, tengo una duda sobre suplementación')

export default function Testimonials() {
  return (
    <section style={{ background: 'white', padding: '2.5rem 20px', borderTop: '1px solid #ebebeb' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: '0 0 1.25rem', textAlign: 'center' }}>
          Los que ya entrenan con nosotros
        </h2>
        <div className="testi-grid">
          {REVIEWS.map(({ t, a }) => (
            <div key={a} style={{ background: '#f9f9f9', border: '1px solid #ebebeb', borderRadius: 8, padding: '16px 18px', fontSize: 13 }}>
              <div style={{ color: '#f59e0b', fontSize: 14, marginBottom: 6 }}>★★★★★</div>
              <div style={{ color: '#555', lineHeight: 1.6, fontStyle: 'italic' }}>&quot;{t}&quot;</div>
              <div style={{ fontWeight: 700, color: '#111', marginTop: 8, fontSize: 11 }}>— {a}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <div style={{ fontSize: 14, color: '#555', marginBottom: 12 }}>¿Dudas con tu suplementación? Escríbenos y te ayudamos.</div>
          <a href={'https://wa.me/34828048310?text=' + WA_MSG} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#25D366', color: 'white', padding: '11px 26px', fontWeight: 800, fontSize: 13, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.04em', borderRadius: 4 }}>
            💬 Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
