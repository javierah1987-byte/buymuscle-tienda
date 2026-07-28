// @ts-nocheck
'use client'
// Panel admin: solicitudes de acceso de distribuidores. Lista + aprobar/rechazar (estado).
// ⚠️ Aprobar HOY marca el estado; CREAR la cuenta de distribuidor (Auth user + distributors +
// distributor_profiles + nivel) es el paso SIGUIENTE (flag) — se hace con estos datos.
import { useState, useEffect } from 'react'
import Link from 'next/link'

const BADGE = { pending: { t: '⏳ Pendiente', c: '#f59e0b' }, approved: { t: '✅ Aprobada', c: '#22c55e' }, rejected: { t: '❌ Rechazada', c: '#ef4444' } }

export default function AdminSolicitudes() {
  const [reqs, setReqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [authErr, setAuthErr] = useState(false)
  const [busy, setBusy] = useState('')

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/distributor-request', { credentials: 'same-origin' })
      if (r.status === 401) { setAuthErr(true); setLoading(false); return }
      const d = await r.json().catch(() => ({}))
      setReqs(Array.isArray(d.requests) ? d.requests : [])
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function setStatus(id, status) {
    setBusy(id)
    try {
      await fetch('/api/distributor-request', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ id, status }) })
      await load()
    } catch {}
    setBusy('')
  }
  const fmt = (d) => { try { return new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) } catch { return '' } }

  if (authErr) return <div style={{ padding: 40, fontFamily: 'Arial', textAlign: 'center' }}>Acceso solo para admin. <Link href="/login?redirectTo=/admin/solicitudes" style={{ color: '#ff1e41' }}>Entrar →</Link></div>

  const pend = reqs.filter((r) => r.status === 'pending')
  return (
    <div style={{ fontFamily: 'Arial,sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ background: '#111', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><Link href="/admin" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13 }}>← Admin</Link><span style={{ color: 'white', marginLeft: 16, fontWeight: 700 }}>Solicitudes distribuidores</span></div>
        <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700 }}>{pend.length} pendiente(s)</span>
      </div>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>Cargando…</div>
          : reqs.length === 0 ? <div style={{ background: 'white', padding: 40, textAlign: 'center', color: '#888' }}>No hay solicitudes todavía.</div>
            : reqs.map((r) => {
              const b = BADGE[r.status] || { t: r.status, c: '#888' }
              return (
                <div key={r.id} style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '16px 20px', marginBottom: 12, borderLeft: '4px solid ' + b.c }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{r.company_name} <span style={{ fontSize: 12, fontWeight: 700, color: b.c, marginLeft: 8 }}>{b.t}</span></div>
                      <div style={{ fontSize: 13, color: '#555', marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <span>📧 {r.email}</span>
                        {r.phone && <span>📞 {r.phone}</span>}
                        {r.nif && <span>🧾 {r.nif}</span>}
                        {r.contact_name && <span>👤 {r.contact_name}</span>}
                        {r.business_type && <span>🏢 {r.business_type}</span>}
                      </div>
                      {r.message && <div style={{ fontSize: 13, color: '#777', marginTop: 6, fontStyle: 'italic' }}>“{r.message}”</div>}
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>{fmt(r.created_at)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {r.status !== 'approved' && <button onClick={() => setStatus(r.id, 'approved')} disabled={busy === r.id} style={{ padding: '7px 14px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 4, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Aprobar</button>}
                      {r.status !== 'rejected' && <button onClick={() => setStatus(r.id, 'rejected')} disabled={busy === r.id} style={{ padding: '7px 14px', background: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 4, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Rechazar</button>}
                    </div>
                  </div>
                  {r.status === 'approved' && <div style={{ marginTop: 10, padding: '8px 12px', background: '#fff8e1', border: '1px solid #ffe0a3', fontSize: 12, color: '#8a6d3b', borderRadius: 4 }}>⚠️ Aprobada. Falta CREAR la cuenta de distribuidor (Auth + distributors + nivel) — paso manual por ahora con estos datos.</div>}
                </div>
              )
            })}
      </div>
    </div>
  )
}
