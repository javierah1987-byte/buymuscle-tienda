// @ts-nocheck
'use client'
import{useEffect,useRef,useState}from'react'
export default function PayPalButton({amount,onSuccess,onError}){
  const ref=useRef(null)
  const[err,setErr]=useState('')
  const clientId=process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID||''
  useEffect(()=>{
    if(!clientId||!ref.current) return
    const render=()=>{
      if(!window.paypal||!ref.current) return
      ref.current.innerHTML=''
      window.paypal.Buttons({
        style:{layout:'vertical',color:'blue',shape:'rect',label:'pay'},
        createOrder:(_,a)=>a.order.create({purchase_units:[{amount:{value:Number(amount).toFixed(2),currency_code:'EUR'}}]}),
        onApprove:async(_,a)=>{const o=await a.order.capture();onSuccess&&onSuccess(o)},
        onError:(e)=>{onError&&onError(e)}
      }).render(ref.current)
    }
    const existing=document.getElementById('paypal-sdk')
    if(existing&&window.paypal){render();return}
    const s=document.createElement('script')
    s.id='paypal-sdk'
    s.src='https://www.paypal.com/sdk/js?client-id='+clientId+'&currency=EUR&locale=es_ES'
    s.onload=render
    s.onerror=()=>setErr('Error cargando PayPal')
    document.head.appendChild(s)
  },[clientId,amount])
  if(!clientId) return(<div style={{padding:'12px',background:'#fff3cd',border:'1px solid #ffc107',borderRadius:4,fontSize:13,color:'#856404',textAlign:'center'}}>Configura NEXT_PUBLIC_PAYPAL_CLIENT_ID en Vercel para activar PayPal</div>)
  if(err) return<div style={{color:'red',fontSize:13,textAlign:'center'}}>{err}</div>
  return<div ref={ref}/>
}
