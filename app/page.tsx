import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import HeroSlider from '@/components/HeroSlider'

const BG_VIDEO_3 = 'https://tienda.buymuscle.es/img/cms/bg-video-BM-3.mp4'
const BASE_BLOG = 'https://tienda.buymuscle.es'

const BLOG_POSTS = [
  { titulo:'Proteina sin lactosa: que opciones elegir si la proteina te cae pesada', href:'/blog/news/proteina-sin-lactosa-que-opciones-elegir-si-la-proteina-te-cae-pesada-o-tienes-intolerancia', img:'/modules/ph_simpleblog/covers/115-thumb.jpg', fecha:'Marzo 3, 2026', cat:'Nutricion' },
  { titulo:'Suplementacion para deportes de resistencia: running, ciclismo o trail en Canarias', href:'/blog/news/suplementacion-para-deportes-de-resistencia-lo-que-necesitas-si-haces-running-ciclismo-o-trail-en-canarias', img:'/modules/ph_simpleblog/covers/114-thumb.jpg', fecha:'Febrero 18, 2026', cat:'Suplementacion' },
  { titulo:'Que tomar antes de entrenar? Opciones naturales y suplementos para energia', href:'/blog/news/que-tomar-antes-de-entrenar-opciones-naturales-y-suplementos-antes-de-entrenar-para-energia', img:'/modules/ph_simpleblog/covers/113-thumb.jpg', fecha:'Febrero 2, 2026', cat:'Pre-entreno' },
]

async function getProducts(cat?: string, limit = 4, orderBy = 'id') {
  let q = supabase.from('products').select('*, categories(name)').eq('active',true).gt('stock',0)
  if(cat){
    const {data:cd} = await supabase.from('categories').select('id').eq('name',cat).single()
    if(cd) q = q.eq('category_id', cd.id)
  }
  if(orderBy === 'stock') q = q.order('stock',{ascending:false})
  else q = q.order('id',{ascending:false})
  const {data} = await q.limit(limit)
  return data || []
}

const QUICK_CATS = [
  {name:'Proteinas',    icon:'🥛', slug:'Proteinas'},
  {name:'Creatinas',   icon:'⚡', slug:'Creatinas Monohidratos'},
  {name:'Pre-entrenos',icon:'🔥', slug:'Pre-entrenos'},
  {name:'BCAA',        icon:'💪', slug:'BCAA'},
  {name:'Vitaminas',   icon:'💊', slug:'Vitaminas'},
  {name:'Quemadores',  icon:'🎯', slug:'Quemadores'},
  {name:'Sport Wear',  icon:'👕', slug:'Sport Wear'},
  {name:'Veganos',     icon:'🌱', slug:'Veganos'},
  {name:'Snacks',      icon:'🍫', slug:'Snacks Proteicos'},
  {name:'Gainers',     icon:'💥', slug:'Ganadores de Peso'},
]

