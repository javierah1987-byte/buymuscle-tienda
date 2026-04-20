// @ts-nocheck
'use client'
import Link from 'next/link'
export default function Footer(){
  const LS={fontSize:13,color:'rgba(255,255,255,0.5)',textDecoration:'none',display:'block',padding:'3px 0',transition:'color 0.15s'}
  const ho=e=>{e.currentTarget.style.color='#ff1e41'}
  const le=e=>{e.currentTarget.style.color='rgba(255,255,255,0.5)'}
  return(
    <footer style={{background:'#000',borderTop:'3px solid #ff1e41',fontFamily:'Arial,sans-serif'}}>
      {/* Garantias */}
      <div style={{borderBottom:'1px solid rgba(255,255,255,0.07)',padding:'20px 32px'}}>
        <div style={{maxWidth:1280,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
          {[
            {icon:'🚚',t:'Envio 24-48h',d:'Peninsula y Canarias'},
            {icon:'🔒',t:'Pago seguro',d:'SSL 256 bits'},
            {icon:'✅',t:'100% originales',d:'Marcas oficiales'},
            {icon:'🔄',t:'Devolucion facil',d:'14 dias sin preguntas'},
          ].map(b=>(
            <div key={b.t} style={{display:'flex',gap:10,alignItems:'center'}}>
              <span style={{fontSize:24}}>{b.icon}</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'white'}}>{b.t}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{b.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Grid 5 columnas */}
      <div style={{padding:'40px 32px 24px',maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',gap:32,marginBottom:32}}>
          {/* Logo + info */}
          <div>
            <div style={{fontSize:28,fontWeight:900,fontStyle:'italic',color:'#ff1e41',letterSpacing:'-1px',marginBottom:12}}>BUYMUSCLE</div>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.4)',lineHeight:1.6,marginBottom:16}}>Tu tienda de suplementacion deportiva en Las Palmas de Gran Canaria. Calidad, rapidez y asesoramiento real.</p>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:6}}>📍 Alcalde Manuel Amador Rodriguez 23, Telde</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:6}}>📞 <a href="tel:+34828048310" style={{color:'rgba(255,255,255,0.5)',textDecoration:'none'}}>+34 828 048 310</a></div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:16}}>✉️ <a href="mailto:tienda@buymuscle.es" style={{color:'rgba(255,255,255,0.5)',textDecoration:'none'}}>tienda@buymuscle.es</a></div>
            <div style={{display:'flex',gap:10}}>
              {[
                {h:'https://www.instagram.com/buymuscle_es',icon:'📸',l:'Instagram'},
                {h:'https://www.facebook.com/buymuscle.es',icon:'👍',l:'Facebook'},
                {h:'https://www.tiktok.com/@buymuscle',icon:'🎵',l:'TikTok'},
                {h:'https://wa.me/34828048310',icon:'💬',l:'WhatsApp'},
              ].map(r=>(
                <a key={r.l} href={r.h} target="_blank" rel="noopener noreferrer"
                  style={{width:34,height:34,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,textDecoration:'none',transition:'background 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,30,65,0.2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
                  {r.icon}
                </a>
              ))}
            </div>
          </div>
          {/* Tienda */}
          <div>
            <h4 style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.5)',marginBottom:16}}>TIENDA</h4>
            <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:7}}>
              {[
                {h:'/tienda',l:'Todos los productos'},
                {h:'/tienda?cat=Proteinas',l:'Proteinas'},
                {h:'/tienda?cat=Creatinas',l:'Creatinas'},
                {h:'/tienda?cat=Pre-entrenos',l:'Pre-entrenos'},
                {h:'/tienda?cat=Vitaminas',l:'Vitaminas'},
                {h:'/objetivos',l:'Por objetivo'},
                {h:'/comparar',l:'Comparar productos'},
              ].map(x=><li key={x.l}><Link href={x.h} style={LS} onMouseEnter={ho} onMouseLeave={le}>{x.l}</Link></li>)}
            </ul>
          </div>
          {/* Marcas */}
          <div>
            <h4 style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.5)',marginBottom:16}}>MARCAS</h4>
            <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:7}}>
              {[
                {h:'/marca/iogenix',l:'IO.Genix'},
                {h:'/marca/mvp',l:'MVP'},
                {h:'/marca/scitec',l:'Scitec'},
                {h:'/marca/biotechusa',l:'BioTech USA'},
                {h:'/marca/gnnutrition',l:'GN Nutrition'},
                {h:'/marca/appliednutrition',l:'Applied Nutrition'},
                {h:'/marca/hsn',l:'HSN'},
              ].map(x=><li key={x.l}><Link href={x.h} style={LS} onMouseEnter={ho} onMouseLeave={le}>{x.l}</Link></li>)}
            </ul>
          </div>
          {/* Informacion */}
          <div>
            <h4 style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.5)',marginBottom:16}}>INFORMACION</h4>
            <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:7}}>
              {[
                {h:'/sobre-nosotros',l:'Sobre nosotros'},
                {h:'/blog',l:'Blog'},
                {h:'/bm-team',l:'BM Team'},
                {h:'/distribuidores',l:'Distribuidores'},
                {h:'/faq',l:'Preguntas frecuentes'},
                {h:'/privacidad',l:'Privacidad'},
                {h:'/aviso-legal',l:'Aviso legal'},
                {h:'/devoluciones',l:'Devoluciones'},
                {h:'/cookies',l:'Politica de cookies'},
              ].map(x=><li key={x.l}><Link href={x.h} style={LS} onMouseEnter={ho} onMouseLeave={le}>{x.l}</Link></li>)}
            </ul>
          </div>
          {/* Herramientas */}
          <div>
            <h4 style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.5)',marginBottom:16}}>HERRAMIENTAS</h4>
            <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:7}}>
              {[
                {h:'/mis-pedidos',l:'Mis pedidos'},
                {h:'/comparar',l:'Comparador'},
                {h:'/objetivos',l:'Por objetivo'},
                {h:'/distribuidores/login',l:'Portal distribuidor'},
              ].map(x=><li key={x.l}><Link href={x.h} style={LS} onMouseEnter={ho} onMouseLeave={le}>{x.l}</Link></li>)}
            </ul>
            <div style={{marginTop:20,padding:'12px',background:'rgba(255,30,65,0.06)',border:'1px solid rgba(255,30,65,0.15)'}}>
              <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>HORARIO</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',lineHeight:1.7}}>Lun-Vie: 9:00 - 20:00<br/>Sabado: 10:00 - 14:00<br/>Domingo: Cerrado</div>
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:20,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>© {new Date().getFullYear()} BuyMuscle. Todos los derechos reservados.</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {['💳','🏦','📱','🍎','🔐'].map((i,idx)=>(
              <div key={idx} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',padding:'4px 8px',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>{i}</div>
            ))}
          </div>
          <a href="/admin" style={{fontSize:11,color:'rgba(255,255,255,0.15)',textDecoration:'none'}}
            onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.15)'}>⚙ Admin</a>
        </div>
      </div>
    </footer>
  )
}
