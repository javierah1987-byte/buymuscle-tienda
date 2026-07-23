'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'

// Track de carrusel "embebible" para los paneles editoriales (panel de texto +
// carrusel). Mismo gesto que ProductCarousel pero sin cabecera propia: flechas
// flotantes sobre el track. No toca ProductCarousel (que sigue siendo el
// carrusel simple con cabecera de las secciones de producto puro).
export default function CarouselTrack({ products, autoplayMs = 4000 }: { products: any[]; autoplayMs?: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const pausedRef = useRef(false)

  const STEP = 280 // ancho de una tarjeta aprox

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 5)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5)
  }, [])

  const go = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    pausedRef.current = true
    setTimeout(() => { pausedRef.current = false }, 5000)
    el.scrollTo({ left: Math.max(0, el.scrollLeft + dir * STEP), behavior: 'instant' as ScrollBehavior })
  }

  // Autoplay — avanza de uno en uno, vuelve al inicio al llegar al final
  useEffect(() => {
    const el = trackRef.current
    if (!el || products.length <= 3) return
    const interval = setInterval(() => {
      if (pausedRef.current) return
      const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5
      el.scrollTo({ left: isAtEnd ? 0 : el.scrollLeft + STEP, behavior: 'instant' as ScrollBehavior })
      setTimeout(() => {
        setAtStart(el.scrollLeft <= 5)
        setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5)
      }, 50)
    }, autoplayMs)
    return () => clearInterval(interval)
  }, [products.length, autoplayMs])

  if (!products.length) return null

  const arrowStyle = (side: 'left' | 'right', disabled: boolean): React.CSSProperties => ({
    position: 'absolute', [side]: 6, top: '50%', transform: 'translateY(-50%)',
    width: 40, height: 40, borderRadius: '50%', zIndex: 2,
    border: '1px solid ' + (disabled ? '#eee' : '#ccc'),
    background: disabled ? 'rgba(250,250,250,0.9)' : 'rgba(255,255,255,0.95)',
    color: disabled ? '#ccc' : '#333',
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, lineHeight: '1', boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
    userSelect: 'none' as const,
  })

  return (
    <div style={{ position: 'relative', minWidth: 0 }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}>
      <button onClick={() => go(-1)} aria-label="Productos anteriores" style={arrowStyle('left', atStart)}>‹</button>
      <button onClick={() => go(1)} aria-label="Productos siguientes" style={arrowStyle('right', atEnd)}>›</button>
      <div ref={trackRef} onScroll={onScroll}
        style={{ display: 'flex', gap: '1px', overflowX: 'scroll', scrollbarWidth: 'none', msOverflowStyle: 'none', background: '#e0e0e0' } as React.CSSProperties}>
        {products.map(p => (
          <div key={p.id} style={{ flexShrink: 0, width: '31%', minWidth: 200, maxWidth: 290 }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  )
}
