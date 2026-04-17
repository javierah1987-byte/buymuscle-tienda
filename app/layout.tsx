import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { CartProvider } from '@/lib/cart'
import { AuthProvider } from '@/lib/auth'

const heebo = Heebo({ subsets: ['latin'], variable: '--font-heebo' })

export const metadata: Metadata = {
  title: { default: 'BUYMUSCLE | Tienda Online de Suplementacion Deportiva', template: '%s | BUYMUSCLE' },
  description: 'Compra suplementos deportivos en Canarias. Proteinas, creatina, pre-entrenos, vitaminas y mas. Envio 24/48h. Productos 100% originales.',
  keywords: ['suplementos deportivos', 'proteinas', 'creatina', 'pre-entrenos', 'Canarias', 'BuyMuscle'],
  authors: [{ name: 'BuyMuscle' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://buymuscle-tienda.vercel.app',
    siteName: 'BUYMUSCLE',
    title: 'BUYMUSCLE | Tienda Online de Suplementacion Deportiva',
    description: 'Compra suplementos deportivos en Canarias. Proteinas, creatina, pre-entrenos y vitaminas.',
    images: [{ url: 'https://tienda.buymuscle.es/img/buymuscle-logo-17621637791.jpg', width: 400, height: 400 }],
  },
  twitter: { card: 'summary_large_image', title: 'BUYMUSCLE', description: 'Suplementos deportivos en Canarias' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={heebo.variable}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
