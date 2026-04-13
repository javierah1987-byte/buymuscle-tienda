'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const { count } = useCart()
  const path = usePathname()
  const isTPV = path.startsWith('/tpv')
  const [mobileOpen, setMobileOpen] = useState(false)

  if (isTPV) return (
    <nav className="nav">
      <div className="container">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">BUYMUSCLE</Link>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            TPV — Punto de Venta
          </div>
          <Link href="/tienda" style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)', padding: '7px 14px', transition: 'all 0.15s' }}>
            Salir del TPV
          </Link>
        </div>
      </div>
    </nav>
  )

  const NAV_LINKS = [
    { href: '/tienda', label: 'Tienda' },
    { href: '/tienda?cat=Prote%C3%ADnas', label: 'Proteínas' },
    { href: '/tienda?cat=Creatinas%20Monohidratos', label: 'Creatina' },
    { href: '/tienda?cat=Pre-entrenos', label: 'Pre-entrenos' },
    { href: '/tienda?cat=Vitaminas', label: 'Vitaminas' },
    { href: '/tienda?cat=BCAA', label: 'BCAA' },
    { href: '/tienda?cat=Quemadores', label: 'Quemadores' },
    { href: '/distribuidores', label: 'Distribuidores' },
  ]

  return (
    <>
      {/* Top bar */}
      <div style={{ background: 'var(--red)', color: 'white', textAlign: 'center', padding: '7px', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        🚚 Envío GRATIS en pedidos +50€ · 24/48h
      </div>
      <nav className="nav">
        <div className="container">
          <div className="nav-inner">
            {/* Logo */}
            <Link href="/" className="nav-logo">BUYMUSCLE</Link>

            {/* Search - desktop */}
            <form action="/tienda" method="get" style={{ flex: 1, maxWidth: 480, margin: '0 2rem', display: 'flex' }}
              onSubmit={e => { e.preventDefault(); const q = (e.currentTarget.querySelector('input') as HTMLInputElement).value; if (q) window.location.href = `/tienda?q=${encodeURIComponent(q)}` }}>
              <input
                name="q"
                placeholder="Buscar suplementos..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 0, padding: '9px 14px', fontSize: 13, width: '100%', margin: 0 }}
              />
              <button type="submit" style={{ background: 'var(--red)', border: 'none', color: 'white', padding: '9px 16px', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </form>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link href="/tpv" style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.15)', transition: 'all 0.15s' }}>
                🖥️ TPV
              </Link>
              <Link href="/carrito" className="nav-cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                {count > 0 && <span className="cart-count">{count}</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* Category nav bar */}
        <div style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                    color: path === link.href || (link.href !== '/tienda' && path.startsWith(link.href.split('?')[0])) ? 'var(--red)' : 'rgba(255,255,255,0.75)',
                    padding: '11px 14px', display: 'block', whiteSpace: 'nowrap',
                    borderBottom: path === link.href ? '2px solid var(--red)' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
