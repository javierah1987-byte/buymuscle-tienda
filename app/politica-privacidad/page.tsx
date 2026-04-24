import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad | BUYMUSCLE',
  description: 'Política de privacidad y protección de datos de BUYMUSCLE.',
}

export default function PoliticaPrivacidad() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', color: '#111', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Política de Privacidad</h1>
      <p style={{ color: '#888', marginBottom: 32 }}>Última actualización: Enero 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>1. Responsable del tratamiento</h2>
        <p>BuyMuscle, con domicilio en Gran Canaria, España. Email de contacto: info@buymuscle.es</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>2. Datos que recopilamos</h2>
        <p>Recopilamos los siguientes datos personales cuando realizas una compra o te registras:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20, lineHeight: 2 }}>
          <li>Nombre y apellidos</li>
          <li>Dirección de envío y facturación</li>
          <li>Correo electrónico</li>
          <li>Número de teléfono (opcional)</li>
          <li>Datos de pago (procesados de forma segura, no almacenamos datos de tarjeta)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>3. Finalidad del tratamiento</h2>
        <p>Utilizamos tus datos para:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20, lineHeight: 2 }}>
          <li>Gestionar y completar tu pedido</li>
          <li>Enviarte confirmaciones y actualizaciones de tu pedido</li>
          <li>Gestionar devoluciones y reclamaciones</li>
          <li>Enviarte comunicaciones comerciales (solo si has dado tu consentimiento)</li>
          <li>Cumplir con nuestras obligaciones legales</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>4. Base legal</h2>
        <p>El tratamiento de tus datos se basa en la ejecución del contrato de compraventa, el cumplimiento de obligaciones legales, y tu consentimiento para comunicaciones comerciales.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>5. Conservación de datos</h2>
        <p>Conservamos tus datos durante el tiempo necesario para la gestión de tu cuenta y pedidos, y posteriormente durante los plazos legalmente exigidos (hasta 6 años para datos contables y fiscales).</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>6. Tus derechos</h2>
        <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, portabilidad y limitación del tratamiento enviando un email a info@buymuscle.es con asunto "Protección de datos".</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>7. Cookies</h2>
        <p>Utilizamos cookies propias y de terceros. Consulta nuestra <a href="/politica-cookies" style={{ color: '#ff1e41' }}>Política de Cookies</a> para más información.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>8. Contacto</h2>
        <p>Para cualquier consulta sobre privacidad: <a href="mailto:info@buymuscle.es" style={{ color: '#ff1e41' }}>info@buymuscle.es</a></p>
      </section>
    </div>
  )
}
