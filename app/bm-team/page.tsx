import Link from 'next/link'

const BASE = 'https://tienda.buymuscle.es/img/cms/'
const LOGO_TEAM = BASE + 'Logo-BM-Team.png'

const ATLETAS = [
  { nombre:'Pedro Veiras', foto:'Pedro.jpg', ig:'pedroveirasspro', desc:'Fisiculturista profesional y referente del fitness en Canarias.' },
  { nombre:'Tino Rinderknecht', foto:'Tino.jpg', ig:'tino_rinderknecht', desc:'Atleta de alto rendimiento y entrenador personal.' },
  { nombre:'Adassa & Alberto', foto:'duplafitness22.jpg', ig:'duplafitness22', desc:'Pareja fitness y embajadores de vida saludable.' },
  { nombre:'Pili Hernandez', foto:'Pili-2.jpg', ig:'pili.hdez93', desc:'Atleta y promotora de la vida activa y saludable.' },
  { nombre:'Cristina Hernandez', foto:'Cristina-2.jpg', ig:'babydollhn', desc:'Modelo fitness e influencer del mundo del culturismo.' },
  { nombre:'Carolina Espeso', foto:'Carolina.jpg', ig:'carolinaespesoj', desc:'Atleta y apasionada del fitness y la nutricion deportiva.' },
  { nombre:'Sheila Ramirez', foto:'Sheila.jpg', ig:'sheilaramirezfit', desc:'Fitness coach y embajadora de vida activa.' },
  { nombre:'Paula Bravo', foto:'Paula.jpg', ig:'paulabravofit', desc:'Atleta y apasionada del deporte y la nutricion.' },
  { nombre:'Ruben Martin', foto:'Ruben.jpg', ig:'rubenmafit', desc:'Culturista y referente del fitness en la isla.' },
  { nombre:'Toni Rodriguez', foto:'Toni.jpg', ig:'tonirodriguezfit', desc:'Atleta y entrenador personal certificado.' },
  { nombre:'Jose Perez', foto:'Jose.jpg', ig:'joseperezfit', desc:'Competidor de fitness y promotor de vida saludable.' },
  { nombre:'Juan Carlos Palomeque', foto:'JuanCarlos.jpg', ig:'jcpalomeque', desc:'Fisiculturista y embajador de BuyMuscle.' },
  { nombre:'Maria Gonzalez', foto:'Maria.jpg', ig:'mariagonzalezfit', desc:'Atleta y modelo fitness comprometida con el deporte.' },
  { nombre:'Angel Sosa', foto:'Angel.jpg', ig:'angelsosafit', desc:'Atleta de alta competicion y embajador de la marca.' },
  { nombre:'Gabri Hernandez', foto:'Gabri.jpg', ig:'gabrihernandezfit', desc:'Entrenador y atleta con amplia trayectoria deportiva.' },
]

