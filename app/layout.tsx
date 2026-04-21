import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ExitIntent from '@/components/ExitIntent'
import WhatsAppButton from '@/components/WhatsAppButton'
import EmailPopup from '@/components/EmailPopup'
import { CartProvider } from '@/lib/cart'
import { AuthProvider } from '@/lib/auth'
import Script from 'next/script'

const heebo = Heebo({ subsets: ['latin'], variable: '--font-heebo' })

export const metadata: Metadata = {
  title: 'BUYMUSCLE | Tienda Online de Suplementacion Deportiva',
  description: 'Suplementación deportiva de calidad en Canarias. Proteínas, creatinas, BCAA y más. Envío 24-48h.',
  keywords: ['suplementación', 'proteínas', 'creatina', 'musculación', 'Canarias', 'Gran Canaria'],
  openGraph: {
    title: 'BUYMUSCLE | Suplementación Deportiva',
    description: 'Tu tienda de suplementación en Canarias',
    locale: 'es_ES',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''
  const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || ''
  const TAWK_ID = process.env.NEXT_PUBLIC_TAWK_ID || ''

  return (
    <html lang="es" className={heebo.variable}>
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${META_PIXEL_ID}');fbq('track','PageView');
        `}</Script>
      )}
      {GA4_ID && <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive"/>
        <Script id="ga4" strategy="afterInteractive">{`
          window.dataLayer=window.dataLayer||[];
          function gtag(){dataLayer.push(arguments);}
          gtag('js',new Date());gtag('config','${GA4_ID}');
        `}</Script>
      </>}
      {TAWK_ID && (
        <Script id="tawk" strategy="afterInteractive">{`
          var Tawk_API=Tawk_API||{},Tawk_LoadStart=new Date();
          (function(){var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;s1.src='https://embed.tawk.to/${TAWK_ID}';
          s1.charset='UTF-8';s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);})();
        `}</Script>
      )}
      <body className={heebo.className}>
        <AuthProvider>
          <CartProvider>
            <Navbar/>
            <main>{children}
        <ExitIntent/></main>
            <Footer/>
            <WhatsAppButton/>
            <EmailPopup/>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
