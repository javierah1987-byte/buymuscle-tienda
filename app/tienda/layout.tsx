import type{Metadata}from 'next'
import { SITE_URL } from '@/lib/site'
export const metadata:Metadata={
  title:'Tienda de Suplementación Deportiva',
  description:'Compra online proteínas, creatinas, pre-entrenos, vitaminas y suplementos deportivos. Envío 24-48h a Península y Canarias. Marcas oficiales.',
  alternates:{canonical:SITE_URL+'/tienda'},
  openGraph:{
    title:'Tienda de Suplementación Deportiva | BuyMuscle',
    description:'Más de 300 productos de suplementación deportiva. Envío rápido y precios competitivos.',
    url:SITE_URL+'/tienda',
    siteName:'BuyMuscle',
    type:'website',
  }
}
// H1 + intro renderizados en SERVIDOR (indexables por Google). El catálogo
// interactivo (filtros, búsqueda) se hidrata debajo en el cliente.
export default function TiendaLayout({children}:{children:React.ReactNode}){
  return(
    <>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'22px 20px 0'}}>
        <h1 style={{fontSize:'clamp(20px,3vw,30px)',fontWeight:900,color:'#111',margin:'0 0 6px',textTransform:'uppercase',letterSpacing:'-0.01em',fontFamily:'var(--font-body)'}}>Tienda de Suplementación Deportiva</h1>
        <p style={{fontSize:14,color:'#777',margin:0,maxWidth:730,lineHeight:1.5}}>Proteínas, creatinas, pre-entrenos, vitaminas y más de 300 productos de las mejores marcas oficiales. Envío 24-48h a Canarias y Península.</p>
      </div>
      {children}
    </>
  )
}
