// @ts-nocheck
'use client'
import { useEffect, useRef, useState } from 'react'

// Vídeo de fondo decorativo que NO se descarga hasta que su sección se acerca
// al viewport (antes competía con las imágenes en la carga inicial del home).
export default function LazyBgVideo({ src, style }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return }
    const io = new IntersectionObserver(
      entries => { if (entries.some(e => e.isIntersecting)) { setVisible(true); io.disconnect() } },
      { rootMargin: '400px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {visible && (
        <video autoPlay muted loop playsInline preload="none" style={style}>
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  )
}
