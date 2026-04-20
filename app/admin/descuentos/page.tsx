// @ts-nocheck
'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const db = createClient(
  'https://awwlbepjxuoxaigztugh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
)

function randomCode(prefix='BM') {
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code=prefix+'-'
  for(let i=0;i<6;i++) code+=chars[Math.floor(Math.random()*chars.length)]
  return code
}

const EMPTY = { code:'', type:'percent', value:'', min_order:'', max_uses:'', expires_at:'', description:'', active:true }

export default function AdminDescuentos() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({...EMPTY, code: randomCode()})
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(null)
  const [filter, setFilter] = useState('all')
  const [editId, setEditId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.from('discount_codes').select('*').order('created_at',{ascending:false})
    setCodes(data||[])
    setLoading(false)
  },[])

  useEffect(()=>{ load() },[load])

  async function submit(e) {
    e.preventDefault()
    if(!form.code||!form.value) return
    setSaving(true)
    const payload = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: Number(form.value),
      min_order: form.min_order ? Number(form.min_order) : 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
      description: form.description || null,
      active: form.active
    }
    if(editId) {
      await db.from('discount_codes').update(payload).eq('id', editId)
    } else {
      await db.from('discount_codes').insert(payload)
    }
    setForm({...EMPTY, code: randomCode()})
    setEditId(null)
    await load()
    setSaving(false)
  }

  async function toggleActive(id, active) {
    await db.from('discount_codes').update({ active: !active }).eq('id', id)
    setCodes(cs => cs.map(c => c.id===id ? {...c, active: !active} : c))
  }

  async function deleteCode(id) {
    if(!confirm('¿Eliminar este código?')) return
    await db.from('discount_codes').delete().eq('id', id)
    setCodes(cs => cs.filter(c => c.id!==id))
  }

  function editCode(c) {
    setEditId(c.id)
    setForm({
      code: c.code, type: c.type, value: c.value,
      min_order: c.min_order||'', max_uses: c.max_uses||'',
      expires_at: c.expires_at ? c.expires_at.slice(0,10) : '',
      description: c.description||'', active: c.active
    })
    window.scrollTo({top:0,behavior:'smooth'})
  }

  function copy(code) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(()=>setCopied(null), 2000)
  }

  const filtered = codes.filter(c => {
    if(filter==='active') return c.active
    if(filter==='inactive') return !c.active
    if(filter==='expired') return c.expires_at && new Date(c.expires_at) < new Date()
    return true
  })

  const stats = {
    total: codes.length,
    active: codes.filter(c=>c.active).length,
    uses: codes.reduce((s,c)=>s+c.uses,0),
    expired: codes.filter(c=>c.expires_at&&new Date(c.expires_at)<new Date()).length
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'2-digit'}) : '—'
  const isExpired = c => c.expires_at && new Date(c.expires_at) < new Date()

  return (
    <div style={{background:'#f5f5f5',minHeight:'100vh',padding:'1.5rem 20px',fontFamily:'var(--font-body,Arial)'}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1.25rem',flexWrap:'wrap'}}>
          <h1 style={{fontSize:20,fontWeight:900,textTransform:'uppercase',margin:0}}>🏷️ Códigos de Descuento</h1>
          <a href="/admin" style={{background:'#111',color:'white',padding:'6px 14px',fontSize:12,fontWeight:700,textDecoration:'none',textTransform:'uppercase'}}>← Admin</a>
          <a href="/" style={{marginLeft:'auto',fontSize:12,color:'#888',textDecoration:'none'}}>← Tienda</a>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.75rem',marginBottom:'1.25rem'}}>
          {[['Total',stats.total,'#111'],['Activos',stats.active,'#22c55e'],['Usos totales',stats.uses,'#3b82f6'],['Expirados',stats.expired,'#f59e0b']].map(([l,v,c])=>(
            <div key={l} style={{background:'white',padding:'1rem 1.25rem',border:'1px solid #e8e8e8'}}>
              <div style={{fontSize:11,color:'#999',textTransform:'uppercase',marginBottom:4}}>{l}</div>
              <div style={{fontSize:26,fontWeight:900,color:c}}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'380px 1fr',gap:'1.25rem',alignItems:'start'}}>

          {/* Formulario */}
          <div style={{background:'white',border:'1px solid #e8e8e8',padding:'1.25rem',position:'sticky',top:20}}>
            <h2 style={{fontSize:14,fontWeight:900,textTransform:'uppercase',margin:'0 0 1rem',paddingBottom:'0.75rem',borderBottom:'1px solid #f0f0f0'}}>
              {editId ? '✏️ Editar código' : '➕ Nuevo código'}
            </h2>
            <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12}}>

              {/* Código */}
              <div>
                <label style={{fontSize:11,color:'#666',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4}}>Código</label>
                <div style={{display:'flex',gap:8}}>
                  <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))}
                    placeholder="VERANO20" required
                    style={{flex:1,padding:'8px 10px',border:'1px solid #ddd',fontSize:14,fontWeight:700,fontFamily:'monospace',letterSpacing:1}}/>
                  <button type="button" onClick={()=>setForm(f=>({...f,code:randomCode()}))}
                    title="Generar aleatorio"
                    style={{padding:'8px 12px',border:'1px solid #ddd',background:'#f5f5f5',cursor:'pointer',fontSize:14,fontFamily:'inherit'}}>
                    🔀
                  </button>
                </div>
              </div>

              {/* Tipo y valor */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <div>
                  <label style={{fontSize:11,color:'#666',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4}}>Tipo</label>
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                    style={{width:'100%',padding:'8px 10px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',background:'white'}}>
                    <option value="percent">Porcentaje (%)</option>
                    <option value="fixed">Importe fijo (€)</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,color:'#666',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4}}>
                    Valor {form.type==='percent'?'(%)':'(€)'}
                  </label>
                  <input type="number" min="0" step={form.type==='percent'?'1':'0.01'} max={form.type==='percent'?'100':undefined}
                    value={form.value} onChange={e=>setForm(f=>({...f,value:e.target.value}))}
                    placeholder={form.type==='percent'?'20':'10.00'} required
                    style={{width:'100%',padding:'8px 10px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}}/>
                </div>
              </div>

              {/* Pedido mínimo */}
              <div>
                <label style={{fontSize:11,color:'#666',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4}}>Pedido mínimo (€) <span style={{color:'#bbb',fontWeight:400}}>opcional</span></label>
                <input type="number" min="0" step="0.01" value={form.min_order} onChange={e=>setForm(f=>({...f,min_order:e.target.value}))}
                  placeholder="0"
                  style={{width:'100%',padding:'8px 10px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}}/>
              </div>

              {/* Usos máximos + expiración */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <div>
                  <label style={{fontSize:11,color:'#666',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4}}>Usos máx. <span style={{color:'#bbb',fontWeight:400}}>vacío=ilimitado</span></label>
                  <input type="number" min="1" value={form.max_uses} onChange={e=>setForm(f=>({...f,max_uses:e.target.value}))}
                    placeholder="∞"
                    style={{width:'100%',padding:'8px 10px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}}/>
                </div>
                <div>
                  <label style={{fontSize:11,color:'#666',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4}}>Expira el <span style={{color:'#bbb',fontWeight:400}}>opcional</span></label>
                  <input type="date" value={form.expires_at} onChange={e=>setForm(f=>({...f,expires_at:e.target.value}))}
                    style={{width:'100%',padding:'8px 10px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}}/>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label style={{fontSize:11,color:'#666',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4}}>Descripción interna <span style={{color:'#bbb',fontWeight:400}}>opcional</span></label>
                <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                  placeholder="Ej: Campaña verano 2026"
                  style={{width:'100%',padding:'8px 10px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}}/>
              </div>

              {/* Activo toggle */}
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
                <input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))}
                  style={{width:16,height:16,accentColor:'#ff1e41'}}/>
                Código activo
              </label>

              <div style={{display:'flex',gap:8,paddingTop:4}}>
                <button type="submit" disabled={saving}
                  style={{flex:1,background:'#ff1e41',color:'white',border:'none',padding:'10px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                  {saving?'Guardando...':(editId?'💾 Actualizar':'✓ Crear código')}
                </button>
                {editId && (
                  <button type="button" onClick={()=>{setEditId(null);setForm({...EMPTY,code:randomCode()})}}
                    style={{padding:'10px 14px',border:'1px solid #ddd',background:'white',cursor:'pointer',fontFamily:'inherit',fontSize:13}}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de códigos */}
          <div>
            {/* Filtros */}
            <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.75rem',flexWrap:'wrap'}}>
              {[['all','Todos'],['active','Activos'],['inactive','Inactivos'],['expired','Expirados']].map(([k,l])=>(
                <button key={k} onClick={()=>setFilter(k)}
                  style={{padding:'5px 14px',border:'1px solid #ddd',background:filter===k?'#111':'white',color:filter===k?'white':'#666',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',textTransform:'uppercase'}}>
                  {l}
                </button>
              ))}
              <span style={{marginLeft:'auto',fontSize:12,color:'#aaa',alignSelf:'center'}}>{filtered.length} códigos</span>
            </div>

            <div style={{background:'white',border:'1px solid #e8e8e8',overflow:'hidden'}}>
              {loading ? <div style={{padding:'3rem',textAlign:'center',color:'#aaa'}}>Cargando...</div>
              : filtered.length===0 ? <div style={{padding:'3rem',textAlign:'center',color:'#aaa'}}>No hay códigos</div>
              : <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f9f9f9',borderBottom:'1px solid #e8e8e8'}}>
                    {['Código','Descuento','Mín.','Usos','Expira','Estado',''].map(h=>(
                      <th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,textTransform:'uppercase',color:'#888',letterSpacing:'0.05em'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c=>{
                    const expired = isExpired(c)
                    const exhausted = c.max_uses && c.uses >= c.max_uses
                    return (
                      <tr key={c.id} style={{borderBottom:'1px solid #f5f5f5',background:editId===c.id?'#fff8f8':'white'}}>
                        {/* Código */}
                        <td style={{padding:'10px 12px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <code style={{fontFamily:'monospace',fontSize:14,fontWeight:700,letterSpacing:1,color:'#ff1e41'}}>{c.code}</code>
                            <button onClick={()=>copy(c.code)} title="Copiar"
                              style={{background:'none',border:'none',cursor:'pointer',fontSize:14,padding:0,color: copied===c.code?'#22c55e':'#aaa'}}>
                              {copied===c.code?'✓':'📋'}
                            </button>
                          </div>
                          {c.description && <div style={{fontSize:10,color:'#bbb',marginTop:2}}>{c.description}</div>}
                        </td>
                        {/* Descuento */}
                        <td style={{padding:'10px 12px'}}>
                          <span style={{fontSize:16,fontWeight:900,color:'#111'}}>
                            {c.type==='percent' ? c.value+'%' : c.value.toFixed(2)+' €'}
                          </span>
                        </td>
                        {/* Pedido mínimo */}
                        <td style={{padding:'10px 12px',fontSize:12,color:'#888'}}>
                          {c.min_order>0 ? c.min_order.toFixed(2)+' €' : '—'}
                        </td>
                        {/* Usos */}
                        <td style={{padding:'10px 12px'}}>
                          <div style={{fontSize:13,fontWeight:600,color:exhausted?'#ef4444':'#333'}}>
                            {c.uses}{c.max_uses ? ' / '+c.max_uses : ''}
                          </div>
                          {c.max_uses && (
                            <div style={{height:3,background:'#f0f0f0',borderRadius:2,marginTop:3,width:60}}>
                              <div style={{height:3,background:exhausted?'#ef4444':'#22c55e',borderRadius:2,width:Math.min(100,(c.uses/c.max_uses*100))+'%'}}/>
                            </div>
                          )}
                        </td>
                        {/* Expira */}
                        <td style={{padding:'10px 12px',fontSize:12,color:expired?'#ef4444':'#888'}}>
                          {fmtDate(c.expires_at)}
                          {expired && <div style={{fontSize:10,color:'#ef4444',fontWeight:700}}>EXPIRADO</div>}
                        </td>
                        {/* Estado */}
                        <td style={{padding:'10px 12px'}}>
                          <button onClick={()=>toggleActive(c.id,c.active)}
                            style={{padding:'3px 10px',border:'none',background:c.active&&!expired&&!exhausted?'#22c55e':'#ddd',color:c.active&&!expired&&!exhausted?'white':'#888',fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit',borderRadius:20}}>
                            {c.active&&!expired&&!exhausted?'ACTIVO':'INACTIVO'}
                          </button>
                        </td>
                        {/* Acciones */}
                        <td style={{padding:'10px 12px'}}>
                          <div style={{display:'flex',gap:6}}>
                            <button onClick={()=>editCode(c)} title="Editar"
                              style={{padding:'4px 10px',border:'1px solid #ddd',background:'white',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
                              ✏️
                            </button>
                            <button onClick={()=>deleteCode(c.id)} title="Eliminar"
                              style={{padding:'4px 10px',border:'1px solid #fecaca',background:'#fff5f5',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:600,color:'#ef4444'}}>
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
