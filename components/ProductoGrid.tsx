// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'

export default function ProductoGrid({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(function(){
    function check(){ setIsMobile(window.innerWidth <= 768) }
    check()
    window.addEventListener('resize', check)
    return function(){ window.removeEventListener('resize', check) }
  }, [])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? 16 : 32,
      background: 'white',
      padding: isMobile ? '16px 12px' : 24,
      marginBottom: 24
    }} className="producto-grid">
      {children}
    </div>
  )
}
