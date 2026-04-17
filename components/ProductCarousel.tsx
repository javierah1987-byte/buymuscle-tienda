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

  const STEP = 620

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 5)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5)
  }, [])

  // CLAVE: usar scrollTo() en lugar de scrollLeft += 
  const goLeft = () => {
    const el = trackRef.current
    if (el) el.scrollTo({ left: el.scrollLeft - STEP, behavior: 'smooth' })
  }

  const goRight = () => {
    const el = trackRef.current
    if (el) el.scrollTo({ left: el.scrollLeft + STEP, behavior: 'smooth' })
  }

  if (!products.length) return null

  const arrowStyle = (disabled: boolean): React.CSSProperties => ({
    width: 32, height: 32,
    border: '1px solid ' + (disabled ? '#eee' : '#bbb'),
    background: 'white',
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18,
    color: disabled ? '#ddd' : '#444',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.15s',
    flexShrink: 0,
  })

  return (
    <section style={{ padding:'2rem 0', background:'white', borderTop:'1px solid #ebebeb' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', borderBottom:'2px solid #e0e0e0', paddingBottom:'0.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {titleIcon && <span style={{ fontSize:18 }}>{titleIcon}</span>}
            <h2 style={{ fontSize:16, fontWeight:800, textTransform:'uppercase', color:'#111', margin:0 }}>{title}</h2>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button
              onClick={goLeft}
              style={arrowStyle(atStart)}
              onMouseEnter={e => { if (!atStart) { e.currentTarget.style.background='var(--red)'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='var(--red)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background='white'; e.currentTarget.style.color=atStart?'#ddd':'#444'; e.currentTarget.style.borderColor=atStart?'#eee':'#bbb'; }}>
              ‹
            </button>
            <button
              onClick={goRight}
              style={arrowStyle(atEnd)}
              onMouseEnter={e => { if (!atEnd) { e.currentTarget.style.background='var(--red)'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='var(--red)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background='white'; e.currentTarget.style.color=atEnd?'#ddd':'#444'; e.currentTarget.style.borderColor=atEnd?'#eee':'#bbb'; }}>
              ›
            </button>
            <Link href={href} style={{ fontSize:12, color:'var(--red)', fontWeight:700, textDecoration:'none', border:'1px solid var(--red)', padding:'5px 14px' }}>
              {hrefLabel}
            </Link>
          </div>
        </div>

        {/* Track scrollable */}
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
          {products.map(p => (
            <div key={p.id} style={{ flexShrink:0, width:'23.8%', minWidth:210 }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
