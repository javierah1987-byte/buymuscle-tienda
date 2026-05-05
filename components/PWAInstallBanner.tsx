// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detectar si ya está instalada
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    if (isInstalled) return

    // iOS — no tiene beforeinstallprompt, mostrar instrucciones manuales
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
    if (ios) {
      const dismissed = localStorage.getItem('pwa-ios-dismissed')
      if (!dismissed) {
        setIsIOS(true)
        setTimeout(() => setShow(true), 3000)
      }
      return
    }

    // Android/Chrome — beforeinstallprompt
    const handler = (e: any) => {
      e.preventDefault()
      setPrompt(e)
      const dismissed = localStorage.getItem('pwa-dismissed')
      if (!dismissed) setTimeout(() => setShow(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setPrompt(null)
  }

  const dismiss = () => {
    setShow(false)
    localStorage.setItem(isIOS ? 'pwa-ios-dismissed' : 'pwa-dismissed', '1')
  }

  if (!show) return null

  return (
    <div style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:9999,
      background:'#111', borderTop:'2px solid #ff1e41',
      padding:'16px 20px', display:'flex', alignItems:'center', gap:14,
      fontFamily:'Heebo,Arial,sans-serif', boxShadow:'0 -4px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{ width:48, height:48, background:'#ff1e41', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:24 }}>
        💪
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:800, fontSize:14, color:'white', marginBottom:2 }}>
          Instala BuyMuscle en tu móvil
        </div>
        {isIOS ? (
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.4 }}>
            Pulsa <strong style={{ color:'white' }}>Compartir</strong> → <strong style={{ color:'white' }}>Añadir a pantalla de inicio</strong>
          </div>
        ) : (
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>
            Acceso rápido, funciona offline y sin publicidad
          </div>
        )}
      </div>
      <div style={{ display:'flex', gap:8, flexShrink:0 }}>
        {!isIOS && (
          <button onClick={install} style={{
            background:'#ff1e41', color:'white', border:'none',
            padding:'9px 16px', fontWeight:700, fontSize:13,
            cursor:'pointer', borderRadius:6, fontFamily:'inherit', whiteSpace:'nowrap'
          }}>
            Instalar
          </button>
        )}
        <button onClick={dismiss} style={{
          background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)',
          border:'none', padding:'9px 12px', fontSize:20, lineHeight:1,
          cursor:'pointer', borderRadius:6, fontFamily:'inherit'
        }}>✕</button>
      </div>
    </div>
  )
}
