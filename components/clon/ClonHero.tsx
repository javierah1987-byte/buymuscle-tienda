'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// HERO clon fiel del PrestaShop (tienda.buymuscle.es): sección 66/33 con el
// carrusel de campañas (7 slides reales, 1600×630) + banner lateral estático
// (Vitamina E). Config fiel al original (slick del theme): autoplay 7000ms,
// transición ~600ms, flechas, infinito, pausa al hover. Sin dots (como allí).
// Las imágenes viven rehospedadas en Supabase (clon-home/) — el PrestaShop
// desaparecerá y la home no puede depender de él.
const CDN = 'https://awwlbepjxuoxaigztugh.supabase.co/storage/v1/object/public/product-images/clon-home/'

type Slide = { img: string; alt: string; href: string; external?: boolean }

const SLIDES: Slide[] = [
  { img: 'slide-1-proteinas-matrix.jpg', alt: 'Nuevas proteínas iO.GENIX: Whey Nova Matrix y Milk Protein Isolate', href: '/tienda?cat=Proteinas' },
  { img: 'slide-2-salsas-siropes.jpg', alt: 'Salsas y siropes Gourmet Selection iO.GENIX', href: '/tienda?cat=' + encodeURIComponent('Salsas y Siropes') },
  { img: 'slide-3-isolate-sabores.jpg', alt: 'Isolate iO.GENIX: nuevos sabores', href: '/tienda?cat=' + encodeURIComponent('Proteína Isolatada') },
  { img: 'slide-4-protein-rings.jpg', alt: 'Protein Rings iO.GENIX', href: '/producto/1697' },
  { img: 'slide-5-canal-whatsapp.jpg', alt: 'Canal de WhatsApp de BuyMuscle', href: 'https://www.whatsapp.com/channel/0029VbAZetpF6smwmI1pv20X', external: true },
  { img: 'slide-6-streetflavour.jpg', alt: 'StreetFlavour: moda callejera', href: '/streetflavour' },
  { img: 'slide-7-bm-vip.jpg', alt: 'BM VIP: club de ventajas BuyMuscle', href: '/login' },
]

const SIDE_BANNER = { img: 'banner-lateral-vitamina-e.jpg', alt: 'Nueva Vitamina E iO.GENIX', href: '/producto/1729' }

const AUTOPLAY_MS = 7000
const EASE = 'transform 650ms cubic-bezier(0.33, 1, 0.68, 1)'

export default function ClonHero() {
  // Track con clones en ambos extremos: [último, ...slides, primero].
  // pos 1..N son las slides reales; al aterrizar en un clon se salta sin
  // transición a la real equivalente (loop infinito sin rebobinado visible).
  const N = SLIDES.length
  const [pos, setPos] = useState(1)
  const [anim, setAnim] = useState(true)
  const pausedRef = useRef(false)
  const touchX = useRef<number | null>(null)

  const go = useCallback((dir: 1 | -1) => {
    setAnim(true)
    // Clamp a [0, N+1]: si ya estamos transicionando sobre un clon, no salirse
    // del track (evita el hueco negro con clicks muy rápidos en las flechas).
    setPos(p => {
      const n = p + dir
      return n < 0 || n > N + 1 ? p : n
    })
  }, [N])

  // Al terminar la transición sobre un clon → salto invisible a la slide real
  const onTransitionEnd = () => {
    if (pos === N + 1) { setAnim(false); setPos(1) }
    else if (pos === 0) { setAnim(false); setPos(N) }
  }
  // Re-activar la animación el frame siguiente al salto invisible
  useEffect(() => {
    if (!anim) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)))
      return () => cancelAnimationFrame(id)
    }
  }, [anim])

  useEffect(() => {
    const t = setInterval(() => { if (!pausedRef.current) go(1) }, AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [go])

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; pausedRef.current = true }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current !== null) {
      const dx = e.changedTouches[0].clientX - touchX.current
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
    }
    touchX.current = null
    setTimeout(() => { pausedRef.current = false }, 3000)
  }

  const track = [SLIDES[N - 1], ...SLIDES, SLIDES[0]]

  const slideInner = (s: Slide, i: number) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={CDN + s.img} alt={s.alt} draggable={false}
      loading={i === 1 ? 'eager' : 'lazy'}
      // @ts-ignore — fetchpriority llega a React como atributo minúsculas
      fetchpriority={i === 1 ? 'high' : undefined}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  )

  return (
    <section style={{ background: '#f5f5f5', padding: '16px 20px 0' }}>
      <div className="clon-hero-grid" style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Slider de campañas (66%) */}
        <div role="region" aria-roledescription="carrusel" aria-label="Campañas destacadas"
          style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1600 / 630', background: '#111' }}
          onMouseEnter={() => { pausedRef.current = true }}
          onMouseLeave={() => { pausedRef.current = false }}
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div onTransitionEnd={onTransitionEnd}
            style={{ display: 'flex', height: '100%', transform: `translateX(-${pos * 100}%)`, transition: anim ? EASE : 'none', willChange: 'transform' }}>
            {track.map((s, i) => (
              <div key={i} style={{ flex: '0 0 100%', minWidth: '100%', height: '100%' }}>
                {s.external
                  ? <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', height: '100%' }}>{slideInner(s, i)}</a>
                  : <Link href={s.href} style={{ display: 'block', height: '100%' }}>{slideInner(s, i)}</Link>}
              </div>
            ))}
          </div>
          <button className="clon-hero-arrow" aria-label="Anterior" onClick={() => go(-1)} style={{ left: 12 }}>‹</button>
          <button className="clon-hero-arrow" aria-label="Siguiente" onClick={() => go(1)} style={{ right: 12 }}>›</button>
        </div>

        {/* Banner lateral fijo (33%) — como el original, solo desktop */}
        <Link href={SIDE_BANNER.href} className="clon-hero-side" aria-label={SIDE_BANNER.alt}
          style={{ position: 'relative', overflow: 'hidden', display: 'block', background: '#0b2436' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CDN + SIDE_BANNER.img} alt={SIDE_BANNER.alt} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', transition: 'transform 500ms ease' }} />
        </Link>
      </div>
    </section>
  )
}
