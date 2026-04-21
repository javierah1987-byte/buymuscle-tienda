// @ts-nocheck
'use client'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ExitIntent from '@/components/ExitIntent'
import WhatsAppButton from '@/components/WhatsAppButton'
import EmailPopup from '@/components/EmailPopup'

export default function StoreWrapper({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/tpv')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
      <Navbar />
      <main>
        <div id="main-content">{children}</div>
        <ExitIntent />
      </main>
      <Footer />
      <WhatsAppButton />
      <EmailPopup />
    </>
  )
}
