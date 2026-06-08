// @ts-nocheck
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const S = 'https://awwlbepjxuoxaigztugh.supabase.co'
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const H = { apikey: K, 'Authorization': 'Bearer ' + K }

const card = { background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: 16, display: 'flex', gap: 16, alignItems: 'center' }

export default function AdminImagenes() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState({}) // id -> {uploading, msg, err}

  const load = useCallback(async () => {
    setLoading(true)
    // Productos cuya imagen aún NO está en Storage: o es null o sigue apuntando al servidor antiguo.
    const q = `${S}/rest/v1/products?select=id,name,active,image_url&or=(image_url.is.null,image_url.ilike.*tienda.buymuscle.es*)&order=active.desc,id.asc`
    const r = await fetch(q, { headers: H })
    setRows(await r.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const upload = async (id, file) => {
    if (!file) return
    setEstado(s => ({ ...s, [id]: { uploading: true } }))
    try {
      const fd = new FormData()
      fd.append('productId', String(id))
      fd.append('file', file)
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir')
      setEstado(s => ({ ...s, [id]: { msg: 'Subida ✓' } }))
      // La fila ya tiene imagen en Storage: la quitamos de la lista de pendientes.
      setTimeout(() => setRows(rs => rs.filter(x => x.id !== id)), 900)
    } catch (e) {
      setEstado(s => ({ ...s, [id]: { err: true, msg: e.message } }))
    }
  }

  const motivo = (u) => !u ? 'Sin imagen' : u.includes('.es//') ? 'URL rota' : 'No migrada (403)'

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: 'white', paddingBottom: 60 }}>
      <div style={{ background: '#1a1a1a', borderBottom: '1px solid #333', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#ff1e41', margin: 0 }}>IMÁGENES PENDIENTES</h1>
          <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Sube la imagen de los productos que no tienen una imagen válida en Storage</p>
        </div>
        <Link href="/admin" style={{ color: '#888', fontSize: 13, textDecoration: 'none' }}>← Admin</Link>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && <p style={{ color: '#888' }}>Cargando…</p>}
        {!loading && rows.length === 0 && (
          <div style={{ ...card, justifyContent: 'center', color: '#86efac' }}>Todas las imágenes están en Storage. Nada pendiente 🎉</div>
        )}
        {!loading && rows.length > 0 && (
          <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>{rows.length} producto(s) pendiente(s)</p>
        )}

        {rows.map(p => {
          const st = estado[p.id] || {}
          return (
            <div key={p.id} style={card}>
              <div style={{ width: 56, height: 56, flexShrink: 0, background: '#222', border: '1px solid #333', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📦</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                  #{p.id} · <span style={{ color: p.active ? '#86efac' : '#f59e0b' }}>{p.active ? 'Activo' : 'Inactivo'}</span> · <span style={{ color: '#ef4444' }}>{motivo(p.image_url)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <label style={{ background: st.uploading ? '#555' : '#ff1e41', color: 'white', fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 4, cursor: st.uploading ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {st.uploading ? 'Subiendo…' : 'Subir imagen'}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={st.uploading} style={{ display: 'none' }}
                    onChange={e => upload(p.id, e.target.files?.[0])} />
                </label>
                {st.msg && <span style={{ fontSize: 11, color: st.err ? '#fca5a5' : '#86efac', maxWidth: 200, textAlign: 'right' }}>{st.msg}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
