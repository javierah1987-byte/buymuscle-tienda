export const metadata={title:'Sobre Nosotros | BUYMUSCLE',description:'Conoce la historia de BuyMuscle, tu tienda de suplementación deportiva en Las Palmas de Gran Canaria.'}
const vals=[
  {i:'🏋️',t:'Nuestra pasión',d:'Nacimos del deporte. Somos atletas que conocemos de primera mano lo que necesita un deportista.'},
  {i:'✅',t:'100% originales',d:'Solo trabajamos con marcas y distribuidores oficiales. Cero falsificaciones, cero compromisos.'},
  {i:'🚚',t:'Envío rápido',d:'Sabemos que cuando necesitas tu suplemento, lo necesitas ya. Enviamos en 24-48h.'},
  {i:'📞',t:'Asesoramiento real',d:'Nuestro equipo te ayuda a elegir el producto perfecto. Llámanos sin compromiso.'},
]
export default function SobreNosotros(){
  return(
    <div style={{background:'#f8f8f8',minHeight:'60vh',fontFamily:'Arial,sans-serif'}}>
      <div style={{background:'#111',color:'white',padding:'60px 20px',textAlign:'center'}}>
        <p style={{fontSize:12,color:'#ff1e41',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.15em',margin:'0 0 12px'}}>Desde Las Palmas de Gran Canaria</p>
        <h1 style={{fontSize:36,fontWeight:900,margin:'0 0 16px',textTransform:'uppercase'}}>Sobre BuyMuscle</h1>
        <p style={{fontSize:16,color:'rgba(255,255,255,0.7)',maxWidth:580,margin:'0 auto',lineHeight:1.7}}>
          Tu tienda de confianza para suplementación deportiva en Canarias. Calidad, rapidez y asesoramiento real.
        </p>
      </div>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'60px 20px'}}>
        <div style={{background:'white',padding:'40px',marginBottom:32,border:'1px solid #e8e8e8'}}>
          <h2 style={{fontSize:18,fontWeight:900,color:'#111',textTransform:'uppercase',margin:'0 0 20px',paddingBottom:12,borderBottom:'2px solid #ff1e41',display:'inline-block'}}>Nuestra historia</h2>
          <p style={{fontSize:15,color:'#555',lineHeight:1.9,margin:'0 0 16px'}}>BuyMuscle nació de una necesidad real: encontrar suplementación deportiva de calidad en Canarias sin pagar precios desorbitados ni esperar semanas a que llegara el pedido.</p>
          <p style={{fontSize:15,color:'#555',lineHeight:1.9,margin:'0 0 16px'}}>Empezamos como un proyecto pequeño en Las Palmas de Gran Canaria, con el objetivo claro de ofrecer las mejores marcas del mercado — Scitec, Iogenix, MVP, HSN y muchas más — con envío rápido a toda la isla y la península.</p>
          <p style={{fontSize:15,color:'#555',lineHeight:1.9,margin:0}}>Hoy somos una referencia para atletas, culturistas, corredores y cualquier persona que quiera mejorar su rendimiento. Nuestro equipo vive el deporte cada día, y eso se nota en cada recomendación y pedido.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20,marginBottom:32}}>
          {vals.map(v=>(
            <div key={v.t} style={{background:'white',padding:'28px',border:'1px solid #e8e8e8'}}>
              <div style={{fontSize:32,marginBottom:12}}>{v.i}</div>
              <h3 style={{fontSize:14,fontWeight:700,color:'#111',textTransform:'uppercase',margin:'0 0 10px'}}>{v.t}</h3>
              <p style={{fontSize:13,color:'#666',lineHeight:1.7,margin:0}}>{v.d}</p>
            </div>
          ))}
        </div>
        <div style={{background:'#ff1e41',padding:'40px',textAlign:'center'}}>
          <h2 style={{fontSize:20,fontWeight:900,color:'white',margin:'0 0 12px',textTransform:'uppercase'}}>¿Tienes alguna pregunta?</h2>
          <p style={{color:'rgba(255,255,255,0.85)',fontSize:14,margin:'0 0 24px'}}>Nuestro equipo está disponible para asesorarte sin compromiso.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="https://wa.me/34828048310" style={{background:'#25D366',color:'white',padding:'12px 24px',textDecoration:'none',fontWeight:700,fontSize:13}}>WhatsApp 828 048 310</a>
            <a href="mailto:info@buymuscle.es" style={{background:'white',color:'#ff1e41',padding:'12px 24px',textDecoration:'none',fontWeight:700,fontSize:13}}>info@buymuscle.es</a>
          </div>
        </div>
      </div>
    </div>
  )
}
