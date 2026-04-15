'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginDistribuidoresPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login'|'reset'>('login')
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos. Verifica tus credenciales.')
      setLoading(false)
    } else {
      router.push('/tienda')
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/distribuidores/nueva-password`
    })
    if (error) setError('No se pudo enviar el email. Verifica la dirección.')
    else setResetSent(true)
    setLoading(false)
  }

  return (
    <div style={{background:'var(--black)', minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      {/* Top bar */}
      <div style={{padding:'1.5rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <Link href="/" className="nav-logo">BUYMUSCLE</Link>
        <Link href="/distribuidores" style={{fontSize:13, color:'rgba(255,255,255,0.4)', fontWeight:600}}>
          ← Info distribuidores
        </Link>
      </div>

      {/* Main */}
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem'}}>
        <div style={{width:'100%', maxWidth:420}}>
          {/* Logo area */}
          <div style={{textAlign:'center', marginBottom:'2.5rem'}}>
            <div style={{fontSize:48, marginBottom:'0.75rem'}}>🔐</div>
            <h1 style={{fontSize:26, fontWeight:900, textTransform:'uppercase', color:'white', marginBottom:'0.5rem'}}>
              {mode==='login' ? 'Portal Distribuidores' : 'Recuperar contraseña'}
            </h1>
            <p style={{fontSize:14, color:'rgba(255,255,255,0.4)'}}>
              {mode==='login'
                ? 'Accede con tus credenciales para ver precios exclusivos'
                : 'Te enviaremos un email para restablecer tu contraseña'}
            </p>
          </div>

          {/* Card */}
          <div style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', padding:'2rem'}}>
            {/* Nivel badges */}
            {mode==='login' && (
              <div style={{display:'flex', gap:'0.5rem', justifyContent:'center', marginBottom:'1.5rem'}}>
                {[{c:'#cd7f32',l:'Bronze -10%'},{c:'#a8a9ad',l:'Silver -15%'},{c:'#ffd700',l:'Gold -20%'}].map(n => (
                  <span key={n.l} style={{fontSize:11, fontWeight:700, padding:'3px 10px', border:`1px solid ${n.c}50`, color:n.c, background:`${n.c}10`}}>
                    {n.l}
                  </span>
                ))}
              </div>
            )}

            {resetSent ? (
              <div style={{textAlign:'center', padding:'1rem 0'}}>
                <div style={{fontSize:48, marginBottom:'1rem'}}>📧</div>
                <h3 style={{fontSize:18, fontWeight:800, color:'white', marginBottom:'0.5rem'}}>Email enviado</h3>
                <p style={{fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:'1.5rem'}}>
                  Revisa tu bandeja de entrada en <strong style={{color:'white'}}>{email}</strong> y sigue las instrucciones.
                </p>
                <button onClick={() => { setMode('login'); setResetSent(false) }}
                  style={{fontSize:13, color:'var(--red)', background:'none', border:'none', cursor:'pointer', fontWeight:700}}>
                  ← Volver al login
                </button>
              </div>
            ) : (
              <form onSubmit={mode==='login'?handleLogin:handleReset}>
                <div style={{marginBottom:'1rem'}}>
                  <label style={{color:'rgba(255,255,255,0.5)', fontSize:13}}>Email</label>
                  <input
                    type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="tu@empresa.com" required autoFocus
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white', marginTop:6}}
                  />
                </div>
                {mode==='login' && (
                  <div style={{marginBottom:'1.25rem'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <label style={{color:'rgba(255,255,255,0.5)', fontSize:13}}>Contraseña</label>
                      <button type="button" onClick={() => setMode('reset')}
                        style={{fontSize:12, color:'var(--red)', background:'none', border:'none', cursor:'pointer', fontWeight:600}}>
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <input
                      type="password" value={password} onChange={e=>setPassword(e.target.value)}
                      placeholder="••••••••" required
                      style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white', marginTop:6}}
                    />
                  </div>
                )}

                {error && (
                  <div style={{background:'rgba(255,30,65,0.1)', border:'1px solid rgba(255,30,65,0.3)', padding:'10px 14px', fontSize:13, color:'var(--red)', marginBottom:'1rem'}}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary"
                  style={{width:'100%', padding:'13px', fontSize:15, justifyContent:'center'}}>
                  {loading ? 'Procesando...' : mode==='login' ? 'Entrar al portal' : 'Enviar email'}
                </button>

                {mode==='reset' && (
                  <button type="button" onClick={() => setMode('login')}
                    style={{width:'100%', marginTop:'0.75rem', padding:'10px', fontSize:13, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer', fontWeight:600}}>
                    ← Volver al login
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Footer del form */}
          <div style={{textAlign:'center', marginTop:'1.5rem'}}>
            <p style={{fontSize:13, color:'rgba(255,255,255,0.3)'}}>
              ¿No tienes acceso todavía?{' '}
              <Link href="/distribuidores#solicitar" style={{color:'var(--red)', fontWeight:700}}>
                Solicitar acceso
              </Link>
            </p>
          </div>

          {/* Beneficios rápidos */}
          <div style={{marginTop:'2.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem'}}>
            {[
              {i:'💰', t:'Hasta -20% dto.', s:'Según tu nivel'},
              {i:'📦', t:'Envío gratuito', s:'En pedidos +150 €'},
              {i:'🎯', t:'300+ productos', s:'Marcas exclusivas'},
              {i:'⚡', t:'Gestión 24h', s:'Pedidos rápidos'},
            ].map(b => (
              <div key={b.t} style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', padding:'0.875rem', display:'flex', gap:10, alignItems:'center'}}>
                <span style={{fontSize:20}}>{b.i}</span>
                <div>
                  <div style={{fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase'}}>{b.t}</div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,0.35)'}}>{b.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
