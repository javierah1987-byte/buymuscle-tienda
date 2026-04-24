import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso Legal | BUYMUSCLE',
  description: 'Aviso legal y términos de uso de BUYMUSCLE tienda online de suplementación deportiva.',
}

export default function AvisoLegal() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', color: '#111', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Aviso Legal</h1>
      <p style={{ color: '#888', marginBottom: 32 }}>Última actualización: Enero 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>1. Datos identificativos</h2>
        <p>En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, del 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, a continuación se reflejan los siguientes datos:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20, lineHeight: 2 }}>
          <li><strong>Empresa:</strong> BuyMuscle</li>
          <li><strong>Domicilio:</strong> Gran Canaria, España</li>
          <li><strong>Email:</strong> info@buymuscle.es</li>
          <li><strong>Teléfono:</strong> +34 828 048 310</li>
          <li><strong>Actividad:</strong> Venta online de suplementación deportiva</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>2. Objeto</h2>
        <p>BuyMuscle pone a disposición del usuario el presente sitio web con el objeto de facilitar al público en general el acceso a información sobre sus productos y servicios, así como la compra online de suplementación deportiva.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>3. Condiciones de uso</h2>
        <p>El acceso y/o uso de este portal de BuyMuscle atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente de las Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>4. Propiedad intelectual e industrial</h2>
        <p>BuyMuscle por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.).</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>5. Responsabilidad</h2>
        <p>BuyMuscle queda exonerada de cualquier tipo de responsabilidad derivada de la información publicada en su página web siempre que esta información haya sido manipulada o introducida por un tercero ajeno a la misma.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#ff1e41' }}>6. Legislación aplicable</h2>
        <p>La relación entre BuyMuscle y el USUARIO se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de Las Palmas de Gran Canaria.</p>
      </section>
    </div>
  )
}
