// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authHeaders } from '@/lib/supabaseBrowser'

const S ='https://awwlbepjxuoxaigztugh.supabase.co'

const LEVEL_COLORS = { Bronze:'#cd7f32', Silver:'#a8a9ad', Gold:'#ffd700' }
const LEVEL_ICON = { Bronze:'🥉', Silver:'🥈', Gold:'🥇' }

export default function AdminDistribuidoresPage() {
  const [levels, setLevels] = useState([])
  const [distributors, setDistributors] = useState([])
  const [loading, setLoading] = useState(true)
  const [editLevel, setEditLevel] = useState(null)
  const [newDist, setNewDist] = useState({ email:'', password:'', company_name:'', level_id:'', phone:'', nif:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [selDist, setSelDist] = useState(null)    // distribuidor seleccionado para ver detalle
  const [distOrders, setDistOrders] = useState([]) // pedidos del distribuidor
  const [editDist, setEditDist] = useState(null)   // distribuidor en modo edición

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/distributors')
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) {
        setMsg('Error cargando distribuidores: ' + (d.error || ('HTTP ' + r.status)))
        setLevels([]); setDistributors([])
      } else {
        setLevels(Array.isArray(d.levels) ? d.levels : [])
        setDistributors(Array.isArray(d.distributors) ? d.distributors : [])
      }
    } catch (e) {
      setMsg('Error cargando distribuidores: ' + String(e?.message || e))
    }
    setLoading(false)
  }

  async function patchAdmin(kind, id, fields) {
    const r = await fetch('/api/admin/distributors', {
      method: 'PATCH', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ kind, id, fields })
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok || !d.ok) throw new Error(d.error || ('HTTP ' + r.status))
  }

  async function saveLevel() {
    if (!editLevel) return
    setSaving(true)
    try {
      await patchAdmin('level', editLevel.id, {
        discount_pct: Number(editLevel.discount_pct),
        min_order_amount: Number(editLevel.min_order_amount)
      })
      setMsg('Nivel actualizado')
      setEditLevel(null)
      load()
    } catch (e) {
      setMsg('Error guardando nivel: ' + String(e?.message || e))
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 2500)
  }

  async function openDetalle(d) {
    setSelDist(d)
    setDistOrders([])
    // Cargar pedidos del distribuidor por email (sesión admin vía RLS)
    const r = await fetch(S + '/rest/v1/orders?customer_email=eq.' + encodeURIComponent(d.email) + '&order=created_at.desc&limit=20', {headers: await authHeaders()})
    const data = await r.json()
    setDistOrders(Array.isArray(data) ? data : [])
  }

  async function saveEditDist() {
    if (!editDist) return
    setSaving(true)
    try {
      await patchAdmin('distributor', editDist.id, {
        company_name: editDist.company_name,
        phone: editDist.phone || null,
        nif: editDist.nif || null,
        level_id: Number(editDist.level_id),
        active: editDist.active
      })
      setEditDist(null)
      setSelDist(null)
      setMsg('Distribuidor actualizado')
      load()
    } catch (e) {
      setMsg('Error guardando distribuidor: ' + String(e?.message || e))
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 2500)
  }

  async function toggleActive(id, active) {
    try {
      await patchAdmin('distributor', id, { active: !active })
    } catch (e) {
      setMsg('Error cambiando estado: ' + String(e?.message || e))
      setTimeout(() => setMsg(''), 2500)
    }
    load()
  }

  async function createDistributor() {
    if (!newDist.email || !newDist.password || !newDist.company_name || !newDist.level_id) {
      setMsg('Rellena email, contraseña, empresa y nivel')
      setTimeout(() => setMsg(''), 2500)
      return
    }
    setSaving(true)
    try {
      // Crea el usuario Auth + registro distribuidor (service role en el servidor)
      const r = await fetch('/api/admin/create-distributor', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: newDist.email,
          password: newDist.password,
          company_name: newDist.company_name,
          level_id: Number(newDist.level_id)
        })
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || d.error) { setMsg('Error: ' + (d.error || ('HTTP ' + r.status))); setSaving(false); return }

      // El alta no guarda teléfono/NIF: completarlos con un PATCH posterior
      if (newDist.phone || newDist.nif) {
        try {
          const g = await fetch('/api/admin/distributors')
          const gd = await g.json().catch(() => ({}))
          const created = (gd.distributors || []).find(x => x.email === newDist.email)
          if (created) await patchAdmin('distributor', created.id, { phone: newDist.phone || null, nif: newDist.nif || null })
        } catch {}
      }

      setMsg('Distribuidor creado correctamente')
      setNewDist({ email:'', password:'', company_name:'', level_id:'', phone:'', nif:'' })
      setTimeout(() => setMsg(''), 3000)
      load()
    } catch (e) {
      setMsg('Error: ' + String(e?.message || e))
      setTimeout(() => setMsg(''), 3000)
    }
    setSaving(false)
  }

  const fmt = d => d ? new Date(d).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' }) : '-'
  const inp = { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'white', padding:'8px 12px', fontSize:13, fontFamily:'Arial', outline:'none', width:'100%', boxSizing:'border-box' }

  return (
    <div style={{ background:'#0d0d0d', minHeight:'100vh', fontFamily:'Arial,sans-serif', color:'white' }}>
      <div style={{ background:'#080808', padding:'18px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h1 style={{ margin:0, fontSize:18, fontWeight:900, textTransform:'uppercase' }}>Distribuidores</h1>
          <p style={{ margin:'3px 0 0', fontSize:12, color:'rgba(255,255,255,0.4)' }}>{distributors.length} distribuidores registrados</p>
        </div>
        <Link href="/admin" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none', fontSize:13 }}>← Admin</Link>
      </div>

      {msg && <div style={{ background:msg.indexOf('Error')===0?'rgba(239,68,68,0.1)':'rgba(34,197,94,0.1)', borderBottom:'1px solid '+(msg.indexOf('Error')===0?'rgba(239,68,68,0.2)':'rgba(34,197,94,0.2)'), padding:'12px 28px', fontSize:13, color:msg.indexOf('Error')===0?'#ef4444':'#22c55e' }}>{msg}</div>}

      <div style={{ padding:'24px 28px', display:'grid', gridTemplateColumns:'300px 1fr', gap:24 }}>

        <div>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Niveles de descuento</div>
          {levels.map(function(level) { return (
            <div key={level.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', padding:'14px 16px', marginBottom:8, borderRadius:4 }}>
              {editLevel && editLevel.id === level.id ? (
                <div>
                  <div style={{ fontWeight:700, color:LEVEL_COLORS[level.name]||'white', marginBottom:10 }}>
                    {LEVEL_ICON[level.name]||''} {level.name}
                  </div>
                  <label style={{ fontSize:10, color:'rgba(255,255,255,0.4)', display:'block', marginBottom:4 }}>DESCUENTO %</label>
                  <input type="number" value={editLevel.discount_pct}
                    onChange={function(e){ setEditLevel(function(p){ return {...p, discount_pct: e.target.value} }) }}
                    style={{ ...inp, marginBottom:8 }}/>
                  <label style={{ fontSize:10, color:'rgba(255,255,255,0.4)', display:'block', marginBottom:4 }}>PEDIDO MÍNIMO €</label>
                  <input type="number" value={editLevel.min_order_amount}
                    onChange={function(e){ setEditLevel(function(p){ return {...p, min_order_amount: e.target.value} }) }}
                    style={{ ...inp, marginBottom:10 }}/>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={saveLevel} disabled={saving} style={{ flex:1, padding:'8px', background:'#ff1e41', border:'none', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Arial' }}>
                      {saving ? '...' : 'Guardar'}
                    </button>
                    <button onClick={function(){ setEditLevel(null) }} style={{ padding:'8px 12px', background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'white', fontSize:13, cursor:'pointer', fontFamily:'Arial' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:20 }}>{LEVEL_ICON[level.name]||''}</span>
                      <span style={{ fontWeight:700, color:LEVEL_COLORS[level.name]||'white' }}>{level.name}</span>
                    </div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>-{level.discount_pct}% · Min {level.min_order_amount}€</div>
                  </div>
                  <button onClick={function(){ setEditLevel({...level}) }} style={{ padding:'5px 12px', background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.6)', fontSize:11, cursor:'pointer', fontFamily:'Arial' }}>
                    Editar
                  </button>
                </div>
              )}
            </div>
          )})}

          <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', padding:16, borderRadius:4, marginTop:20 }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Nuevo distribuidor</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <input value={newDist.email} onChange={function(e){ setNewDist(function(p){ return {...p, email:e.target.value} }) }} placeholder="Email *" style={inp}/>
              <input type="password" value={newDist.password} onChange={function(e){ setNewDist(function(p){ return {...p, password:e.target.value} }) }} placeholder="Contraseña *" style={inp}/>
              <input value={newDist.company_name} onChange={function(e){ setNewDist(function(p){ return {...p, company_name:e.target.value} }) }} placeholder="Empresa *" style={inp}/>
              <input value={newDist.phone} onChange={function(e){ setNewDist(function(p){ return {...p, phone:e.target.value} }) }} placeholder="Telefono" style={inp}/>
              <input value={newDist.nif} onChange={function(e){ setNewDist(function(p){ return {...p, nif:e.target.value} }) }} placeholder="NIF/CIF" style={inp}/>
              <select value={newDist.level_id} onChange={function(e){ setNewDist(function(p){ return {...p, level_id:e.target.value} }) }} style={{ ...inp, cursor:'pointer' }}>
                <option value="">Nivel *</option>
                {levels.map(function(l){ return <option key={l.id} value={l.id}>{LEVEL_ICON[l.name]||''} {l.name} (-{l.discount_pct}%)</option> })}
              </select>
              <button onClick={createDistributor} disabled={saving} style={{ padding:'10px', background:'#ff1e41', border:'none', color:'white', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'Arial' }}>
                {saving ? 'Creando...' : 'Crear distribuidor'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(255,255,255,0.4)' }}>Lista de distribuidores</div>
          {loading ? (
            <div style={{ padding:40, textAlign:'center', color:'rgba(255,255,255,0.4)' }}>Cargando...</div>
          ) : distributors.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:14 }}>No hay distribuidores aun</div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>
                {['Empresa','Email','Nivel','Telefono','Alta','Estado',''].map(function(col){ return (
                  <th key={col} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'rgba(255,255,255,0.4)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>{col}</th>
                )})}
              </tr></thead>
              <tbody>
                {distributors.map(function(d) {
                  const levelName = d.distributor_levels ? d.distributor_levels.name : ''
                  const levelDisc = d.distributor_levels ? d.distributor_levels.discount_pct : 0
                  return (
                    <tr key={d.id} onClick={function(){ openDetalle(d) }} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:'pointer', transition:'background 0.15s' }} onMouseEnter={function(e){e.currentTarget.style.background='rgba(255,255,255,0.04)'}} onMouseLeave={function(e){e.currentTarget.style.background=''}}>
                      <td style={{ padding:'12px 14px', fontSize:13, fontWeight:700, color:'white' }}>{d.company_name}</td>
                      <td style={{ padding:'12px 14px', fontSize:12, color:'rgba(255,255,255,0.6)', fontFamily:'monospace' }}>{d.email}</td>
                      <td style={{ padding:'12px 14px' }}>
                        <span style={{ fontSize:11, padding:'2px 8px', background:(LEVEL_COLORS[levelName]||'#555')+'20', color:LEVEL_COLORS[levelName]||'#888', borderRadius:12, fontWeight:700 }}>
                          {LEVEL_ICON[levelName]||''} {levelName} {levelDisc>0?'-'+levelDisc+'%':''}
                        </span>
                      </td>
                      <td style={{ padding:'12px 14px', fontSize:12, color:'rgba(255,255,255,0.5)' }}>{d.phone||'-'}</td>
                      <td style={{ padding:'12px 14px', fontSize:11, color:'rgba(255,255,255,0.4)' }}>{fmt(d.created_at)}</td>
                      <td style={{ padding:'12px 14px' }}>
                        <span style={{ fontSize:11, padding:'2px 8px', borderRadius:12, background:d.active?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', color:d.active?'#22c55e':'#ef4444' }}>
                          {d.active?'Activo':'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding:'12px 14px' }}>
                        <button onClick={function(e){ e.stopPropagation(); toggleActive(d.id, d.active) }} style={{ padding:'4px 10px', background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.6)', fontSize:11, cursor:'pointer', fontFamily:'Arial' }}>
                          {d.active?'Desactivar':'Activar'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL DETALLE DISTRIBUIDOR */}
      {selDist && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={function(e){ if(e.target===e.currentTarget){ setSelDist(null); setEditDist(null) } }}>
          <div style={{ background:'#111', border:'1px solid #333', borderRadius:8, width:'100%', maxWidth:640, maxHeight:'85vh', overflow:'auto' }}>
            {/* Header */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #222', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:800, fontSize:16, color:'white' }}>{selDist.company_name}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{selDist.email}</div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <button onClick={function(){ setEditDist({...selDist, level_id: selDist.level_id}) }}
                  style={{ background:'#1a1a1a', border:'1px solid #444', color:'white', padding:'6px 14px', fontSize:12, cursor:'pointer', borderRadius:4, fontFamily:'inherit' }}>
                  ✏️ Editar
                </button>
                <button onClick={function(){ setSelDist(null); setEditDist(null) }}
                  style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:22, lineHeight:1 }}>✕</button>
              </div>
            </div>

            <div style={{ padding:'20px' }}>
              {/* Modo edición */}
              {editDist ? (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:14 }}>Editar datos</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <div>
                      <label style={{ display:'block', fontSize:10, color:'#888', marginBottom:4 }}>EMPRESA</label>
                      <input value={editDist.company_name} onChange={function(e){ setEditDist(function(p){ return {...p,company_name:e.target.value} }) }}
                        style={{ width:'100%', background:'#1a1a1a', border:'1px solid #333', color:'white', padding:'7px 10px', fontSize:13, fontFamily:'inherit', borderRadius:3, boxSizing:'border-box' }}/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:10, color:'#888', marginBottom:4 }}>TELÉFONO</label>
                      <input value={editDist.phone||''} onChange={function(e){ setEditDist(function(p){ return {...p,phone:e.target.value} }) }}
                        style={{ width:'100%', background:'#1a1a1a', border:'1px solid #333', color:'white', padding:'7px 10px', fontSize:13, fontFamily:'inherit', borderRadius:3, boxSizing:'border-box' }}/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:10, color:'#888', marginBottom:4 }}>NIF/CIF</label>
                      <input value={editDist.nif||''} onChange={function(e){ setEditDist(function(p){ return {...p,nif:e.target.value} }) }}
                        style={{ width:'100%', background:'#1a1a1a', border:'1px solid #333', color:'white', padding:'7px 10px', fontSize:13, fontFamily:'inherit', borderRadius:3, boxSizing:'border-box' }}/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:10, color:'#888', marginBottom:4 }}>NIVEL</label>
                      <select value={editDist.level_id} onChange={function(e){ setEditDist(function(p){ return {...p,level_id:Number(e.target.value)} }) }}
                        style={{ width:'100%', background:'#1a1a1a', border:'1px solid #333', color:'white', padding:'7px 10px', fontSize:13, fontFamily:'inherit', borderRadius:3, boxSizing:'border-box' }}>
                        {levels.map(function(l){ return <option key={l.id} value={l.id}>{l.name} (-{l.discount_pct}%)</option> })}
                      </select>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={saveEditDist} disabled={saving}
                      style={{ flex:1, background:'#ff1e41', color:'white', border:'none', padding:'10px', fontWeight:700, fontSize:13, cursor:'pointer', borderRadius:4, fontFamily:'inherit' }}>
                      {saving ? 'Guardando...' : '✅ Guardar cambios'}
                    </button>
                    <button onClick={function(){ setEditDist(null) }}
                      style={{ background:'#1a1a1a', border:'1px solid #333', color:'white', padding:'10px 16px', cursor:'pointer', borderRadius:4, fontFamily:'inherit' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Vista de datos */
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
                  {[
                    { l:'Nivel', v:(LEVEL_ICON[selDist.distributor_levels?.name]||'')+(selDist.distributor_levels?.name||'—')+' (-'+selDist.distributor_levels?.discount_pct+'%)' },
                    { l:'Estado', v:selDist.active?'🟢 Activo':'🔴 Inactivo' },
                    { l:'Teléfono', v:selDist.phone||'—' },
                    { l:'NIF/CIF', v:selDist.nif||'—' },
                    { l:'Email', v:selDist.email },
                    { l:'Alta', v:fmt(selDist.created_at) },
                  ].map(function(item){ return (
                    <div key={item.l} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', padding:'10px 14px', borderRadius:4 }}>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:4 }}>{item.l}</div>
                      <div style={{ fontSize:13, color:'white', fontWeight:600 }}>{item.v}</div>
                    </div>
                  )})}
                </div>
              )}

              {/* Historial de pedidos */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:12 }}>
                  📦 Historial de pedidos ({distOrders.length})
                </div>
                {distOrders.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'20px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>
                    Sin pedidos registrados
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {distOrders.map(function(o){ return (
                      <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:4 }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:'#ff1e41' }}>{o.order_number}</div>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{fmt(o.created_at)}</div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:15, fontWeight:800, color:'white' }}>{Number(o.total||0).toFixed(2)} €</div>
                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>{o.status}</div>
                        </div>
                      </div>
                    )})}
                    <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', borderTop:'1px solid #333', marginTop:4 }}>
                      <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>Total acumulado</span>
                      <span style={{ fontSize:15, fontWeight:900, color:'#22c55e' }}>
                        {distOrders.reduce(function(s,o){ return s+Number(o.total||0) },0).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
