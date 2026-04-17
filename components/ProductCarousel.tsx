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

  const goLeft = () => {
    const el = trackRef.current
    if (!el) return
    const newLeft = Math.max(0, el.scrollLeft - STEP)
    el.scrollTo({ left: newLeft, behavior: 'instant' })
  }

  const goRight = () => {
    const el = trackRef.current
    if (!el) return
    const newLeft = el.scrollLeft + STEP
    el.scrollTo({ left: newLeft, behavior: 'instant' })
  }

  if (!products.length) return null

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 34, height: 34,
    border: '1px solid ' + (disabled ? '#eee' : '#bbb'),
    background: disabled ? '#fafafa' : 'white',
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, lineHeight: 1,
    color: disabled ? '#ccc' : '#444',
    fontFamily: 'var(--font-body)',
    flexShrink: 0,
    userSelect: 'none' as const,
  })

  return (
    <section style={{ padding:'2rem 0', background:'white', borderTop:'1px solid #ebebeb' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px' }}>

        {/* Cabecera con flechas */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', borderBottom:'2px solid #e0e0e0', paddingBottom:'0.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {titleIcon && <span style={{ fontSize:18 }}>{titleIcon}</span>}
            <h2 style={{ fontSize:16, fontWeight:800, textTransform:'uppercase', color:'#111', margin:0 }}>{title}</h2>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={goLeft} style={btnStyle(atStart)}
              onMouseEnter={e=>{ if(!atStart){ e.currentTarget.style.background='var(--red)'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='var(--red)'; }}}
              onMouseLeave={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.color=atStart?'#ccc':'#444'; e.currentTarget.style.borderColor=atStart?'#eee':'#bbb'; }}>
              ‹
            </button>
            <button onClick={goRight} style={btnStyle(atEnd)}
              onMouseEnter={e=>{ if(!atEnd){ e.currentTarget.style.background='var(--red)'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='var(--red)'; }}}
              onMouseLeave={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.color=atEnd?'#ccc':'#444'; e.currentTarget.style.borderColor=atEnd?'#eee':'#bbb'; }}>
              ›
            </button>
            <Link href={href} style={{ fontSize:12, color:'var(--red)', fontWeight:700, textDecoration:'none', border:'1px solid var(--red)', padding:'5px 14px' }}>
              {hrefLabel}
            </Link>
          </div>
        </div>

        {/* Track — scroll instant, CSS transition en tarjetas */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          style={{
            display: 'flex',
            gap: '1px',
            overflowX: 'scroll',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            background: '#e0e0e0',
          } as React.CSSProperties}>
          {products.map(p => (
            <div key={p.id} style={{ flexShrink:0, width:'24%', minWidth:210, maxWidth:310 }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
