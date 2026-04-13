import Link from 'next/link'
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">BUYMUSCLE</div>
            <p className="footer-desc">Tu tienda de suplementación deportiva online. Más de 300 productos de las mejores marcas.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: '1rem' }}>
              {[
                { icon: '📘', label: 'Facebook', url: 'https://www.facebook.com/BuyMuscle/' },
                { icon: '📸', label: 'Instagram', url: 'https://www.instagram.com/buymuscle_/' },
              ].map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'background 0.15s', borderRadius: 0 }}
                  title={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Categorías</h4>
            <Link href="/tienda?cat=Proteínas">Proteínas</Link>
            <Link href="/tienda?cat=Creatinas Monohidratos">Creatina</Link>
            <Link href="/tienda?cat=Pre-entrenos">Pre-entrenos</Link>
            <Link href="/tienda?cat=Vitaminas">Vitaminas</Link>
            <Link href="/tienda?cat=BCAA">BCAA</Link>
            <Link href="/tienda?cat=Quemadores">Quemadores</Link>
          </div>
          <div className="footer-col">
            <h4>Empresa</h4>
            <Link href="/distribuidores">Distribuidores</Link>
            <Link href="/distribuidores/login">Área distribuidores</Link>
            <a href="#">Blog</a>
            <a href="#">Sobre nosotros</a>
            <a href="#">Contacto</a>
          </div>
          <div className="footer-col">
            <h4>Ayuda</h4>
            <a href="#">Aviso legal</a>
            <a href="#">Política de privacidad</a>
            <a href="#">Política de cookies</a>
            <a href="#">Devoluciones</a>
            <a href="#">Envíos</a>
          </div>
        </div>

        {/* Payment methods & trust badges */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {['💳 Tarjeta', '💶 Bizum', '🏦 Transferencia'].map(m => (
              <span key={m} style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', padding: '5px 12px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{m}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['🚚 Envío 24/48h', '🔄 Devoluciones fáciles', '🔒 Pago seguro'].map(t => (
              <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} BuyMuscle. Todos los derechos reservados.</p>
          <p>Sevilla, España</p>
        </div>
      </div>
    </footer>
  )
}
