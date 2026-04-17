'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const SLIDES = [
  { img:'https://tienda.buymuscle.es/img/cms/iogenix-isolate-nuevos-sabores_1.jpg', href:'/tienda?cat=Proteína Isolatada', alt:'Isolate Professional nuevos sabores' },
  { img:'https://tienda.buymuscle.es/img/cms/iogenix-protein-rings.jpg', href:'/tienda?cat=Snacks Protéicos', alt:'Protein Rings' },
  { img:'https://tienda.buymuscle.es/img/cms/Banner-Canal-Whatsapp-BM-1600x630.jpg', href:'/tienda', alt:'Canal WhatsApp BuyMuscle' },
  { img:'https://tienda.buymuscle.es/img/cms/pink-bun-lactomin.jpg', href:'/tienda?cat=Proteínas', alt:'Pink Bun nuevo sabor' },
  { img:'https://tienda.buymuscle.es/img/cms/BANNER-WEB-1600X630-STREETFLAVOUR.jpg', href:'/tienda?cat=StreetFlavour', alt:'StreetFlavour' },
]
const VIP = 'https://tienda.buymuscle.es/img/cms/BANNER-BM-VIP-1200x1200.jpg'
const BG_VIDEO = 'https://tienda.buymuscle.es/img/cms/bg-video-BM-2.mp4'

export default function HeroSlider() {
  const [cur, setCur] = useState(0)
  const [fade, setFade] = useState(true)

  const goTo = useCallback((i: number) => {
    setFade(false)
    setTimeout(() => { setCur(i); setFade(true) }, 280)
  }, [])
  const next = useCallback(() => goTo((cur + 1) % SLIDES.length), [cur, goTo])
  const prev = () => goTo((cur - 1 + SLIDES.length) % SLIDES.length)
  useEffect(() => { const t = setInterval(next, 5000); return () => clearInterval(t) }, [next])

  return (
    <>
    {/* HERO: slider + VIP en una fila full-width */}
    <div style={{ background:'#0a0a0a', position:'relative', overflow:'hidden' }}>

      {/* VIDEO bg-video-BM-2.mp4 de fondo — cubre TODO el ancho incluyendo franjas */}
      <video autoPlay muted loop playsInline
        style={{ position:'absolute', inset:0, width:'100%', height:'100%',
          objectFit:'cover', zIndex:0,
          opacity:0.6, filter:'brightness(0.6) saturate(1.2) contrast(1.1)' }}>
        <source src={BG_VIDEO} type="video/mp4"/>
      </video>
      {/* Overlay sutil */}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.18)', zIndex:1 }}/>

      {/* Grid slider + VIP sin contenedor limitante */}
      <div style={{ position:'relative', zIndex:2, display:'flex', maxWidth:'100%' }}>

        {/* SLIDER — ocupa todo el espacio hasta el VIP */}
        <div style={{ flex:1, position:'relative', height:430, overflow:'hidden', minWidth:0 }}>
          <Link href={SLIDES[cur].href} style={{ display:'block', height:'100%' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SLIDES[cur].img} alt={SLIDES[cur].alt}
              style={{ width:'100%', height:430, objectFit:'cover', display:'block',
                opacity:fade?1:0, transition:'opacity 0.28s ease' }}/>
          </Link>

          {/* Flecha izq */}
          <button onClick={prev}
            style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)',
              width:44, height:88, background:'rgba(0,0,0,0.5)', border:'none',
              color:'white', fontSize:32, cursor:'pointer', zIndex:10,
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'background 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,0.78)')}
            onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,0.5)')}>‹</button>

          {/* Flecha der */}
          <button onClick={next}
            style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)',
              width:44, height:88, background:'rgba(0,0,0,0.5)', border:'none',
              color:'white', fontSize:32, cursor:'pointer', zIndex:10,
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'background 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,0.78)')}
            onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,0.5)')}>›</button>

          {/* Dots */}
          <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)',
            display:'flex', gap:7, zIndex:10 }}>
            {SLIDES.map((_,i) => (
              <button key={i} onClick={()=>goTo(i)}
                style={{ width:i===cur?24:8, height:8, borderRadius:4, border:'none', padding:0,
                  cursor:'pointer', transition:'all 0.3s',
                  background:i===cur?'var(--red)':'rgba(255,255,255,0.65)' }}/>
            ))}
          </div>
        </div>

        {/* BANNER BM VIP — 380px fijo a la derecha */}
        <Link href="/distribuidores"
          style={{ display:'block', width:380, flexShrink:0, height:430, overflow:'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VIP} alt="BM VIP BuyMuscle Beneficios Exclusivos"
            style={{ width:'100%', height:430, objectFit:'cover', display:'block',
              transition:'transform 0.4s' }}
            onMouseEnter={e=>((e.target as HTMLImageElement).style.transform='scale(1.04)')}
            onMouseLeave={e=>((e.target as HTMLImageElement).style.transform='scale(1)')}/>
        </Link>
      </div>
    </div>

    {/* FRANJA LUCES — el vídeo sigue de fondo aquí también */}
    <div style={{ background:'#050505', height:68, position:'relative', overflow:'hidden' }}>
      {/* Video continúa en la franja — misma fuente */}
      <video autoPlay muted loop playsInline
        style={{ position:'absolute', inset:0, width:'100%', height:'100%',
          objectFit:'cover', opacity:0.85, filter:'brightness(0.55) saturate(1.3)' }}>
        <source src={BG_VIDEO} type="video/mp4"/>
      </video>
      {/* Overlay oscuro para que quede como el original */}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)' }}/>
      {/* Rayos de luz en diagonal exactos al original */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', left:'23%', top:'-150%', width:1.5, height:'400%',
          background:'linear-gradient(180deg,transparent,rgba(255,185,60,0.85) 45%,rgba(255,255,255,1) 50%,rgba(255,185,60,0.85) 55%,transparent)',
          transform:'rotate(-32deg)', boxShadow:'0 0 8px 2px rgba(255,160,40,0.5)', filter:'blur(0.5px)' }}/>
        <div style={{ position:'absolute', left:'29%', top:'-150%', width:1, height:'400%',
          background:'linear-gradient(180deg,transparent,rgba(255,140,40,0.4) 45%,rgba(255,240,170,0.55) 50%,rgba(255,140,40,0.4) 55%,transparent)',
          transform:'rotate(-32deg)' }}/>
        <div style={{ position:'absolute', right:'23%', top:'-150%', width:1.5, height:'400%',
          background:'linear-gradient(180deg,transparent,rgba(255,185,60,0.85) 45%,rgba(255,255,255,1) 50%,rgba(255,185,60,0.85) 55%,transparent)',
          transform:'rotate(32deg)', boxShadow:'0 0 8px 2px rgba(255,160,40,0.5)', filter:'blur(0.5px)' }}/>
        <div style={{ position:'absolute', right:'29%', top:'-150%', width:1, height:'400%',
          background:'linear-gradient(180deg,transparent,rgba(255,140,40,0.4) 45%,rgba(255,240,170,0.55) 50%,rgba(255,140,40,0.4) 55%,transparent)',
          transform:'rotate(32deg)' }}/>
      </div>
    </div>
    </>
  )
}
