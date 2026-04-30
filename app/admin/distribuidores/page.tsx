// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const S = 'https://awwlbepjxuoxaigztugh.supabase.co'
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

const LEVEL_COLORS = { Bronze:'#cd7f32', Silver:'#a8a9ad', Gold:'#ffd700' }
const LEVEL_ICON = { Bronze:'🥉', Silver:'🥈', Gold:'🥇' }

export default function AdminDistribuidoresPage() {
  const [levels, setLevels] = useState([])
  const [distributors, setDistributors] = useState([])
  const [loading, setLoading] = useState(true)
  const [editLevel, setEditLevel] = useState(null)
  const [newDist, setNewDist] = useState({ email:'', company_name:'', level_id:'', phone:'', nif:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const h = {apikey: K, 'Authorization': 'Bearer ' + K}
    const [r1, r2] = await Promise.all([
      fetch(S + '/rest/v1/distributor_levels?order=discount_pct.asc', {headers: h}).then(r => r.json()),
      fetch(S + '/rest/v1/distributors?select=*,distributor_levels(name,discount_pct)&order=company_name.asc', {headers: h}).then(r => r.json())
    ])
    setLevels(Array.isArray(r1) ? r1 : [])
    setDistributors(Array.isArray(r2) ? r2 : [])
    setLoading(false)
  }

  async function saveLevel() {
    if (!editLevel) return
    setSaving(true)
    const h2 = {apikey: K, 'Authorization': 'Bearer ' + K, 'Content-Type': 'application/json'}
    await fetch(S + '/rest/v1/distributor_levels?id=eq.' + editLevel.id, {
      method: 'PATCH', headers: h2,
      body: JSON.stringify({discount_pct: Number(editLevel.discount_pct), min_order_amount: Number(editLevel.min_order_amount)})
    })
    setMsg('Nivel actualizado')
    setEditLevel(null)
    setSaving(false)
    setTimeout(() => setMsg(''), 2500)
    load()
  }

  async function toggleActive(id, active) {
    const h3 = {apikey: K, 'Authorization': 'Bearer ' + K, 'Content-Type': 'application/json'}
    await fetch(S + '/rest/v1/distributors?id=eq.' + id, {
      method: 'PATCH', headers: h3, body: JSON.stringify({active: !active})
    })
    load()
  }

  async function createDistributor() {
    if (!newDist.email || !newDist.company_name || !newDist.level_id) {
      setMsg('Rellena email, empresa y nivel')
      setTimeout(() => setMsg(''), 2500)
      return
    }
    setSaving(true)
    const h4 = {apikey: K, 'Authorization': 'Bearer ' + K, 'Content-Type': 'application/json', 'Prefer': 'return=minimal'}
    const r = await fetch(S + '/rest/v1/distributors', {
      method: 'POST', headers: h4,
      body: JSON.stringify({email: newDist.email, company_name: newDist.company_name, level_id: Number(newDist.level_id), phone: newDist.phone || null, nif: newDist.nif || null, active: true})
    })
    if (!r.ok) { const err = await r.text(); setMsg('Error: ' + err); setSaving(false); return }
    setMsg('Distribuidor creado correctamente')
    setNewDist({ email:'', company_name:'', level_id:'', phone:'', nif:'' })
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
    load()
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

      {msg && <div style={{ background:'rgba(34,197,94,0.1)', borderBottom:'1px solid rgba(34,197,94,0.2)', padding:'12px 28px', fontSize:13, color:'#22c55e' }}>{msg}</div>}

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
                    <tr key={d.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
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
                        <button onClick={function(){ toggleActive(d.id, d.active) }} style={{ padding:'4px 10px', background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.6)', fontSize:11, cursor:'pointer', fontFamily:'Arial' }}>
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
    </div>
  )
}
