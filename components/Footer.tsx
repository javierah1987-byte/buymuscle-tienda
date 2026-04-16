'use client'
import Link from 'next/link'

const INFO_LINKS = [
  {l:'Sobre Nosotros',h:'/sobre-nosotros'},
  {l:'Cambios y Devoluciones',h:'/devoluciones'},
  {l:'Contacto',h:'/contacto'},
  {l:'Gastos de envío',h:'/envio'},
  {l:'Aviso legal',h:'/aviso-legal'},
  {l:'Condiciones de uso',h:'/condiciones'},
]
const SEG_LINKS = [
  {l:'Aviso legal',h:'/aviso-legal'},
  {l:'Condiciones Generales',h:'/condiciones'},
  {l:'Política de privacidad',h:'/privacidad'},
  {l:'Política de cookies',h:'/cookies'},
]
const ENL_LINKS = [
  {l:'Lo más vendido',h:'/tienda'},
  {l:'Novedades',h:'/tienda'},
  {l:'Ofertas',h:'/tienda?cat=Ofertas'},
  {l:'Pre-Pedidos',h:'/tienda?cat=Pre-Pedidos'},
  {l:'StreetFlavour',h:'/tienda?cat=StreetFlavour'},
  {l:'Portal Distribuidores',h:'/distribuidores'},
  {l:'Blog',h:'/blog'},
]

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      style={{display:'block', fontSize:13, color:'rgba(255,255,255,0.45)', textDecoration:'none', padding:'4px 0', transition:'color 0.12s'}}
      onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
      onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.45)')}>
      {children}
    </Link>
  )
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 style={{fontSize:11, fontWeight:800, textTransform:'uppercase' as const, letterSpacing:'0.1em', color:'white', marginBottom:'0.875rem', paddingBottom:'0.5rem', borderBottom:'2px solid var(--red)'}}>
      {children}
    </h4>
  )
}

export default function Footer() {
  return (
    <footer style={{background:'#111', color:'rgba(255,255,255,0.6)', borderTop:'3px solid var(--red)'}}>

      {/* Franja de garantías */}
      <div style={{background:'#0a0a0a', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="container">
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', padding:'1.25rem 0'}}>
            {[
              {icon:'🚚', t:'Envío 24/48h', d:'Pedidos antes de las 14h'},
              {icon:'🔒', t:'Pago 100% Seguro', d:'SSL · Tarjeta · Bizum'},
              {icon:'🔄', t:'Devoluciones', d:'14 días garantizados'},
              {icon:'✅', t:'Originales', d:'Productos 100% auténticos'},
            ].map(g=>(
              <div key={g.t} style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:20, flexShrink:0}}>{g.icon}</span>
                <div>
                  <div style={{fontSize:12, fontWeight:700, color:'white', textTransform:'uppercase' as const, letterSpacing:'0.03em'}}>{g.t}</div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,0.35)'}}>{g.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="container">
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1.4fr', gap:'2.5rem', padding:'2.5rem 0', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>

          {/* Logo + descripción */}
          <div>
            <Link href="/" style={{fontFamily:'var(--font-body)', fontSize:22, fontWeight:900, color:'var(--red)', fontStyle:'italic', textTransform:'uppercase' as const, textDecoration:'none', display:'block', marginBottom:'0.75rem'}}>
              BUYMUSCLE
            </Link>
            <p style={{fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.7, marginBottom:'1.25rem', maxWidth:260}}>
              Tienda online de suplementación deportiva en Canarias. Más de 300 productos de las mejores marcas.
            </p>
            <div style={{display:'flex', gap:8, marginBottom:'1.25rem'}}>
              {[['📘','Facebook'],['📸','Instagram'],['🎵','TikTok'],['▶️','YouTube']].map(([ic,lb])=>(
                <a key={lb} href="#" aria-label={lb}
                  style={{width:34, height:34, background:'rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, cursor:'pointer', transition:'background 0.15s', textDecoration:'none'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--red)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}>
                  {ic}
                </a>
              ))}
            </div>
            <div style={{display:'flex', gap:6, flexWrap:'wrap' as const}}>
              {['💳 Tarjeta','📱 Bizum','🏦 Transferencia'].map(m=>(
                <span key={m} style={{background:'rgba(255,255,255,0.06)', padding:'4px 10px', fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:600}}>{m}</span>
              ))}
            </div>
          </div>

          {/* Información */}
          <div>
            <FooterTitle>Información</FooterTitle>
            {INFO_LINKS.map(l=><FooterLink key={l.l} href={l.h}>{l.l}</FooterLink>)}
          </div>

          {/* Seguridad */}
          <div>
            <FooterTitle>Seguridad</FooterTitle>
            {SEG_LINKS.map(l=><FooterLink key={l.l} href={l.h}>{l.l}</FooterLink>)}
          </div>

          {/* Enlaces */}
          <div>
            <FooterTitle>Enlaces</FooterTitle>
            {ENL_LINKS.map(l=><FooterLink key={l.l} href={l.h}>{l.l}</FooterLink>)}
          </div>

          {/* Contacto */}
          <div>
            <FooterTitle>Contacto</FooterTitle>
            <div style={{display:'flex', flexDirection:'column' as const, gap:'0.6rem'}}>
              <div style={{display:'flex', gap:8, alignItems:'flex-start'}}>
                <span style={{flexShrink:0, marginTop:1}}>📍</span>
                <span style={{fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.6}}>
                  Alcalde Manuel Amador Rodríguez, 23<br/>
                  35200 Telde, Las Palmas
                </span>
              </div>
              <a href="tel:+34828048310" style={{display:'flex', gap:8, alignItems:'center', fontSize:13, color:'rgba(255,255,255,0.45)', textDecoration:'none'}}
                onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.45)')}>
                <span>📞</span> +34 828 048 310
              </a>
              <a href="mailto:tienda@buymuscle.es" style={{display:'flex', gap:8, alignItems:'center', fontSize:13, color:'rgba(255,255,255,0.45)', textDecoration:'none'}}
                onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.45)')}>
                <span>✉️</span> tienda@buymuscle.es
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{background:'#000'}}>
        <div className="container">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem 0', flexWrap:'wrap' as const, gap:8}}>
            <span style={{fontSize:12, color:'rgba(255,255,255,0.25)'}}>
              Copyright © BuyMuscle — Tienda Online de Suplementación Deportiva
            </span>
            <div style={{display:'flex', gap:'1.25rem'}}>
              {[['Privacidad','/privacidad'],['Cookies','/cookies'],['Aviso Legal','/aviso-legal']].map(([t,h])=>(
                <Link key={t} href={h} style={{fontSize:11, color:'rgba(255,255,255,0.2)', textDecoration:'none'}}
                  onMouseEnter={e=>(e.currentTarget.style.color='rgba(255,255,255,0.5)')}
                  onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.2)')}>
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
