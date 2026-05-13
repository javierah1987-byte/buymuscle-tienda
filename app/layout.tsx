import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'
import StoreWrapper from '@/components/StoreWrapper'
import { CartProvider } from '@/lib/cart'
import { AuthProvider } from '@/lib/auth'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import CookieBanner from '@/components/CookieBanner'
import { CookieConsentManager } from '@/components/CookieConsentManager'

const heebo = Heebo({ subsets: ['latin'], variable: '--font-heebo' })

export const metadata: Metadata = {
  title: { default: 'BUYMUSCLE | Tienda Online de Suplementación Deportiva', template: '%s | BuyMuscle' },
  description: 'Tienda de suplementación deportiva en Canarias. Proteínas, creatinas, pre-entrenos y más. Envío 24-48h · Precios garantizados · Marca oficial.',
  keywords: ['suplementación', 'proteínas', 'creatina', 'musculación', 'Canarias', 'Gran Canaria', 'suplementos deportivos', 'whey', 'pre-entreno', 'BCAA'],
  authors: [{ name: 'BuyMuscle', url: 'https://tienda.buymuscle.es' }],
  creator: 'BuyMuscle',
  metadataBase: new URL('https://tienda.buymuscle.es'),
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'BuyMuscle' },
  formatDetection: { telephone: false },
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: 'cover', themeColor: '#111111' },
  icons: { apple: [{ url: '/icon?size=180', sizes: '180x180', type: 'image/png' }, { url: '/icon?size=152', sizes: '152x152', type: 'image/png' }] },
  openGraph: { title: 'BUYMUSCLE | Suplementación Deportiva', description: 'Tu tienda de suplementación en Canarias', locale: 'es_ES', type: 'website' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const TAWK_ID = process.env.NEXT_PUBLIC_TAWK_ID || ''

  return (
    <html lang="es" className={heebo.variable}>
      <body className={heebo.className}>
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function(err) { console.log('SW error:', err); });
            });
          }
        `}} />
        <AuthProvider>
          <CartProvider>
            <StoreWrapper>{children}</StoreWrapper>
          </CartProvider>
        </AuthProvider>
        <CookieBanner />
        <CookieConsentManager />
        <PWAInstallBanner />
      </body>
    </html>
  )
}
