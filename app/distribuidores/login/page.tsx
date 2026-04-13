'use client'
import{useState}from 'react'
import Link from 'next/link'
import{supabase}from '@/lib/supabase'
import{useRouter}from 'next/navigation'
export default function LoginPage(){
  const router=useRouter()
  const[email,setEmail]=useState('')
  const[password,setPassword]=useState('')
  const[loading,setLoading]=useState(false)
  const[error,setError]=useState('')
  const handleLogin=async(e:React.FormEvent)=>{
    e.preventDefault();setLoading(true);setError('')
    const{error}=await supabase.auth.signInWithPassword({email,password})
    if(error)setError('Credenciales incorrectas.')
    else router.push('/distribuidores/portal')
    setLoading(false)
  }
  return(
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <Link href="/" style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:900,letterSpacing:'0.08em',textTransform:'uppercase'}}>Buy<span style={{color:'var(--green)'}}>Muscle</span></Link>
          <div style={{fontFamily:'var(--font-display)',fontSize:13,color:'var(--muted)',letterSpacing:'0.15em',textTransform:'uppercase',marginTop:8}}>Portal Distribuidores</div>
        </div>
        <div className="card" style={{padding:'2rem'}}>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:900,textTransform:'uppercase',marginBottom:'1.5rem'}}>Acceder</h1>
          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="distribuidor@empresa.com" required/></div>
            <div><label>Contraseña</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/></div>
            {error&&<div style={{background:'rgba(255,61,61,0.1)',border:'1px solid rgba(255,61,61,0.3)',borderRadius:6,padding:'10px 14px',fontSize:14,color:'var(--red)'}}>{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading} style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:'16px',marginTop:'0.5rem'}}>{loading?'Entrando…':'Entrar al portal'}</button>
          </form>
          <div style={{marginTop:'1.5rem',paddingTop:'1.5rem',borderTop:'1px solid var(--border)',fontSize:13,color:'var(--muted)',textAlign:'center'}}>¿No tienes acceso? <a href="mailto:distribuidores@buymuscle.es" style={{color:'var(--green)',textDecoration:'underline'}}>Solicita el alta</a></div>
        </div>
        <div style={{textAlign:'center',marginTop:'1.5rem'}}><Link href="/tienda" style={{fontSize:13,color:'var(--muted)',textDecoration:'underline'}}>Volver a la tienda</Link></div>
      </div>
    </div>
  )
}
