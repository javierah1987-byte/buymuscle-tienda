// @ts-nocheck
'use client'

export default function Footer() {
  const year = new Date().getFullYear()
  const links = {
    tienda:[['Proteínas','/tienda'],['Pre-entrenos','/tienda'],['Vitaminas','/tienda'],['Veganos','/veganos'],['Ofertas','/tienda'],['Lo más vendido','/tienda']],
    info:[['Política de envíos','/envios'],['Devoluciones','/devoluciones'],['Aviso legal','/aviso-legal'],['Privacidad','/privacidad'],['Cookies','/cookies'],['Blog','/blog']],
  }
  const ls = {color:'#666',textDecoration:'none',display:'block',fontSize:12,marginBottom:8,transition:'color 0.15s'}
  return (
    <footer style={{background:'#111',borderTop:'1px solid #1a1a1a',color:'#888',fontFamily:'var(--font-body,Arial)'}}>
      {/* Badges */}
      <div style={{background:'#0a0a0a',borderBottom:'1px solid #1a1a1a',padding:'20px',display:'flex',justifyContent:'center',gap:40,flexWrap:'wrap'}}>
        {[['🚚','Envío 24-48h','Peninsular y Canarias'],['🔒','Pago seguro','100% protegido'],['✅','Originales','Marcas oficiales'],['📞','Atención','Lun–Sáb 9-20h']].map(([icon,t,s])=>(
          <div key={t} style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:22}}>{icon}</span>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'#ccc',textTransform:'uppercase',letterSpacing:'0.05em'}}>{t}</div>
              <div style={{fontSize:11,color:'#555'}}>{s}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{maxWidth:1200,margin:'0 auto',padding:'40px 20px',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:40}}>
        <div>
          <div style={{color:'#ff1e41',fontWeight:900,fontSize:26,letterSpacing:2,marginBottom:12}}>BUYMUSCLE</div>
          <p style={{fontSize:12,color:'#555',lineHeight:1.8,margin:'0 0 16px',maxWidth:260}}>Tu tienda de suplementación deportiva en Las Palmas de Gran Canaria. Productos originales al mejor precio.</p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <a href="https://wa.me/34828048310" target="_blank" style={{background:'#25d366',color:'white',padding:'7px 12px',fontSize:11,fontWeight:700,textDecoration:'none'}}>💬 WhatsApp</a>
            <a href="https://instagram.com/buymuscle.es" target="_blank" style={{background:'#e1306c',color:'white',padding:'7px 12px',fontSize:11,fontWeight:700,textDecoration:'none'}}>📸 Instagram</a>
          </div>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14,paddingBottom:8,borderBottom:'1px solid #1a1a1a'}}>Tienda</div>
          {links.tienda.map(([l,h])=><a key={l} href={h} style={ls}>{l}</a>)}
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14,paddingBottom:8,borderBottom:'1px solid #1a1a1a'}}>Información</div>
          {links.info.map(([l,h])=><a key={l} href={h} style={ls}>{l}</a>)}
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14,paddingBottom:8,borderBottom:'1px solid #1a1a1a'}}>Contacto</div>
          <div style={{fontSize:12,color:'#555',lineHeight:2}}>
            <div>📍 Las Palmas de Gran Canaria</div>
            <div>📞 <a href="tel:+34828048310" style={{color:'#666',textDecoration:'none'}}>828 048 310</a></div>
            <div>✉️ <a href="mailto:info@buymuscle.es" style={{color:'#666',textDecoration:'none'}}>info@buymuscle.es</a></div>
            <div style={{marginTop:10,fontSize:11,color:'#444'}}>Lunes–Sábado 9:00–20:00h</div>
          </div>
          <div style={{marginTop:14}}>
            <div style={{fontSize:11,color:'#444',marginBottom:6}}>Métodos de pago</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['💳 Tarjeta','🏦 Transferencia','📱 Bizum'].map(m=><span key={m} style={{fontSize:10,background:'#1a1a1a',padding:'3px 8px',color:'#555'}}>{m}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{borderTop:'1px solid #1a1a1a',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
        <div style={{fontSize:11,color:'#333'}}>© {year} BuyMuscle · Todos los derechos reservados</div>
        <div style={{display:'flex',gap:16}}>
          <a href="/admin" style={{fontSize:10,color:'#2a2a2a',textDecoration:'none'}}>⚙ Admin</a>
          <a href="/privacidad" style={{fontSize:11,color:'#333',textDecoration:'none'}}>Privacidad</a>
          <a href="/cookies" style={{fontSize:11,color:'#333',textDecoration:'none'}}>Cookies</a>
        </div>
      </div>
    </footer>
  )
}
