// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
export default function ExitIntent(){
  const[show,setShow]=useState(false)
  const[email,setEmail]=useState('')
  const[sent,setSent]=useState(false)
  useEffect(()=>{
    if(typeof window==='undefined')return
    if(sessionStorage.getItem('exit_shown'))return
    const handler=(e)=>{
      if(e.clientY<=5){
        setShow(true)
        sessionStorage.setItem('exit_shown','1')
        document.removeEventListener('mouseleave',handler)
      }
    }
    document.addEventListener('mouseleave',handler)
    return()=>document.removeEventListener('mouseleave',handler)
  },[])
  async function subscribe(){
    if(!email.includes('@'))return
    await fetch(S+'/rest/v1/email_subscribers',{method:'POST',
      headers:{apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify({email,source:'exit_intent'})}).catch(()=>{})
    setSent(true)
    setTimeout(()=>setShow(false),2500)
  }
  if(!show)return null
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.72)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Arial,sans-serif'}}
      onClick={e=>{if(e.target===e.currentTarget)setShow(false)}}>
      <div style={{background:'white',maxWidth:460,width:'92%',position:'relative',overflow:'hidden'}}>
        <div style={{background:'#ff1e41',padding:'28px 32px 20px',textAlign:'center',color:'white'}}>
          <div style={{fontSize:36,fontWeight:900,letterSpacing:'-1px'}}>ESPERA</div>
          <h2 style={{margin:'4px 0 8px',fontSize:22,fontWeight:900}}>Antes de irte...</h2>
          <p style={{margin:0,fontSize:14,opacity:0.9}}>Suscribete y consigue <strong>5% de descuento</strong> en tu primer pedido</p>
        </div>
        <div style={{padding:'24px 32px'}}>
          {sent?(
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{fontSize:36,marginBottom:10}}>✅</div>
              <p style={{fontWeight:700,color:'#333',fontSize:15}}>Perfecto. Revisa tu email — el codigo llega en unos minutos.</p>
            </div>
          ):(
            <>
              <div style={{display:'flex',gap:0,marginBottom:12}}>
                <input value={email} onChange={e=>setEmail(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&subscribe()} type="email" placeholder="tu@email.com"
                  style={{flex:1,padding:'12px 14px',border:'2px solid #e0e0e0',borderRight:'none',fontSize:14,fontFamily:'Arial',outline:'none'}}/>
                <button onClick={subscribe}
                  style={{background:'#ff1e41',color:'white',border:'none',padding:'12px 18px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'Arial',whiteSpace:'nowrap'}}>
                  Quiero el 5%
                </button>
              </div>
              <div style={{textAlign:'center'}}>
                <button onClick={()=>setShow(false)}
                  style={{background:'none',border:'none',cursor:'pointer',color:'#bbb',fontSize:12,fontFamily:'Arial'}}>
                  No gracias, pago precio completo
                </button>
              </div>
            </>
          )}
        </div>
        <button onClick={()=>setShow(false)} aria-label="Cerrar"
          style={{position:'absolute',top:10,right:14,background:'transparent',border:'none',cursor:'pointer',fontSize:20,color:'rgba(255,255,255,0.85)',lineHeight:1}}>
          ✕
        </button>
      </div>
    </div>
  )
}
