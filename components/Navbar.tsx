'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import ShippingBar from '@/components/ShippingBar'

const LEVEL_COLORS: Record<string,string> = { Bronze:'#cd7f32', Silver:'#a8a9ad', Gold:'#ffd700' }

const NUTRICION_MEGA = [
  { col:'PROTEINAS', items:[{l:'Proteinas',h:'/tienda?cat=Proteinas'},{l:'Proteina Whey',h:'/tienda?cat=Proteina Whey'},{l:'Proteina Isolatada',h:'/tienda?cat=Proteina Isolatada'},{l:'Proteina Vegetal',h:'/tienda?cat=Proteina Vegetal'},{l:'Caseinas',h:'/tienda?cat=Caseinas'},{l:'Ganadores de Peso',h:'/tienda?cat=Ganadores de Peso'},{l:'Barritas Proteicas',h:'/tienda?cat=Barritas Proteicas'},{l:'Snacks Proteicos',h:'/tienda?cat=Snacks Proteicos'},{l:'Packs',h:'/tienda?cat=Packs'}]},
  { col:'ALIMENTOS Y SNACKS', items:[{l:'Alimentos y Snacks',h:'/tienda?cat=Alimentos y Snacks'},{l:'Barritas Proteicas',h:'/tienda?cat=Barritas Proteicas'},{l:'Bebidas',h:'/tienda?cat=Bebidas'},{l:'Mantequillas',h:'/tienda?cat=Mantequillas de Frutos Secos'},{l:'Salsas y Siropes',h:'/tienda?cat=Salsas y Siropes'},{l:'Caprichos Fit',h:'/tienda?cat=Caprichos Fit'}]},
  { col:'VITAMINAS Y MINERALES', items:[{l:'Vitaminas',h:'/tienda?cat=Vitaminas'},{l:'Minerales',h:'/tienda?cat=Minerales'},{l:'Omega 3',h:'/tienda?cat=Omega 3'},{l:'Colageno',h:'/tienda?cat=Colageno'},{l:'Sistema Inmunologico',h:'/tienda?cat=Sistema Inmunologico'}]},
  { col:'AMINOACIDOS', items:[{l:'BCAA',h:'/tienda?cat=BCAA'},{l:'Beta Alanina',h:'/tienda?cat=Beta Alanina'},{l:'Glutaminas',h:'/tienda?cat=Glutaminas'},{l:'L-Carnitina',h:'/tienda?cat=L-Carnitina'}]},
  { col:'CREATINA', items:[{l:'Creatinas Monohidratos',h:'/tienda?cat=Creatinas Monohidratos'}]},
  { col:'CONTROL DE PESO', items:[{l:'Quemadores',h:'/tienda?cat=Quemadores'},{l:'Ganadores de Peso',h:'/tienda?cat=Ganadores de Peso'},{l:'Control de Peso',h:'/tienda?cat=Control de Peso'}]},
  { col:'PRE Y POS ENTRENOS', items:[{l:'Pre-entrenos',h:'/tienda?cat=Pre-entrenos'},{l:'Recuperadores',h:'/tienda?cat=Recuperadores'},{l:'Termogenicos',h:'/tienda?cat=Termogenicos'}]},
  { col:'CARBOHIDRATOS', items:[{l:'Avenas',h:'/tienda?cat=Avenas'},{l:'Bebidas Energeticas',h:'/tienda?cat=Bebidas Energeticas'},{l:'Carbohidratos',h:'/tienda?cat=Carbohidratos'}]},
  { col:'ESTIMULANTES', items:[{l:'Cafeina',h:'/tienda?cat=Cafeina'},{l:'Prohormonales',h:'/tienda?cat=Prohormonales'},{l:'ZMA',h:'/tienda?cat=ZMA'}]},
  { col:'ACCESORIOS', items:[{l:'Shaker',h:'/tienda?cat=Accesorios'},{l:'Material Gimnasio',h:'/tienda?cat=Accesorios'},{l:'Mochilas',h:'/tienda?cat=Accesorios'}]},
]

