import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Envíos | BUYMUSCLE',
  description: 'Información sobre plazos, costes y condiciones de envío en BuyMuscle',
}

export default function PoliticaEnvios() {
  return (
    <div style={{maxWidth:860,margin:'0 auto',padding:'48px 24px',fontFamily:'Heebo,sans-serif',color:'#111',lineHeight:1.8}}>
      <h1 style={{fontSize:32,fontWeight:900,marginBottom:8}}>Política de Envíos</h1>
      <p style={{color:'#888',marginBottom:40}}>Última actualización: Enero 2026</p>

      <h2 style={{fontSize:20,fontWeight:800,color:'#ff1e41',marginBottom:12}}>1. Plazos de entrega</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:28}}>
        {[
          {zona:'Península',plazo:'24 – 48h laborables',icon:'🚚'},
          {zona:'Canarias (destino principal)',plazo:'24 – 48h laborables',icon:'🏝️'},
          {zona:'Baleares',plazo:'48 – 72h laborables',icon:'⛵'},
          {zona:'Ceuta y Melilla',plazo:'3 – 5 días laborables',icon:'📦'},
        ].map(z=>(
          <div key={z.zona} style={{border:'1px solid #e8e8e8',borderRadius:8,padding:'16px 20px',display:'flex',gap:12,alignItems:'flex-start'}}>
            <span style={{fontSize:28}}>{z.icon}</span>
            <div>
              <div style={{fontWeight:700,fontSize:15}}>{z.zona}</div>
              <div style={{color:'#555',fontSize:14,marginTop:4}}>{z.plazo}</div>
            </div>
          </div>
        ))}
      </div>
      <p style={{color:'#888',fontSize:13,marginBottom:28}}>Los plazos son orientativos y pueden variar en períodos de alta demanda como rebajas o campañas especiales. El plazo comienza a contar una vez confirmado el pago.</p>

      <h2 style={{fontSize:20,fontWeight:800,color:'#ff1e41',marginBottom:12}}>2. Costes de envío</h2>
      <table style={{width:'100%',borderCollapse:'collapse',marginBottom:28,fontSize:14}}>
        <thead>
          <tr style={{background:'#f5f5f5'}}>
            <th style={{padding:'10px 14px',textAlign:'left',borderBottom:'2px solid #e8e8e8'}}>Importe del pedido</th>
            <th style={{padding:'10px 14px',textAlign:'left',borderBottom:'2px solid #e8e8e8'}}>Coste de envío</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{borderBottom:'1px solid #e8e8e8'}}>
            <td style={{padding:'10px 14px'}}>Menos de 50 €</td>
            <td style={{padding:'10px 14px',fontWeight:700}}>4.90 €</td>
          </tr>
          <tr style={{borderBottom:'1px solid #e8e8e8',background:'#f0fdf4'}}>
            <td style={{padding:'10px 14px'}}>50 € o más</td>
            <td style={{padding:'10px 14px',fontWeight:700,color:'#16a34a'}}>🎉 GRATIS</td>
          </tr>
        </tbody>
      </table>

      <h2 style={{fontSize:20,fontWeight:800,color:'#ff1e41',marginBottom:12}}>3. Seguimiento del pedido</h2>
      <p style={{marginBottom:24}}>Una vez enviado tu pedido, recibirás un email con el número de seguimiento de la transportista. Puedes rastrear tu paquete directamente en la web de la agencia de transporte o a través del apartado <strong>"Mis Pedidos"</strong> de tu cuenta.</p>

      <h2 style={{fontSize:20,fontWeight:800,color:'#ff1e41',marginBottom:12}}>4. Incidencias en el envío</h2>
      <p style={{marginBottom:12}}>Si tu pedido llegó dañado, incompleto o con error, contacta con nosotros en las <strong>48 horas siguientes</strong> a la recepción:</p>
      <ul style={{paddingLeft:24,marginBottom:24,color:'#555'}}>
        <li style={{marginBottom:8}}>Email: <a href="mailto:info@buymuscle.es" style={{color:'#ff1e41'}}>info@buymuscle.es</a></li>
        <li style={{marginBottom:8}}>WhatsApp: <a href="https://wa.me/34828048310" style={{color:'#ff1e41'}}>828 048 310</a></li>
      </ul>
      <p style={{marginBottom:24}}>Adjunta fotos del estado del paquete y el producto para acelerar la resolución. Nos comprometemos a responder en menos de 24h laborables.</p>

      <h2 style={{fontSize:20,fontWeight:800,color:'#ff1e41',marginBottom:12}}>5. Dirección de envío</h2>
      <p style={{marginBottom:24}}>La dirección de envío debe indicarse correctamente durante el proceso de compra. BuyMuscle no se responsabiliza de retrasos o extravíos causados por datos incorrectos facilitados por el cliente. Si necesitas modificar la dirección antes del envío, contáctanos inmediatamente.</p>

      <h2 style={{fontSize:20,fontWeight:800,color:'#ff1e41',marginBottom:12}}>6. Pedidos no entregados</h2>
      <p>Si la transportista no puede entregar el pedido tras varios intentos, el paquete será devuelto a nuestros almacenes. En ese caso, el cliente deberá abonar los gastos de reenvío o recibirá el importe del pedido descontando los gastos de envío originales.</p>
    </div>
  )
}
