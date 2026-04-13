import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/lib/cart'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'BUYMUSCLE | Tienda Online de Suplementación Deportiva',
  description: 'Tienda de suplementación deportiva en Sevilla. Proteínas, creatinas, pre-entrenos y más de 300 productos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
