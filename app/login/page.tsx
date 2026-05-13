'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const S = 'https://awwlbepjxuoxaigztugh.supabase.co'
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODYxMjMsImV4cCI6MjA1OTg2MjEyM30.l0bSFCIHqTGNmHdUMV5tq5L1N-PwL5G8W_GXh4XyJtw'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      const res = await fetch(S + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': K, 'Authorization': 'Bearer ' + K },
        body: JSON.stringify({ email, password: pass })
      })
      const data = await res.json()
      if (!res.ok || data.error) { setErr(data.error_description || data.msg || 'Error de autenticación'); setLoading(false); return; }
      // Guardar token en cookie via API
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: data.access_token, refresh_token: data.refresh_token })
      }).catch(() => {})
      const redirect = params.get('redirectTo') || '/tpv'
      router.push(redirect)
    } catch(e) { setErr('Error de conexión'); setLoading(false); }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#111',padding:'1rem'}}>
      <div style={{background:'#1a1a1a',borderRadius:12,padding:'2rem',width:'100%',maxWidth:400,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <h1 style={{color:'#ff1e41',fontSize:28,fontWeight:900,letterSpacing:2,margin:0}}>BUYMUSCLE</h1>
          <p style={{color:'#888',marginTop:8,fontSize:14}}>Acceso al panel de gestión</p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',color:'#ccc',marginBottom:6,fontSize:14}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid #333',background:'#252525',color:'white',fontSize:15,boxSizing:'border-box'}}
              placeholder="tu@email.com" autoComplete="email" />
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block',color:'#ccc',marginBottom:6,fontSize:14}}>Contraseña</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required
              style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid #333',background:'#252525',color:'white',fontSize:15,boxSizing:'border-box'}}
              placeholder="••••••••" autoComplete="current-password" />
          </div>
          {err && <div style={{background:'#3d0000',color:'#ff6b6b',padding:'10px 14px',borderRadius:8,marginBottom:'1rem',fontSize:14}}>{err}</div>}
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'12px',background:loading?'#666':'#ff1e41',color:'white',border:'none',borderRadius:8,fontSize:16,fontWeight:700,cursor:loading?'not-allowed':'pointer',transition:'background 0.2s'}}>
            {loading ? 'Accediendo...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
