// @ts-nocheck
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

const FALLBACK=[
  {id:1,image_url:'https://tienda.buymuscle.es/img/cms/iogenix-isolate-nuevos-sabores_1.jpg',url:'/tienda',title:'Isolate Professional',subtitle:'Nuevos sabores disponibles'},
  {id:2,image_url:'https://tienda.buymuscle.es/img/cms/iogenix-protein-rings.jpg',url:'/tienda',title:'Protein Rings',subtitle:'El snack proteico definitivo'},
  {id:3,image_url:'https://tienda.buymuscle.es/img/cms/Banner-Canal-Whatsapp-BM-1600x630.jpg',url:'/tienda',title:'BuyMuscle',subtitle:'Tu suplementacion en Canarias'},
]

export default function HeroSlider(){
  const[slides,setSlides]=useState(FALLBACK)
  const[idx,setIdx]=useState(0)
  const[loaded,setLoaded]=useState(false)

  useEffect(()=>{
    fetch(S+'/rest/v1/banners?active=eq.true&order=order_pos.asc',{
      headers:{apikey:K,'Authorization':'Bearer '+K}
    }).then(r=>r.json()).then(d=>{
      if(Array.isArray(d)&&d.length>0){
        setSlides(d)
      }
      setLoaded(true)
    }).catch(()=>setLoaded(true))
  },[])

  const prev=useCallback(()=>setIdx(i=>(i-1+slides.length)%slides.length),[slides.length])
  const next=useCallback(()=>setIdx(i=>(i+1)%slides.length),[slides.length])

  useEffect(()=>{
    const t=setInterval(next,5000)
    return()=>clearInterval(t)
  },[next])

  const s=slides[idx]||{}

  return(
    <div style={{position:'relative',width:'100%',height:'clamp(200px,40vw,520px)',background:'#111',overflow:'hidden',userSelect:'none'}}>
      {/* Imagen */}
      {s.image_url&&(
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.image_url} alt={s.title||'Banner'} key={s.id||idx}
          style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',opacity:0.85,transition:'opacity 0.4s'}}/>
      )}

      {/* Overlay */}
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.1) 60%,transparent 100%)'}}/>

      {/* Texto */}
      {(s.title||s.subtitle)&&(
        <div style={{position:'absolute',left:'5%',top:'50%',transform:'translateY(-50%)',zIndex:2,maxWidth:'45%'}}>
          {s.title&&<h2 style={{margin:0,fontSize:'clamp(18px,3vw,42px)',fontWeight:900,color:'white',textTransform:'uppercase',textShadow:'0 2px 8px rgba(0,0,0,0.6)',lineHeight:1.1}}>{s.title}</h2>}
          {s.subtitle&&<p style={{margin:'8px 0 0',fontSize:'clamp(12px,1.5vw,18px)',color:'rgba(255,255,255,0.85)',textShadow:'0 1px 4px rgba(0,0,0,0.5)'}}>{s.subtitle}</p>}
          {s.url&&s.url!=='/'&&(
            <Link href={s.url} style={{display:'inline-block',marginTop:16,padding:'10px 24px',background:'#ff1e41',color:'white',borderRadius:4,textDecoration:'none',fontWeight:700,fontSize:'clamp(12px,1.2vw,15px)',textTransform:'uppercase',letterSpacing:'0.05em'}}>
              Ver productos
            </Link>
          )}
        </div>
      )}

      {/* Arrows */}
      {slides.length>1&&(
        <>
          <button onClick={prev} aria-label="Anterior" style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.45)',border:'none',color:'white',width:40,height:40,borderRadius:'50%',cursor:'pointer',fontSize:18,zIndex:3,display:'flex',alignItems:'center',justifyContent:'center'}}>&#8249;</button>
          <button onClick={next} aria-label="Siguiente" style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.45)',border:'none',color:'white',width:40,height:40,borderRadius:'50%',cursor:'pointer',fontSize:18,zIndex:3,display:'flex',alignItems:'center',justifyContent:'center'}}>&#8250;</button>
        </>
      )}

      {/* Dots */}
      {slides.length>1&&(
        <div style={{position:'absolute',bottom:14,left:'50%',transform:'translateX(-50%)',display:'flex',gap:6,zIndex:3}}>
          {slides.map((_,i)=>(
            <button key={i} onClick={()=>setIdx(i)} aria-label={'Slide '+(i+1)}
              style={{width:i===idx?24:8,height:8,borderRadius:4,border:'none',background:i===idx?'#ff1e41':'rgba(255,255,255,0.5)',cursor:'pointer',padding:0,transition:'all 0.3s'}}/>
          ))}
        </div>
      )}
    </div>
  )
}
