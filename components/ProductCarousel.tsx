'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import { Product } from '@/lib/supabase'
import ProductCard from './ProductCard'
import Link from 'next/link'

interface Props {
  products: Product[]
  title: string
  titleIcon?: string
  href?: string
  hrefLabel?: string
  autoplayMs?: number
}

// Sistema PrestaShop "arrows-middle" con colores de marca: flechas circulares
// rojas a los LADOS del track (centradas en vertical) y desplazamiento SUAVE
// por página (scroll smooth + snap), en vez de saltos instant por tarjeta.
export default function ProductCarousel({
  products, title, titleIcon,
  href = '/tienda', hrefLabel = 'Ver todos →',
  autoplayMs = 5000
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const pausedRef = useRef(false)

  // Actualizar estado flechas
  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 5)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5)
  }, [])

  // Avance por PÁGINA (ancho visible ≈ 4 tarjetas desktop), como el
  // slidesToScroll del slick original, con el easing suave del navegador.
  const go = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    pausedRef.current = true
    setTimeout(() => { pausedRef.current = false }, 5000) // pausa 5s al clicar
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
  }

  // Autoplay — avanza una página suave; al llegar al final vuelve al inicio
  useEffect(() => {
    const el = trackRef.current
    if (!el || products.length <= 4) return

    const interval = setInterval(() => {
      if (pausedRef.current) return
      const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5
      if (isAtEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: el.clientWidth, behavior: 'smooth' })
      }
    }, autoplayMs)

    return () => clearInterval(interval)
  }, [products.length, autoplayMs])

  if (!products.length) return null

  return (
    <section
      style={{ padding:'2rem 0', background:'white', borderTop:'1px solid #ebebeb' }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px' }}>

        {/* Cabecera */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', borderBottom:'2px solid #e0e0e0', paddingBottom:'0.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {titleIcon && <span style={{ fontSize:18 }}>{titleIcon}</span>}
            <h2 style={{ fontSize:16, fontWeight:800, textTransform:'uppercase', color:'#111', margin:0 }}>{title}</h2>
          </div>
          <Link href={href} style={{ fontSize:12, color:'var(--red)', fontWeight:700, textDecoration:'none', border:'1px solid var(--red)', padding:'5px 14px' }}>
            {hrefLabel}
          </Link>
        </div>

        {/* Track con flechas laterales */}
        <div className="pc-wrap">
          <button className="pc-arrow pc-arrow-left" onClick={() => go(-1)} disabled={atStart} aria-label="Productos anteriores">‹</button>
          <button className="pc-arrow pc-arrow-right" onClick={() => go(1)} disabled={atEnd} aria-label="Productos siguientes">›</button>
          <div
            ref={trackRef}
            onScroll={onScroll}
            style={{
              display: 'flex',
              gap: '1px',
              overflowX: 'scroll',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x proximity',
              background: '#e0e0e0',
            } as React.CSSProperties}>
            {products.map(p => (
              <div key={p.id} style={{ flexShrink:0, width:'24%', minWidth:210, maxWidth:310, scrollSnapAlign:'start' }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
