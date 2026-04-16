import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CartProvider } from '@/lib/cart'
import { AuthProvider } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'BUYMUSCLE | Tienda Online de Suplementación Deportiva',
  description: 'Tienda online de suplementación deportiva. Proteínas, creatinas, pre-entrenos y más de 300 productos. Envío 24/48h.',
  keywords: 'suplementación deportiva, proteínas, creatinas, pre-entrenos, BCAA, Canarias',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CartProvider>
            {/* Franja superior — idéntica al original */}
            <div style={{background:'var(--red)', color:'white', textAlign:'center', padding:'8px 16px', fontSize:12, fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase', position:'relative', zIndex:1000}}>
              🚛 ENVÍO GRATIS EN PEDIDOS +50€ · 24/48H
            </div>
            <Navbar />
            <main style={{minHeight:'70vh'}}>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
