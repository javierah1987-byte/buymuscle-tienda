// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
export default function ExitIntent(){
  const[show,setShow]=useState(false)
  const[closed,setClosed]=useState(false)
  const[email,setEmail]=useState('')
  const[sent,setSent]=useState(false)
  useEffect(()=>{
    const shown=sessionStorage.getItem('exit_shown')
    if(shown)return
    const handler=(e)=>{
      if(e.clientY<=10&&!closed){
        setShow(true)
        sessionStorage.setItem('exit_shown','1')
      }
    }
    document.addEventListener('mouseleave',handler)
    return()=>document.removeEventListener('mouseleave',handler)
  },[closed])
  async function subscribe(){
    if(!email.includes('@'))return
    const S='https://awwlbepjxuoxaigztugh.supabase.co'
    const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
    await fetch(S+'/rest/v1/email_subscribers',{method:'POST',headers:{apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({email,source:'exit_intent'})}).catch(()=>{})
    setSent(true)
    setTimeout(()=>{setShow(false);setClosed(true)},2500)
  }
  if(!show)return null
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Arial,sans-serif'}} onClick={e=>{if(e.target===e.currentTarget){setShow(false);setClosed(true)}}}>
      <div style={{background:'white',maxWidth:480,width:'90%',position:'relative',overflow:'hidden'}}>
        <div style={{background:'#ff1e41',padding:'32px 32px 24px',textAlign:'center',color:'white'}}>
          <div style={{fontSize:40,marginBottom:8}}>ESPERA</div>
          <h2 style={{margin:0,fontSize:24,fontWeight:900,lineHeight:1.2}}>Antes de irte...</h2>
          <p style={{margin:'8px 0 0',opacity:0.9,fontSize:15}}>Suscribete y consigue <strong>5% de descuento</strong> en tu primer pedido</p>
        </div>
        <div style={{padding:'28px 32px'}}>
          {sent?(
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{fontSize:40,marginBottom:12}}>✅</div>
              <p style={{fontWeight:700,color:'#333',fontSize:16}}>Perfecto. Revisa tu email para el codigo de descuento.</p>
            </div>
          ):(
            <>
              <div style={{display:'flex',gap:0,marginBottom:16}}>
                <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&subscribe()} type="email" placeholder="tu@email.com"
                  style={{flex:1,padding:'12px 16px',border:'2px solid #e0e0e0',borderRight:'none',fontSize:14,fontFamily:'Arial',outline:'none'}}/>
                <button onClick={subscribe} style={{background:'#ff1e41',color:'white',border:'none',padding:'12px 20px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'Arial',whiteSpace:'nowrap'}}>
                  Quiero el 5%
                </button>
              </div>
              <div style={{textAlign:'center'}}>
                <button onClick={()=>{setShow(false);setClosed(true)}} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:12,fontFamily:'Arial'}}>
                  No gracias, pago precio completo
                </button>
              </div>
            </>
          )}
        </div>
        <button onClick={()=>{setShow(false);setClosed(true)}} aria-label="Cerrar"
          style={{position:'absolute',top:12,right:14,background:'transparent',border:'none',cursor:'pointer',fontSize:22,color:'rgba(255,255,255,0.8)',lineHeight:1}}>
          ✕
        </button>
      </div>
    </div>
  )
}
