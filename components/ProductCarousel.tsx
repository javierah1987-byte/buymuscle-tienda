'use client'
import { useRef, useState, useCallback } from 'react'
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
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const STEP = 300 // px por click

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 5)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5)
  }, [])

  const scrollLeft = () => {
    const el = trackRef.current
    if (el) el.scrollLeft -= STEP
  }

  const scrollRight = () => {
    const el = trackRef.current
    if (el) el.scrollLeft += STEP
  }

  if (!products.length) return null

  const btnBase: React.CSSProperties = {
    width: 32, height: 32, border: '1px solid #ccc', background: 'white',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, color: '#333', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
    flexShrink: 0,
  }
  const btnDisabled: React.CSSProperties = { ...btnBase, color: '#ddd', borderColor: '#eee', cursor: 'default' }

  return (
    <section style={{ padding: '2rem 0', background: 'white', borderTop: '1px solid #ebebeb' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {titleIcon && <span style={{ fontSize: 18 }}>{titleIcon}</span>}
            <h2 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: 0 }}>{title}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={scrollLeft} style={atStart ? btnDisabled : btnBase}
              onMouseEnter={e => { if (!atStart) { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--red)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = atStart ? '#ddd' : '#333'; e.currentTarget.style.borderColor = atStart ? '#eee' : '#ccc'; }}>
              ‹
            </button>
            <button onClick={scrollRight} style={atEnd ? btnDisabled : btnBase}
              onMouseEnter={e => { if (!atEnd) { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--red)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = atEnd ? '#ddd' : '#333'; e.currentTarget.style.borderColor = atEnd ? '#eee' : '#ccc'; }}>
              ›
            </button>
            <Link href={href} style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, textDecoration: 'none', border: '1px solid var(--red)', padding: '5px 14px' }}>
              {hrefLabel}
            </Link>
          </div>
        </div>

        {/* Track — sin scroll-snap, con transición CSS */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div
            ref={trackRef}
            onScroll={onScroll}
            style={{
              display: 'flex',
              gap: '1px',
              overflowX: 'scroll',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              background: '#e0e0e0',
            }}>
            {products.map((p, i) => (
              <div key={p.id} style={{ flexShrink: 0, width: '23.5%', minWidth: 220 }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
