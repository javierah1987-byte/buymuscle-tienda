'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function NuevaPasswordPage() {
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  // null = comprobando, true = sesión de recuperación válida, false = enlace inválido/caducado
  const [sessionReady, setSessionReady] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true

    // Supabase procesa el token del enlace y emite PASSWORD_RECOVERY / SIGNED_IN
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true)
      }
    })

    // Por si la sesión ya estaba establecida al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (session) {
        setSessionReady(true)
      } else {
        // Damos margen a que el SDK procese el token del hash de la URL
        setTimeout(() => {
          if (!active) return
          setSessionReady(ready => (ready === null ? false : ready))
        }, 3000)
      }
    })

    return () => { active = false; subscription.unsubscribe() }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      if (/expired|invalid|session/i.test(error.message)) {
        setError('El enlace ha caducado o no es válido. Solicita uno nuevo desde la página de acceso.')
      } else if (/different from the old password|same password/i.test(error.message)) {
        setError('La nueva contraseña debe ser distinta de la anterior.')
      } else {
        setError('No se pudo actualizar la contraseña. Inténtalo de nuevo.')
      }
      setLoading(false)
    } else {
      setDone(true)
      setLoading(false)
    }
  }

  return (
    <div style={{background:'var(--black)', minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      {/* Top bar */}
      <div style={{padding:'1.5rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <Link href="/" className="nav-logo">BUYMUSCLE</Link>
        <Link href="/distribuidores/login" style={{fontSize:13, color:'rgba(255,255,255,0.4)', fontWeight:600}}>
          ← Volver al login
        </Link>
      </div>

      {/* Main */}
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem'}}>
        <div style={{width:'100%', maxWidth:420}}>
          {/* Logo area */}
          <div style={{textAlign:'center', marginBottom:'2.5rem'}}>
            <div style={{fontSize:48, marginBottom:'0.75rem'}}>🔑</div>
            <h1 style={{fontSize:26, fontWeight:900, textTransform:'uppercase', color:'white', marginBottom:'0.5rem'}}>
              Nueva contraseña
            </h1>
            <p style={{fontSize:14, color:'rgba(255,255,255,0.4)'}}>
              Elige una contraseña nueva para tu cuenta de distribuidor
            </p>
          </div>

          {/* Card */}
          <div style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', padding:'2rem'}}>
            {done ? (
              <div style={{textAlign:'center', padding:'1rem 0'}}>
                <div style={{fontSize:48, marginBottom:'1rem'}}>✅</div>
                <h3 style={{fontSize:18, fontWeight:800, color:'white', marginBottom:'0.5rem'}}>Contraseña actualizada</h3>
                <p style={{fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:'1.5rem'}}>
                  Tu contraseña se ha cambiado correctamente. Ya puedes acceder al portal con tus nuevas credenciales.
                </p>
                <Link href="/distribuidores/login" className="btn-primary"
                  style={{display:'inline-flex', padding:'12px 24px', fontSize:14, justifyContent:'center'}}>
                  Ir al login
                </Link>
              </div>
            ) : sessionReady === null ? (
              <div style={{textAlign:'center', padding:'1.5rem 0'}}>
                <div style={{fontSize:36, marginBottom:'1rem'}}>⏳</div>
                <p style={{fontSize:14, color:'rgba(255,255,255,0.5)'}}>Verificando el enlace de recuperación...</p>
              </div>
            ) : sessionReady === false ? (
              <div style={{textAlign:'center', padding:'1rem 0'}}>
                <div style={{fontSize:48, marginBottom:'1rem'}}>⚠️</div>
                <h3 style={{fontSize:18, fontWeight:800, color:'white', marginBottom:'0.5rem'}}>Enlace caducado o no válido</h3>
                <p style={{fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:'1.5rem'}}>
                  El enlace de recuperación ha caducado o ya se ha utilizado. Solicita uno nuevo desde la página de acceso.
                </p>
                <Link href="/distribuidores/login" style={{fontSize:13, color:'var(--red)', fontWeight:700}}>
                  ← Solicitar un nuevo enlace
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{marginBottom:'1rem'}}>
                  <label style={{color:'rgba(255,255,255,0.5)', fontSize:13}}>Nueva contraseña</label>
                  <input
                    type="password" value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres" required minLength={8} autoFocus
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white', marginTop:6}}
                  />
                </div>
                <div style={{marginBottom:'1.25rem'}}>
                  <label style={{color:'rgba(255,255,255,0.5)', fontSize:13}}>Repite la contraseña</label>
                  <input
                    type="password" value={password2} onChange={e=>setPassword2(e.target.value)}
                    placeholder="••••••••" required minLength={8}
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white', marginTop:6}}
                  />
                </div>

                {error && (
                  <div style={{background:'rgba(255,30,65,0.1)', border:'1px solid rgba(255,30,65,0.3)', padding:'10px 14px', fontSize:13, color:'var(--red)', marginBottom:'1rem'}}>
                    {error}{' '}
                    {/caducado/.test(error) && (
                      <Link href="/distribuidores/login" style={{color:'var(--red)', fontWeight:700, textDecoration:'underline'}}>
                        Solicitar nuevo enlace
                      </Link>
                    )}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary"
                  style={{width:'100%', padding:'13px', fontSize:15, justifyContent:'center'}}>
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            )}
          </div>

          {/* Footer del form */}
          <div style={{textAlign:'center', marginTop:'1.5rem'}}>
            <p style={{fontSize:13, color:'rgba(255,255,255,0.3)'}}>
              ¿Problemas con tu cuenta?{' '}
              <a href="mailto:tienda@buymuscle.es" style={{color:'var(--red)', fontWeight:700}}>
                Contacta con nosotros
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
