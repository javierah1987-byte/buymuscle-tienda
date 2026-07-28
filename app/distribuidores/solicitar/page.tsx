// @ts-nocheck
'use client'
import { useState } from 'react'
import Link from 'next/link'

const inputSt = { width: '100%', padding: '11px 13px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', marginTop: 6, borderRadius: 4 }
const labelSt = { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600 }

export default function SolicitarDistribuidor() {
  const [f, setF] = useState({ company_name: '', nif: '', contact_name: '', email: '', phone: '', business_type: '', message: '' })
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!f.company_name.trim() || !f.email.includes('@')) { setErr('Indica al menos el nombre del negocio y un email válido.'); return }
    setSending(true); setErr('')
    try {
      const r = await fetch('/api/distributor-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) { setErr('No se pudo enviar la solicitud. Inténtalo de nuevo en un momento.'); setSending(false); return }
      setDone(true)
    } catch { setErr('Error de conexión. Inténtalo de nuevo.'); setSending(false) }
  }

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: 22, fontWeight: 900, fontStyle: 'italic', color: '#ff1e41', textDecoration: 'none' }}>BUYMUSCLE</Link>
        <Link href="/distribuidores/login" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textDecoration: 'none' }}>← Ya tengo cuenta</Link>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          {done ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem', textAlign: 'center', borderRadius: 8 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: '0 0 10px' }}>Solicitud enviada</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                Gracias, <strong style={{ color: 'white' }}>{f.company_name}</strong>. Revisaremos tu solicitud y te contactaremos en <strong style={{ color: 'white' }}>{f.email}</strong> para darte de alta como distribuidor.
              </p>
              <Link href="/" style={{ display: 'inline-block', marginTop: 20, color: '#ff1e41', fontWeight: 700, textDecoration: 'none' }}>← Volver a la tienda</Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>🏢</div>
                <h1 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', color: 'white', margin: '0 0 6px' }}>Solicitar acceso distribuidor</h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Rellena los datos de tu negocio. Te damos de alta y accedes a precios exclusivos.</p>
              </div>
              <form onSubmit={submit} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.75rem', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label style={labelSt}>Nombre del negocio *</label><input value={f.company_name} onChange={set('company_name')} required style={inputSt} placeholder="Mi Tienda / Gimnasio SL" /></div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 160 }}><label style={labelSt}>NIF / CIF</label><input value={f.nif} onChange={set('nif')} style={inputSt} placeholder="B12345678" /></div>
                  <div style={{ flex: 1, minWidth: 160 }}><label style={labelSt}>Persona de contacto</label><input value={f.contact_name} onChange={set('contact_name')} style={inputSt} placeholder="Nombre y apellidos" /></div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 160 }}><label style={labelSt}>Email *</label><input type="email" value={f.email} onChange={set('email')} required style={inputSt} placeholder="tu@empresa.com" /></div>
                  <div style={{ flex: 1, minWidth: 160 }}><label style={labelSt}>Teléfono</label><input value={f.phone} onChange={set('phone')} style={inputSt} placeholder="600 000 000" /></div>
                </div>
                <div><label style={labelSt}>Tipo de negocio</label>
                  <select value={f.business_type} onChange={set('business_type')} style={{ ...inputSt, cursor: 'pointer' }}>
                    <option value="">— Selecciona —</option>
                    <option>Tienda física de suplementación</option>
                    <option>Gimnasio / Centro deportivo</option>
                    <option>Tienda online / e-commerce</option>
                    <option>Distribuidor / mayorista</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div><label style={labelSt}>Mensaje (opcional)</label><textarea value={f.message} onChange={set('message')} rows={3} style={{ ...inputSt, resize: 'vertical' }} placeholder="Cuéntanos sobre tu negocio, volumen estimado, etc." /></div>
                {err && <div style={{ background: 'rgba(255,30,65,0.1)', border: '1px solid rgba(255,30,65,0.3)', padding: '10px 14px', fontSize: 13, color: '#ff6b6b', borderRadius: 4 }}>{err}</div>}
                <button type="submit" disabled={sending} style={{ width: '100%', padding: '13px', background: sending ? '#666' : '#ff1e41', color: 'white', border: 'none', fontSize: 15, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', borderRadius: 4, fontFamily: 'inherit' }}>
                  {sending ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
