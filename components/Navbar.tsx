'use client'
import Link from 'next/link'
import{useCart}from '@/lib/cart'
import{usePathname}from 'next/navigation'
export default function Navbar(){
  const{count}=useCart()
  const path=usePathname()
  const isTPV=path.startsWith('/tpv')
  if(isTPV)return(
    <nav className="nav"><div className="container"><div className="nav-inner">
      <Link href="/" className="nav-logo">Buy<span>Muscle</span></Link>
      <div style={{fontFamily:'var(--font-display)',fontSize:13,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--green)'}}>
        TPV — Terminal Punto de Venta
      </div>
      <Link href="/tienda" style={{fontFamily:'var(--font-display)',fontSize:14,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--muted)',transition:'color 0.15s'}}
        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--white)'}}
        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--muted)'}}>
        Salir del TPV
      </Link>
    </div></div></nav>
  )
  return(
    <nav className="nav"><div className="container"><div className="nav-inner">
      <Link href="/" className="nav-logo">Buy<span>Muscle</span></Link>
      <div className="nav-links">
        <Link href="/tienda" className={path.startsWith('/tienda')?'active':''}>Tienda</Link>
        <Link href="/tienda?cat=Prote%C3%ADnas">Proteinas</Link>
        <Link href="/tienda?cat=Pre-entrenos">Pre-entrenos</Link>
        <Link href="/tienda?cat=Creatinas%20Monohidratos">Creatina</Link>
        <Link href="/distribuidores" className={path.startsWith('/distribuidores')?'active':''}>Distribuidores</Link>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
        <Link href="/tpv" style={{fontFamily:'var(--font-display)',fontSize:13,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--muted)',padding:'7px 14px',border:'1px solid var(--border)',borderRadius:4,transition:'all 0.15s',display:'flex',alignItems:'center',gap:6}}>
          🖥️ TPV
        </Link>
        <Link href="/carrito" className="nav-cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Carrito{count>0&&<span className="cart-count">{count}</span>}
        </Link>
      </div>
    </div></div></nav>
  )
}
