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
    <div style={{ position:'relative', background:'#000', overflow:'hidden' }}>

      {/* VIDEO DE FONDO — bg-video-BM-2.mp4 ocupa todo el contenedor */}
      <video autoPlay muted loop playsInline
        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%',
          objectFit:'cover', zIndex:0,
          opacity:0.55, filter:'brightness(0.65) saturate(1.1)' }}>
        <source src={BG_VIDEO} type="video/mp4"/>
      </video>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.25)', zIndex:1 }}/>

      {/* SLIDER + VIP — sobre el video */}
      <div style={{ position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'1fr 380px', margin:'0 auto', maxWidth:1280 }}>

        {/* SLIDER PRINCIPAL */}
        <div style={{ position:'relative', height:430, overflow:'hidden' }}>
          <Link href={SLIDES[cur].href} style={{ display:'block', height:'100%' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SLIDES[cur].img} alt={SLIDES[cur].alt}
              style={{ width:'100%', height:430, objectFit:'cover', display:'block',
                opacity:fade?1:0, transition:'opacity 0.28s ease' }}/>
          </Link>

          {/* Flechas */}
          <button onClick={prev}
            style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)',
              width:44, height:86, background:'rgba(0,0,0,0.48)', border:'none', color:'white',
              fontSize:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              zIndex:10, transition:'background 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,0.75)')}
            onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,0.48)')}>‹</button>
          <button onClick={next}
            style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)',
              width:44, height:86, background:'rgba(0,0,0,0.48)', border:'none', color:'white',
              fontSize:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              zIndex:10, transition:'background 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,0.75)')}
            onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,0.48)')}>›</button>

          {/* Dots */}
          <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)',
            display:'flex', gap:7, zIndex:10 }}>
            {SLIDES.map((_,i) => (
              <button key={i} onClick={()=>goTo(i)}
                style={{ width:i===cur?24:8, height:8, borderRadius:4, border:'none', padding:0,
                  cursor:'pointer', transition:'all 0.3s',
                  background:i===cur?'var(--red)':'rgba(255,255,255,0.6)' }}/>
            ))}
          </div>
        </div>

        {/* BANNER BM VIP FIJO */}
        <Link href="/distribuidores" style={{ display:'block', height:430, overflow:'hidden', flexShrink:0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VIP} alt="BM VIP BuyMuscle Beneficios Exclusivos"
            style={{ width:'100%', height:430, objectFit:'cover', display:'block', transition:'transform 0.4s' }}
            onMouseEnter={e=>((e.target as HTMLImageElement).style.transform='scale(1.04)')}
            onMouseLeave={e=>((e.target as HTMLImageElement).style.transform='scale(1)')}/>
        </Link>
      </div>

      {/* FRANJA DE LUCES — el efecto de rombos/rayos del vídeo visible */}
      <div style={{ position:'relative', zIndex:2, height:70, overflow:'hidden' }}>
        {/* El vídeo ya corre detrás (z:0) — sólo añadimos los rayos de luz */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          {/* Línea de luz izquierda diagonal */}
          <div style={{ position:'absolute', left:'22%', top:'-100%', width:1.5, height:'400%',
            background:'linear-gradient(180deg,transparent,rgba(255,180,60,0.8) 40%,rgba(255,255,255,1) 50%,rgba(255,180,60,0.8) 60%,transparent)',
            transform:'rotate(-35deg)', boxShadow:'0 0 6px 2px rgba(255,160,40,0.4)', filter:'blur(0.5px)' }}/>
          <div style={{ position:'absolute', left:'28%', top:'-100%', width:1, height:'400%',
            background:'linear-gradient(180deg,transparent,rgba(255,140,40,0.4) 45%,rgba(255,220,150,0.6) 50%,rgba(255,140,40,0.4) 55%,transparent)',
            transform:'rotate(-35deg)' }}/>
          {/* Línea de luz derecha diagonal */}
          <div style={{ position:'absolute', right:'22%', top:'-100%', width:1.5, height:'400%',
            background:'linear-gradient(180deg,transparent,rgba(255,180,60,0.8) 40%,rgba(255,255,255,1) 50%,rgba(255,180,60,0.8) 60%,transparent)',
            transform:'rotate(35deg)', boxShadow:'0 0 6px 2px rgba(255,160,40,0.4)', filter:'blur(0.5px)' }}/>
          <div style={{ position:'absolute', right:'28%', top:'-100%', width:1, height:'400%',
            background:'linear-gradient(180deg,transparent,rgba(255,140,40,0.4) 45%,rgba(255,220,150,0.6) 50%,rgba(255,140,40,0.4) 55%,transparent)',
            transform:'rotate(35deg)' }}/>
          {/* Brillo tenue central */}
          <div style={{ position:'absolute', left:'50%', bottom:0, transform:'translateX(-50%)',
            width:400, height:40, background:'radial-gradient(ellipse at center bottom,rgba(255,80,40,0.12) 0%,transparent 70%)' }}/>
        </div>
      </div>
    </div>
  )
}
