'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Level = { id:number; name:string; discount_pct:number; min_order_amount:number }
type Distributor = { id:string; email:string; company_name:string; active:boolean; level_name:string; discount_pct:number; user_id:string|null }

const LEVEL_COLORS: Record<string,string> = { Bronze:'#cd7f32', Silver:'#a8a9ad', Gold:'#ffd700' }
const LEVEL_ICON: Record<string,string> = { Bronze:'🥉', Silver:'🥈', Gold:'🥇' }

export default function AdminDistribuidoresPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [loading, setLoading] = useState(true)
  const [editLevel, setEditLevel] = useState<Level|null>(null)
  const [newDist, setNewDist] = useState({ email:'', company_name:'', level_id:'', password:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const [{ data:lvls }, { data:dists }] = await Promise.all([
      supabase.from('distributor_levels').select('*').order('discount_pct'),
      supabase.from('distributor_profiles').select('*').order('company_name')
    ])
    setLevels(lvls||[]); setDistributors(dists||[]); setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveLevel = async () => {
    if (!editLevel) return
    setSaving(true)
    await supabase.from('distributor_levels')
      .update({ discount_pct: editLevel.discount_pct, min_order_amount: editLevel.min_order_amount })
      .eq('id', editLevel.id)
    setMsg('✓ Nivel actualizado'); setEditLevel(null); await load(); setSaving(false)
    setTimeout(()=>setMsg(''), 3000)
  }

  const toggleActive = async (id:string, active:boolean) => {
    await supabase.from('distributors').update({ active: !active }).eq('id', id)
    await load()
  }

  const createDistributor = async (e:React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg('')
    try {
      const res = await fetch('/api/admin/create-distributor', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(newDist)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      setMsg(`✓ Distribuidor creado. Email: ${newDist.email} · Contraseña: ${newDist.password}`)
      setNewDist({ email:'', company_name:'', level_id:'', password:'' })
      await load()
    } catch(err:any) { setMsg('Error: '+err.message) }
    setSaving(false)
  }

  return (
    <div style={{background:'var(--bg)',minHeight:'100vh',paddingBottom:'3rem'}}>
      <div className="container" style={{paddingTop:'2rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem',flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--red)',marginBottom:4}}>ADMIN</div>
            <h1 style={{fontSize:28,fontWeight:900,textTransform:'uppercase',margin:0}}>GESTIÓN DE DISTRIBUIDORES</h1>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Link href="/admin/pedidos" style={{fontSize:13,color:'var(--muted)',border:'1px solid var(--border)',padding:'8px 16px',display:'flex',alignItems:'center',gap:4}}>📋 Pedidos</Link>
            <Link href="/" style={{fontSize:13,color:'var(--muted)',border:'1px solid var(--border)',padding:'8px 16px'}}>← Tienda</Link>
          </div>
        </div>

        {msg && (
          <div style={{background:msg.includes('Error')?'rgba(255,30,65,0.08)':'rgba(40,167,69,0.08)',border:`1px solid ${msg.includes('Error')?'rgba(255,30,65,0.3)':'rgba(40,167,69,0.3)'}`,padding:'12px 16px',marginBottom:'1.5rem',fontSize:14,color:msg.includes('Error')?'var(--red)':'#28a745',fontWeight:600,wordBreak:'break-all'}}>
            {msg}
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'380px 1fr',gap:'1.5rem',alignItems:'start'}}>
          {/* IZQUIERDA: tabla descuentos + crear */}
          <div>
            {/* TABLA DE DESCUENTOS */}
            <div style={{background:'var(--white)',border:'1px solid var(--border)',padding:'1.5rem',marginBottom:'1rem'}}>
              <h2 style={{fontSize:15,fontWeight:800,textTransform:'uppercase',marginBottom:'0.5rem',paddingBottom:'0.75rem',borderBottom:'1px solid var(--border)'}}>Tabla de descuentos</h2>
              <p style={{fontSize:12,color:'var(--muted)',marginBottom:'1rem'}}>Los cambios se aplican automáticamente al loguearse el distribuidor.</p>
              {levels.map(level => (
                <div key={level.id} style={{padding:'0.875rem',background:`${LEVEL_COLORS[level.name]}08`,border:`1px solid ${LEVEL_COLORS[level.name]}30`,marginBottom:'0.75rem'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:editLevel?.id===level.id?8:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontSize:20}}>{LEVEL_ICON[level.name]}</span>
                      <div>
                        <div style={{fontSize:14,fontWeight:800,color:LEVEL_COLORS[level.name]}}>{level.name}</div>
                        <div style={{fontSize:11,color:'var(--muted)'}}>Mín. pedido: {level.min_order_amount} €</div>
                      </div>
                    </div>
                    {editLevel?.id!==level.id && (
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:26,fontWeight:900,color:LEVEL_COLORS[level.name],fontFamily:'var(--font-body)'}}>-{level.discount_pct}%</span>
                        <button onClick={()=>setEditLevel({...level})} style={{fontSize:11,padding:'4px 8px',border:'1px solid var(--border)',background:'none',cursor:'pointer',color:'var(--muted)'}}>✏️ Editar</button>
                      </div>
                    )}
                  </div>
                  {editLevel?.id===level.id && (
                    <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap',paddingTop:4}}>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        <span style={{fontSize:12,color:'var(--muted)'}}>Descuento:</span>
                        <input type="number" value={editLevel.discount_pct} onChange={e=>setEditLevel({...editLevel,discount_pct:Number(e.target.value)})} style={{width:60,padding:'5px 8px',fontSize:14,margin:0,textAlign:'center'}} min={0} max={50}/>
                        <span style={{fontSize:13}}>%</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        <span style={{fontSize:12,color:'var(--muted)'}}>Mín:</span>
                        <input type="number" value={editLevel.min_order_amount} onChange={e=>setEditLevel({...editLevel,min_order_amount:Number(e.target.value)})} style={{width:70,padding:'5px 8px',fontSize:14,margin:0,textAlign:'center'}} min={0}/>
                        <span style={{fontSize:12}}>€</span>
                      </div>
                      <button onClick={saveLevel} disabled={saving} className="btn-primary" style={{padding:'5px 12px',fontSize:12}}>✓ Guardar</button>
                      <button onClick={()=>setEditLevel(null)} style={{padding:'5px 8px',fontSize:12,border:'1px solid var(--border)',background:'none',cursor:'pointer'}}>✕</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CREAR DISTRIBUIDOR */}
            <div style={{background:'var(--white)',border:'1px solid var(--border)',padding:'1.5rem'}}>
              <h2 style={{fontSize:15,fontWeight:800,textTransform:'uppercase',marginBottom:'1.25rem',paddingBottom:'0.75rem',borderBottom:'1px solid var(--border)'}}>Crear distribuidor</h2>
              <form onSubmit={createDistributor}>
                <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                  <div><label>Empresa / Nombre</label><input value={newDist.company_name} onChange={e=>setNewDist(p=>({...p,company_name:e.target.value}))} placeholder="Nombre empresa" required/></div>
                  <div><label>Email de acceso</label><input type="email" value={newDist.email} onChange={e=>setNewDist(p=>({...p,email:e.target.value}))} placeholder="dist@empresa.com" required/></div>
                  <div><label>Contraseña inicial</label><input type="text" value={newDist.password} onChange={e=>setNewDist(p=>({...p,password:e.target.value}))} placeholder="Mínimo 8 caracteres" required minLength={8}/></div>
                  <div>
                    <label>Nivel de descuento</label>
                    <select value={newDist.level_id} onChange={e=>setNewDist(p=>({...p,level_id:e.target.value}))} required style={{margin:0}}>
                      <option value="">Seleccionar nivel...</option>
                      {levels.map(l=><option key={l.id} value={l.id}>{LEVEL_ICON[l.name]} {l.name} (-{l.discount_pct}%)</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary" style={{padding:'11px',justifyContent:'center'}}>
                    {saving?'Creando...':'+ Crear distribuidor'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* DERECHA: lista distribuidores */}
          <div style={{background:'var(--white)',border:'1px solid var(--border)'}}>
            <div style={{padding:'1rem 1.25rem',borderBottom:'2px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--bg)'}}>
              <h2 style={{fontSize:15,fontWeight:800,textTransform:'uppercase',margin:0}}>Distribuidores ({distributors.length})</h2>
              <button onClick={load} style={{fontSize:12,color:'var(--muted)',background:'none',border:'1px solid var(--border)',padding:'6px 12px',cursor:'pointer'}}>↻ Actualizar</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 100px 90px 80px 90px',gap:'0.5rem',padding:'8px 1.25rem',borderBottom:'1px solid var(--border)',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--muted)',background:'var(--bg)'}}>
              <span>Empresa / Email</span><span style={{textAlign:'center'}}>Nivel</span><span style={{textAlign:'center'}}>Cuenta</span><span style={{textAlign:'center'}}>Estado</span><span/>
            </div>
            {loading ? (
              Array.from({length:5}).map((_,i)=><div key={i} className="skeleton" style={{height:56,margin:'0.5rem 1rem'}}/>)
            ) : distributors.length===0 ? (
              <div style={{padding:'4rem',textAlign:'center',color:'var(--muted)'}}>
                <div style={{fontSize:40,marginBottom:8}}>🏪</div>
                <p style={{fontWeight:700,fontSize:16}}>Sin distribuidores todavía</p>
                <p style={{fontSize:13,marginTop:4}}>Crea el primero con el formulario</p>
              </div>
            ) : distributors.map(d=>(
              <div key={d.id} style={{display:'grid',gridTemplateColumns:'1fr 100px 90px 80px 90px',gap:'0.5rem',padding:'12px 1.25rem',borderBottom:'1px solid var(--border)',alignItems:'center',opacity:d.active?1:0.5}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.company_name}</div>
                  <div style={{fontSize:11,color:'var(--muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.email}</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <span style={{fontSize:11,fontWeight:700,padding:'3px 8px',background:`${LEVEL_COLORS[d.level_name]||'#999'}15`,color:LEVEL_COLORS[d.level_name]||'#999',border:`1px solid ${LEVEL_COLORS[d.level_name]||'#999'}40`,whiteSpace:'nowrap'}}>
                    {LEVEL_ICON[d.level_name]} {d.level_name} -{d.discount_pct}%
                  </span>
                </div>
                <div style={{textAlign:'center',fontSize:11,fontWeight:600}}>
                  {d.user_id?<span style={{color:'#28a745'}}>🔗 Activo</span>:<span style={{color:'var(--muted)'}}>⚠️ Sin cuenta</span>}
                </div>
                <div style={{textAlign:'center',fontSize:11,fontWeight:600}}>
                  <span style={{color:d.active?'#28a745':'var(--muted)'}}>{d.active?'● Activo':'● Inactivo'}</span>
                </div>
                <button onClick={()=>toggleActive(d.id,d.active)} style={{fontSize:11,padding:'4px 8px',background:'none',border:'1px solid var(--border)',cursor:'pointer',color:'var(--muted)'}}>
                  {d.active?'Desactivar':'Activar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
