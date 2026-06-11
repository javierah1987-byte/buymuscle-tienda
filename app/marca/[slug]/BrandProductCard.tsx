// @ts-nocheck
'use client'
import Link from 'next/link'

// Tarjeta de producto de la página de marca.
// Es el único trozo que necesita ser cliente (hover + onError de la imagen);
// el resto de la página se renderiza en el servidor con ISR.
export default function BrandProductCard({ p }) {
  const price = Number(p.price_incl_tax || 0)
  const sale = p.sale_price ? Number(p.sale_price) : null
  const hasOffer = sale && sale < price
  return (
    <Link href={'/producto/' + p.id} style={{textDecoration:'none',color:'inherit',display:'block'}}>
      <div style={{background:'white',border:'1px solid #e8e8e8',transition:'all 0.2s'}}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.12)';e.currentTarget.style.transform='translateY(-2px)'}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none'}}>
        <div style={{position:'relative',paddingTop:'100%',background:'#f8f8f8'}}>
          <img src={p.image_url||'https://placehold.co/300x300/f8f8f8/aaa?text=BM'} alt={p.name}
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain',padding:8}}
            onError={e=>{e.target.src='https://placehold.co/300x300/f8f8f8/aaa?text=BM'}}/>
          {hasOffer&&<div style={{position:'absolute',top:8,left:8,background:'#ff1e41',color:'white',fontSize:10,fontWeight:700,padding:'2px 6px'}}>OFERTA</div>}
        </div>
        <div style={{padding:'12px 14px'}}>
          <div style={{fontSize:12,fontWeight:600,color:'#333',lineHeight:1.3,marginBottom:8,minHeight:36,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.name}</div>
          <div>
            {hasOffer&&<div style={{fontSize:11,color:'#aaa',textDecoration:'line-through'}}>{price.toFixed(2)} €</div>}
            <div style={{fontSize:16,fontWeight:700,color:hasOffer?'#ff1e41':'#333'}}>{(hasOffer?sale:price).toFixed(2)} €</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
