import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{background:'#111',borderTop:'1px solid #1a1a1a',color:'#888',fontFamily:'var(--font-body,Arial)'}}>
      {/* Banner superior */}
      <div style={{background:'#0a0a0a',borderBottom:'1px solid #1a1a1a',padding:'20px',display:'flex',justifyContent:'center',gap:'40px',flexWrap:'wrap'}}>
        {[
          ['🚚','Envío en 24-48h','Peninsular y Canarias'],
          ['🔒','Pago 100% seguro','Transferencia y más'],
          ['✅','Productos originales','Marcas oficiales'],
          ['📞','Atención personalizada','Lunes a Sábado'],
        ].map(([icon,title,sub])=>(
          <div key={title} style={{display:'flex',alignItems:'center',gap:10,textAlign:'left'}}>
            <span style={{fontSize:24}}>{icon}</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'#ccc',textTransform:'uppercase',letterSpacing:'0.05em'}}>{title}</div>
              <div style={{fontSize:11,color:'#555'}}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cuerpo del footer */}
      <div style={{maxWidth:1200,margin:'0 auto',padding:'40px 20px',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'40px'}}>
        {/* Brand */}
        <div>
          <div style={{color:'#ff1e41',fontWeight:900,fontSize:28,letterSpacing:2,marginBottom:12}}>BUYMUSCLE</div>
          <p style={{fontSize:12,color:'#555',lineHeight:1.8,margin:'0 0 16px',maxWidth:280}}>
            Tu tienda de suplementación deportiva en Las Palmas de Gran Canaria. Productos originales de las mejores marcas al mejor precio.
          </p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <a href="https://wa.me/34828048310" target="_blank" style={{background:'#25d366',color:'white',padding:'8px 14px',fontSize:11,fontWeight:700,textDecoration:'none',display:'flex',alignItems:'center',gap:6}}>
              <span>💬</span> WhatsApp
            </a>
            <a href="https://instagram.com/buymuscle" target="_blank" style={{background:'#e1306c',color:'white',padding:'8px 14px',fontSize:11,fontWeight:700,textDecoration:'none',display:'flex',alignItems:'center',gap:6}}>
              <span>📸</span> Instagram
            </a>
          </div>
        </div>

        {/* Tienda */}
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14,paddingBottom:8,borderBottom:'1px solid #1a1a1a'}}>Tienda</div>
          {[
            ['Proteínas', '/tienda?cat=proteinas'],
            ['Pre-entrenos', '/tienda?cat=pre-entrenos'],
            ['Vitaminas', '/tienda?cat=vitaminas'],
            ['Veganos', '/veganos'],
            ['Ofertas', '/tienda?cat=ofertas'],
            ['Lo más vendido', '/tienda?cat=top'],
          ].map(([l,h])=>(
            <a key={l} href={h} style={{display:'block',fontSize:12,color:'#666',textDecoration:'none',marginBottom:8,transition:'color 0.1s'}}
              onMouseEnter={e=>e.target.style.color='#ff1e41'} onMouseLeave={e=>e.target.style.color='#666'}>
              {l}
            </a>
          ))}
        </div>

        {/* Información */}
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14,paddingBottom:8,borderBottom:'1px solid #1a1a1a'}}>Información</div>
          {[
            ['Política de envíos', '/envios'],
            ['Devoluciones', '/devoluciones'],
            ['Aviso legal', '/aviso-legal'],
            ['Política de privacidad', '/privacidad'],
            ['Política de cookies', '/cookies'],
            ['Blog', '/blog'],
          ].map(([l,h])=>(
            <a key={l} href={h} style={{display:'block',fontSize:12,color:'#666',textDecoration:'none',marginBottom:8,transition:'color 0.1s'}}
              onMouseEnter={e=>e.target.style.color='#ff1e41'} onMouseLeave={e=>e.target.style.color='#666'}>
              {l}
            </a>
          ))}
        </div>

        {/* Contacto */}
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14,paddingBottom:8,borderBottom:'1px solid #1a1a1a'}}>Contacto</div>
          <div style={{fontSize:12,color:'#555',lineHeight:2}}>
            <div>📍 Las Palmas de Gran Canaria</div>
            <div>📞 <a href="tel:+34828048310" style={{color:'#666',textDecoration:'none'}}>828 048 310</a></div>
            <div>✉️ <a href="mailto:info@buymuscle.es" style={{color:'#666',textDecoration:'none'}}>info@buymuscle.es</a></div>
            <div style={{marginTop:12,fontSize:11,color:'#444'}}>Lunes–Sábado<br/>9:00 – 20:00h</div>
          </div>
          <div style={{marginTop:16}}>
            <div style={{fontSize:11,color:'#444',marginBottom:8}}>Métodos de pago</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['💳 Tarjeta','🏦 Transferencia','📱 Bizum'].map(m=>(
                <span key={m} style={{fontSize:10,background:'#1a1a1a',padding:'3px 8px',color:'#555'}}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{borderTop:'1px solid #1a1a1a',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
        <div style={{fontSize:11,color:'#333'}}>© {year} BuyMuscle · Todos los derechos reservados · CIF: B00000000</div>
        <div style={{display:'flex',gap:16}}>
          <a href="/admin" style={{fontSize:10,color:'#333',textDecoration:'none'}}>Admin</a>
          <a href="/privacidad" style={{fontSize:11,color:'#333',textDecoration:'none'}}>Privacidad</a>
          <a href="/cookies" style={{fontSize:11,color:'#333',textDecoration:'none'}}>Cookies</a>
        </div>
      </div>
    </footer>
  )
}
