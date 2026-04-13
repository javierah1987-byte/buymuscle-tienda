'use client'
import Link from 'next/link'
import{useCart}from '@/lib/cart'
import{usePathname}from 'next/navigation'
export default function Navbar(){
  const{count}=useCart()
  const path=usePathname()
  return(
    <nav className="nav"><div className="container"><div className="nav-inner">
      <Link href="/" className="nav-logo">Buy<span>Muscle</span></Link>
      <div className="nav-links">
        <Link href="/tienda" className={path.startsWith('/tienda')?'active':''}>Tienda</Link>
        <Link href="/tienda?cat=Prote%C3%ADnas">Proteínas</Link>
        <Link href="/tienda?cat=Pre-entrenos">Pre-entrenos</Link>
        <Link href="/tienda?cat=Creatinas%20Monohidratos">Creatina</Link>
        <Link href="/distribuidores" className={path.startsWith('/distribuidores')?'active':''}>Distribuidores</Link>
      </div>
      <Link href="/carrito" className="nav-cart">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        Carrito
        {count>0&&<span className="cart-count">{count}</span>}
      </Link>
    </div></div></nav>
  )
}
