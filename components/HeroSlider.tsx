// @ts-nocheck
'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const FALLBACK=[
  {id:1,image_url:'https://tienda.buymuscle.es/img/cms/iogenix-isolate-nuevos-sabores_1.jpg',url:'/tienda',title:'Isolate Professional',subtitle:'Nuevos sabores disponibles'},
  {id:2,image_url:'https://tienda.buymuscle.es/img/cms/iogenix-protein-rings.jpg',url:'/tienda',title:'Protein Rings',subtitle:'El snack proteico definitivo'},
  {id:3,image_url:'https://tienda.buymuscle.es/img/cms/Banner-Canal-Whatsapp-BM-1600x630.jpg',url:'/tienda',title:'BuyMuscle',subtitle:'Tu suplementacion en Canarias'},
]

const AUTOPLAY_MS=6000
const FADE='opacity 900ms ease-in-out'

// Un slide con title/subtitle se pinta con overlay + bloque de texto (banners
// del admin, p.ej. Distribuidores). Un slide SIN texto es un arte final de
// campaña (el texto ya viene en la imagen): se pinta limpio y clicable entero.
const hasTextOf=b=>!!(b&&(b.title||b.subtitle))

// initialBanners llega del servidor (app/page.tsx, ISR): así el primer banner
// sale ya en el HTML inicial (mejor LCP) y no hay doble descarga fallback→real.
// Sin prop (otros usos), conserva el fetch en cliente.
export default function HeroSlider({initialBanners=null}){
  const hasInitial=Array.isArray(initialBanners)&&initialBanners.length>0
  const[slides,setSlides]=useState(hasInitial?initialBanners:FALLBACK)
  const[idx,setIdx]=useState(0)
  const touchX=useRef(null)

  useEffect(()=>{
    if(hasInitial) return
    fetch(S+'/rest/v1/banners?active=eq.true&order=order_pos.asc',{
      headers:{apikey:K,'Authorization':'Bearer '+K}
    }).then(r=>r.json()).then(d=>{
      if(Array.isArray(d)&&d.length>0) setSlides(d)
    }).catch(()=>{})
  },[hasInitial])

  const prev=useCallback(()=>setIdx(i=>(i-1+slides.length)%slides.length),[slides.length])
  const next=useCallback(()=>setIdx(i=>(i+1)%slides.length),[slides.length])

  // Autoplay suave: setTimeout dependiente de idx → cada navegación (manual o
  // automática) reinicia la cuenta. Sin saltos a destiempo tras interactuar.
  useEffect(()=>{
    const t=setTimeout(next,AUTOPLAY_MS)
    return()=>clearTimeout(t)
  },[idx,next])

  // Swipe táctil (móvil)
  const onTouchStart=e=>{touchX.current=e.touches[0].clientX}
  const onTouchEnd=e=>{
    if(touchX.current===null) return
    const dx=e.changedTouches[0].clientX-touchX.current
    if(Math.abs(dx)>50)(dx<0?next:prev)()
    touchX.current=null
  }

  const s=slides[idx]||{}
  const hasText=hasTextOf(s)

  return(
    <div style={{position:'relative',width:'100%',aspectRatio:'1600 / 630',maxHeight:720,background:'#111',overflow:'hidden',userSelect:'none'}}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Todas las imágenes apiladas: crossfade real con easing (no corte seco) */}
      {slides.map((b,i)=>b.image_url&&(
        // eslint-disable-next-line @next/next/no-img-element
        <img key={b.id??i} src={b.image_url} alt={b.alt||b.title||'Campaña BuyMuscle'}
          fetchPriority={i===0?'high':'auto'} loading={i===0?'eager':'lazy'} decoding="async"
          style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',
            opacity:i===idx?(hasTextOf(b)?0.85:1):0,transition:FADE,pointerEvents:'none'}}/>
      ))}

      {/* Overlay solo bajo bloque de texto (las campañas planchadas van limpias) */}
      {hasText&&<div style={{position:'absolute',inset:0,background:'linear-gradient(to right,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.1) 60%,transparent 100%)'}}/>}

      {/* Campañas: el slide entero es el enlace */}
      {!hasText&&s.url&&(s.external
        ? <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.alt||'Ver campaña'} style={{position:'absolute',inset:0,zIndex:1}}/>
        : <Link href={s.url} aria-label={s.alt||'Ver campaña'} style={{position:'absolute',inset:0,zIndex:1}}/>
      )}

      {/* Texto (banners del admin con title/subtitle) */}
      {hasText&&(
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
