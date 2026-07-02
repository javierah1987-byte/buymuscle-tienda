import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacta con BuyMuscle: teléfono, WhatsApp, email y dirección de nuestra tienda de suplementación deportiva en Telde, Gran Canaria.',
  alternates: { canonical: SITE_URL + '/contacto' },
  openGraph: { title: 'Contacto | BuyMuscle', description: 'Estamos para ayudarte. Teléfono, WhatsApp y email de BuyMuscle.', url: SITE_URL + '/contacto', type: 'website' },
}

const CARD = { background:'#fff', border:'1px solid #eee', borderRadius:12, padding:'22px 24px', textDecoration:'none', color:'#111', display:'block', transition:'box-shadow .2s' }

export default function ContactoPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px 72px' }}>
      <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#111', margin: '0 0 10px' }}>Contacto</h1>
      <p style={{ fontSize: 16, color: '#666', maxWidth: 620, margin: '0 0 36px', lineHeight: 1.6 }}>
        ¿Dudas con un pedido o con un producto? Estamos a un mensaje. Te respondemos rápido en horario comercial.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
        <a href="https://wa.me/34828048310?text=Hola%2C%20tengo%20una%20consulta" target="_blank" rel="noopener" style={CARD}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>WhatsApp</div>
          <div style={{ color: '#ff1e41', fontWeight: 700 }}>+34 828 048 310</div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>La vía más rápida</div>
        </a>
        <a href="tel:+34828048310" style={CARD}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📞</div>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>Teléfono</div>
          <div style={{ color: '#ff1e41', fontWeight: 700 }}>828 048 310</div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Lun–Vie, horario comercial</div>
        </a>
        <a href="mailto:tienda@buymuscle.es" style={CARD}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✉️</div>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>Email</div>
          <div style={{ color: '#ff1e41', fontWeight: 700 }}>tienda@buymuscle.es</div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Para consultas y pedidos</div>
        </a>
      </div>

      <div style={{ marginTop: 28, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '24px 26px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: 8 }}>📍 Dónde estamos</div>
        <div style={{ fontSize: 16, color: '#111', fontWeight: 600 }}>Alcalde Manuel Amador Rodríguez 23</div>
        <div style={{ fontSize: 15, color: '#666' }}>35200 Telde · Las Palmas de Gran Canaria</div>
        <a href="https://www.google.com/maps/search/?api=1&query=Alcalde+Manuel+Amador+Rodriguez+23+Telde" target="_blank" rel="noopener" style={{ display: 'inline-block', marginTop: 12, color: '#ff1e41', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Ver en Google Maps →</a>
      </div>

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Link href="/tienda" style={{ display: 'inline-block', background: '#ff1e41', color: '#fff', padding: '13px 32px', borderRadius: 6, fontWeight: 700, textDecoration: 'none' }}>Ir a la tienda →</Link>
      </div>
    </div>
  )
}
