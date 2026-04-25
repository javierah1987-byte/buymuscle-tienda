// @ts-nocheck
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

export default function SearchAutocomplete({ placeholder = 'Buscar...' }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [sel, setSel] = useState(-1)
  const ref = useRef(null)
  const router = useRouter()
  const timer = useRef(null)

  const search = useCallback(async (term) => {
    if (term.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const r = await fetch(
        S+'/rest/v1/products?name=ilike.*'+encodeURIComponent(term)+'*&active=eq.true&select=id,name,price_incl_tax,sale_price,image_url,brand&order=name.asc&limit=8',
        { headers: { apikey: K, 'Authorization': 'Bearer '+K } }
      )
      const d = await r.json()
      setResults(Array.isArray(d) ? d : [])
      setOpen(true)
    } catch(e) { setResults([]) }
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(timer.current)
    if (q.trim()) {
      timer.current = setTimeout(() => search(q.trim()), 250)
    } else {
      setResults([]); setOpen(false)
    }
    return () => clearTimeout(timer.current)
  }, [q, search])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleKey(e) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s+1, results.length-1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s-1, -1)) }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (sel >= 0 && results[sel]) {
        router.push('/producto/'+results[sel].id)
        setOpen(false); setQ('')
      } else if (q.trim()) {
        router.push('/tienda?q='+encodeURIComponent(q.trim()))
        setOpen(false)
      }
    }
    if (e.key === 'Escape') setOpen(false)
  }

  function goTo(id) {
    router.push('/producto/'+id)
    setOpen(false); setQ(''); setSel(-1)
  }

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setSel(-1) }}
          onKeyDown={handleKey}
          onFocus={() => q.length >= 2 && results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 40px 10px 14px',
            border: '1px solid #e0e0e0', borderRadius: 4,
            fontSize: 14, fontFamily: 'Heebo, sans-serif',
            outline: 'none', background: 'white', color: '#111',
          }}
        />
        {loading ? (
          <div style={{ position: 'absolute', right: 10, width: 18, height: 18, border: '2px solid #ff1e41', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        ) : (
          <button
            onClick={() => q.trim() && router.push('/tienda?q='+encodeURIComponent(q.trim()))}
            style={{ position: 'absolute', right: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#ff1e41', fontSize: 18, padding: 4, display: 'flex' }}
          >🔍</button>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
          background: 'white', borderRadius: '0 0 8px 8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #eee', borderTop: 'none',
          maxHeight: 420, overflowY: 'auto',
        }}>
          {results.map((p, i) => (
            <div key={p.id} onClick={() => goTo(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                cursor: 'pointer', transition: 'background 0.1s',
                background: sel === i ? '#fff5f6' : 'white',
                borderBottom: i < results.length-1 ? '1px solid #f5f5f5' : 'none',
              }}
              onMouseEnter={() => setSel(i)}
            >
              {p.image_url ? (
                <img src={p.image_url} alt="" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 4, background: '#f5f5f5', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, background: '#f5f5f5', borderRadius: 4, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{p.brand || ''}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#ff1e41', flexShrink: 0 }}>
                {p.sale_price ? Number(p.sale_price).toFixed(2) : Number(p.price_incl_tax).toFixed(2)} €
              </div>
            </div>
          ))}
          <div
            onClick={() => { router.push('/tienda?q='+encodeURIComponent(q.trim())); setOpen(false) }}
            style={{ padding: '10px 14px', fontSize: 13, color: '#ff1e41', cursor: 'pointer', textAlign: 'center', fontWeight: 700, borderTop: '1px solid #f0f0f0' }}
          >
            Ver todos los resultados para "{q}" →
          </div>
        </div>
      )}

      {open && results.length === 0 && q.length >= 2 && !loading && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
          background: 'white', borderRadius: '0 0 8px 8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #eee', borderTop: 'none',
          padding: '16px 14px', fontSize: 13, color: '#888', textAlign: 'center',
        }}>
          No se encontraron productos para "{q}"
        </div>
      )}
    </div>
  )
}
