// @ts-nocheck
'use client'
// Cuenta de PARTICULAR: registro + login estándar con Supabase Auth (email + contraseña),
// usando el MISMO cliente que useAuth (lib/supabase, sesión en localStorage). Zona cliente:
// sus pedidos vía RLS (orders.customer_email = jwt.email → el usuario solo ve los suyos).
// NOTA: los pedidos se muestran para el email con el que se registra (debe coincidir con el
// email de compra). La verificación de email depende del setting "Confirm email" de Supabase
// (si está ON, signUp manda un correo de confirmación; el flujo lo contempla).
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const STAT = { pending: '⏳ Pendiente', paid: '💳 Pagado', processing: '📦 Preparando', shipped: '🚚 Enviado', completed: '✅ Completado', delivered: '✅ Entregado', cancelled: '❌ Cancelado' }
const inputSt = { width: '100%', padding: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', marginTop: 6 }

export default function CuentaPage() {
  const [session, setSession] = useState(null)
  const [booting, setBooting] = useState(true)
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setBooting(false); if (data.session) loadOrders() })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); if (s) loadOrders() })
    return () => { try { sub.subscription.unsubscribe() } catch {} }
  }, [])

  async function loadOrders() {
    // RLS filtra a orders del email del usuario. Sin JOINs pesados.
    const { data } = await supabase.from('orders')
      .select('id,order_number,total,status,payment_method,created_at,holded_invoice_id')
      .order('created_at', { ascending: false }).limit(100)
    setOrders(Array.isArray(data) ? data : [])
  }

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true); setErr(''); setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pass })
    if (error) setErr('Email o contraseña incorrectos. Si acabas de registrarte, confirma antes el email.')
    setLoading(false)
  }
  async function handleRegister(e) {
    e.preventDefault(); setLoading(true); setErr(''); setMsg('')
    if (pass.length < 6) { setErr('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(), password: pass,
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + '/cuenta' : undefined },
    })
    if (error) { setErr(error.message || 'No se pudo crear la cuenta.'); setLoading(false); return }
    if (data.session) setMsg('¡Cuenta creada! Ya estás dentro.') // "Confirm email" OFF
    else { setMode('login'); setMsg('Cuenta creada. Te hemos enviado un email para confirmarla — ábrelo (revisa spam) y luego entra aquí.') } // "Confirm email" ON
    setLoading(false)
  }
  async function logout() { await supabase.auth.signOut(); setSession(null); setOrders([]); setMsg(''); setEmail(''); setPass('') }

  const fmt = (d) => { try { return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return '' } }

  if (booting) return <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#aaa' }}>Cargando…</div>

  // ── ZONA CLIENTE (logueado) ──────────────────────────────
  if (session) {
    const uEmail = session.user?.email || email
    return (
      <div style={{ background: '#f5f5f5', minHeight: '80vh' }}>
        <div style={{ background: '#111', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div><Link href="/" style={{ fontSize: 20, fontWeight: 900, fontStyle: 'italic', color: '#ff1e41', textDecoration: 'none' }}>BUYMUSCLE</Link><span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 14, fontSize: 14 }}>Mi cuenta</span></div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{uEmail}</span>
            <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Salir</button>
          </div>
        </div>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 4px' }}>Mis pedidos</h1>
          <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>Pedidos hechos con <strong>{uEmail}</strong>.</p>
          <div style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {orders.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ color: '#aaa', marginBottom: 16 }}>Aún no hay pedidos con este email.</p>
                <Link href="/tienda" style={{ color: '#ff1e41', fontWeight: 700, textDecoration: 'none', padding: '10px 24px', border: '2px solid #ff1e41', display: 'inline-block' }}>Ir a la tienda</Link>
              </div>
            ) : orders.map((o) => (
              <div key={o.id} style={{ padding: '15px 22px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#ff1e41', fontSize: 14 }}>{o.order_number}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{fmt(o.created_at)} · {o.payment_method || 'Tarjeta'}</div>
                </div>
                <span style={{ fontSize: 12, padding: '4px 10px', background: '#f5f5f5', borderRadius: 20 }}>{STAT[o.status] || o.status}</span>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{Number(o.total || 0).toFixed(2)} €</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link href={'/pedido-confirmado?n=' + o.order_number} style={{ color: '#ff1e41', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>Detalle →</Link>
                  {o.holded_invoice_id && <a href={'/api/order-invoice?n=' + o.order_number} target="_blank" rel="noopener noreferrer" style={{ color: '#555', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>Factura</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── LOGIN / REGISTRO ─────────────────────────────────────
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'white', padding: '38px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <Link href="/" style={{ fontSize: 26, fontWeight: 900, fontStyle: 'italic', color: '#ff1e41', textDecoration: 'none' }}>BUYMUSCLE</Link>
          <p style={{ margin: '8px 0 0', color: '#888', fontSize: 14 }}>{mode === 'login' ? 'Entra en tu cuenta' : 'Crea tu cuenta'}</p>
        </div>
        <div style={{ display: 'flex', marginBottom: 20, border: '1px solid #eee', borderRadius: 4, overflow: 'hidden' }}>
          {[['login', 'Entrar'], ['register', 'Crear cuenta']].map(([m, l]) => (
            <button key={m} onClick={() => { setMode(m); setErr(''); setMsg('') }} style={{ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, background: mode === m ? '#ff1e41' : 'white', color: mode === m ? 'white' : '#888' }}>{l}</button>
          ))}
        </div>
        {msg && <div style={{ background: '#e7f6ec', border: '1px solid #b6e0c4', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#1a7a3d' }}>{msg}</div>}
        {err && <div style={{ background: '#fdeaea', border: '1px solid #f5c2c2', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#b91c1c' }}>{err}</div>}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" autoComplete="email" style={inputSt} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contraseña</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} required placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} style={inputSt} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#999' : '#ff1e41', color: 'white', border: 'none', padding: '13px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
        <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid #eee', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/mi-cuenta" style={{ color: '#888', fontSize: 13, textDecoration: 'none' }}>¿Compraste sin cuenta? Ver pedidos con un código →</Link>
          <Link href="/distribuidores/login" style={{ color: '#ff1e41', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>¿Eres distribuidor? Accede aquí →</Link>
        </div>
      </div>
    </div>
  )
}
