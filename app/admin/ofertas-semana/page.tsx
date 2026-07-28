// @ts-nocheck
'use client'
import { useEffect, useState, useCallback } from 'react'
import { ALL_SLOTS, DAY_META, salePrice, eur, weekLabel, addDaysYmd, weekRotation, DAY_SLOTS } from '@/lib/weeklyOffers'

const RED = '#ff1e41'
const SLOT_LABEL = { week: { abbr: 'SEMANA', name: 'Oferta de la semana (válida 7 días)' }, ...DAY_META }
// Descuentos sugeridos por el autocompletar (Javier los edita a mano).
const SUGGESTED_PCT = { week: 20, day: [15, 20, 15, 10, 20, 15, 10] }

export default function AdminOfertasSemana() {
  const [week, setWeek] = useState('')
  const [slots, setSlots] = useState({})      // slot -> { product, discount_pct } | null (borrar) | undefined (sin tocar)
  const [picking, setPicking] = useState(null)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)

  const load = useCallback(async (w) => {
    const url = '/api/admin/weekly-offers' + (w ? '?week=' + w : '')
    const r = await fetch(url, { credentials: 'same-origin' })
    const d = await r.json().catch(() => ({}))
    if (!r.ok || !d.ok) { setMsg('Error cargando: ' + (d.error || ('HTTP ' + r.status))); return }
    setWeek(d.week_start)
    const map = {}
    for (const row of d.rows || []) map[row.slot] = { product: row.products, discount_pct: Number(row.discount_pct) }
    setSlots(map)
    setDirty(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function search() {
    if (!q.trim()) return
    setSearching(true)
    const r = await fetch('/api/admin/weekly-offers?search=' + encodeURIComponent(q.trim()), { credentials: 'same-origin' })
    const d = await r.json().catch(() => ({}))
    setResults(r.ok && d.ok ? d.rows : [])
    setSearching(false)
  }

  function assign(slot, product) {
    setSlots((s) => ({ ...s, [slot]: { product, discount_pct: s[slot]?.discount_pct ?? (slot === 'week' ? SUGGESTED_PCT.week : 15) } }))
    setPicking(null); setQ(''); setResults([]); setDirty(true)
  }
  function setPct(slot, v) {
    const n = Math.max(0, Math.min(90, Number(v) || 0))
    setSlots((s) => (s[slot]?.product ? { ...s, [slot]: { ...s[slot], discount_pct: n } } : s)); setDirty(true)
  }
  function remove(slot) { setSlots((s) => ({ ...s, [slot]: null })); setDirty(true) }

  async function autocompletar() {
    const r = await fetch('/api/admin/weekly-offers?bestsellers=1', { credentials: 'same-origin' })
    const d = await r.json().catch(() => ({}))
    if (!r.ok || !d.ok || !d.rows?.length) { setMsg('No hay best-sellers para autocompletar'); return }
    const bs = d.rows
    const rot = weekRotation(week)
    setSlots((prev) => {
      const next = { ...prev }
      // hero: solo si está vacío
      if (!next.week?.product) next.week = { product: bs[0], discount_pct: SUGGESTED_PCT.week }
      // días: rellena los VACÍOS rotando best-sellers (no pisa lo que Javier ya puso)
      let bi = 1
      DAY_SLOTS.forEach((slot, i) => {
        if (next[slot]?.product) return
        const prod = bs[(rot + bi) % bs.length] || bs[bi % bs.length]
        next[slot] = { product: prod, discount_pct: SUGGESTED_PCT.day[i % SUGGESTED_PCT.day.length] }
        bi++
      })
      return next
    })
    setDirty(true); setMsg('Autocompletado con best-sellers — revisa y ajusta los % antes de guardar'); setTimeout(() => setMsg(''), 4000)
  }

  async function save() {
    setSaving(true)
    const payload = { week_start: week, slots: ALL_SLOTS.map((s) => ({ slot: s, product_id: slots[s]?.product?.id || null, discount_pct: slots[s]?.discount_pct || 0 })) }
    const r = await fetch('/api/admin/weekly-offers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(payload) })
    const d = await r.json().catch(() => ({}))
    setSaving(false)
    if (r.ok && d.ok) { setMsg('Guardado ✓ (' + d.saved + ' ofertas, ' + d.cleared + ' vaciadas)'); await load(week) }
    else setMsg('Error al guardar: ' + (d.error || ('HTTP ' + r.status)))
    setTimeout(() => setMsg(''), 4000)
  }

  async function testSend() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) { setMsg('Escribe un email válido para la prueba'); return }
    if (dirty) { setMsg('Guarda primero — la prueba usa lo GUARDADO'); return }
    setTesting(true)
    const r = await fetch('/api/admin/newsletter-test-send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ email: testEmail, week }) })
    const d = await r.json().catch(() => ({}))
    setTesting(false)
    if (r.ok && d.ok) setMsg('Prueba enviada a ' + d.to + (d.complete ? '' : ' (⚠️ semana incompleta: faltan ' + d.missing.join(', ') + ')'))
    else setMsg('Fallo en la prueba: ' + (d.error || ('HTTP ' + r.status)))
    setTimeout(() => setMsg(''), 6000)
  }

  const missing = ALL_SLOTS.filter((s) => !slots[s]?.product)
  const complete = missing.length === 0

  return (
    <div style={{ background: '#f5f5f6', minHeight: '100vh', fontFamily: 'Arial,sans-serif', color: '#111' }}>
      <div style={{ background: '#fff', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eaeaea' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, textTransform: 'uppercase' }}>📅 Ofertas de la semana</h1>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>Una sola tabla → la web (oferta semana/día) y el email del lunes leen lo mismo. El descuento es SIEMPRE real.</p>
        </div>
        <a href="/admin" style={{ color: '#6a6a6a', textDecoration: 'none', fontSize: 13 }}>← Admin</a>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px' }}>
        {/* Semana + navegación */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => load(addDaysYmd(week, -7))} style={btnGhost}>← Semana anterior</button>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{week ? weekLabel(week) : '…'}</div>
            <button onClick={() => load(addDaysYmd(week, 7))} style={btnGhost}>Siguiente →</button>
          </div>
          <button onClick={autocompletar} style={{ ...btnGhost, borderColor: RED, color: RED, fontWeight: 700 }}>✨ Autocompletar best-sellers</button>
        </div>

        {msg && <div style={{ background: msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fallo') ? '#7f1d1d' : '#166534', color: '#fff', padding: '10px 14px', marginBottom: 14, fontSize: 13, borderRadius: 6 }}>{msg}</div>}

        {/* Guard de completitud */}
        <div style={{ background: complete ? '#dcfce7' : '#fef3c7', border: '1px solid ' + (complete ? '#86efac' : '#fcd34d'), borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
          {complete
            ? '✓ Semana completa (8/8). El email del lunes se enviaría con estas ofertas.'
            : '⚠️ Faltan ' + missing.length + ' ofertas (' + missing.map((s) => SLOT_LABEL[s].abbr).join(', ') + '). El envío automático NO saldría hasta completarlas.'}
        </div>

        {/* Slots */}
        {ALL_SLOTS.map((slot) => {
          const cur = slots[slot]
          const p = cur?.product
          const isWeek = slot === 'week'
          const pct = cur?.discount_pct || 0
          return (
            <div key={slot} style={{ background: '#fff', border: '1px solid ' + (isWeek ? RED + '55' : '#e6e6e6'), borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ width: 92, flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 13, color: isWeek ? RED : '#333' }}>{SLOT_LABEL[slot].abbr}</div>
                  <div style={{ fontSize: 10, color: '#999' }}>{isWeek ? 'la semana' : SLOT_LABEL[slot].name}</div>
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  {p ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {p.image_url && <img src={p.image_url} alt="" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{[p.brand, p.categories?.name].filter(Boolean).join(' · ')} · PVP {eur(Number(p.price_incl_tax))}</div>
                      </div>
                    </div>
                  ) : <div style={{ fontSize: 13, color: '#bbb' }}>— sin producto —</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 12, color: '#666' }}>−</span>
                    <input type="number" min={0} max={90} value={pct} onChange={(e) => setPct(slot, e.target.value)} disabled={!p}
                      style={{ width: 52, padding: '5px 6px', border: '1px solid #dcdcdc', borderRadius: 4, fontSize: 13, textAlign: 'right' }} />
                    <span style={{ fontSize: 12, color: '#666' }}>%</span>
                  </div>
                  {p && <div style={{ fontSize: 13, fontWeight: 800, color: RED, minWidth: 66, textAlign: 'right' }}>{eur(salePrice(Number(p.price_incl_tax), pct))}</div>}
                  <button onClick={() => { setPicking(picking === slot ? null : slot); setQ(''); setResults([]) }} style={btnGhost}>{p ? 'Cambiar' : 'Elegir'}</button>
                  {p && <button onClick={() => remove(slot)} style={{ ...btnGhost, color: '#b91c1c' }}>Quitar</button>}
                </div>
              </div>

              {picking === slot && (
                <div style={{ marginTop: 10, borderTop: '1px dashed #e6e6e6', paddingTop: 10 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()}
                      placeholder="Buscar producto por nombre o id…" style={{ flex: 1, padding: '8px 10px', border: '1px solid #dcdcdc', borderRadius: 4, fontSize: 13 }} />
                    <button onClick={search} disabled={searching} style={{ ...btnGhost, borderColor: RED, color: RED }}>{searching ? '…' : 'Buscar'}</button>
                  </div>
                  <div style={{ maxHeight: 220, overflowY: 'auto', marginTop: 8 }}>
                    {results.map((r) => (
                      <div key={r.id} onClick={() => assign(slot, r)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', cursor: 'pointer', borderBottom: '1px solid #f2f2f2' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        {r.image_url && <img src={r.image_url} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: '#999' }}>#{r.id} · {[r.brand, r.categories?.name].filter(Boolean).join(' · ')} · {eur(Number(r.price_incl_tax))} · stock {r.stock}</div>
                        </div>
                      </div>
                    ))}
                    {!results.length && <div style={{ fontSize: 12, color: '#bbb', padding: '8px' }}>Sin resultados todavía.</div>}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Guardar + acciones */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
          <button onClick={save} disabled={saving} style={{ background: RED, color: '#fff', border: 'none', padding: '12px 24px', fontSize: 14, fontWeight: 800, borderRadius: 6, cursor: 'pointer' }}>
            {saving ? 'Guardando…' : (dirty ? '💾 Guardar cambios' : '✓ Guardado')}
          </button>
          <a href={'/api/admin/newsletter-preview?week=' + week} target="_blank" rel="noreferrer"
            style={{ ...btnGhost, padding: '11px 18px', textDecoration: 'none', color: '#111', opacity: dirty ? 0.5 : 1, pointerEvents: dirty ? 'none' : 'auto' }}>
            👁 Vista previa del email{dirty ? ' (guarda primero)' : ''}
          </a>
        </div>

        {/* Test-send */}
        <div style={{ background: '#fff', border: '1px solid #e6e6e6', borderRadius: 8, padding: 16, marginTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>✉️ Enviar prueba (solo a este email — NO a suscriptores)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="tu@email.com"
              style={{ flex: 1, minWidth: 220, padding: '9px 12px', border: '1px solid #dcdcdc', borderRadius: 4, fontSize: 13 }} />
            <button onClick={testSend} disabled={testing} style={{ background: '#111', color: '#fff', border: 'none', padding: '9px 20px', fontSize: 13, fontWeight: 700, borderRadius: 4, cursor: 'pointer' }}>
              {testing ? 'Enviando…' : 'Enviar prueba'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 8 }}>El envío masivo real (lunes 07:30, a la lista) es una tanda aparte: requiere OK de Javier + RGPD (baja, consentimiento) con seguridad.</div>
        </div>
      </div>
    </div>
  )
}

const btnGhost = { background: 'transparent', border: '1px solid #cccccc', color: '#5a5a5a', padding: '6px 12px', fontSize: 12, cursor: 'pointer', borderRadius: 4, fontFamily: 'inherit' }
