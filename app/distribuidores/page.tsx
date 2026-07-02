// @ts-nocheck
import Link from 'next/link'

export const metadata = {
  title: 'Portal de Distribuidores — BuyMuscle',
  description: 'Acceso exclusivo para distribuidores de BuyMuscle. Entra con tus credenciales y realiza tus pedidos con tu tarifa.',
}

// Página de distribuidores: sólo acceso. Sin niveles públicos (oro/plata/bronce).
// El distribuidor entra con email + contraseña y compra con su tarifa (precio y
// descuento se aplican en servidor según su grupo). Las altas las gestiona el
// administrador desde el panel.
export default function DistribuidoresPage() {
  return (
    <div style={{ background:'var(--black)', minHeight:'70vh' }}>
      {/* HERO */}
      <section style={{ background:'var(--black)', padding:'5rem 0 4rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 40%, rgba(217,180,90,0.10) 0%, transparent 60%)', pointerEvents:'none' }}/>
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <div style={{ maxWidth:640 }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'#d9b45a', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ width:40, height:2, background:'#d9b45a', display:'inline-block' }}/>
              Área privada
            </div>
            <h1 style={{ fontSize:'clamp(34px,6vw,64px)', fontWeight:900, textTransform:'uppercase', lineHeight:0.95, letterSpacing:'-0.02em', color:'white', marginBottom:'1.25rem' }}>
              PORTAL DE<br/><span style={{ color:'var(--red)' }}>DISTRIBUIDORES</span>
            </h1>
            <p style={{ fontSize:17, color:'rgba(255,255,255,0.6)', marginBottom:'2.25rem', lineHeight:1.6, maxWidth:520 }}>
              Acceso exclusivo para distribuidores. Entra con tus credenciales y realiza tus pedidos
              con tu tarifa personalizada. Los precios y tu descuento se aplican automáticamente al entrar.
            </p>
            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <Link href="/distribuidores/login" className="btn-primary" style={{ fontSize:15, padding:'13px 34px', justifyContent:'center' }}>
                Acceder al portal →
              </Link>
              <Link href="/distribuidores/facturas" className="btn-outline" style={{ fontSize:15, padding:'11px 28px', justifyContent:'center' }}>
                Mis facturas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA (sin niveles) */}
      <section style={{ padding:'3.5rem 0', background:'var(--surface)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1.5rem', maxWidth:960, margin:'0 auto' }}>
            {[
              { i:'🔑', t:'Entra con tu cuenta', d:'Email y contraseña de distribuidor. Si no la tienes, solicítala abajo.' },
              { i:'🏷️', t:'Tu tarifa, aplicada sola', d:'Al iniciar sesión verás tus precios de distribuidor en todo el catálogo.' },
              { i:'📦', t:'Pide como siempre', d:'Añade al carrito y confirma. Tu pedido se factura con tus condiciones.' },
            ].map(s => (
              <div key={s.t} style={{ background:'var(--bg)', border:'1px solid var(--border)', padding:'1.75rem', borderRadius:8 }}>
                <div style={{ fontSize:32, marginBottom:'0.75rem' }}>{s.i}</div>
                <h3 style={{ fontSize:15, fontWeight:800, textTransform:'uppercase', marginBottom:8, color:'var(--text)' }}>{s.t}</h3>
                <p style={{ fontSize:13.5, color:'var(--muted)', lineHeight:1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLICITAR ACCESO */}
      <section style={{ padding:'3.5rem 0 4.5rem', background:'var(--black)', borderTop:'2px solid var(--red)' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'2rem', flexWrap:'wrap', maxWidth:960, margin:'0 auto' }}>
            <div>
              <h2 style={{ fontSize:'clamp(20px,3vw,30px)', fontWeight:900, textTransform:'uppercase', color:'white', marginBottom:'0.4rem' }}>
                ¿Aún no eres distribuidor?
              </h2>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, maxWidth:520 }}>
                Si tienes una tienda o negocio y quieres vender nuestros productos, escríbenos y
                estudiamos tu alta como distribuidor.
              </p>
            </div>
            <a href="mailto:tienda@buymuscle.es?subject=Solicitud%20de%20acceso%20distribuidor"
              className="btn-primary" style={{ fontSize:15, padding:'13px 30px', justifyContent:'center', whiteSpace:'nowrap' }}>
              Solicitar acceso →
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