export default async function Home() {
  const [novedades, masVendidos, proteinas, preEntrenos] = await Promise.all([
    getProducts(undefined, 4, 'id'),
    getProducts(undefined, 4, 'stock'),
    getProducts('Proteinas', 4, 'id'),
    getProducts('Pre-entrenos', 4, 'id'),
  ])

  return (
    <div style={{background:'#f5f5f5'}}>
      <HeroSlider />

      {/* Categorias rapidas */}
      <section style={{background:'white',borderBottom:'1px solid #ebebeb',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 20px'}}>
          <div style={{display:'flex',overflowX:'auto'}}>
            {QUICK_CATS.map(cat=>(
              <Link key={cat.name} href={`/tienda?cat=${encodeURIComponent(cat.slug)}`} className="cat-bar-link">
                <span style={{fontSize:22}}>{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NOVEDADES + texto lateral */}
      <section style={{background:'white',padding:'2rem 0 2.5rem',borderBottom:'1px solid #ebebeb'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:0,alignItems:'start'}}>
            <div style={{padding:'1.5rem 2rem 1.5rem 0',borderRight:'1px solid #ebebeb'}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--red)',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:'0.4rem'}}>BUYMUSCLE</div>
              <h2 style={{fontSize:28,fontWeight:900,color:'#111',lineHeight:1.1,marginBottom:'1rem'}}>
                Nutricion<br/>deportiva
              </h2>
              <p style={{fontSize:13,color:'#777',lineHeight:1.8,marginBottom:'1.5rem'}}>
                Compra suplementos deportivos en Canarias. Proteinas, creatina, aminoacidos y pre-entrenos de marcas lideres.
              </p>
              <Link href="/tienda" style={{fontSize:13,fontWeight:700,color:'var(--red)',textDecoration:'none'}}>Ver todo el catalogo →</Link>
              <div style={{marginTop:'1.75rem',display:'flex',flexDirection:'column',gap:6}}>
                <Link href="/sport-wear" style={{display:'block',background:'#111',color:'white',padding:'9px 14px',textDecoration:'none',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>👕 Sport Wear</Link>
                <Link href="/veganos" style={{display:'block',background:'#1a3a1a',color:'#7ed957',padding:'9px 14px',textDecoration:'none',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>🌱 Veganos</Link>
                <Link href="/streetflavour" style={{display:'block',background:'#0a1a2a',color:'#47daff',padding:'9px 14px',textDecoration:'none',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>🎽 StreetFlavour</Link>
                <Link href="/bm-team" style={{display:'block',background:'#001a0d',color:'#00F399',padding:'9px 14px',textDecoration:'none',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>💪 BM Team</Link>
              </div>
            </div>
            <div style={{paddingLeft:'2rem'}}>
              <div style={{marginBottom:'1rem'}}>
                <div style={{fontSize:15,fontWeight:700,textTransform:'uppercase',color:'#222',letterSpacing:'0.04em',marginBottom:'0.6rem'}}>NOVEDADES</div>
                <div style={{borderBottom:'1px solid #e0e0e0',width:'100%'}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',background:'#ebebeb'}}>
                {novedades.map((p:any)=><ProductCard key={p.id} product={p}/>)}
              </div>
              <div style={{marginTop:'0.75rem',textAlign:'right'}}>
                <Link href="/tienda" style={{fontSize:12,color:'var(--red)',fontWeight:700,textDecoration:'none',border:'1px solid var(--red)',padding:'5px 14px',display:'inline-block'}}>Ver todo →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOS MAS VENDIDOS */}
      <section style={{background:'#f5f5f5',padding:'2.5rem 0',borderBottom:'1px solid #e0e0e0'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 20px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',borderBottom:'2px solid #e0e0e0',paddingBottom:'0.75rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:20}}>🏆</span>
              <h2 style={{fontSize:17,fontWeight:800,textTransform:'uppercase',color:'#111',margin:0}}>LOS MAS VENDIDOS</h2>
            </div>
            <Link href="/tienda" style={{fontSize:12,color:'var(--red)',fontWeight:700,textDecoration:'none',border:'1px solid var(--red)',padding:'5px 14px'}}>Ver todos →</Link>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',background:'#e0e0e0'}}>
            {masVendidos.map((p:any)=><ProductCard key={p.id} product={p}/>)}
          </div>
        </div>
      </section>

      {/* DISTRIBUIDORES */}
      <section style={{position:'relative',padding:'3.5rem 0',overflow:'hidden',borderTop:'3px solid var(--red)'}}>
        <video autoPlay muted loop playsInline
          style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',minWidth:'100%',minHeight:'100%',objectFit:'cover',zIndex:0,opacity:0.45,filter:'brightness(0.5)'}}>
          <source src={BG_VIDEO_3} type="video/mp4"/>
        </video>
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.62)',zIndex:1}}/>
        <div style={{position:'relative',zIndex:2,maxWidth:1280,margin:'0 auto',padding:'0 20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:'3rem',alignItems:'center'}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'var(--red)',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:'0.6rem'}}>PROGRAMA EXCLUSIVO</div>
              <h3 style={{fontSize:'clamp(24px,3.5vw,42px)',fontWeight:900,textTransform:'uppercase',color:'white',lineHeight:1.05,marginBottom:'1.25rem'}}>
                PORTAL DE <span style={{color:'var(--red)'}}>DISTRIBUIDORES</span>
              </h3>
              <p style={{color:'rgba(255,255,255,0.5)',fontSize:14,lineHeight:1.7,maxWidth:480,marginBottom:'1.5rem'}}>
                Accede a descuentos exclusivos de hasta un 20% en todos nuestros productos.
              </p>
              <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                {[['Bronze','-10%','#cd7f32'],['Silver','-15%','#a8a9ad'],['Gold','-20%','#ffd700']].map(([n,d,c])=>(
                  <div key={n} style={{background:'rgba(255,255,255,0.06)',border:`1px solid ${c}50`,padding:'10px 20px',textAlign:'center'}}>
                    <div style={{fontSize:12,fontWeight:700,color:c as string,textTransform:'uppercase'}}>{n}</div>
                    <div style={{fontSize:22,fontWeight:900,color:'white',lineHeight:1}}>{d}</div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginTop:2}}>descuento</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',minWidth:200}}>
              <Link href="/distribuidores/login" style={{background:'var(--red)',color:'white',padding:'14px 28px',fontFamily:'var(--font-body)',fontSize:14,fontWeight:700,textDecoration:'none',textTransform:'uppercase',textAlign:'center',display:'block'}}>Acceder al portal</Link>
              <Link href="/distribuidores" style={{background:'transparent',color:'rgba(255,255,255,0.6)',padding:'12px 24px',fontFamily:'var(--font-body)',fontSize:12,fontWeight:700,textDecoration:'none',border:'1px solid rgba(255,255,255,0.2)',textTransform:'uppercase',textAlign:'center',display:'block'}}>Mas informacion</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROTEINAS */}
      {proteinas.length>0 && (
        <section style={{padding:'2.5rem 0',background:'#f5f5f5'}}>
          <div style={{maxWidth:1280,margin:'0 auto',padding:'0 20px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',borderBottom:'2px solid #e0e0e0',paddingBottom:'0.75rem'}}>
              <h2 style={{fontSize:17,fontWeight:800,textTransform:'uppercase',color:'#111',margin:0}}>LAS MEJORES PROTEINAS</h2>
              <Link href="/tienda?cat=Proteinas" style={{fontSize:12,color:'var(--red)',fontWeight:700,textDecoration:'none',border:'1px solid var(--red)',padding:'5px 14px'}}>Ver todas →</Link>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',background:'#e0e0e0'}}>
              {proteinas.map((p:any)=><ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        </section>
      )}

      {/* BM SPORT WEAR BANNER */}
      <section style={{position:'relative',overflow:'hidden',height:280}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://tienda.buymuscle.es/img/cms/BANNER-WEB-1600X630-STREETFLAVOUR.jpg" alt="BM Sportswear"
          style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to right, rgba(0,0,0,0.65) 0%, transparent 55%)'}}/>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 60px'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#47daff',textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:8}}>BUYMUSCLE</div>
          <h2 style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:900,color:'white',textTransform:'uppercase',lineHeight:1,marginBottom:12}}>
            BM <span style={{color:'#47daff'}}>SPORTSWEAR</span>
          </h2>
          <p style={{color:'rgba(255,255,255,0.65)',fontSize:14,maxWidth:380,marginBottom:20}}>Camisetas, hoodies y accesorios BuyMuscle para entrenar con estilo.</p>
          <div style={{display:'flex',gap:10}}>
            <Link href="/sport-wear" style={{background:'white',color:'#111',padding:'11px 24px',fontFamily:'var(--font-body)',fontSize:13,fontWeight:700,textDecoration:'none',textTransform:'uppercase',display:'inline-block'}}>
              Ver Sport Wear
            </Link>
            <Link href="/streetflavour" style={{background:'#47daff',color:'#111',padding:'11px 24px',fontFamily:'var(--font-body)',fontSize:13,fontWeight:700,textDecoration:'none',textTransform:'uppercase',display:'inline-block'}}>
              StreetFlavour
            </Link>
          </div>
        </div>
      </section>

      {/* PRE-ENTRENOS */}
      {preEntrenos.length>0 && (
        <section style={{padding:'2.5rem 0',background:'white',borderTop:'1px solid #ebebeb'}}>
          <div style={{maxWidth:1280,margin:'0 auto',padding:'0 20px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',borderBottom:'2px solid #f0f0f0',paddingBottom:'0.75rem'}}>
              <h2 style={{fontSize:17,fontWeight:800,textTransform:'uppercase',color:'#111',margin:0}}>PRE-ENTRENOS</h2>
              <Link href="/tienda?cat=Pre-entrenos" style={{fontSize:12,color:'var(--red)',fontWeight:700,textDecoration:'none',border:'1px solid var(--red)',padding:'5px 14px'}}>Ver todos →</Link>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',background:'#e0e0e0'}}>
              {preEntrenos.map((p:any)=><ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        </section>
      )}

      {/* BLOG — ultimas 3 entradas */}
      <section style={{padding:'2.5rem 0',background:'#f5f5f5',borderTop:'1px solid #ebebeb'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 20px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem',borderBottom:'2px solid #e0e0e0',paddingBottom:'0.75rem'}}>
            <div>
              <h2 style={{fontSize:17,fontWeight:800,textTransform:'uppercase',color:'#111',margin:0}}>NUESTRO BLOG</h2>
              <div style={{fontSize:12,color:'#999',marginTop:3}}>Nutricion deportiva, entrenamiento y suplementacion</div>
            </div>
            <Link href="/blog" style={{fontSize:12,color:'var(--red)',fontWeight:700,textDecoration:'none',border:'1px solid var(--red)',padding:'5px 14px'}}>Ver todos →</Link>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1px',background:'#e0e0e0'}}>
            {BLOG_POSTS.map(post=>(
              <a key={post.href} href={BASE_BLOG+post.href} target="_blank" rel="noopener noreferrer"
                style={{background:'white',textDecoration:'none',color:'inherit',display:'flex',flexDirection:'column'}}>
                <div style={{height:180,overflow:'hidden',background:'#f0f0f0',flexShrink:0}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={BASE_BLOG+post.img} alt={post.titulo}
                    style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </div>
                <div style={{padding:'1rem',flex:1,display:'flex',flexDirection:'column'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'0.5rem'}}>
                    <span style={{fontSize:10,fontWeight:700,background:'#f0f0f0',color:'#666',padding:'2px 8px',textTransform:'uppercase'}}>{post.cat}</span>
                    <span style={{fontSize:11,color:'#bbb'}}>{post.fecha}</span>
                  </div>
                  <h3 style={{fontSize:14,fontWeight:700,color:'#111',lineHeight:1.4,margin:'0 0 0.5rem',flex:1}}>
                    {post.titulo}
                  </h3>
                  <span style={{fontSize:12,fontWeight:700,color:'var(--red)'}}>Leer mas →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
