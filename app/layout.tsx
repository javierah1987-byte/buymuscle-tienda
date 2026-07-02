import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'
import StoreWrapper from '@/components/StoreWrapper'
import { CartProvider } from '@/lib/cart'
import { AuthProvider } from '@/lib/auth'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import { CookieConsentManager } from '@/components/CookieConsentManager'

const heebo = Heebo({ subsets: ['latin'], variable: '--font-heebo' })

export const metadata: Metadata = {
  title: { default: 'BUYMUSCLE | Tienda Online de Suplementación Deportiva', template: '%s | BuyMuscle' },
  description: 'Tienda de suplementación deportiva en Canarias. Proteínas, creatinas, pre-entrenos y más. Envío 24-48h · Precios garantizados · Marca oficial.',
  keywords: ['suplementación', 'proteínas', 'creatina', 'musculación', 'Canarias', 'Gran Canaria'],
  authors: [{ name: 'BuyMuscle', url: 'https://tienda.buymuscle.es' }],
  creator: 'BuyMuscle',
  metadataBase: new URL('https://tienda.buymuscle.es'),
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'BuyMuscle' },
  formatDetection: { telephone: false },
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: 'cover', themeColor: '#111111' },
  icons: { apple: [{ url: '/icon?size=180', sizes: '180x180', type: 'image/png' }] },
  openGraph: { title: 'BUYMUSCLE | Suplementación Deportiva', description: 'Tu tienda de suplementación en Canarias', locale: 'es_ES', type: 'website' },
  alternates: { canonical: '/' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={heebo.variable}>
      <body className={heebo.className}>
        <script dangerouslySetInnerHTML={{__html: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(e){console.log('SW error:',e)})})}"}} />
        {/* Datos estructurados (SEO): negocio + buscador del sitio */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context":"https://schema.org","@type":"Store","name":"BuyMuscle","image":"https://tienda.buymuscle.es/icon?size=180","url":"https://tienda.buymuscle.es","telephone":"+34828048310","email":"tienda@buymuscle.es","priceRange":"€€","address":{"@type":"PostalAddress","streetAddress":"Alcalde Manuel Amador Rodríguez 23","addressLocality":"Telde","addressRegion":"Las Palmas","postalCode":"35200","addressCountry":"ES"}})}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context":"https://schema.org","@type":"WebSite","name":"BuyMuscle","url":"https://tienda.buymuscle.es","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://tienda.buymuscle.es/tienda?q={search_term_string}"},"query-input":"required name=search_term_string"}})}} />
        <AuthProvider>
          <CartProvider>
            <StoreWrapper>{children}</StoreWrapper>
          </CartProvider>
        </AuthProvider>
        <CookieConsentManager />
        <PWAInstallBanner />
      </body>
    </html>
  )
}
