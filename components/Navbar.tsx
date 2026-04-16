'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const LEVEL_COLORS: Record<string,string> = { Bronze:'#cd7f32', Silver:'#a8a9ad', Gold:'#ffd700' }

const NUTRICION_ITEMS = [
  {l:'Proteínas',h:'/tienda?cat=Proteínas'},{l:'Proteína Whey',h:'/tienda?cat=Proteína Whey'},
  {l:'Proteína Isolatada',h:'/tienda?cat=Proteína Isolatada'},{l:'Proteína Vegetal',h:'/tienda?cat=Proteína Vegetal'},
  {l:'Caseínas',h:'/tienda?cat=Caseínas'},{l:'Ganadores de Peso',h:'/tienda?cat=Ganadores de Peso'},
  {l:'Barritas Protéicas',h:'/tienda?cat=Barritas Protéicas'},{l:'Snacks Protéicos',h:'/tienda?cat=Snacks Protéicos'},
  {l:'Creatinas',h:'/tienda?cat=Creatinas Monohidratos'},{l:'Pre-entrenos',h:'/tienda?cat=Pre-entrenos'},
  {l:'BCAA',h:'/tienda?cat=BCAA'},{l:'Aminoácidos',h:'/tienda?cat=Aminoácidos'},
  {l:'L-Carnitina',h:'/tienda?cat=L-Carnitina'},{l:'Glutaminas',h:'/tienda?cat=Glutaminas'},
]
const OBJETIVOS_ITEMS = [
  {l:'Ganar Músculo',h:'/tienda?cat=Ganar Músculo'},{l:'Quemadores',h:'/tienda?cat=Quemadores'},
  {l:'Control de Peso',h:'/tienda?cat=Control de Peso'},{l:'Vitaminas',h:'/tienda?cat=Vitaminas'},
  {l:'Omega 3',h:'/tienda?cat=Omega 3'},{l:'Colágeno',h:'/tienda?cat=Colágeno'},
  {l:'Tribulus',h:'/tienda?cat=Tribulus'},{l:'Cafeína',h:'/tienda?cat=Cafeína'},
]

