'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const SLIDES = [
  { img:'https://tienda.buymuscle.es/img/cms/iogenix-isolate-nuevos-sabores_1.jpg', href:'/tienda?cat=Proteína Isolatada', alt:'Isolate Professional nuevos sabores' },
  { img:'https://tienda.buymuscle.es/img/cms/iogenix-protein-rings.jpg', href:'/tienda?cat=Snacks Protéicos', alt:'Protein Rings' },
  { img:'https://tienda.buymuscle.es/img/cms/Banner-Canal-Whatsapp-BM-1600x630.jpg', href:'/tienda', alt:'Canal WhatsApp BuyMuscle' },
  { img:'https://tienda.buymuscle.es/img/cms/pink-bun-lactomin.jpg', href:'/tienda?cat=Proteínas', alt:'Pink Bun sabor' },
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
    <div style={{ position:'relative', background:'#000' }}>
      {/* VIDEO DE FONDO — idéntico al original bg-video-BM-2.mp4 */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', zIndex:0, pointerEvents:'none' }}>
        <video
          autoPlay muted loop playsInline
          style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
            minWidth:'100%', minHeight:'100%', width:'auto', height:'auto',
            objectFit:'cover', opacity:0.55, filter:'brightness(0.7) saturate(1.2)' }}>
          <source src={BG_VIDEO} type="video/mp4"/>
        </video>
        {/* Overlay para oscurecer el video */}
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)' }}/>
      </div>

      {/* CONTENIDO DEL SLIDER sobre el video */}
      <div style={{ position:'relative', zIndex:1, maxWidth:1280, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px' }}>

          {/* SLIDER PRINCIPAL */}
          <div style={{ position:'relative', height:430, overflow:'hidden' }}>
            <Link href={SLIDES[cur].href} style={{ display:'block', height:'100%' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SLIDES[cur].img} alt={SLIDES[cur].alt}
                style={{ width:'100%', height:430, objectFit:'cover', display:'block',
                  opacity:fade?1:0, transition:'opacity 0.28s ease' }}/>
            </Link>

            {/* Flecha izq */}
            <button onClick={prev}
              style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)',
                width:42, height:80, background:'rgba(0,0,0,0.5)', border:'none', color:'white',
                fontSize:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                zIndex:10, transition:'background 0.15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,0.8)')}
              onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,0.5)')}>‹</button>

            {/* Flecha der */}
            <button onClick={next}
              style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)',
                width:42, height:80, background:'rgba(0,0,0,0.5)', border:'none', color:'white',
                fontSize:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                zIndex:10, transition:'background 0.15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,0.8)')}
              onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,0.5)')}>›</button>

            {/* Dots */}
            <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)',
              display:'flex', gap:7, zIndex:10 }}>
              {SLIDES.map((_,i) => (
                <button key={i} onClick={()=>goTo(i)}
                  style={{ width:i===cur?22:8, height:8, borderRadius:4, border:'none', padding:0,
                    cursor:'pointer', background:i===cur?'var(--red)':'rgba(255,255,255,0.55)',
                    transition:'all 0.3s' }}/>
              ))}
            </div>
          </div>

          {/* BANNER VIP FIJO */}
          <Link href="/distribuidores" style={{ display:'block', height:430, overflow:'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={VIP} alt="BM VIP BuyMuscle Beneficios Exclusivos"
              style={{ width:'100%', height:430, objectFit:'cover', display:'block', transition:'transform 0.4s' }}
              onMouseEnter={e=>((e.target as HTMLImageElement).style.transform='scale(1.04)')}
              onMouseLeave={e=>((e.target as HTMLImageElement).style.transform='scale(1)')}/>
          </Link>
        </div>

        {/* FRANJA DE LUCES — efecto laser/proyección del original */}
        <div style={{ height:64, background:'#050505', position:'relative', overflow:'hidden' }}>
          {/* Video de fondo también en la franja */}
          <div style={{ position:'absolute', inset:0, overflow:'hidden', opacity:0.8 }}>
            <video autoPlay muted loop playsInline
              style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                minWidth:'100%', minHeight:'100%', width:'auto', height:'auto', objectFit:'cover' }}>
              <source src={BG_VIDEO} type="video/mp4"/>
            </video>
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.2)' }}/>
          </div>
          {/* Rayos de luz en diagonal */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
            {/* Rayo izquierdo */}
            <div style={{ position:'absolute', left:'25%', top:'-20%', width:2, height:'200%',
              background:'linear-gradient(180deg, transparent, rgba(255,200,100,0.7) 40%, rgba(255,255,255,0.9) 50%, rgba(255,200,100,0.7) 60%, transparent)',
              transform:'rotate(-30deg)', filter:'blur(1px)', boxShadow:'0 0 8px rgba(255,200,100,0.5)' }}/>
            {/* Rayo central-izquierdo */}
            <div style={{ position:'absolute', left:'38%', top:'-20%', width:1, height:'200%',
              background:'linear-gradient(180deg, transparent, rgba(255,150,50,0.5) 40%, rgba(255,255,200,0.7) 50%, rgba(255,150,50,0.5) 60%, transparent)',
              transform:'rotate(-30deg)', filter:'blur(0.5px)' }}/>
            {/* Rayo derecho */}
            <div style={{ position:'absolute', right:'25%', top:'-20%', width:2, height:'200%',
              background:'linear-gradient(180deg, transparent, rgba(255,200,100,0.7) 40%, rgba(255,255,255,0.9) 50%, rgba(255,200,100,0.7) 60%, transparent)',
              transform:'rotate(30deg)', filter:'blur(1px)', boxShadow:'0 0 8px rgba(255,200,100,0.5)' }}/>
            {/* Rayo central-derecho */}
            <div style={{ position:'absolute', right:'38%', top:'-20%', width:1, height:'200%',
              background:'linear-gradient(180deg, transparent, rgba(255,150,50,0.5) 40%, rgba(255,255,200,0.7) 50%, rgba(255,150,50,0.5) 60%, transparent)',
              transform:'rotate(30deg)', filter:'blur(0.5px)' }}/>
            {/* Brillo central */}
            <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
              width:300, height:30, background:'radial-gradient(ellipse, rgba(255,180,80,0.15) 0%, transparent 70%)',
              filter:'blur(4px)' }}/>
          </div>
        </div>
      </div>
    </div>
  )
}