export default function BMTeamPage() {
  return (
    <div style={{ background:'#111', minHeight:'100vh', color:'white' }}>

      {/* Hero */}
      <section style={{ background:'linear-gradient(135deg,#0a0a0a 0%,#1a0a0a 50%,#0a0a0a 100%)', borderBottom:'3px solid #00F399', padding:'3rem 20px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem', alignItems:'center' }}>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_TEAM} alt="BuyMuscle Team" style={{ maxWidth:360, width:'100%', marginBottom:'1.5rem' }}/>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.7)', lineHeight:1.8, maxWidth:500 }}>
              Un equipo de referentes en el mundo del fitness que representa nuestros valores dentro y fuera del deporte. Atletas, influencers y profesionales que confian en nuestra marca para llevar su rendimiento al siguiente nivel.
            </p>
            <div style={{ marginTop:'2rem', display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <div style={{ background:'rgba(0,243,153,0.1)', border:'1px solid #00F39950', padding:'12px 20px', textAlign:'center' }}>
                <div style={{ fontSize:28, fontWeight:900, color:'#00F399' }}>+15</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Atletas</div>
              </div>
              <div style={{ background:'rgba(0,243,153,0.1)', border:'1px solid #00F39950', padding:'12px 20px', textAlign:'center' }}>
                <div style={{ fontSize:28, fontWeight:900, color:'#00F399' }}>100K+</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Seguidores</div>
              </div>
              <div style={{ background:'rgba(0,243,153,0.1)', border:'1px solid #00F39950', padding:'12px 20px', textAlign:'center' }}>
                <div style={{ fontSize:28, fontWeight:900, color:'#00F399' }}>7</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Islas</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#00F399', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'0.5rem' }}>PROGRAMA EXCLUSIVO</div>
            <h1 style={{ fontSize:'clamp(32px,5vw,60px)', fontWeight:900, color:'white', textTransform:'uppercase', lineHeight:1, marginBottom:'1rem' }}>
              BM <span style={{ color:'#00F399' }}>TEAM</span>
            </h1>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:'1.5rem' }}>
              Forma parte de la familia BuyMuscle.<br/>Comparte tu pasion por el fitness.
            </p>
            <a href="mailto:tienda@buymuscle.es" style={{ display:'inline-block', background:'#00F399', color:'#111', padding:'12px 28px', fontSize:13, fontWeight:700, textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Unirse al equipo
            </a>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ background:'#0a0a0a', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'10px 20px' }}>
          <div style={{ display:'flex', gap:6, alignItems:'center', fontSize:12, color:'#666' }}>
            <Link href="/" style={{ color:'#666', textDecoration:'none' }}>Inicio</Link>
            <span>›</span>
            <span style={{ color:'#00F399', fontWeight:600 }}>BM Team</span>
          </div>
        </div>
      </div>

      {/* Grid atletas */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'3rem 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'2rem', paddingBottom:'1rem', borderBottom:'2px solid #00F399' }}>
          <h2 style={{ fontSize:20, fontWeight:800, textTransform:'uppercase', color:'white', margin:0 }}>NUESTROS ATLETAS</h2>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>Referentes del fitness en Canarias</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'2px', background:'#222' }}>
          {ATLETAS.map((atleta) => (
            <AtletaCard key={atleta.nombre} atleta={atleta} />
          ))}
        </div>

        {/* CTA unirse */}
        <div style={{ marginTop:'4rem', background:'linear-gradient(135deg,#001a0d,#003a1a)', border:'1px solid #00F39930', padding:'3rem', textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#00F399', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'0.75rem' }}>UNETE A NOSOTROS</div>
          <h3 style={{ fontSize:'clamp(22px,3vw,36px)', fontWeight:900, color:'white', textTransform:'uppercase', marginBottom:'1rem' }}>
            SER PARTE DEL <span style={{ color:'#00F399' }}>BM TEAM</span>
          </h3>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.8, maxWidth:500, margin:'0 auto 2rem' }}>
            Si eres atleta, influencer o apasionado del fitness y quieres representar a BuyMuscle, contacta con nosotros.
          </p>
          <a href="mailto:tienda@buymuscle.es?subject=Solicitud BM Team"
            style={{ display:'inline-block', background:'#00F399', color:'#111', padding:'14px 36px', fontSize:14, fontWeight:700, textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.05em' }}>
            Enviar solicitud
          </a>
        </div>
      </div>
    </div>
  )
}

function AtletaCard({ atleta }: { atleta: typeof ATLETAS[0] }) {
  const imgSrc = 'https://tienda.buymuscle.es/img/cms/' + atleta.foto
  const igUrl = 'https://www.instagram.com/' + atleta.ig

  return (
    <div style={{ background:'#1a1a1a', position:'relative', overflow:'hidden', aspectRatio:'3/4' }}
      onMouseEnter={e=>{ const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement; if(overlay) overlay.style.opacity='1'; }}
      onMouseLeave={e=>{ const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement; if(overlay) overlay.style.opacity='0'; }}>
      {/* Imagen */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgSrc} alt={atleta.nombre}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.4s' }}
        onError={e=>{ (e.target as HTMLImageElement).src='https://placehold.co/400x600/1a1a1a/00F399?text=BM+Team'; }}/>
      {/* Overlay hover */}
      <div className="overlay" style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.3) 60%,transparent 100%)', opacity:0, transition:'opacity 0.3s', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'1.5rem' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#00F399', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>BM TEAM</div>
        <div style={{ fontSize:18, fontWeight:800, color:'white', marginBottom:'0.5rem' }}>{atleta.nombre}</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:1.5, marginBottom:'0.75rem' }}>{atleta.desc}</div>
        <a href={igUrl} target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'white', padding:'6px 12px', fontSize:12, fontWeight:600, textDecoration:'none', backdropFilter:'blur(4px)', width:'fit-content' }}>
          <span>📷</span> @{atleta.ig}
        </a>
      </div>
      {/* Badge nombre siempre visible */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(to top,rgba(0,0,0,0.85),transparent)', padding:'1rem 1rem 0.75rem' }}>
        <div style={{ fontSize:14, fontWeight:700, color:'white' }}>{atleta.nombre}</div>
        <div style={{ fontSize:11, color:'#00F399' }}>@{atleta.ig}</div>
      </div>
    </div>
  )
}
