import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CartProvider } from '@/lib/cart'
import { AuthProvider } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'BUYMUSCLE | Tienda Online de Suplementación Deportiva',
  description: 'Compra suplementos deportivos en Canarias con BuyMuscle. Proteínas, creatinas, aminoácidos y pre-entrenos. Envío 24/48h.',
  keywords: 'suplementación deportiva, proteínas, creatinas, pre-entrenos, BCAA, Canarias, BuyMuscle',
  openGraph: {
    title: 'BUYMUSCLE | Tienda Online de Suplementación Deportiva',
    description: 'Más de 300 productos de las mejores marcas. Envío 24/48h a toda España.',
    url: 'https://tienda.buymuscle.es',
    siteName: 'BuyMuscle',
    locale: 'es_ES',
    type: 'website',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CartProvider>
            {/* Franja roja superior con marquee — igual que el original */}
            <div style={{
              background:'var(--red)',
              color:'white',
              textAlign:'center',
              padding:'7px 16px',
              fontSize:12,
              fontWeight:700,
              letterSpacing:'0.06em',
              textTransform:'uppercase',
              position:'relative',
              zIndex:1001,
              overflow:'hidden'
            }}>
              <span>🚛 ENVÍO GRATIS EN PEDIDOS +50€ &nbsp;·&nbsp; ENTREGA 24/48H &nbsp;·&nbsp; 📞 +34 828 048 310 &nbsp;·&nbsp; ✅ PRODUCTOS 100% ORIGINALES</span>
            </div>
            <Navbar />
            <main style={{ minHeight:'70vh' }}>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
