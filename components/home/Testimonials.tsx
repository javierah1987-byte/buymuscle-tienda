// S12 · Reseñas protagonistas — lo que hablan de nosotros los clientes.
// Avatares = círculo con INICIALES en color de marca (placeholders limpios,
// NO fotos reales). Cabecera con la nota media grande. El enlace de WhatsApp
// reutiliza el número YA publicado en la web (components/WhatsAppButton.tsx).
const REVIEWS = [
  { t: 'La mejor tienda de suplementacion de Canarias. Envio en 24h.', a: 'Carlos M.' },
  { t: 'Precios imbatibles y atencion al cliente 10/10.', a: 'Laura G.' },
  { t: 'Productos originales y bien embalados. Repito seguro.', a: 'Marta R.' },
]

const WA_MSG = encodeURIComponent('Hola BuyMuscle, tengo una duda sobre suplementación')

// "Carlos M." → "CM"
const initials = (name: string) => name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

export default function Testimonials() {
  return (
    <section id="resenas" style={{ background: 'white', padding: '3rem 20px', borderTop: '1px solid #ebebeb' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Cabecera protagonista: nota media + título */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 'clamp(34px,4vw,44px)', fontWeight: 900, color: '#111', lineHeight: 1 }}>4.9</span>
            <span style={{ fontSize: 'clamp(18px,2vw,24px)', color: '#f59e0b', letterSpacing: 2 }}>★★★★★</span>
          </div>
          <h2 style={{ fontSize: 'clamp(18px,2.2vw,24px)', fontWeight: 900, textTransform: 'uppercase', color: '#111', margin: '6px 0 4px' }}>
            Los que ya entrenan con nosotros
          </h2>
          <div style={{ fontSize: 13, color: '#888' }}>Valoración media de +500 clientes en Canarias</div>
        </div>

        {/* Tarjetas con avatar de iniciales */}
        <div className="testi-grid">
          {REVIEWS.map(({ t, a }) => (
            <div key={a} style={{ background: '#f9f9f9', border: '1px solid #ebebeb', borderRadius: 12, padding: '22px 22px 20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: '#f59e0b', fontSize: 16, letterSpacing: 1, marginBottom: 10 }}>★★★★★</div>
              <div style={{ color: '#444', fontSize: 15, lineHeight: 1.65, fontStyle: 'italic', flex: 1 }}>&quot;{t}&quot;</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                <div aria-hidden="true" style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#ff1e41 0%,#b00722 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, letterSpacing: '0.02em', flexShrink: 0, boxShadow: '0 2px 6px rgba(255,30,65,0.3)' }}>
                  {initials(a)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#111', fontSize: 14 }}>{a}</div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 1 }}>Cliente de BuyMuscle</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Última puerta abierta */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div style={{ fontSize: 14, color: '#555', marginBottom: 12 }}>¿Dudas con tu suplementación? Escríbenos y te ayudamos.</div>
          <a href={'https://wa.me/34828048310?text=' + WA_MSG} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#25D366', color: 'white', padding: '12px 28px', fontWeight: 800, fontSize: 13, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.04em', borderRadius: 4 }}>
            💬 Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