export default function Navbar() {
  const { count } = useCart()
  const { isDistributor, levelName, discountPct, signOut, loading } = useAuth()
  const path = usePathname()
  const router = useRouter()
  const isTPV = path.startsWith('/tpv')
  const [openMenu, setOpenMenu] = useState<string|null>(null)

  const handleSignOut = async () => { await signOut(); router.push('/') }

  if (isTPV) return (
    <nav style={{background:'black',position:'sticky',top:0,zIndex:100}}>
      <div className="container"><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:60}}>
        <Link href="/" className="nav-logo">BUYMUSCLE</Link>
        <span style={{color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:700,textTransform:'uppercase'}}>TPV — Punto de Venta</span>
        <Link href="/tienda" style={{color:'rgba(255,255,255,0.5)',fontSize:12,fontWeight:700,border:'1px solid rgba(255,255,255,0.2)',padding:'6px 14px'}}>Salir</Link>
      </div></div>
    </nav>
  )

  return (
    <>
      {/* Barra distribuidores o vacía */}
      {isDistributor && levelName ? (
        <div style={{background:LEVEL_COLORS[levelName],color:levelName==='Silver'?'#111':'white',textAlign:'center',padding:'6px',fontSize:12,fontWeight:700,letterSpacing:'0.05em',textTransform:'uppercase'}}>
          {levelName==='Bronze'?'🥉':levelName==='Silver'?'🥈':'🥇'} Portal Distribuidor — Nivel {levelName} · Descuento {discountPct}% aplicado
        </div>
      ) : null}

      <header style={{background:'black',position:'sticky',top:isDistributor?30:0,zIndex:100,boxShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>
        {/* Fila 1: Logo + buscador + iconos */}
        <div className="container">
          <div style={{display:'flex',alignItems:'center',gap:'1.5rem',height:65}}>
            {/* Logo */}
            <Link href="/" style={{fontFamily:'var(--font-body)',fontSize:28,fontWeight:900,color:'var(--red)',fontStyle:'italic',textTransform:'uppercase',letterSpacing:'0.01em',flexShrink:0,textDecoration:'none'}}>
              BUYMUSCLE
            </Link>

            {/* Buscador central grande */}
            <form action="/tienda" method="get" style={{flex:1,display:'flex',maxWidth:600}}
              onSubmit={e=>{e.preventDefault();const q=(e.currentTarget.querySelector('input') as HTMLInputElement).value;if(q)window.location.href=`/tienda?q=${encodeURIComponent(q)}`}}>
              <input name="q" placeholder="Buscar..." style={{flex:1,background:'white',border:'none',color:'#333',borderRadius:0,padding:'10px 16px',fontSize:14,width:'100%',margin:0,outline:'none'}}/>
              <button type="submit" style={{background:'var(--red)',border:'none',color:'white',padding:'10px 18px',cursor:'pointer',fontSize:14,flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </form>

            {/* Iconos derecha */}
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexShrink:0}}>
              {/* Auth distribuidor */}
              {!loading && (isDistributor && levelName ? (
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:11,fontWeight:700,padding:'4px 10px',background:`${LEVEL_COLORS[levelName]}20`,border:`1px solid ${LEVEL_COLORS[levelName]}60`,color:LEVEL_COLORS[levelName],textTransform:'uppercase'}}>
                    {levelName==='Bronze'?'🥉':levelName==='Silver'?'🥈':'🥇'} -{discountPct}%
                  </span>
                  <button onClick={handleSignOut} style={{fontSize:11,color:'rgba(255,255,255,0.5)',background:'none',border:'1px solid rgba(255,255,255,0.2)',padding:'4px 10px',cursor:'pointer',fontFamily:'var(--font-body)'}}>Salir</button>
                </div>
              ) : (
                <Link href="/distribuidores/login" style={{color:'rgba(255,255,255,0.7)',fontSize:13,display:'flex',flexDirection:'column',alignItems:'center',gap:2,textDecoration:'none'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span style={{fontSize:10}}>Acceder</span>
                </Link>
              ))}

              {/* TPV */}
              <Link href="/tpv" style={{color:'rgba(255,255,255,0.5)',fontSize:11,display:'flex',flexDirection:'column',alignItems:'center',gap:2,textDecoration:'none',padding:'0 4px'}}>
                <span style={{fontSize:16}}>🖥️</span><span>TPV</span>
              </Link>

              {/* Carrito */}
              <Link href="/carrito" style={{color:'white',display:'flex',flexDirection:'column',alignItems:'center',gap:2,textDecoration:'none',position:'relative',padding:'0 4px'}}>
                <div style={{position:'relative'}}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  {count>0&&<span style={{position:'absolute',top:-6,right:-8,background:'var(--red)',color:'white',width:16,height:16,borderRadius:'50%',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{count}</span>}
                </div>
                <span style={{fontSize:10}}>Carrito</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Fila 2: Menú de navegación */}
        <div style={{background:'#111',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="container">
            <div style={{display:'flex',alignItems:'center',position:'relative'}}>
              {/* Nutrición Deportiva con dropdown */}
              <div style={{position:'relative'}} onMouseEnter={()=>setOpenMenu('nutricion')} onMouseLeave={()=>setOpenMenu(null)}>
                <button style={{fontFamily:'var(--font-body)',fontSize:12,fontWeight:700,letterSpacing:'0.04em',textTransform:'uppercase',color:'rgba(255,255,255,0.85)',padding:'12px 16px',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
                  NUTRICIÓN DEPORTIVA <span style={{fontSize:8}}>▼</span>
                </button>
                {openMenu==='nutricion'&&(
                  <div style={{position:'absolute',top:'100%',left:0,background:'white',border:'1px solid #e8e8e8',minWidth:200,zIndex:200,boxShadow:'0 4px 16px rgba(0,0,0,0.15)'}}>
                    {NUTRICION_ITEMS.map(item=>(
                      <Link key={item.l} href={item.h} style={{display:'block',padding:'9px 16px',fontSize:13,color:'#333',textDecoration:'none',borderBottom:'1px solid #f0f0f0'}}
                        onMouseEnter={e=>(e.currentTarget.style.background='#f5f5f5')}
                        onMouseLeave={e=>(e.currentTarget.style.background='white')}>
                        {item.l}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Objetivos con dropdown */}
              <div style={{position:'relative'}} onMouseEnter={()=>setOpenMenu('objetivos')} onMouseLeave={()=>setOpenMenu(null)}>
                <button style={{fontFamily:'var(--font-body)',fontSize:12,fontWeight:700,letterSpacing:'0.04em',textTransform:'uppercase',color:'rgba(255,255,255,0.85)',padding:'12px 16px',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
                  OBJETIVOS <span style={{fontSize:8}}>▼</span>
                </button>
                {openMenu==='objetivos'&&(
                  <div style={{position:'absolute',top:'100%',left:0,background:'white',border:'1px solid #e8e8e8',minWidth:180,zIndex:200,boxShadow:'0 4px 16px rgba(0,0,0,0.15)'}}>
                    {OBJETIVOS_ITEMS.map(item=>(
                      <Link key={item.l} href={item.h} style={{display:'block',padding:'9px 16px',fontSize:13,color:'#333',textDecoration:'none',borderBottom:'1px solid #f0f0f0'}}
                        onMouseEnter={e=>(e.currentTarget.style.background='#f5f5f5')}
                        onMouseLeave={e=>(e.currentTarget.style.background='white')}>
                        {item.l}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Links directos */}
              {[
                {l:'SPORT WEAR',h:'/tienda?cat=Sport Wear'},
                {l:'VEGANOS',h:'/tienda?cat=Veganos'},
                {l:'LO MÁS VENDIDO',h:'/tienda'},
                {l:'PRE-PEDIDOS',h:'/tienda?cat=Pre-Pedidos'},
                {l:'BLOG',h:'#'},
              ].map(link=>(
                <Link key={link.l} href={link.h} style={{fontFamily:'var(--font-body)',fontSize:12,fontWeight:700,letterSpacing:'0.04em',textTransform:'uppercase',color:'rgba(255,255,255,0.85)',padding:'12px 16px',display:'block',whiteSpace:'nowrap',textDecoration:'none'}}>
                  {link.l}
                </Link>
              ))}

              {/* Spacer */}
              <div style={{flex:1}}/>

              {/* Botones de colores exactos al original */}
              <Link href="/distribuidores" style={{fontFamily:'var(--font-body)',fontSize:11,fontWeight:700,padding:'8px 12px',background:'#FBEC96',color:'#111',textTransform:'uppercase',letterSpacing:'0.04em',textDecoration:'none',whiteSpace:'nowrap'}}>BM VIP</Link>
              <Link href="/distribuidores" style={{fontFamily:'var(--font-body)',fontSize:11,fontWeight:700,padding:'8px 12px',background:'#00F399',color:'#111',textTransform:'uppercase',letterSpacing:'0.04em',textDecoration:'none',whiteSpace:'nowrap'}}>BM TEAM</Link>
              <Link href="/tienda?cat=Ofertas" style={{fontFamily:'var(--font-body)',fontSize:11,fontWeight:700,padding:'8px 12px',background:'#FF2958',color:'white',textTransform:'uppercase',letterSpacing:'0.04em',textDecoration:'none',whiteSpace:'nowrap'}}>OFERTAS</Link>
              <Link href="/tienda?cat=StreetFlavour" style={{fontFamily:'var(--font-body)',fontSize:11,fontWeight:700,padding:'8px 12px',background:'#47DAFF',color:'#111',textTransform:'uppercase',letterSpacing:'0.04em',textDecoration:'none',whiteSpace:'nowrap'}}>STREETFLAVOUR</Link>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
