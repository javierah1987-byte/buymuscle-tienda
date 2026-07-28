import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Política de Privacidad | BUYMUSCLE',
  description: 'Política de privacidad y protección de datos de BUYMUSCLE (Endorfinate SLU). Responsable, finalidades, bases legales, encargados, plazos y derechos RGPD.',
}

// Estilos compartidos (mismo patrón inline que el resto de páginas legales).
const wrap = { maxWidth: 820, margin: '0 auto', padding: '40px 20px', color: '#111', fontFamily: 'Arial, sans-serif', lineHeight: 1.65 } as const
const sec = { marginBottom: 30 } as const
const h2 = { fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' } as const
const box = { marginTop: 12, padding: '16px 20px', background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: 8 } as const
const ul = { marginTop: 12, paddingLeft: 20, lineHeight: 2 } as const
const th = { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #e5e5e5', fontSize: 13, color: '#555', verticalAlign: 'top' } as const
const td = { padding: '8px 10px', borderBottom: '1px solid #eee', fontSize: 13, verticalAlign: 'top' } as const
// Nota de "pendiente de confirmar por Javier / asesor legal" — visible a propósito en el borrador.
const Confirm = ({ children }: { children: ReactNode }) => (
  <span style={{ display: 'inline-block', background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e', borderRadius: 4, padding: '0 6px', fontSize: 12, fontWeight: 700 }}>⚠️ {children}</span>
)

export default function PoliticaPrivacidad() {
  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Política de Privacidad</h1>
      <p style={{ color: '#888', marginBottom: 20 }}>Última actualización: julio de 2026</p>

      {/* Banner de BORRADOR — quitar cuando el asesor legal valide el texto definitivo. */}
      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 16px', marginBottom: 28, fontSize: 13, color: '#9a3412' }}>
        <strong>Borrador pendiente de validación legal.</strong> Este texto es un borrador técnico redactado conforme a cómo la tienda trata los datos. Debe revisarlo el asesor legal de Endorfinate SLU y confirmarse los datos marcados con <Confirm>a confirmar</Confirm> antes de publicarlo.
      </div>

      {/* 1 · RESPONSABLE */}
      <section style={sec}>
        <h2 style={h2}>1. Responsable del tratamiento</h2>
        <p>El responsable del tratamiento de tus datos personales es la entidad titular de la tienda BUYMUSCLE:</p>
        <div style={box}>
          <ul style={{ paddingLeft: 20, lineHeight: 2, margin: 0 }}>
            <li><strong>Razón social:</strong> ENDORFINATE SLU</li>
            <li><strong>Nombre comercial:</strong> BUYMUSCLE</li>
            <li><strong>CIF:</strong> B76251594 &nbsp;<Confirm>Javier: confirmar CIF y datos registrales</Confirm></li>
            <li><strong>Domicilio:</strong> Alcalde Manuel Amador Rodríguez 23, 35200 Telde, Las Palmas &nbsp;<Confirm>confirmar domicilio social</Confirm></li>
            <li><strong>Email de contacto (privacidad):</strong> tienda@buymuscle.es</li>
            <li><strong>Teléfono:</strong> 828 048 310</li>
          </ul>
        </div>
        <p style={{ marginTop: 10, fontSize: 13, color: '#666' }}>No se ha designado un Delegado de Protección de Datos (DPD) por no ser legalmente exigible para esta actividad. Para cualquier asunto de protección de datos, escribe a <a href="mailto:tienda@buymuscle.es" style={{ color: '#ff1e41' }}>tienda@buymuscle.es</a>.</p>
      </section>

      {/* 2 · DATOS Y ORIGEN */}
      <section style={sec}>
        <h2 style={h2}>2. Qué datos tratamos y de dónde proceden</h2>
        <p>Tratamos únicamente los datos que tú nos facilitas al registrarte, comprar, suscribirte o contactar con nosotros. No obtenemos datos de terceros. Según el caso, tratamos:</p>
        <ul style={ul}>
          <li><strong>Identificación y contacto:</strong> nombre y apellidos, email, teléfono y, para la factura, NIF/CIF.</li>
          <li><strong>Datos de envío y facturación:</strong> dirección postal, población, código postal y provincia.</li>
          <li><strong>Datos de la cuenta:</strong> email y contraseña (almacenada cifrada; nunca en texto claro) e historial de pedidos.</li>
          <li><strong>Datos de pedido y pago:</strong> productos, importes y fecha. El pago con tarjeta/Bizum lo procesa la pasarela bancaria: <strong>la tienda no almacena los datos de tu tarjeta</strong>.</li>
          <li><strong>Datos de distribuidor</strong> (solo cuenta B2B): empresa, CIF y nivel comercial.</li>
          <li><strong>Reseñas de producto</strong> (si las publicas): nombre mostrado, valoración y comentario.</li>
          <li><strong>Datos técnicos y de navegación:</strong> dirección IP, tipo de dispositivo y cookies, según tu configuración de consentimiento (ver apartado 9).</li>
        </ul>
        <p style={{ fontSize: 13, color: '#666' }}>Los campos marcados como obligatorios en cada formulario son imprescindibles para la finalidad indicada (por ejemplo, tramitar tu pedido). Si no los facilitas, no podremos prestarte ese servicio.</p>
      </section>

      {/* 3 · FINALIDADES Y BASES LEGALES */}
      <section style={sec}>
        <h2 style={h2}>3. Para qué usamos tus datos y con qué base legal</h2>
        <p>Tratamos tus datos para finalidades distintas, cada una con su propia base jurídica (art. 6 del RGPD). La gestión de tu cuenta y tus pedidos es independiente del marketing: <strong>solo te enviamos comunicaciones comerciales si nos das tu consentimiento</strong>.</p>
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr><th style={th}>Finalidad</th><th style={th}>Base legal (RGPD)</th></tr>
            </thead>
            <tbody>
              <tr><td style={td}>Crear y gestionar tu cuenta; tramitar, enviar y entregar tus pedidos; gestionar devoluciones y atención al cliente.</td><td style={td}>Ejecución del contrato de compraventa — <strong>art. 6.1.b</strong> (y medidas precontractuales).</td></tr>
              <tr><td style={td}>Emitir facturas y llevar la contabilidad; atender obligaciones fiscales, contables y de consumo.</td><td style={td}>Obligación legal — <strong>art. 6.1.c</strong>.</td></tr>
              <tr><td style={td}>Seguridad de la tienda, prevención del fraude, resolución de incidencias y mejora del servicio.</td><td style={td}>Interés legítimo — <strong>art. 6.1.f</strong>.</td></tr>
              <tr><td style={td}>Enviarte comunicaciones comerciales y la newsletter de ofertas (email).</td><td style={td}>Consentimiento — <strong>art. 6.1.a</strong> (revocable en cualquier momento).</td></tr>
              <tr><td style={td}>Cookies analíticas y de marketing (ver apartado 9).</td><td style={td}>Consentimiento — <strong>art. 6.1.a</strong>, prestado en el banner de cookies.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4 · ENCARGADOS / DESTINATARIOS */}
      <section style={sec}>
        <h2 style={h2}>4. Quién accede a tus datos (encargados del tratamiento)</h2>
        <p>No vendemos ni cedemos tus datos. Solo los comparten, por cuenta de Endorfinate SLU y con contrato de encargado (art. 28 RGPD), los proveedores estrictamente necesarios para prestar el servicio:</p>
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr><th style={th}>Proveedor</th><th style={th}>Para qué</th><th style={th}>Ubicación de los datos</th></tr>
            </thead>
            <tbody>
              <tr><td style={td}><strong>Supabase</strong> (base de datos y autenticación)</td><td style={td}>Alojar cuentas, pedidos y datos de cliente</td><td style={td}>Unión Europea — servidores en <strong>París (Francia)</strong>. Sin transferencia internacional del dato alojado.</td></tr>
              <tr><td style={td}><strong>Vercel</strong> (alojamiento web)</td><td style={td}>Servir la web y registros técnicos</td><td style={td}>EE. UU. (Vercel Inc.) — con garantías (cláusulas contractuales tipo).</td></tr>
              <tr><td style={td}><strong>Holded</strong> (facturación)</td><td style={td}>Emitir y conservar facturas</td><td style={td}>España / UE.</td></tr>
              <tr><td style={td}><strong>Resend</strong> (envío de emails)</td><td style={td}>Confirmaciones de pedido y newsletter</td><td style={td}>EE. UU. (Resend Inc.) — con garantías (cláusulas contractuales tipo).</td></tr>
              <tr><td style={td}><strong>Redsys</strong> (pasarela de pago)</td><td style={td}>Procesar pagos con tarjeta y Bizum</td><td style={td}>España / UE. Redsys y tu entidad bancaria son responsables de los datos de pago.</td></tr>
              <tr><td style={td}><strong>Empresa de transporte</strong> <Confirm>Javier: indicar transportista/s</Confirm></td><td style={td}>Entregar tu pedido en tu dirección</td><td style={td}>Según el transportista (normalmente UE).</td></tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 10, fontSize: 13, color: '#666' }}>También pueden acceder las autoridades públicas cuando exista obligación legal. <Confirm>Si se reactiva el pago con PayPal (hoy desactivado), añadir PayPal como encargado (EE. UU./Luxemburgo) con su transferencia.</Confirm></p>
      </section>

      {/* 5 · TRANSFERENCIAS INTERNACIONALES */}
      <section style={sec}>
        <h2 style={h2}>5. Transferencias internacionales</h2>
        <p>La base de datos con tus cuentas y pedidos se aloja <strong>dentro de la Unión Europea</strong> (Francia). Algunos proveedores de servicio (por ejemplo, el alojamiento web y el envío de emails) están en <strong>Estados Unidos</strong>; en esos casos la transferencia se ampara en las <strong>Cláusulas Contractuales Tipo</strong> aprobadas por la Comisión Europea y en las garantías adicionales que ofrece cada proveedor. Puedes solicitarnos información sobre estas garantías en <a href="mailto:tienda@buymuscle.es" style={{ color: '#ff1e41' }}>tienda@buymuscle.es</a>.</p>
      </section>

      {/* 6 · CONSERVACIÓN */}
      <section style={sec}>
        <h2 style={h2}>6. Cuánto tiempo conservamos tus datos</h2>
        <ul style={ul}>
          <li><strong>Cuenta:</strong> mientras la mantengas activa. Si la eliminas, suprimimos tus datos, salvo los que debamos conservar por obligación legal.</li>
          <li><strong>Pedidos y facturación:</strong> durante los plazos legales — hasta <strong>6 años</strong> la documentación contable (art. 30 del Código de Comercio) y <strong>4 años</strong> a efectos tributarios. <Confirm>plazos exactos a confirmar por el asesor</Confirm></li>
          <li><strong>Marketing:</strong> hasta que retires tu consentimiento o te des de baja.</li>
          <li><strong>Cookies:</strong> según la duración de cada cookie (detallada en la Política de Cookies).</li>
          <li><strong>Reclamaciones:</strong> durante el plazo de prescripción de las acciones legales que correspondan.</li>
        </ul>
      </section>

      {/* 7 · DERECHOS */}
      <section style={sec}>
        <h2 style={h2}>7. Tus derechos</h2>
        <p>Puedes ejercer en cualquier momento los siguientes derechos sobre tus datos:</p>
        <ul style={ul}>
          <li><strong>Acceso:</strong> saber qué datos tuyos tratamos.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li><strong>Supresión</strong> («derecho al olvido»): que eliminemos tus datos cuando ya no sean necesarios.</li>
          <li><strong>Oposición:</strong> oponerte a un tratamiento basado en nuestro interés legítimo.</li>
          <li><strong>Limitación:</strong> pedir que suspendamos el tratamiento en determinados supuestos.</li>
          <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso común, o que los enviemos a otro responsable.</li>
          <li><strong>Retirar el consentimiento</strong> en cualquier momento (por ejemplo, para el marketing), sin que afecte a la licitud del tratamiento previo.</li>
        </ul>
        <p style={{ marginTop: 12 }}>Para ejercerlos, escríbenos a <a href="mailto:tienda@buymuscle.es" style={{ color: '#ff1e41' }}>tienda@buymuscle.es</a> con el asunto «Protección de datos». Podremos pedirte que acredites tu identidad. Responderemos en el plazo máximo de un mes.</p>
        <p>Si consideras que no hemos atendido correctamente tus derechos, puedes reclamar ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>: <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: '#ff1e41' }}>www.aepd.es</a> — C/ Jorge Juan, 6, 28001 Madrid.</p>
      </section>

      {/* 8 · MARKETING / CONSENTIMIENTO */}
      <section style={sec}>
        <h2 style={h2}>8. Comunicaciones comerciales</h2>
        <p>Solo te enviaremos comunicaciones comerciales (como la newsletter de ofertas) si nos has dado tu consentimiento de forma expresa. Puedes retirarlo cuando quieras: desde el enlace de «baja» que incluye cada correo o escribiendo a <a href="mailto:tienda@buymuscle.es" style={{ color: '#ff1e41' }}>tienda@buymuscle.es</a>. Darte de baja del marketing no afecta a los correos necesarios para gestionar tus pedidos.</p>
      </section>

      {/* 9 · COOKIES */}
      <section style={sec}>
        <h2 style={h2}>9. Cookies</h2>
        <p>Usamos cookies técnicas (necesarias para el funcionamiento de la tienda y el carrito) y, solo si las aceptas, cookies analíticas y de marketing. Las cookies no técnicas están <strong>desactivadas por defecto</strong>: puedes aceptarlas, rechazarlas o configurarlas en el banner de cookies, y cambiar tu decisión cuando quieras. Tienes el detalle en la <a href="/politica-cookies" style={{ color: '#ff1e41' }}>Política de Cookies</a>.</p>
      </section>

      {/* 10 · MENORES */}
      <section style={sec}>
        <h2 style={h2}>10. Menores de edad</h2>
        <p>La tienda no está dirigida a menores y no recabamos conscientemente datos de personas menores de 14 años. Si detectamos que un menor nos ha facilitado datos sin el consentimiento de sus progenitores o tutores, los eliminaremos.</p>
      </section>

      {/* 11 · DECISIONES AUTOMATIZADAS */}
      <section style={sec}>
        <h2 style={h2}>11. Decisiones automatizadas</h2>
        <p>No tomamos decisiones automatizadas ni elaboramos perfiles con efectos jurídicos o significativos sobre ti.</p>
      </section>

      {/* 12 · SEGURIDAD */}
      <section style={sec}>
        <h2 style={h2}>12. Seguridad de tus datos</h2>
        <p>Aplicamos medidas técnicas y organizativas para proteger tus datos: cifrado del tráfico (HTTPS), contraseñas almacenadas cifradas, control de acceso por roles y aislamiento de los datos de cada cliente en la base de datos. Ningún sistema es infalible, pero trabajamos para mantener un nivel de seguridad adecuado al riesgo.</p>
      </section>

      {/* 13 · CAMBIOS */}
      <section style={sec}>
        <h2 style={h2}>13. Cambios en esta política</h2>
        <p>Podemos actualizar esta política para adaptarla a cambios legales o del servicio. Publicaremos la versión vigente en esta página con su fecha de actualización.</p>
      </section>

      {/* 14 · CONTACTO */}
      <section style={sec}>
        <h2 style={h2}>14. Contacto</h2>
        <p>Para cualquier duda sobre esta política o sobre el tratamiento de tus datos: <a href="mailto:tienda@buymuscle.es" style={{ color: '#ff1e41' }}>tienda@buymuscle.es</a>.</p>
      </section>
    </div>
  )
}
