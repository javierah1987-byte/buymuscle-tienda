// S5 · Stats de social proof — solo las 4 cifras, en banda compacta.
// (Los 3 testimonios se mueven al cierre S12: arriba frenan el camino al
// producto; abajo rematan la confianza justo antes de decidir.)
export default function StatsBand() {
  return (
    <section style={{ background: '#f9f9f9', padding: '1rem 20px', borderBottom: '1px solid #ebebeb' }}>
      <div className="stats-band" style={{ maxWidth: 1280, margin: '0 auto' }}>
        {[{ n: '+500', l: 'Clientes en Canarias' }, { n: '316', l: 'Productos disponibles' }, { n: '24h', l: 'Envio express' }, { n: '4.9★', l: 'Valoracion media' }].map(({ n, l }) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 900, fontSize: 'clamp(20px,2.5vw,28px)', color: '#ff1e41', lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
