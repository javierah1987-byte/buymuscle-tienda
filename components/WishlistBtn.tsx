// @ts-nocheck
'use client'
import{useEffect,useState}from 'react'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
function sid(){let i=localStorage.getItem('bm_sid');if(!i){i=Math.random().toString(36).slice(2);localStorage.setItem('bm_sid',i)}return i}
export default function WishlistBtn({productId,size=24}){
  const[saved,setSaved]=useState(false),[loading,setLoading]=useState(false)
  useEffect(()=>{
    fetch(S+'/rest/v1/wishlists?session_id=eq.'+sid()+'&product_id=eq.'+productId+'&select=id',{
      headers:{'apikey':K,'Authorization':'Bearer '+K}
    }).then(r=>r.json()).then(d=>setSaved(d.length>0)).catch(()=>{})
  },[productId])
  async function toggle(){
    setLoading(true)
    if(saved){
      await fetch(S+'/rest/v1/wishlists?session_id=eq.'+sid()+'&product_id=eq.'+productId,{
        method:'DELETE',headers:{'apikey':K,'Authorization':'Bearer '+K}
      })
      setSaved(false)
    }else{
      await fetch(S+'/rest/v1/wishlists',{method:'POST',
        headers:{'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json','Prefer':'return=minimal'},
        body:JSON.stringify({session_id:sid(),product_id:productId})})
      setSaved(true)
    }
    setLoading(false)
  }
  return(
    <button onClick={toggle} disabled={loading} title={saved?'Quitar de favoritos':'Guardar en favoritos'}
      style={{background:'none',border:'none',cursor:loading?'wait':'pointer',padding:4,display:'inline-flex',alignItems:'center',justifyContent:'center',transition:'transform 0.15s',transform:saved?'scale(1.15)':'scale(1)'}}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill={saved?'#ff1e41':'none'} stroke={saved?'#ff1e41':'#bbb'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  )
                  }
