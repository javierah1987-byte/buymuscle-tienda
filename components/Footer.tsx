import Link from 'next/link'
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Buy<span>Muscle</span></div>
            <p className="footer-desc">Tu tienda de suplementación deportiva en Sevilla.</p>
          </div>
          <div className="footer-col"><h4>Tienda</h4>
            <Link href="/tienda">Todo el catálogo</Link>
            <Link href="/tienda?cat=Proteínas">Proteínas</Link>
            <Link href="/tienda?cat=Creatinas Monohidratos">Creatina</Link>
            <Link href="/tienda?cat=Pre-entrenos">Pre-entrenos</Link>
          </div>
          <div className="footer-col"><h4>Empresa</h4>
            <Link href="/distribuidores">Distribuidores</Link>
            <Link href="#">Contacto</Link>
          </div>
          <div className="footer-col"><h4>Legal</h4>
            <Link href="#">Aviso legal</Link>
            <Link href="#">Privacidad</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} BuyMuscle. Todos los derechos reservados.</p>
          <p style={{color:'var(--muted)',fontSize:'13px'}}>Sevilla, España</p>
        </div>
      </div>
    </footer>
  )
}
