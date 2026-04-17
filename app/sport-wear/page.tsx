import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
export const revalidate = 60

async function getProducts() {
  const cats = ['Sport Wear','Camisetas','Mochilas y Bolsos','Toallas','Accesorios']
  const { data: catData } = await supabase.from('categories').select('id').in('name', cats)
  const ids = catData?.map((c:any)=>c.id) || []
  if(!ids.length) {
    const { data } = await supabase.from('products').select('*, categories(name)').eq('active',true).gt('stock',0).order('id',{ascending:false}).limit(20)
    return data || []
  }
  const { data } = await supabase.from('products').select('*, categories(name)').in('category_id',ids).eq('active',true).gt('stock',0).order('id',{ascending:false}).limit(48)
  return data || []
}

export default async function SportWearPage() {
  const products = await getProducts()
  return (
    <div style={{background:'#f5f5f5',minHeight:'80vh'}}>
      <section style={{position:'relative',height:280,overflow:'hidden',background:'#111'}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://tienda.buymuscle.es/img/cms/BANNER-WEB-1600X630-STREETFLAVOUR.jpg" alt="Sport Wear"
          style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.45}}/>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--red)',textTransform:'uppercase',letterSpacing:'0.15em',marginBottom:8}}>BUYMUSCLE</div>
          <h1 style={{fontSize:'clamp(32px,5vw,60px)',fontWeight:900,color:'white',textTransform:'uppercase',letterSpacing:'0.03em',lineHeight:1}}>SPORT WEAR</h1>
          <p style={{color:'rgba(255,255,255,0.55)',marginTop:12,fontSize:14}}>Ropa deportiva para el gym y la calle</p>
        </div>
      </section>
      <div style={{background:'white',borderBottom:'1px solid #ebebeb'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'10px 20px'}}>
          <div style={{display:'flex',gap:6,alignItems:'center',fontSize:12,color:'#999'}}>
            <Link href="/" style={{color:'#999',textDecoration:'none'}}>Inicio</Link><span>›</span>
            <span style={{color:'#333',fontWeight:600}}>Sport Wear</span>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'2rem 20px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem',borderBottom:'2px solid #e0e0e0',paddingBottom:'0.75rem'}}>
          <h2 style={{fontSize:20,fontWeight:800,textTransform:'uppercase',color:'#111',margin:0}}>
            SPORT WEAR <span style={{fontSize:14,fontWeight:400,color:'#999'}}>({products.length} productos)</span>
          </h2>
          <Link href="/tienda?cat=Sport Wear" style={{fontSize:12,color:'var(--red)',fontWeight:700,textDecoration:'none',border:'1px solid var(--red)',padding:'5px 14px'}}>Ver catálogo →</Link>
        </div>
        {products.length > 0 ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',background:'#e0e0e0'}}>
            {products.map((p:any) => <ProductCard key={p.id} product={p}/>)}
          </div>
        ) : (
          <div style={{textAlign:'center',padding:'4rem',background:'white'}}>
            <div style={{fontSize:56,marginBottom:'1rem'}}>👕</div>
            <h3 style={{fontSize:18,fontWeight:700,color:'#333',marginBottom:'0.5rem'}}>Próximamente</h3>
            <p style={{color:'#888',marginBottom:'1.5rem'}}>Estamos preparando los productos de Sport Wear</p>
            <Link href="/tienda" style={{background:'var(--red)',color:'white',padding:'12px 28px',fontFamily:'var(--font-body)',fontSize:13,fontWeight:700,textDecoration:'none',textTransform:'uppercase',display:'inline-block'}}>
              Ver todo el catálogo
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
