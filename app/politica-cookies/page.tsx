import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies | BUYMUSCLE',
  description: 'Información sobre el uso de cookies en BuyMuscle',
}

export default function PoliticaCookies() {
  return (
    <div style={{maxWidth:860,margin:'0 auto',padding:'48px 24px',fontFamily:'Heebo,sans-serif',color:'#111',lineHeight:1.8}}>
      <h1 style={{fontSize:32,fontWeight:900,marginBottom:8}}>Política de Cookies</h1>
      <p style={{color:'#888',marginBottom:40}}>Última actualización: Enero 2026</p>

      <h2 style={{fontSize:20,fontWeight:800,color:'#ff1e41',marginBottom:12}}>1. ¿Qué son las cookies?</h2>
      <p style={{marginBottom:24}}>Las cookies son pequeños ficheros de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Nos ayudan a mejorar tu experiencia de navegación y a entender cómo se usa nuestra tienda.</p>

      <h2 style={{fontSize:20,fontWeight:800,color:'#ff1e41',marginBottom:12}}>2. Cookies que utilizamos</h2>
      <div style={{overflowX:'auto',marginBottom:24}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
          <thead>
            <tr style={{background:'#f5f5f5'}}>
              <th style={{padding:'10px 14px',textAlign:'left',borderBottom:'2px solid #e8e8e8',fontWeight:700}}>Cookie</th>
              <th style={{padding:'10px 14px',textAlign:'left',borderBottom:'2px solid #e8e8e8',fontWeight:700}}>Tipo</th>
              <th style={{padding:'10px 14px',textAlign:'left',borderBottom:'2px solid #e8e8e8',fontWeight:700}}>Finalidad</th>
              <th style={{padding:'10px 14px',textAlign:'left',borderBottom:'2px solid #e8e8e8',fontWeight:700}}>Duración</th>
            </tr>
          </thead>
          <tbody>
            {[
              {name:'bm_cart',type:'Técnica',desc:'Guarda el contenido de tu carrito de compra',dur:'Sesión'},
              {name:'bm_session',type:'Técnica',desc:'Mantiene tu sesión de usuario activa',dur:'7 días'},
              {name:'_fbp',type:'Analítica',desc:'Cookie de Meta Pixel para medir conversiones publicitarias',dur:'3 meses'},
              {name:'_ga',type:'Analítica',desc:'Google Analytics para estadísticas de uso',dur:'2 años'},
              {name:'_gid',type:'Analítica',desc:'Google Analytics para identificar sesiones',dur:'24 horas'},
            ].map(c=>(
              <tr key={c.name} style={{borderBottom:'1px solid #e8e8e8'}}>
                <td style={{padding:'10px 14px',fontFamily:'monospace',fontSize:13}}>{c.name}</td>
                <td style={{padding:'10px 14px'}}><span style={{padding:'2px 8px',borderRadius:20,background:c.type==='Técnica'?'#dbeafe':'#fef9c3',fontSize:12,fontWeight:600}}>{c.type}</span></td>
                <td style={{padding:'10px 14px',color:'#555',fontSize:13}}>{c.desc}</td>
                <td style={{padding:'10px 14px',color:'#888',fontSize:13}}>{c.dur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{fontSize:20,fontWeight:800,color:'#ff1e41',marginBottom:12}}>3. Cookies técnicas (necesarias)</h2>
      <p style={{marginBottom:24}}>Las cookies técnicas son imprescindibles para que la tienda funcione correctamente: guardar tu carrito, mantener tu sesión y recordar tus preferencias. No requieren tu consentimiento según la normativa vigente.</p>

      <h2 style={{fontSize:20,fontWeight:800,color:'#ff1e41',marginBottom:12}}>4. Cookies analíticas y publicitarias</h2>
      <p style={{marginBottom:24}}>Utilizamos Google Analytics y Meta Pixel para medir el rendimiento de la tienda y nuestras campañas publicitarias. Estas cookies nos permiten saber qué productos interesan más y mejorar tu experiencia. Puedes rechazarlas sin que afecte a tu compra.</p>

      <h2 style={{fontSize:20,fontWeight:800,color:'#ff1e41',marginBottom:12}}>5. Cómo gestionar las cookies</h2>
      <p style={{marginBottom:16}}>Puedes configurar tu navegador para bloquear o eliminar cookies en cualquier momento:</p>
      <ul style={{paddingLeft:24,marginBottom:24,color:'#555'}}>
        <li style={{marginBottom:8}}><strong>Chrome:</strong> Ajustes → Privacidad y seguridad → Cookies</li>
        <li style={{marginBottom:8}}><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
        <li style={{marginBottom:8}}><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
        <li style={{marginBottom:8}}><strong>Edge:</strong> Configuración → Privacidad → Cookies</li>
      </ul>
      <p style={{marginBottom:24}}>Ten en cuenta que bloquear todas las cookies puede afectar a la funcionalidad del carrito y el proceso de compra.</p>

      <h2 style={{fontSize:20,fontWeight:800,color:'#ff1e41',marginBottom:12}}>6. Más información</h2>
      <p style={{marginBottom:8}}>Para cualquier consulta sobre nuestra política de cookies, puedes contactarnos en <a href="mailto:info@buymuscle.es" style={{color:'#ff1e41'}}>info@buymuscle.es</a>.</p>
      <p style={{color:'#888',fontSize:13}}>Esta política se aplica exclusivamente al dominio buymuscle-tienda.vercel.app y tienda.buymuscle.es.</p>
    </div>
  )
}
