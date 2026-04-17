'use client'
import { useRef, useState, useEffect } from 'react'
import { Product } from '@/lib/supabase'
import ProductCard from './ProductCard'
import Link from 'next/link'

interface Props {
  products: Product[]
  title: string
  titleIcon?: string
  href?: string
  hrefLabel?: string
}

export default function ProductCarousel({ products, title, titleIcon, href = '/tienda', hrefLabel = 'Ver todos →' }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const CARD_W = 290 // ancho aproximado de cada tarjeta

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 10)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    checkScroll()
    return () => el.removeEventListener('scroll', checkScroll)
  }, [products])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? CARD_W * 2 : -CARD_W * 2, behavior: 'smooth' })
  }

  if (!products.length) return null

  return (
    <section style={{ padding: '2.5rem 0', background: 'white', borderTop: '1px solid #ebebeb' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {titleIcon && <span style={{ fontSize: 20 }}>{titleIcon}</span>}
            <h2 style={{ fontSize: 17, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: 0 }}>{title}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Flechas */}
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => scroll('left')}
                disabled={!canLeft}
                style={{ width: 32, height: 32, border: '1px solid', borderColor: canLeft ? '#ccc' : '#eee', background: 'white', cursor: canLeft ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: canLeft ? '#333' : '#ccc', transition: 'all 0.15s', fontFamily: 'var(--font-body)' }}
                onMouseEnter={e => { if (canLeft) e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--red)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = canLeft ? '#333' : '#ccc'; e.currentTarget.style.borderColor = canLeft ? '#ccc' : '#eee'; }}>
                ‹
              </button>
              <button onClick={() => scroll('right')}
                disabled={!canRight}
                style={{ width: 32, height: 32, border: '1px solid', borderColor: canRight ? '#ccc' : '#eee', background: 'white', cursor: canRight ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: canRight ? '#333' : '#ccc', transition: 'all 0.15s', fontFamily: 'var(--font-body)' }}
                onMouseEnter={e => { if (canRight) { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--red)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = canRight ? '#333' : '#ccc'; e.currentTarget.style.borderColor = canRight ? '#ccc' : '#eee'; }}>
                ›
              </button>
            </div>
            <Link href={href} style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, textDecoration: 'none', border: '1px solid var(--red)', padding: '5px 14px' }}>
              {hrefLabel}
            </Link>
          </div>
        </div>

        {/* Carrusel */}
        <div style={{ position: 'relative' }}>
          {/* Flecha izquierda grande — solo si puede scrollear */}
          {canLeft && (
            <button onClick={() => scroll('left')}
              style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 40, height: 80, background: 'white', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#333', boxShadow: '2px 0 8px rgba(0,0,0,0.1)', fontFamily: 'var(--font-body)' }}>
              ‹
            </button>
          )}
          {/* Flecha derecha grande */}
          {canRight && (
            <button onClick={() => scroll('right')}
              style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 40, height: 80, background: 'white', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#333', boxShadow: '-2px 0 8px rgba(0,0,0,0.1)', fontFamily: 'var(--font-body)' }}>
              ›
            </button>
          )}

          {/* Track scrollable */}
          <div ref={scrollRef}
            style={{ display: 'flex', gap: '1px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none', background: '#e0e0e0' }}
            onScroll={checkScroll}>
            {products.map(p => (
              <div key={p.id} style={{ flexShrink: 0, width: `${CARD_W}px`, scrollSnapAlign: 'start' }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
