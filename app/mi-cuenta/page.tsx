// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
const S = 'https://awwlbepjxuoxaigztugh.supabase.co'
const K = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const h = { apikey: K, 'Authorization': 'Bearer ' + K }
const STAT = { pending: '⏳ Pendiente', processing: '📦 Preparando', shipped: '🚚 Enviado', delivered: '✅ Entregado', cancelled: '❌ Cancelado' }
export default function MiCuenta() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('login') // 'login' | 'code' | 'dashboard'
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [points, setPoints] = useState(0)
  const [msg, setMsg] = useState('')
  const [booting, setBooting] = useState(true)

  // Al entrar, intenta reanudar una sesión verificada viva (cookie httpOnly, 30 min).
  useEffect(() => { (async () => { await loadData(); setBooting(false) })() }, [])

  // Carga los datos SOLO si hay sesión verificada (my-orders confía en la cookie).
  async function loadData() {
    setLoading(true)
    try {
      const r = await fetch('/api/my-orders', { credentials: 'same-origin' })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) { setLoading(false); return false }
      const ve = d.email || email
      setEmail(ve)
      const ords = Array.isArray(d.orders) ? d.orders : []
      setOrders(ords)
      setPoints(ords.filter(o => o.status === 'delivered').reduce((s, o) => s + Math.floor(Number(o.total || 0)), 0))
      try {
        const rv = await fetch(S + '/rest/v1/product_reviews?select=id,product_id,name,rating,comment,created_at&email=eq.' + encodeURIComponent(ve) + '&order=created_at.desc', { headers: h })
        const revs = await rv.json(); setReviews(Array.isArray(revs) ? revs : [])
      } catch { setReviews([]) }
      setStep('dashboard'); setLoading(false); return true
    } catch { setLoading(false); return false }
  }

  async function pedirCodigo() {
    if (!email.includes('@')) { setMsg('Introduce un email válido'); return }
    setLoading(true); setMsg('')
    try {
      const r = await fetch('/api/mis-pedidos/request-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      if (r.status === 429) { setMsg('Demasiados intentos. Espera unos minutos.'); setLoading(false); return }
      setCode(''); setStep('code'); setMsg('Si hay pedidos con ese email, te hemos enviado un código de 6 dígitos. Revisa tu bandeja (y spam).')
    } catch { setMsg('No se pudo enviar el código. Inténtalo de nuevo.') }
    setLoading(false)
  }

  async function verificar() {
    if (!/^\d{6}$/.test(code)) { setMsg('Introduce el código de 6 dígitos.'); return }
    setLoading(true); setMsg('')
    try {
      const r = await fetch('/api/mis-pedidos/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) {
        setMsg(d.error === 'too_many_attempts' ? 'Demasiados intentos. Pide un código nuevo.' : 'Código incorrecto o caducado.')
        setLoading(false); return
      }
      await loadData()
    } catch { setMsg('No se pudo verificar. Inténtalo de nuevo.') }
    setLoading(false)
  }

  async function logout() {
    try { await fetch('/api/mis-pedidos/logout', { method: 'POST', credentials: 'same-origin' }) } catch {}
    setEmail(''); setCode(''); setOrders([]); setReviews([]); setPoints(0); setMsg(''); setStep('login')
  }

  const fmt = d => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  // Mientras comprobamos si hay sesión viva (cookie), evita el flash del formulario.
  if (booting) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial,sans-serif', background: '#f5f5f5', color: '#aaa' }}>Cargando...</div>
  )

  // ── LOGIN / CÓDIGO ────────────────────────────────────────
  if (step === 'login' || step === 'code') return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial,sans-serif', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'white', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ fontSize: 28, fontWeight: 900, fontStyle: 'italic', color: '#ff1e41', textDecoration: 'none' }}>BUYMUSCLE</Link>
          <p style={{ margin: '8px 0 0', color: '#888', fontSize: 14 }}>Accede con tu email para ver tus pedidos</p>
        </div>
        {msg && <div style={{ background: '#fff8e1', border: '1px solid #ffe0a3', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#7a5b00' }}>{msg}</div>}

        {step === 'login' ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && pedirCodigo()}
                placeholder="tu@email.com" type="email" aria-label="Email"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Arial', boxSizing: 'border-box' }} />
            </div>
            <button onClick={pedirCodigo} disabled={loading}
              style={{ width: '100%', background: '#ff1e41', color: 'white', border: 'none', padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial' }}>
              {loading ? 'Enviando...' : 'Enviarme el código'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#888' }}>Sin contraseña. Te enviamos un código de un solo uso al email con el que compraste.</p>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Código enviado a {email}</label>
              <input inputMode="numeric" pattern="\d{6}" maxLength={6} value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && verificar()} placeholder="000000" aria-label="Código de 6 dígitos" autoFocus
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', fontSize: 20, fontFamily: 'Arial', boxSizing: 'border-box', letterSpacing: 6, fontWeight: 700, textAlign: 'center' }} />
            </div>
            <button onClick={verificar} disabled={loading}
              style={{ width: '100%', background: '#ff1e41', color: 'white', border: 'none', padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial' }}>
              {loading ? 'Verificando...' : 'Ver mis pedidos'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
              <button onClick={pedirCodigo} disabled={loading} style={{ background: 'none', border: 'none', color: '#ff1e41', cursor: 'pointer', fontFamily: 'Arial', fontSize: 13, textDecoration: 'underline' }}>Reenviar código</button>
              <span style={{ color: '#ccc', margin: '0 8px' }}>·</span>
              <button onClick={() => { setStep('login'); setMsg(''); setCode('') }} style={{ background: 'none', border: 'none', color: '#777', cursor: 'pointer', fontFamily: 'Arial', fontSize: 13, textDecoration: 'underline' }}>Cambiar email</button>
            </div>
          </>
        )}

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #eee', textAlign: 'center' }}>
          <Link href="/distribuidores/login" style={{ color: '#ff1e41', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>¿Eres distribuidor? Accede aquí →</Link>
        </div>
      </div>
    </div>
  )

  // ── DASHBOARD ─────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'Arial,sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ background: '#111', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, fontStyle: 'italic', color: '#ff1e41', textDecoration: 'none' }}>BUYMUSCLE</Link>
          <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 16, fontSize: 14 }}>Mi cuenta</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{email}</span>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Arial' }}>Salir</button>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { icon: '📦', label: 'Pedidos', val: orders.length },
            { icon: '✅', label: 'Entregados', val: orders.filter(o => o.status === 'delivered').length },
            { icon: '🎁', label: 'Puntos acumulados', val: points + ' pts' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div><div style={{ fontSize: 22, fontWeight: 900, color: '#ff1e41' }}>{s.val}</div><div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div></div>
            </div>
          ))}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#ff1e41,#c41230)', padding: '20px 24px', marginBottom: 24, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontSize: 16, fontWeight: 700 }}>🎁 Programa de fidelización</div><div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Acumulas 1 punto por cada euro en pedidos entregados. Canjea 100 pts = 1€ de descuento.</div></div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}><div style={{ fontSize: 32, fontWeight: 900 }}>{points}</div><div style={{ fontSize: 11, opacity: 0.8 }}>PUNTOS</div></div>
        </div>
        <div style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', fontWeight: 700, fontSize: 16 }}>Mis pedidos</div>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>Cargando...</div>
            : orders.length === 0 ? <div style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: '#aaa', marginBottom: 16 }}>Aún no tienes pedidos con este email.</p>
              <Link href="/tienda" style={{ color: '#ff1e41', fontWeight: 700, textDecoration: 'none', padding: '10px 24px', border: '2px solid #ff1e41', display: 'inline-block' }}>Ir a la tienda</Link>
            </div>
              : orders.map(o => (
                <div key={o.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#ff1e41', fontSize: 15 }}>{o.order_number}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{o.created_at ? fmt(o.created_at) : ''} &middot; {o.payment_method || 'Tarjeta'}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}><span style={{ fontSize: 13, padding: '4px 10px', background: '#f5f5f5', borderRadius: 20 }}>{STAT[o.status] || o.status}</span></div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{Number(o.total || 0).toFixed(2)} €</div>
                  <Link href={'/pedido-confirmado?n=' + o.order_number} style={{ color: '#ff1e41', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>Ver detalles →</Link>
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}
