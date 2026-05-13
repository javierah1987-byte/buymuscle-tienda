'use client'
import { useEffect } from 'react'

function getConsent() {
  try { const raw = localStorage.getItem('bm_cookie_consent'); return raw ? JSON.parse(raw) : null } catch { return null }
}

function loadGA4(id) {
  if (document.getElementById('ga4-script')) return
  const s = document.createElement('script'); s.id = 'ga4-script'; s.async = true
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  function gtag() { window.dataLayer.push(arguments) }
  gtag('js', new Date()); gtag('config', id)
  window.gtag = gtag
}

function loadMetaPixel(id) {
  if (document.getElementById('meta-pixel')) return
  const s = document.createElement('script'); s.id = 'meta-pixel'
  s.text = '!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init","' + id + '");fbq("track","PageView");'
  document.head.appendChild(s)
}

export function CookieConsentManager() {
  const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID
  const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

  function applyConsent() {
    const consent = getConsent()
    if (!consent) return
    if (consent.analytics && GA4_ID) loadGA4(GA4_ID)
    if (consent.marketing && META_ID) loadMetaPixel(META_ID)
  }

  useEffect(() => {
    applyConsent()
    window.addEventListener('cookieConsentGranted', applyConsent)
    return () => window.removeEventListener('cookieConsentGranted', applyConsent)
  }, [])

  return null
}
