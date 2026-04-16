import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{background:'#111', color:'rgba(255,255,255,0.7)', borderTop:'3px solid var(--red)'}}>

      {/* ── Franja superior: garantías ── */}
      <div style={{background:'#0a0a0a', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="container">
          <div style={{display:'flex', justifyContent:'center', gap:'3rem', padding:'1rem 0', flexWrap:'wrap'}}>
            {[
              {icon:'🚚', t:'Envío 24/48h', d:'En pedidos realizados antes de las 14h'},
              {icon:'🔒', t:'Pago seguro', d:'SSL · Tarjeta · Bizum · Transferencia'},
              {icon:'🔄', t:'Devoluciones', d:'14 días para cambios y devoluciones'},
              {icon:'⭐', t:'Productos originales', d:'100% auténticos y garantizados'},
            ].map(g=>(
              <div key={g.t} style={{display:'flex', alignItems:'center', gap:10, padding:'0.25rem 0'}}>
                <span style={{fontSize:22}}>{g.icon}</span>
                <div>
                  <div style={{fontSize:12, fontWeight:700, color:'white', textTransform:'uppercase', letterSpacing:'0.04em'}}>{g.t}</div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,0.45)'}}>{g.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cuerpo del footer ── */}
      <div className="container">
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1.5fr', gap:'2.5rem', padding:'2.5rem 0', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>

          {/* Col 1: Logo + descripción */}
          <div>
            <Link href="/" style={{fontFamily:'var(--font-body)', fontSize:24, fontWeight:900, color:'var(--red)', fontStyle:'italic', textTransform:'uppercase', textDecoration:'none', display:'block', marginBottom:'0.75rem'}}>
              BUYMUSCLE
            </Link>
            <p style={{fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.7, marginBottom:'1rem', maxWidth:280}}>
              Tienda online de suplementación deportiva con sede en Canarias. Más de 300 productos de las mejores marcas mundiales.
            </p>
            {/* Redes sociales */}
            <div style={{display:'flex', gap:10}}>
              {[
                {icon:'📘', label:'Facebook'},
                {icon:'📸', label:'Instagram'},
                {icon:'🎵', label:'TikTok'},
                {icon:'▶️', label:'YouTube'},
              ].map(s=>(
                <a key={s.label} href="#" aria-label={s.label}
                  style={{width:32, height:32, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, transition:'background 0.15s'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--red)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.08)')}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Información */}
          <div>
            <h4 style={{fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'white', marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'2px solid var(--red)'}}>
              INFORMACIÓN
            </h4>
            {[
              {l:'Sobre Nosotros', h:'/sobre-nosotros'},
              {l:'Cambios y Devoluciones', h:'/devoluciones'},
              {l:'Contacto', h:'/contacto'},
              {l:'Gastos de envío', h:'/envio'},
              {l:'Aviso legal', h:'/aviso-legal'},
              {l:'Condiciones de uso', h:'/condiciones'},
            ].map(item=>(
              <Link key={item.l} href={item.h}
                style={{display:'block', fontSize:13, color:'rgba(255,255,255,0.5)', textDecoration:'none', padding:'4px 0', transition:'color 0.12s'}}
                onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.5)')}>
                {item.l}
              </Link>
            ))}
          </div>

          {/* Col 3: Seguridad */}
          <div>
            <h4 style={{fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'white', marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'2px solid var(--red)'}}>
              SEGURIDAD
            </h4>
            {[
              {l:'Aviso legal', h:'/aviso-legal'},
              {l:'Condiciones Generales', h:'/condiciones'},
              {l:'Política de privacidad', h:'/privacidad'},
              {l:'Política de cookies', h:'/cookies'},
            ].map(item=>(
              <Link key={item.l} href={item.h}
                style={{display:'block', fontSize:13, color:'rgba(255,255,255,0.5)', textDecoration:'none', padding:'4px 0', transition:'color 0.12s'}}
                onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.5)')}>
                {item.l}
              </Link>
            ))}
          </div>

          {/* Col 4: Enlaces */}
          <div>
            <h4 style={{fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'white', marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'2px solid var(--red)'}}>
              ENLACES
            </h4>
            {[
              {l:'Lo más vendido', h:'/tienda'},
              {l:'Novedades', h:'/tienda'},
              {l:'Ofertas', h:'/tienda?cat=Ofertas'},
              {l:'Pre-Pedidos', h:'/tienda?cat=Pre-Pedidos'},
              {l:'StreetFlavour', h:'/tienda?cat=StreetFlavour'},
              {l:'Portal Distribuidores', h:'/distribuidores'},
              {l:'Blog', h:'/blog'},
            ].map(item=>(
              <Link key={item.l} href={item.h}
                style={{display:'block', fontSize:13, color:'rgba(255,255,255,0.5)', textDecoration:'none', padding:'4px 0', transition:'color 0.12s'}}
                onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.5)')}>
                {item.l}
              </Link>
            ))}
          </div>

          {/* Col 5: Contacto */}
          <div>
            <h4 style={{fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'white', marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'2px solid var(--red)'}}>
              CONTACTO
            </h4>
            <div style={{display:'flex', flexDirection:'column', gap:'0.6rem', fontSize:13}}>
              <div style={{display:'flex', gap:8, alignItems:'flex-start'}}>
                <span style={{marginTop:2, flexShrink:0}}>📍</span>
                <span style={{color:'rgba(255,255,255,0.5)', lineHeight:1.5}}>
                  Alcalde Manuel Amador Rodríguez, 23<br/>
                  35200 Telde, Las Palmas
                </span>
              </div>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <span>📞</span>
                <a href="tel:+34828048310" style={{color:'rgba(255,255,255,0.5)', textDecoration:'none'}}>+34 828 048 310</a>
              </div>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <span>✉️</span>
                <a href="mailto:tienda@buymuscle.es" style={{color:'rgba(255,255,255,0.5)', textDecoration:'none'}}>tienda@buymuscle.es</a>
              </div>
            </div>

            {/* Métodos de pago */}
            <div style={{marginTop:'1.25rem'}}>
              <div style={{fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.5rem'}}>PAGO SEGURO</div>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {['💳 Tarjeta','📱 Bizum','🏦 Transferencia'].map(m=>(
                  <span key={m} style={{background:'rgba(255,255,255,0.08)', padding:'4px 8px', fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:600}}>{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Copyright ── */}
      <div style={{background:'#000', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="container">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.875rem 0', flexWrap:'wrap', gap:8}}>
            <span style={{fontSize:12, color:'rgba(255,255,255,0.3)'}}>
              Copyright © BuyMuscle — Tienda Online de Suplementación Deportiva
            </span>
            <div style={{display:'flex', gap:'1rem'}}>
              <Link href="/privacidad" style={{fontSize:11, color:'rgba(255,255,255,0.25)', textDecoration:'none'}}>Privacidad</Link>
              <Link href="/cookies" style={{fontSize:11, color:'rgba(255,255,255,0.25)', textDecoration:'none'}}>Cookies</Link>
              <Link href="/aviso-legal" style={{fontSize:11, color:'rgba(255,255,255,0.25)', textDecoration:'none'}}>Aviso Legal</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
