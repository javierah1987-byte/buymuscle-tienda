// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
export default function EmailPopup(){
  const[v,setV]=useState(false),[email,setEmail]=useState(''),[sent,setSent]=useState(false),[load,setLoad]=useState(false)
  useEffect(()=>{if(localStorage.getItem('bm_popup'))return;const t=setTimeout(()=>setV(true),8000);return()=>clearTimeout(t)},[])
  function close(){setV(false);localStorage.setItem('bm_popup','1')}
  async function submit(e){
    e.preventDefault();if(!email)return;setLoad(true)
    await fetch(S+'/rest/v1/email_subscribers',{method:'POST',headers:{'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({email,discount_code:'BIENVENIDO10',source:'popup'})}).catch(()=>{})
    setSent(true);setLoad(false);setTimeout(close,4000)
  }
  if(!v)return null
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',maxWidth:460,width:'100%',position:'relative',overflow:'hidden'}}>
        <button onClick={close} style={{position:'absolute',top:10,right:14,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#aaa',zIndex:1}}>✕</button>
        <div style={{background:'#ff1e41',padding:'32px 32px 24px',textAlign:'center'}}>
          <div style={{fontSize:42,marginBottom:8}}>🎁</div>
          <h2 style={{color:'white',fontSize:22,fontWeight:900,margin:'0 0 6px',textTransform:'uppercase'}}>¡10% de descuento!</h2>
          <p style={{color:'rgba(255,255,255,0.9)',fontSize:14,margin:0}}>En tu primer pedido</p>
        </div>
        <div style={{padding:'24px 32px 32px'}}>
          {!sent?(<>
            <p style={{fontSize:14,color:'#555',textAlign:'center',margin:'0 0 20px'}}>Suscríbete y recibe el código al instante.</p>
            <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:10}}>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" required style={{padding:'12px 16px',border:'1px solid #ddd',fontSize:14,fontFamily:'inherit',width:'100%',boxSizing:'border-box'}}/>
              <button type="submit" disabled={load} style={{background:'#ff1e41',color:'white',border:'none',padding:'12px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{load?'Enviando...':'QUIERO MI DESCUENTO'}</button>
            </form>
            <p onClick={close} style={{textAlign:'center',fontSize:12,color:'#aaa',marginTop:12,cursor:'pointer',textDecoration:'underline'}}>No, prefiero pagar precio completo</p>
          </>):(
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{fontSize:48,marginBottom:12}}>✅</div>
              <h3 style={{margin:'0 0 8px',fontSize:18}}>¡Código enviado!</h3>
              <div style={{background:'#f5f5f5',border:'2px dashed #ff1e41',padding:'12px 20px',fontSize:22,fontWeight:900,letterSpacing:2,color:'#ff1e41',fontFamily:'monospace',margin:'12px 0'}}>BIENVENIDO10</div>
              <p style={{color:'#aaa',fontSize:12}}>-10% en tu primer pedido</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
