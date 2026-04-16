'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const SLIDES = [
  { img:'https://tienda.buymuscle.es/img/cms/iogenix-isolate-nuevos-sabores_1.jpg', href:'/tienda?cat=Proteína Isolatada', alt:'Isolate nuevos sabores' },
  { img:'https://tienda.buymuscle.es/img/cms/iogenix-protein-rings.jpg', href:'/tienda?cat=Snacks Protéicos', alt:'Protein Rings' },
  { img:'https://tienda.buymuscle.es/img/cms/Banner-Canal-Whatsapp-BM-1600x630.jpg', href:'/tienda', alt:'Canal WhatsApp BuyMuscle' },
  { img:'https://tienda.buymuscle.es/img/cms/pink-bun-lactomin.jpg', href:'/tienda?cat=Proteínas', alt:'Pink Bun sabor' },
  { img:'https://tienda.buymuscle.es/img/cms/BANNER-WEB-1600X630-STREETFLAVOUR.jpg', href:'/tienda?cat=StreetFlavour', alt:'StreetFlavour' },
]
const VIP = 'https://tienda.buymuscle.es/img/cms/BANNER-BM-VIP-1200x1200.jpg'

export default function HeroSlider() {
  const [cur, setCur] = useState(0)
  const [fade, setFade] = useState(true)
  const goTo = useCallback((i: number) => {
    setFade(false); setTimeout(() => { setCur(i); setFade(true) }, 280)
  }, [])
  const next = useCallback(() => goTo((cur + 1) % SLIDES.length), [cur, goTo])
  const prev = () => goTo((cur - 1 + SLIDES.length) % SLIDES.length)
  useEffect(() => { const t = setInterval(next, 5000); return () => clearInterval(t) }, [next])

  return (
    <section style={{ background:'#000' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 380px' }}>
        <div style={{ position:'relative', height:430, overflow:'hidden' }}>
          <Link href={SLIDES[cur].href}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SLIDES[cur].img} alt={SLIDES[cur].alt}
              style={{ width:'100%', height:430, objectFit:'cover', display:'block', opacity:fade?1:0, transition:'opacity 0.28s ease' }} />
          </Link>
          <button onClick={prev} style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:42, height:80, background:'rgba(0,0,0,0.45)', border:'none', color:'white', fontSize:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,0.75)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,0.45)')}>‹</button>
          <button onClick={next} style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', width:42, height:80, background:'rgba(0,0,0,0.45)', border:'none', color:'white', fontSize:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,0.75)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,0.45)')}>›</button>
          <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', display:'flex', gap:7, zIndex:10 }}>
            {SLIDES.map((_,i) => (
              <button key={i} onClick={()=>goTo(i)} style={{ width:i===cur?22:8, height:8, borderRadius:4, border:'none', padding:0, cursor:'pointer', background:i===cur?'var(--red)':'rgba(255,255,255,0.55)', transition:'all 0.3s' }} />
            ))}
          </div>
        </div>
        <Link href="/distribuidores" style={{ display:'block', height:430, overflow:'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VIP} alt="BM VIP BuyMuscle"
            style={{ width:'100%', height:430, objectFit:'cover', display:'block', transition:'transform 0.4s' }}
            onMouseEnter={e=>((e.target as HTMLImageElement).style.transform='scale(1.04)')}
            onMouseLeave={e=>((e.target as HTMLImageElement).style.transform='scale(1)')} />
        </Link>
      </div>
      <div style={{ height:56, background:'#080808', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(255,30,65,0.12) 0%, transparent 70%)' }} />
        <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:'70%', height:1, background:'linear-gradient(90deg,transparent,rgba(255,30,65,0.5) 30%,rgba(255,80,40,0.8) 50%,rgba(255,30,65,0.5) 70%,transparent)', boxShadow:'0 0 20px rgba(255,30,65,0.4)' }} />
      </div>
    </section>
  )
}
