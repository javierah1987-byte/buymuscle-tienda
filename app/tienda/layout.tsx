import type{Metadata}from 'next'
export const metadata:Metadata={
  title:'Tienda de Suplementacion Deportiva | BuyMuscle',
  description:'Compra online proteinas, creatinas, pre-entrenos, vitaminas y suplementos deportivos. Envio 24-48h a Peninsula y Canarias. Marcas oficiales.',
  alternates:{canonical:'https://buymuscle-tienda.vercel.app/tienda'},
  openGraph:{
    title:'Tienda de Suplementacion Deportiva | BuyMuscle',
    description:'Mas de 300 productos de suplementacion deportiva. Envio rapido y precios competitivos.',
    url:'https://buymuscle-tienda.vercel.app/tienda',
    siteName:'BuyMuscle',
    type:'website',
  }
}
export default function TiendaLayout({children}:{children:React.ReactNode}){
  return<>{children}</>
}
