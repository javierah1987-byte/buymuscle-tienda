// @ts-nocheck
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const card = { background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: 20, marginBottom: 16 }
const h2 = { fontSize: 13, fontWeight: 700, color: '#ff1e41', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }
const th = { padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #2a2a2a' }
const td = { padding: '8px 10px', fontSize: 13, borderBottom: '1px solid #1f1f1f', color: '#ddd' }
const inp = { width: 70, padding: '6px 8px', border: '1px solid #333', background: '#111', color: 'white', fontSize: 13, borderRadius: 4 }

export default function Estimador() {
  const [threshold, setThreshold] = useState(5)
  const [weeks, setWeeks] = useState(2)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/admin/estimador?threshold=${threshold}&weeks=${weeks}`, { credentials: 'same-origin' })
      const d = await r.json()
      setData(d && d.ok ? d : null)
    } catch { setData(null) }
    setLoading(false)
  }, [threshold, weeks])

  useEffect(() => { load() }, [load])

  const cold = data?.phase === 'cold'

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: 'white', paddingBottom: 60, fontFamily: 'Arial,sans-serif' }}>
      <div style={{ background: '#1a1a1a', borderBottom: '1px solid #333', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#ff1e41', margin: 0 }}>ESTIMADOR DE PEDIDOS</h1>
          <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Qué reponer y qué está cambiando · solo lectura</p>
        </div>
        <Link href="/admin" style={{ color: '#888', fontSize: 13, textDecoration: 'none' }}>← Admin</Link>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>

        {/* Controles */}
        <div style={{ ...card, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 12, color: '#aaa' }}>Stock bajo si es menor que{' '}
            <input type="number" min={0} value={threshold} onChange={e => setThreshold(Math.max(0, parseInt(e.target.value) || 0))} style={inp} /> uds
          </label>
          <label style={{ fontSize: 12, color: '#aaa' }}>Cobertura{' '}
            <input type="number" min={1} value={weeks} onChange={e => setWeeks(Math.max(1, parseInt(e.target.value) || 1))} style={inp} /> semanas
          </label>
          {data?.meta && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#666' }}>
            {data.meta.totalProducts} productos · {data.meta.weeksWithData} semanas con ventas
          </span>}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Calculando…</div>
        : !data ? <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>No se pudo cargar (¿sesión de admin?)</div>
        : <>
          {/* Aviso de fase */}
          <div style={{ ...card, background: cold ? '#2a230f' : '#0f2a16', borderColor: cold ? '#f59e0b55' : '#22c55e55' }}>
            <div style={{ fontSize: 13, color: cold ? '#fcd34d' : '#86efac' }}>
              {cold
                ? '🟡 Fase inicial: aún hay poco histórico de ventas. Lo fiable hoy es el STOCK BAJO. El "pedido sugerido" y las tendencias se activarán solos cuando entren más ventas.'
                : '🟢 Hay histórico suficiente: pedido sugerido por ventas y alertas de tendencia activos.'}
            </div>
          </div>

          {/* Pedido sugerido (fase con datos) */}
          {!cold && (
            <div style={card}>
              <h2 style={h2}>📦 Pedido sugerido (cobertura {weeks} sem)</h2>
              {data.suggested.length === 0
                ? <div style={{ color: '#666', fontSize: 13 }}>Nada por reponer según las ventas actuales.</div>
                : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th style={th}>Producto</th><th style={th}>Stock</th><th style={th}>Media/sem</th><th style={th}>Pedir</th></tr></thead>
                  <tbody>{data.suggested.map(p => (
                    <tr key={p.id}><td style={td}>{p.name}</td><td style={td}>{p.stock}</td><td style={td}>{p.weeklyAvg}</td>
                      <td style={{ ...td, color: '#ff1e41', fontWeight: 700 }}>{p.suggested}</td></tr>
                  ))}</tbody>
                </table>}
            </div>
          )}

          {/* Stock bajo (siempre) */}
          <div style={card}>
            <h2 style={h2}>⚠️ Stock bajo (&lt; {threshold} uds)</h2>
            {data.lowStock.length === 0
              ? <div style={{ color: '#666', fontSize: 13 }}>Ningún producto por debajo del umbral. 👍</div>
              : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>Producto</th><th style={th}>Stock</th><th style={th}>Vendido (8 sem)</th></tr></thead>
                <tbody>{data.lowStock.map(p => (
                  <tr key={p.id}><td style={td}>{p.name}</td>
                    <td style={{ ...td, color: p.stock === 0 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>{p.stock}</td>
                    <td style={td}>{p.sold8w}</td></tr>
                ))}</tbody>
              </table>}
          </div>

          {/* Tendencias */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['week', '📅 Esta semana vs. previas'], ['month', '🗓️ Este mes vs. previos']].map(([k, title]) => (
              <div key={k} style={card}>
                <h2 style={h2}>{title}</h2>
                {cold ? <div style={{ color: '#666', fontSize: 12 }}>Aún sin histórico suficiente.</div>
                : data.trends[k].length === 0 ? <div style={{ color: '#666', fontSize: 12 }}>Sin cambios destacables.</div>
                : data.trends[k].map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #1f1f1f', fontSize: 13 }}>
                    <span style={{ color: '#ddd' }}>{t.dir === 'up' ? '🔼' : '🔽'} {t.name}</span>
                    <span style={{ color: t.dir === 'up' ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>{t.last} vs {t.avg}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  )
}
