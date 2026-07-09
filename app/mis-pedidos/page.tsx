// @ts-nocheck
'use client'
import { useState } from 'react'
import Link from 'next/link'
const STATUS: any = { pending: '⏳ Pendiente', processing: '📦 Preparando', shipped: '🚚 Enviado', delivered: '✅ Entregado', cancelled: '❌ Cancelado' }

export default function MisPedidos() {
  const [step, setStep] = useState('email')   // 'email' | 'code' | 'orders'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [open, setOpen] = useState(null)

  const cleanEmail = () => email.trim().toLowerCase()

  async function pedirCodigo(e) {
    e.preventDefault(); if (!email) return
    setLoading(true); setMsg('')
    try {
      const r = await fetch('/api/mis-pedidos/request-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ email: cleanEmail() }),
      })
      if (r.status === 429) { setMsg('Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'); setLoading(false); return }
      // Respuesta genérica: no revela si el email tiene pedidos.
      setCode(''); setStep('code')
      setMsg('Si hay pedidos con ese email, te hemos enviado un código de 6 dígitos. Revisa tu bandeja de entrada (y la carpeta de spam).')
    } catch { setMsg('No se pudo enviar el código. Inténtalo de nuevo.') }
    setLoading(false)
  }

  async function verificar(e) {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) { setMsg('Introduce el código de 6 dígitos que te hemos enviado.'); return }
    setLoading(true); setMsg('')
    try {
      const r = await fetch('/api/mis-pedidos/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ email: cleanEmail(), code }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) {
        setMsg(d.error === 'too_many_attempts'
          ? 'Demasiados intentos. Pide un código nuevo.'
          : 'Código incorrecto o caducado. Revísalo o pide uno nuevo.')
        setLoading(false); return
      }
      const ro = await fetch('/api/my-orders', { credentials: 'same-origin' })
      const dd = await ro.json().catch(() => ({}))
      setOrders(dd && dd.ok && Array.isArray(dd.orders) ? dd.orders : [])
      setStep('orders')
    } catch { setMsg('No se pudo verificar. Inténtalo de nuevo.') }
    setLoading(false)
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  const inputStyle: any = { flex: 1, padding: '10px 14px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit' }
  const btnStyle: any = { background: '#ff1e41', color: 'white', border: 'none', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }

  return (
    <div style={{ background: '#f8f8f8', minHeight: '60vh', fontFamily: 'Arial,sans-serif' }}>
      <div style={{ background: '#111', color: 'white', padding: '50px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 10px', textTransform: 'uppercase' }}>Mis Pedidos</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>Consulta el estado de tus pedidos</p>
      </div>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>

        {/* PASO 1 · email */}
        {step === 'email' && (
          <div style={{ background: 'white', padding: 28, border: '1px solid #e8e8e8', marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>Accede con tu email</h3>
            <p style={{ fontSize: 13, color: '#777', margin: '0 0 16px' }}>Por seguridad, te enviaremos un código de un solo uso al email con el que hiciste el pedido.</p>
            <form onSubmit={pedirCodigo} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" aria-label="Email con el que hiciste el pedido" required style={inputStyle} />
              <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Enviando...' : 'Enviarme el código'}</button>
            </form>
          </div>
        )}

        {/* PASO 2 · código */}
        {step === 'code' && (
          <div style={{ background: 'white', padding: 28, border: '1px solid #e8e8e8', marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>Introduce el código</h3>
            <p style={{ fontSize: 13, color: '#777', margin: '0 0 16px' }}>Enviado a <strong>{cleanEmail()}</strong>.</p>
            <form onSubmit={verificar} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input inputMode="numeric" pattern="\d{6}" maxLength={6} value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000" aria-label="Código de 6 dígitos" autoFocus
                style={{ ...inputStyle, letterSpacing: 6, fontWeight: 700, fontSize: 20, textAlign: 'center' }} />
              <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Verificando...' : 'Ver mis pedidos'}</button>
            </form>
            <div style={{ marginTop: 14, fontSize: 13 }}>
              <button onClick={pedirCodigo} disabled={loading} style={{ background: 'none', border: 'none', color: '#ff1e41', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0, textDecoration: 'underline' }}>Reenviar código</button>
              <span style={{ color: '#ccc', margin: '0 8px' }}>·</span>
              <button onClick={() => { setStep('email'); setMsg(''); setCode('') }} style={{ background: 'none', border: 'none', color: '#777', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0, textDecoration: 'underline' }}>Cambiar email</button>
            </div>
          </div>
        )}

        {/* Mensaje info/error */}
        {msg && step !== 'orders' && (
          <div style={{ background: '#fff8e1', border: '1px solid #ffe0a3', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#7a5b00' }}>{msg}</div>
        )}

        {/* PASO 3 · pedidos */}
        {step === 'orders' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#777' }}>Verificado como <strong>{cleanEmail()}</strong></span>
              <button onClick={async () => { try { await fetch('/api/mis-pedidos/logout', { method: 'POST', credentials: 'same-origin' }) } catch {} setStep('email'); setEmail(''); setCode(''); setOrders(null); setMsg('') }} style={{ background: 'none', border: '1px solid #ddd', padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}>Salir</button>
            </div>
            {orders === null ? null
              : orders.length === 0 ? (
                <div style={{ background: 'white', padding: 28, border: '1px solid #e8e8e8', textAlign: 'center', color: '#aaa' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p style={{ margin: 0, fontSize: 14 }}>No encontramos pedidos con ese email.</p>
                </div>
              ) : orders.map(o => (
                <div key={o.id} style={{ background: 'white', border: '1px solid #e8e8e8', marginBottom: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: open === o.id ? '1px solid #f0f0f0' : 'none' }}
                    role="button" tabIndex={0} aria-expanded={open === o.id}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(open === o.id ? null : o.id) } }}
                    onClick={() => setOpen(open === o.id ? null : o.id)}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Pedido #{o.id?.slice(0, 8).toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{fmt(o.created_at)} · {o.order_lines?.length || 0} producto{o.order_lines?.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ff1e41' }}>{Number(o.total || 0).toFixed(2)} €</span>
                      <span style={{ fontSize: 12, padding: '3px 10px', background: '#f5f5f5', borderRadius: 20, color: '#555' }}>{STATUS[o.status] || o.status}</span>
                      <span style={{ color: '#aaa', fontSize: 16 }}>{open === o.id ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {open === o.id && (
                    <div style={{ padding: '16px 20px' }}>
                      {(o.order_lines || []).map((l: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9f9f9', fontSize: 13 }}>
                          <span style={{ color: '#333' }}>{l.product_name} × {l.quantity}</span>
                          <span style={{ fontWeight: 600 }}>{Number(l.line_total ?? l.unit_price * l.quantity).toFixed(2)} €</span>
                        </div>
                      ))}
                      {o.tracking_number && <div style={{ marginTop: 12, padding: '10px', background: '#f9f9f9', fontSize: 12, color: '#666' }}>
                        <p style={{ margin: 0 }}><strong>Seguimiento:</strong> {o.tracking_number}</p>
                      </div>}
                      <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                        <Link href="/tienda" style={{ display: 'inline-block', background: '#111', color: 'white', padding: '8px 16px', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>Volver a comprar →</Link>
                        {o.holded_invoice_id && <a href={'/api/order-invoice?n=' + encodeURIComponent(o.order_number)} target="_blank" rel="noopener"
                          style={{ display: 'inline-block', background: '#ff1e41', color: 'white', padding: '8px 16px', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>⬇ Descargar factura</a>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  )
}
