// @ts-nocheck
import Link from 'next/link'

const LINKS = {
  'Tienda': [
    {l:'Todos los productos',h:'/tienda'},
    {l:'Novedades',h:'/tienda?order=new'},
    {l:'Ofertas',h:'/tienda?cat=Ofertas'},
    {l:'Veganos',h:'/tienda?cat=Veganos'},
    {l:'Lo más vendido',h:'/tienda?order=popular'},
  ],
  'Por objetivo': [
    {l:'Ganar masa muscular',h:'/objetivos#volumen'},
    {l:'Perder grasa',h:'/objetivos#definicion'},
    {l:'Resistencia y cardio',h:'/objetivos#resistencia'},
    {l:'Nutrición vegana',h:'/objetivos#veganos'},
    {l:'Ver todos los objetivos',h:'/objetivos'},
  ],
  'Herramientas': [
    {l:'Comparar productos',h:'/comparar'},
    {l:'Mis pedidos',h:'/mis-pedidos'},
    {l:'Blog y consejos',h:'/blog'},
    {l:'Preguntas frecuentes',h:'/faq'},
    {l:'Sobre nosotros',h:'/sobre-nosotros'},
  ],
  'Ayuda': [
    {l:'Política de envíos',h:'/envios'},
    {l:'Devoluciones',h:'/devoluciones'},
    {l:'Privacidad',h:'/privacidad'},
    {l:'Aviso legal',h:'/aviso-legal'},
    {l:'Cookies',h:'/cookies'},
  ],
}

export default function Footer() {
  return (
    <footer style={{background:'#0a0a0a',color:'rgba(255,255,255,0.65)',fontFamily:'var(--font-body,Arial,sans-serif)',marginTop:0}}>
      {/* Top */}
      <div style={{borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'48px 20px 40px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',gap:32}}>
          {/* Brand */}
          <div>
            <Link href="/" style={{textDecoration:'none'}}>
              <div style={{fontFamily:'var(--font-body,Arial)',fontWeight:900,fontSize:24,color:'#ff1e41',letterSpacing:'-0.5px',marginBottom:12}}>BUYMUSCLE</div>
            </Link>
            <p style={{fontSize:13,lineHeight:1.7,color:'rgba(255,255,255,0.5)',margin:'0 0 20px',maxWidth:240}}>
              Tu tienda de suplementación deportiva en Las Palmas de Gran Canaria. Calidad, rapidez y asesoramiento real.
            </p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {[
                {l:'📸 Instagram',h:'https://instagram.com/buymuscle'},
                {l:'👥 Facebook',h:'https://facebook.com/buymuscle'},
                {l:'🎵 TikTok',h:'https://tiktok.com/@buymuscle'},
              ].map(s=>(
                <a key={s.l} href={s.h} target="_blank" rel="noopener noreferrer"
                  style={{fontSize:11,color:'rgba(255,255,255,0.5)',textDecoration:'none',padding:'4px 10px',border:'1px solid rgba(255,255,255,0.1)',display:'inline-block',transition:'color 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.color='white'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>
                  {s.l}
                </a>
              ))}
            </div>
            <div style={{marginTop:16,padding:'12px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:4}}>📞 Atención al cliente</div>
              <a href="https://wa.me/34828048310" style={{color:'#25D366',textDecoration:'none',fontSize:13,fontWeight:700}}>WhatsApp 828 048 310</a>
            </div>
          </div>
          {/* Columns */}
          {Object.entries(LINKS).map(([title, links])=>(
            <div key={title}>
              <h4 style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.9)',margin:'0 0 14px'}}>
                {title}
              </h4>
              <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:8}}>
                {links.map(l=>(
                  <li key={l.l}>
                    <Link href={l.h} style={{fontSize:13,color:'rgba(255,255,255,0.5)',textDecoration:'none',transition:'color 0.2s'}}
                      onMouseEnter={e=>e.currentTarget.style.color='white'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>
                      {l.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom */}
      <div style={{padding:'16px 20px',maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>
          © {new Date().getFullYear()} BuyMuscle · Las Palmas de Gran Canaria · Todos los derechos reservados
        </div>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.2)'}}>💳 Visa · Mastercard · Bizum · Transferencia</span>
        </div>
      </div>
    </footer>
  )
}
