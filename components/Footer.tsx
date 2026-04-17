'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background:'#111', color:'rgba(255,255,255,0.65)', borderTop:'3px solid var(--red)', marginTop:0 }}>
      {/* Main footer */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'3rem 20px 2rem', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'2.5rem' }}>

        {/* Col 1: Logo + descripcion */}
        <div>
          <Link href="/" style={{ display:'inline-block', marginBottom:'1rem', textDecoration:'none' }}>
            <span style={{ fontFamily:'var(--font-body)', fontSize:28, fontWeight:900, color:'var(--red)', fontStyle:'italic', textTransform:'uppercase', letterSpacing:'0.01em' }}>BUYMUSCLE</span>
          </Link>
          <p style={{ fontSize:13, lineHeight:1.8, color:'rgba(255,255,255,0.5)', marginBottom:'1.25rem' }}>
            Tu tienda online de suplementacion deportiva en Canarias. Proteinas, creatina, vitaminas y mucho mas.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <a href="tel:+34828048310" style={{ color:'rgba(255,255,255,0.6)', textDecoration:'none', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ color:'var(--red)' }}>📞</span> +34 828 048 310
            </a>
            <a href="mailto:tienda@buymuscle.es" style={{ color:'rgba(255,255,255,0.6)', textDecoration:'none', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ color:'var(--red)' }}>✉️</span> tienda@buymuscle.es
            </a>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, display:'flex', alignItems:'flex-start', gap:8 }}>
              <span style={{ color:'var(--red)', flexShrink:0 }}>📍</span>
              <span>Alcalde Manuel Amador Rodriguez 23, 35200 Telde, Las Palmas</span>
            </div>
          </div>
        </div>

        {/* Col 2: Informacion */}
        <div>
          <h4 style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'white', marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
            INFORMACION
          </h4>
          <nav style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              ['Sobre Nosotros','/sobre-nosotros'],
              ['Cambios y Devoluciones','/devoluciones'],
              ['Contacto','/contacto'],
              ['Gastos de envio','/envio'],
              ['Aviso Legal','/aviso-legal'],
              ['Politica de Privacidad','/privacidad'],
              ['Blog','/blog'],
            ].map(([label,href])=>(
              <Link key={href} href={href} style={{ fontSize:13, color:'rgba(255,255,255,0.5)', textDecoration:'none', transition:'color 0.12s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.5)')}>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Col 3: Categorias */}
        <div>
          <h4 style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'white', marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
            CATEGORIAS
          </h4>
          <nav style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              ['Proteinas','/tienda?cat=Proteinas'],
              ['Creatinas','/tienda?cat=Creatinas Monohidratos'],
              ['Pre-entrenos','/tienda?cat=Pre-entrenos'],
              ['BCAA','/tienda?cat=BCAA'],
              ['Vitaminas','/tienda?cat=Vitaminas'],
              ['Quemadores','/tienda?cat=Quemadores'],
              ['Sport Wear','/sport-wear'],
              ['Veganos','/veganos'],
              ['StreetFlavour','/streetflavour'],
            ].map(([label,href])=>(
              <Link key={href} href={href} style={{ fontSize:13, color:'rgba(255,255,255,0.5)', textDecoration:'none', transition:'color 0.12s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.5)')}>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Col 4: Seguridad + RRSS */}
        <div>
          <h4 style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'white', marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
            PAGO SEGURO
          </h4>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:'1.5rem' }}>
            {['💳 Tarjeta','🏦 Bizum','🔒 SSL'].map(m=>(
              <span key={m} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', padding:'5px 10px', fontSize:12, color:'rgba(255,255,255,0.6)', borderRadius:2 }}>{m}</span>
            ))}
          </div>
          <div style={{ background:'rgba(255,30,65,0.08)', border:'1px solid rgba(255,30,65,0.25)', padding:'12px 14px', marginBottom:'1.5rem' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Envio gratis</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>En pedidos superiores a 50€</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 }}>Entrega en 24/48h laborables</div>
          </div>
          <h4 style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'white', marginBottom:'0.75rem' }}>SIGUENOS</h4>
          <div style={{ display:'flex', gap:10 }}>
            {[
              ['IG','https://instagram.com/buymuscle.es','#E1306C'],
              ['FB','https://facebook.com/buymuscle','#1877F2'],
              ['YT','https://youtube.com/@buymuscle','#FF0000'],
              ['WA','https://wa.me/34828048310','#25D366'],
            ].map(([icon,href,color])=>(
              <a key={icon} href={href} target="_blank" rel="noopener noreferrer"
                style={{ width:36,height:36,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.7)',textDecoration:'none',transition:'all 0.15s',borderRadius:2 }}
                onMouseEnter={e=>{ e.currentTarget.style.background=color+'22'; e.currentTarget.style.borderColor=color; e.currentTarget.style.color=color; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.7)'; }}>
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', padding:'1rem 20px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} BuyMuscle. Todos los derechos reservados.
          </div>
          <div style={{ display:'flex', gap:16 }}>
            {[['Privacidad','/privacidad'],['Cookies','/cookies'],['Aviso Legal','/aviso-legal']].map(([l,h])=>(
              <Link key={h} href={h} style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
