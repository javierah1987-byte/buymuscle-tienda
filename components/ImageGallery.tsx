// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Image from 'next/image'
// Mismo proxy que ProductCard: Edge Function de Supabase para bypass de hotlink.
function proxyImg(url){
  if(!url) return '/placeholder.jpg'
  if(typeof url==='string'&&url.includes('tienda.buymuscle.es'))
    return 'https://awwlbepjxuoxaigztugh.supabase.co/functions/v1/image-proxy?url='+encodeURIComponent(url)
  return url
}
export default function ImageGallery({images=[],name=''}){
  const[main,setMain]=useState(0)
  const[zoom,setZoom]=useState(false)
  const[flavorImgs,setFlavorImgs]=useState(null)
  const baseImgs=images.filter(Boolean)
  const imgs=(flavorImgs&&flavorImgs.length)?flavorImgs:baseImgs
  useEffect(()=>{
    if(!zoom)return
    const h=e=>{if(e.key==='Escape')setZoom(false)}
    window.addEventListener('keydown',h)
    return()=>window.removeEventListener('keydown',h)
  },[zoom])
  // Galería por SABOR: AddToCartSection dispara 'bm-variant-image' con la(s) foto(s) del sabor
  // elegido → cambiamos TODA la galería (principal + miniaturas) a las de ese sabor.
  useEffect(()=>{
    const h=e=>{ const d=e.detail; setFlavorImgs(Array.isArray(d)?d.filter(Boolean):(d?[d]:null)); setMain(0) }
    window.addEventListener('bm-variant-image',h)
    return()=>window.removeEventListener('bm-variant-image',h)
  },[])
  const shown = imgs[main]||imgs[0]
  if(!imgs.length) return(
    <div style={{aspectRatio:'1',background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:60}}>📦</div>
  )
  return(
    <div>
      {/* Imagen principal — vía next/image: el optimizador de Vercel redimensiona,
          convierte a WebP/AVIF y cachea (Storage sirve no-cache, así que sin esto
          el navegador re-descarga el original completo en cada visita). */}
      <div style={{position:'relative',overflow:'hidden',cursor:'zoom-in',background:'#fafafa',border:'1px solid #f0f0f0',aspectRatio:'1'}} onClick={()=>setZoom(true)}
        role="button" tabIndex={0} aria-label={'Ampliar imagen de '+name}
        onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setZoom(true)}}}>
        <Image src={proxyImg(shown)} alt={name} fill priority
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{objectFit:'contain',transition:'transform 0.3s'}}
          onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();const x=((e.clientX-r.left)/r.width-0.5)*20;const y=((e.clientY-r.top)/r.height-0.5)*20;e.currentTarget.style.transform='scale(1.4) translate('+(-x)+'px,'+(-y)+'px)'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)'}}/>
        <div aria-hidden="true" style={{position:'absolute',bottom:8,right:8,background:'rgba(0,0,0,0.4)',color:'white',padding:'2px 6px',fontSize:11,borderRadius:2}}>🔍 Zoom</div>
      </div>
      {/* Miniaturas (64px reales en vez del original completo) */}
      {imgs.length>1&&<div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
        {imgs.map((img,i)=>(
          <button key={i} onClick={()=>{setMain(i);setFlavorImg(null)}} aria-label={'Ver imagen '+(i+1)+' de '+name}
            style={{border:main===i?'2px solid #ff1e41':'2px solid #f0f0f0',padding:0,background:'none',cursor:'pointer',width:64,height:64,flexShrink:0,overflow:'hidden',position:'relative'}}>
            <Image src={proxyImg(img)} alt={name+' miniatura '+(i+1)} width={64} height={64} loading="lazy"
              style={{width:'100%',height:'100%',objectFit:'contain',display:'block'}}/>
          </button>
        ))}
      </div>}
      {/* Modal zoom */}
      {zoom&&(
        <div onClick={()=>setZoom(false)} role="dialog" aria-modal="true" aria-label={'Imagen ampliada de '+name} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <button onClick={()=>setZoom(false)} aria-label="Cerrar imagen ampliada" style={{position:'absolute',top:20,right:24,background:'none',border:'none',color:'white',fontSize:32,cursor:'pointer',lineHeight:1}}>✕</button>
          {imgs.length>1&&<button onClick={e=>{e.stopPropagation();setMain(m=>(m-1+imgs.length)%imgs.length)}} aria-label="Imagen anterior"
            style={{position:'absolute',left:20,background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:28,cursor:'pointer',padding:'8px 14px',borderRadius:4}}>‹</button>}
          <img src={proxyImg(shown)} alt={name} style={{maxWidth:'90vw',maxHeight:'90vh',objectFit:'contain'}} onClick={e=>e.stopPropagation()}/>
          {imgs.length>1&&<button onClick={e=>{e.stopPropagation();setMain(m=>(m+1)%imgs.length)}} aria-label="Imagen siguiente"
            style={{position:'absolute',right:20,background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:28,cursor:'pointer',padding:'8px 14px',borderRadius:4}}>›</button>}
          <div style={{position:'absolute',bottom:20,color:'rgba(255,255,255,0.6)',fontSize:13}}>{main+1} / {imgs.length}</div>
        </div>
      )}
    </div>
  )
      }