const OBJETIVOS_ITEMS = [
  {l:'Caprichos Fit',h:'/tienda?cat=Caprichos Fit'},
  {l:'Control de Peso',h:'/tienda?cat=Control de Peso'},
  {l:'Ganar Musculo',h:'/tienda?cat=Ganar Musculo'},
  {l:'Rendimiento Deportivo',h:'/tienda?cat=Rendimiento Deportivo'},
  {l:'Salud y Bienestar',h:'/tienda?cat=Salud y Bienestar'},
]

const NAV_DIRECT = [
  {l:'SPORT WEAR',h:'/sport-wear'},
  {l:'VEGANOS',h:'/veganos'},
  {l:'LO MAS VENDIDO',h:'/tienda'},
  {l:'PRE-PEDIDOS',h:'/tienda?cat=Pre-Pedidos'},
  {l:'BLOG',h:'/blog'},
]

function MegaLink({href,children}:{href:string;children:React.ReactNode}){
  return(
    <Link href={href} style={{display:'block',padding:'5px 0',fontSize:13,color:'#444',textDecoration:'none',lineHeight:1.4}}
      onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
      onMouseLeave={e=>(e.currentTarget.style.color='#444')}>
      {children}
    </Link>
  )
}

export default function Navbar(){
  const {count}=useCart()
  const {isDistributor,levelName,discountPct,signOut,loading}=useAuth()
  const path=usePathname()
  const router=useRouter()
  const [openMenu,setOpenMenu]=useState<string|null>(null)
  const isTPV=path.startsWith('/tpv')
  const handleSignOut=async()=>{await signOut();router.push('/')}

  if(isTPV) return(
    <nav style={{background:'black',position:'sticky',top:0,zIndex:100}}>
      <div className="container">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:60}}>
          <Link href="/" className="nav-logo">BUYMUSCLE</Link>
          <span style={{color:'rgba(255,255,255,0.4)',fontSize:12,fontWeight:700,textTransform:'uppercase'}}>TPV</span>
          <Link href="/tienda" style={{color:'rgba(255,255,255,0.4)',fontSize:12,border:'1px solid rgba(255,255,255,0.15)',padding:'5px 12px',textDecoration:'none'}}>Salir</Link>
        </div>
      </div>
    </nav>
  )

  return(
    <>
      {isDistributor&&levelName&&(
        <div style={{background:LEVEL_COLORS[levelName],color:'#000',textAlign:'center',padding:'5px',fontSize:12,fontWeight:700,letterSpacing:'0.05em',textTransform:'uppercase'}}>
          {levelName==='Bronze'?'🥉':levelName==='Silver'?'🥈':'🥇'} Portal Distribuidor {levelName} - -{discountPct}% en todo
        </div>
      )}

      <header style={{background:'#000',position:'sticky',top:0,zIndex:999,boxShadow:'0 1px 0 rgba(255,255,255,0.06)'}}>
        {/* Fila 1: Logo + buscador + iconos */}
        <div style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div className="container">
            <div style={{display:'flex',alignItems:'center',gap:'1.5rem',height:62}}>
              <Link href="/" style={{fontFamily:'var(--font-body)',fontSize:26,fontWeight:900,color:'var(--red)',fontStyle:'italic',textTransform:'uppercase',letterSpacing:'0.02em',textDecoration:'none',flexShrink:0}}>
                BUYMUSCLE
              </Link>
              <form style={{flex:1,display:'flex',maxWidth:560}}
                onSubmit={e=>{e.preventDefault();const q=(e.currentTarget.querySelector('input') as HTMLInputElement).value;if(q)router.push('/tienda?q='+encodeURIComponent(q))}}>
                <input placeholder="Buscar..." style={{flex:1,background:'white',border:'none',padding:'9px 14px',fontSize:13,margin:0,outline:'none',color:'#333'}}/>
                <button type="submit" style={{background:'var(--red)',border:'none',color:'white',padding:'9px 16px',cursor:'pointer',fontSize:14,flexShrink:0}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </button>
              </form>
              <div style={{display:'flex',alignItems:'center',gap:'1rem',flexShrink:0}}>
                {!loading&&(isDistributor&&levelName?(
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:12,fontWeight:700,padding:'4px 10px',background:LEVEL_COLORS[levelName]+'25',border:'1px solid '+LEVEL_COLORS[levelName]+'50',color:LEVEL_COLORS[levelName]}}>
                      {levelName==='Bronze'?'🥉':levelName==='Silver'?'🥈':'🥇'} -{discountPct}%
                    </span>
                    <button onClick={handleSignOut} style={{fontSize:11,color:'rgba(255,255,255,0.4)',background:'none',border:'1px solid rgba(255,255,255,0.15)',padding:'4px 10px',cursor:'pointer',fontFamily:'var(--font-body)'}}>Salir</button>
                  </div>
                ):(
                  <Link href="/distribuidores/login" style={{color:'rgba(255,255,255,0.65)',display:'flex',flexDirection:'column',alignItems:'center',gap:2,textDecoration:'none',fontSize:11,fontWeight:600}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Acceder
                  </Link>
                ))}
                <Link href="/tpv" style={{color:'rgba(255,255,255,0.4)',display:'flex',flexDirection:'column',alignItems:'center',gap:2,textDecoration:'none',fontSize:11,fontWeight:600}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                  TPV
                </Link>
                <Link href="/carrito" style={{color:'white',display:'flex',flexDirection:'column',alignItems:'center',gap:2,textDecoration:'none',position:'relative',fontSize:11,fontWeight:600}}>
                  <div style={{position:'relative'}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    {count>0&&<span style={{position:'absolute',top:-6,right:-8,background:'var(--red)',color:'white',width:15,height:15,borderRadius:'50%',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{count}</span>}
                  </div>
                  Carrito
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Fila 2: Nav bar inferior */}
        <div style={{background:'#111'}}>
          <div className="container">
            <div style={{display:'flex',alignItems:'stretch',position:'relative'}}>

              {/* Icono casa */}
              <Link href="/" style={{height:42,padding:'0 12px',display:'flex',alignItems:'center',color:'rgba(255,255,255,0.8)',fontSize:18,flexShrink:0,textDecoration:'none',transition:'color 0.1s'}}
                onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.8)')}>
                🏠
              </Link>

              {/* NUTRICION DEPORTIVA mega-menu */}
              <div style={{position:'static'}}
                onMouseEnter={()=>setOpenMenu('nutricion')}
                onMouseLeave={()=>setOpenMenu(null)}>
                <button style={{height:42,padding:'0 16px',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:12,fontWeight:700,letterSpacing:'0.05em',textTransform:'uppercase',color:openMenu==='nutricion'?'var(--red)':'rgba(255,255,255,0.85)',display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap'}}>
                  NUTRICION DEPORTIVA <span style={{fontSize:8}}>▼</span>
                </button>
                {openMenu==='nutricion'&&(
                  <div style={{position:'fixed',top:'auto',left:0,right:0,background:'white',borderTop:'3px solid var(--red)',boxShadow:'0 8px 24px rgba(0,0,0,0.15)',zIndex:9999,padding:'1.5rem 0'}}>
                    <div className="container">
                      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'1.5rem'}}>
                        <div style={{borderRight:'1px solid #f0f0f0',paddingRight:'1rem'}}>
                          <div style={{fontSize:11,fontWeight:800,color:'#999',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.75rem'}}>ACCESO RAPIDO</div>
                          {[{l:'Packs',h:'/tienda?cat=Packs'},{l:'Novedades',h:'/tienda'},{l:'Ofertas',h:'/tienda?cat=Ofertas'},{l:'Mas vendidos',h:'/tienda'}].map(item=>(
                            <Link key={item.l} href={item.h} style={{display:'block',padding:'6px 0',fontSize:13,color:'#333',textDecoration:'none',fontWeight:600}}>{item.l}</Link>
                          ))}
                        </div>
                        {NUTRICION_MEGA.slice(0,4).map(col=>(
                          <div key={col.col}>
                            <div style={{fontSize:11,fontWeight:800,color:'var(--red)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'0.6rem',paddingBottom:'0.4rem',borderBottom:'2px solid var(--red)'}}>{col.col}</div>
                            {col.items.map(item=><MegaLink key={item.l} href={item.h}>{item.l}</MegaLink>)}
                          </div>
                        ))}
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'1.5rem',marginTop:'1.25rem',paddingTop:'1.25rem',borderTop:'1px solid #f0f0f0'}}>
                        {NUTRICION_MEGA.slice(4).map(col=>(
                          <div key={col.col}>
                            <div style={{fontSize:11,fontWeight:800,color:'var(--red)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'0.6rem',paddingBottom:'0.4rem',borderBottom:'2px solid var(--red)'}}>{col.col}</div>
                            {col.items.map(item=><MegaLink key={item.l} href={item.h}>{item.l}</MegaLink>)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* OBJETIVOS dropdown */}
              <div style={{position:'relative'}}
                onMouseEnter={()=>setOpenMenu('objetivos')}
                onMouseLeave={()=>setOpenMenu(null)}>
                <button style={{height:42,padding:'0 16px',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:12,fontWeight:700,letterSpacing:'0.05em',textTransform:'uppercase',color:openMenu==='objetivos'?'var(--red)':'rgba(255,255,255,0.85)',display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap'}}>
                  OBJETIVOS <span style={{fontSize:8}}>▼</span>
                </button>
                {openMenu==='objetivos'&&(
                  <div style={{position:'absolute',top:'100%',left:0,background:'white',border:'1px solid #e8e8e8',minWidth:200,zIndex:9999,boxShadow:'0 4px 16px rgba(0,0,0,0.12)',borderTop:'3px solid var(--red)'}}>
                    {OBJETIVOS_ITEMS.map(item=>(
                      <Link key={item.l} href={item.h}
                        style={{display:'block',padding:'9px 16px',fontSize:13,color:'#333',textDecoration:'none',borderBottom:'1px solid #f5f5f5'}}
                        onMouseEnter={e=>{e.currentTarget.style.background='#f9f9f9';e.currentTarget.style.color='var(--red)'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.color='#333'}}>
                        {item.l}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Links directos */}
              {NAV_DIRECT.map(link=>(
                <Link key={link.l} href={link.h}
                  style={{height:42,padding:'0 16px',display:'flex',alignItems:'center',fontFamily:'var(--font-body)',fontSize:12,fontWeight:700,letterSpacing:'0.05em',textTransform:'uppercase',color:'rgba(255,255,255,0.85)',textDecoration:'none',whiteSpace:'nowrap',transition:'color 0.1s'}}
                  onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                  onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.85)')}>
                  {link.l}
                </Link>
              ))}

              <div style={{flex:1}}/>

              {/* Botones de colores */}
              <Link href="/distribuidores" style={{height:42,padding:'0 14px',display:'flex',alignItems:'center',fontFamily:'var(--font-body)',fontSize:11,fontWeight:700,background:'#FBEC96',color:'#111',textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>BM VIP</Link>
              <Link href="/bm-team" style={{height:42,padding:'0 14px',display:'flex',alignItems:'center',fontFamily:'var(--font-body)',fontSize:11,fontWeight:700,background:'#00F399',color:'#111',textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>BM TEAM</Link>
              <Link href="/tienda?cat=Ofertas" style={{height:42,padding:'0 14px',display:'flex',alignItems:'center',fontFamily:'var(--font-body)',fontSize:11,fontWeight:700,background:'#FF2958',color:'white',textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>OFERTAS</Link>
              <Link href="/streetflavour" style={{height:42,padding:'0 14px',display:'flex',alignItems:'center',fontFamily:'var(--font-body)',fontSize:11,fontWeight:700,background:'#47DAFF',color:'#111',textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>STREETFLAVOUR</Link>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
