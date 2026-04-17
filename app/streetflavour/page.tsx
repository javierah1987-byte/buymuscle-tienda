import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
export const revalidate = 60

async function getProducts() {
  const { data: catData } = await supabase.from('categories').select('id').ilike('name','%street%')
  const ids = catData?.map((c:any)=>c.id) || []
  const q = supabase.from('products').select('*, categories(name)').eq('active',true).gt('stock',0).order('id',{ascending:false})
  const { data } = ids.length ? await q.in('category_id',ids).limit(48) : await q.ilike('name','%street%').limit(24)
  return data || []
}

export default async function StreetFlavourPage() {
  const products = await getProducts()
  return (
    <div style={{background:'#f5f5f5',minHeight:'80vh'}}>
      <section style={{position:'relative',height:300,overflow:'hidden',background:'#0a0a0a'}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://tienda.buymuscle.es/img/cms/BANNER-WEB-1600X630-STREETFLAVOUR.jpg" alt="StreetFlavour"
          style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.7}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 60%)'}}/>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 60px'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#47daff',textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:10}}>BUYMUSCLE</div>
          <h1 style={{fontSize:'clamp(36px,5vw,64px)',fontWeight:900,color:'white',textTransform:'uppercase',letterSpacing:'0.03em',lineHeight:1,marginBottom:10}}>STREET<span style={{color:'#47daff'}}>FLAVOUR</span></h1>
          <p style={{color:'rgba(255,255,255,0.65)',fontSize:15,maxWidth:400}}>Encuentra tu camiseta ahora. Siente el sabor de la calle.</p>
        </div>
      </section>
      <div style={{background:'white',borderBottom:'1px solid #ebebeb'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'10px 20px'}}>
          <div style={{display:'flex',gap:6,alignItems:'center',fontSize:12,color:'#999'}}>
            <Link href="/" style={{color:'#999',textDecoration:'none'}}>Inicio</Link><span>›</span>
            <span style={{color:'#333',fontWeight:600}}>StreetFlavour</span>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'2rem 20px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem',borderBottom:'3px solid #47daff',paddingBottom:'0.75rem'}}>
          <h2 style={{fontSize:20,fontWeight:800,textTransform:'uppercase',color:'#111',margin:0}}>
            STREETFLAVOUR <span style={{fontSize:14,fontWeight:400,color:'#999'}}>({products.length} productos)</span>
          </h2>
          <Link href="/tienda?cat=StreetFlavour" style={{fontSize:12,color:'#47daff',fontWeight:700,textDecoration:'none',border:'1px solid #47daff',padding:'5px 14px'}}>Ver catalogo →</Link>
        </div>
        {products.length > 0 ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',background:'#e0e0e0'}}>
            {products.map((p:any) => <ProductCard key={p.id} product={p}/>)}
          </div>
        ) : (
          <div style={{textAlign:'center',padding:'4rem',background:'white'}}>
            <div style={{fontSize:56,marginBottom:'1rem'}}>🎽</div>
            <h3 style={{fontSize:18,fontWeight:700,color:'#333',marginBottom:'0.5rem'}}>Proximamente</h3>
            <p style={{color:'#888',marginBottom:'1.5rem'}}>Estamos preparando los productos StreetFlavour</p>
            <Link href="/tienda" style={{background:'var(--red)',color:'white',padding:'12px 28px',fontFamily:'var(--font-body)',fontSize:13,fontWeight:700,textDecoration:'none',textTransform:'uppercase',display:'inline-block'}}>
              Ver todo el catalogo
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
