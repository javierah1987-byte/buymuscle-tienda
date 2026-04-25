// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [detail, setDetail] = useState(false)
  const [prefs, setPrefs] = useState({ analytics: true, marketing: true })

  useEffect(() => {
    const saved = localStorage.getItem('bm_cookie_consent')
    if (!saved) setTimeout(() => setVisible(true), 1200)
  }, [])

  function accept(all) {
    const consent = all ? { analytics: true, marketing: true } : prefs
    localStorage.setItem('bm_cookie_consent', JSON.stringify({ ...consent, date: Date.now() }))
    setVisible(false)
    // Activar GA/Meta si acepta
    if (consent.analytics && window.gtag) window.gtag('consent', 'update', { analytics_storage: 'granted' })
    if (consent.marketing && window.fbq) window.fbq('consent', 'grant')
  }

  function reject() {
    localStorage.setItem('bm_cookie_consent', JSON.stringify({ analytics: false, marketing: false, date: Date.now() }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'white', boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
      borderTop: '3px solid #ff1e41', fontFamily: 'Heebo, sans-serif',
      animation: 'slideUp 0.3s ease',
    }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .cookie-toggle { position: relative; width: 42px; height: 24px; }
        .cookie-toggle input { opacity: 0; width: 0; height: 0; }
        .cookie-toggle-slider { position: absolute; inset: 0; background: #ddd; border-radius: 24px; cursor: pointer; transition: .3s; }
        .cookie-toggle input:checked + .cookie-toggle-slider { background: #ff1e41; }
        .cookie-toggle-slider:before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: .3s; }
        .cookie-toggle input:checked + .cookie-toggle-slider:before { transform: translateX(18px); }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px' }}>
        {!detail ? (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#333', lineHeight: 1.5 }}>
                🍪 Usamos cookies propias y de terceros para mejorar tu experiencia y mostrarte publicidad relevante.
                Puedes aceptar todas, rechazarlas o{' '}
                <button onClick={() => setDetail(true)} style={{ background: 'none', border: 'none', color: '#ff1e41', cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: 0, textDecoration: 'underline' }}>
                  personalizar tu elección
                </button>.{' '}
                <Link href="/politica-cookies" style={{ color: '#888', fontSize: 13 }}>Política de cookies</Link>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button onClick={reject} style={{ padding: '9px 20px', border: '1px solid #ddd', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#555' }}>
                Rechazar
              </button>
              <button onClick={() => accept(true)} style={{ padding: '9px 20px', border: 'none', borderRadius: 4, background: '#ff1e41', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'white' }}>
                Aceptar todo
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Configurar cookies</h3>
              <button onClick={() => setDetail(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#888' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {/* Técnicas — siempre activas */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f9f9f9', borderRadius: 6 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Cookies técnicas</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Necesarias para el funcionamiento de la tienda y el carrito.</div>
                </div>
                <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>Siempre activas</span>
              </div>
              {/* Analíticas */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f9f9f9', borderRadius: 6 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Cookies analíticas</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Google Analytics — estadísticas de uso anónimas.</div>
                </div>
                <label className="cookie-toggle">
                  <input type="checkbox" checked={prefs.analytics} onChange={e => setPrefs(p => ({ ...p, analytics: e.target.checked }))} />
                  <span className="cookie-toggle-slider" />
                </label>
              </div>
              {/* Marketing */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f9f9f9', borderRadius: 6 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Cookies de marketing</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Meta Pixel — personalización y medición de campañas.</div>
                </div>
                <label className="cookie-toggle">
                  <input type="checkbox" checked={prefs.marketing} onChange={e => setPrefs(p => ({ ...p, marketing: e.target.checked }))} />
                  <span className="cookie-toggle-slider" />
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={reject} style={{ padding: '9px 20px', border: '1px solid #ddd', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#555' }}>
                Rechazar todo
              </button>
              <button onClick={() => accept(false)} style={{ padding: '9px 20px', border: '1px solid #ff1e41', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#ff1e41' }}>
                Guardar preferencias
              </button>
              <button onClick={() => accept(true)} style={{ padding: '9px 20px', border: 'none', borderRadius: 4, background: '#ff1e41', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'white' }}>
                Aceptar todo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
