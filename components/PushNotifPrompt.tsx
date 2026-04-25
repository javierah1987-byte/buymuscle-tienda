// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'

export default function PushNotifPrompt() {
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState('idle') // idle | asking | granted | denied

  useEffect(() => {
    // Solo mostrar si soporta notificaciones y no ha decidido aún
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission !== 'default') return
    const dismissed = localStorage.getItem('bm_push_dismissed')
    if (dismissed) return
    // Esperar 30 seg antes de mostrar (no interrumpir al llegar)
    const t = setTimeout(() => setVisible(true), 30000)
    return () => clearTimeout(t)
  }, [])

  async function requestPermission() {
    setStatus('asking')
    try {
      // Registrar SW si no está
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const perm = await Notification.requestPermission()
      if (perm === 'granted') {
        setStatus('granted')
        // Mostrar notificación de bienvenida
        setTimeout(() => {
          reg.showNotification('¡Activado! 🎉', {
            body: 'Recibirás ofertas exclusivas de BuyMuscle directamente en tu dispositivo.',
            icon: '/icon',
            tag: 'bm-welcome',
            data: { url: '/tienda' },
          })
        }, 500)
        localStorage.setItem('bm_push_granted', '1')
        setTimeout(() => setVisible(false), 3000)
      } else {
        setStatus('denied')
        setTimeout(() => { setVisible(false); localStorage.setItem('bm_push_dismissed', '1') }, 2000)
      }
    } catch(e) {
      setStatus('denied')
      setTimeout(() => setVisible(false), 2000)
    }
  }

  function dismiss() {
    setVisible(false)
    localStorage.setItem('bm_push_dismissed', '1')
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 8000,
      background: 'white', borderRadius: 12, padding: '20px 22px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)', maxWidth: 320, width: '90vw',
      border: '1px solid #f0f0f0', fontFamily: 'Heebo, sans-serif',
      animation: 'fadeInUp 0.4s ease',
    }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <button onClick={dismiss} style={{
        position: 'absolute', top: 10, right: 12,
        background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 18, lineHeight: 1,
      }}>✕</button>

      {status === 'idle' && <>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>¿Quieres enterarte antes?</div>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5, marginBottom: 16 }}>
          Activa las notificaciones y sé el primero en saber de <strong>ofertas exclusivas</strong>, reposición de stock y novedades BuyMuscle.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={dismiss} style={{
            flex: 1, padding: '9px 0', border: '1px solid #e0e0e0', borderRadius: 6,
            background: 'white', cursor: 'pointer', fontSize: 13, color: '#888', fontWeight: 600,
          }}>Ahora no</button>
          <button onClick={requestPermission} style={{
            flex: 2, padding: '9px 0', border: 'none', borderRadius: 6,
            background: '#ff1e41', cursor: 'pointer', fontSize: 13, color: 'white', fontWeight: 700,
          }}>Activar alertas</button>
        </div>
      </>}

      {status === 'asking' && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
          <div style={{ fontSize: 14, color: '#555' }}>Esperando permiso...</div>
        </div>
      )}

      {status === 'granted' && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#22c55e' }}>¡Notificaciones activadas!</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Te avisaremos de las mejores ofertas.</div>
        </div>
      )}

      {status === 'denied' && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>😕</div>
          <div style={{ fontSize: 13, color: '#888' }}>Puedes activarlas más tarde desde la configuración del navegador.</div>
        </div>
      )}
    </div>
  )
}
