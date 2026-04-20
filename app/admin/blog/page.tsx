// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const CATS=['Todos','nutricion','entrenamiento','recetas','suplementacion','lifestyle']
const EMPTY={title:'',slug:'',excerpt:'',content:'',cover_image:'',category:'nutricion',tags:'',published:false}

export default function BlogAdmin(){
  const[posts,setPosts]=useState([])
  const[form,setForm]=useState({...EMPTY})
  const[editing,setEditing]=useState(null)
  const[saving,setSaving]=useState(false)
  const[msg,setMsg]=useState('')

  useEffect(()=>{
    fetch(S+'/rest/v1/blog_posts?order=created_at.desc',{headers:{'apikey':K,'Authorization':'Bearer '+K}})
      .then(r=>r.json()).then(d=>setPosts(d||[])).catch(()=>{})
  },[])

  function slugify(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}

  function handleTitle(v){
    setForm(f=>({...f,title:v,slug:editing?f.slug:slugify(v)}))
  }

  async function save(){
    if(!form.title||!form.slug)return
    setSaving(true)
    const body={...form,tags:form.tags?form.tags.split(',').map(t=>t.trim()):[],
      published_at:form.published?new Date().toISOString():null}
    if(editing){
      await fetch(S+'/rest/v1/blog_posts?id=eq.'+editing,{
        method:'PATCH',headers:{'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json'},
        body:JSON.stringify(body)
      })
      setPosts(p=>p.map(x=>x.id===editing?{...x,...body}:x))
      setMsg('Artículo actualizado ✅')
    }else{
      const r=await fetch(S+'/rest/v1/blog_posts',{
        method:'POST',headers:{'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json','Prefer':'return=representation'},
        body:JSON.stringify(body)
      })
      const d=await r.json()
      setPosts(p=>[d[0],...p])
      setMsg('Artículo creado ✅')
    }
    setForm({...EMPTY});setEditing(null);setSaving(false)
    setTimeout(()=>setMsg(''),3000)
  }

  async function toggle(id,published){
    await fetch(S+'/rest/v1/blog_posts?id=eq.'+id,{
      method:'PATCH',headers:{'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json'},
      body:JSON.stringify({published:!published,published_at:!published?new Date().toISOString():null})
    })
    setPosts(p=>p.map(x=>x.id===id?{...x,published:!published}:x))
  }

  async function del(id){
    if(!confirm('¿Eliminar este artículo?'))return
    await fetch(S+'/rest/v1/blog_posts?id=eq.'+id,{method:'DELETE',headers:{'apikey':K,'Authorization':'Bearer '+K}})
    setPosts(p=>p.filter(x=>x.id!==id))
  }

  function edit(p){setEditing(p.id);setForm({...p,tags:(p.tags||[]).join(', ')})}

  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})

  return(
    <div style={{background:'#f5f5f5',minHeight:'100vh',fontFamily:'Arial,sans-serif'}}>
      <div style={{background:'#111',color:'white',padding:'24px 32px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:24}}>✍️</span>
          <div>
            <h1 style={{margin:0,fontSize:20,fontWeight:900,textTransform:'uppercase'}}>Blog Admin</h1>
            <p style={{margin:0,fontSize:12,color:'rgba(255,255,255,0.6)'}}>Gestiona artículos del blog</p>
          </div>
        </div>
        <Link href="/blog" target="_blank" style={{color:'#ff1e41',textDecoration:'none',fontSize:13,fontWeight:700}}>Ver blog →</Link>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 20px',display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:20}}>
        {/* Formulario */}
        <div style={{background:'white',padding:24,border:'1px solid #e8e8e8',height:'fit-content'}}>
          <h3 style={{fontSize:14,fontWeight:700,textTransform:'uppercase',margin:'0 0 20px'}}>
            {editing?'Editar artículo':'Nuevo artículo'}
          </h3>
          {msg&&<div style={{background:'#f0fdf4',border:'1px solid #86efac',padding:'8px 12px',fontSize:13,color:'#166534',marginBottom:12}}>{msg}</div>}
          {[
            {label:'Título *',key:'title',type:'text',ph:'Título del artículo',fn:v=>handleTitle(v)},
            {label:'Slug (URL)',key:'slug',type:'text',ph:'url-del-articulo'},
            {label:'Imagen de portada',key:'cover_image',type:'text',ph:'https://...'},
            {label:'Extracto',key:'excerpt',type:'text',ph:'Breve descripción...'},
          ].map(f=>(
            <div key={f.key} style={{marginBottom:12}}>
              <div style={{fontSize:12,color:'#666',marginBottom:4,fontWeight:600}}>{f.label}</div>
              <input value={form[f.key]} onChange={e=>f.fn?f.fn(e.target.value):setForm(ff=>({...ff,[f.key]:e.target.value}))}
                placeholder={f.ph} style={{width:'100%',padding:'8px 10px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}}/>
            </div>
          ))}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:'#666',marginBottom:4,fontWeight:600}}>Categoría</div>
            <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
              style={{width:'100%',padding:'8px 10px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit'}}>
              {CATS.slice(1).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:'#666',marginBottom:4,fontWeight:600}}>Tags (separados por coma)</div>
            <input value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))}
              placeholder="proteina, ganancia, whey" style={{width:'100%',padding:'8px 10px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}}/>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:'#666',marginBottom:4,fontWeight:600}}>Contenido</div>
            <textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))}
              placeholder="Escribe el artículo aquí (puedes usar Markdown)..." rows={8}
              style={{width:'100%',padding:'8px 10px',border:'1px solid #ddd',fontSize:13,fontFamily:'inherit',resize:'vertical',boxSizing:'border-box'}}/>
          </div>
          <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,cursor:'pointer',fontSize:14}}>
            <input type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} style={{width:16,height:16}}/>
            Publicar inmediatamente
          </label>
          <div style={{display:'flex',gap:8}}>
            {editing&&<button onClick={()=>{setEditing(null);setForm({...EMPTY})}}
              style={{flex:1,padding:10,border:'1px solid #ddd',background:'white',cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>Cancelar</button>}
            <button onClick={save} disabled={saving||!form.title}
              style={{flex:2,padding:10,border:'none',background:'#ff1e41',color:'white',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:'inherit'}}>
              {saving?'Guardando...':(editing?'Actualizar':'Publicar artículo')}
            </button>
          </div>
        </div>

        {/* Lista */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{fontSize:14,fontWeight:700,textTransform:'uppercase',margin:0}}>Artículos ({posts.length})</h3>
          </div>
          {posts.length===0?<div style={{background:'white',padding:24,border:'1px solid #e8e8e8',textAlign:'center',color:'#aaa',fontSize:13}}>
            No hay artículos. Crea el primero.
          </div>:posts.map(p=>(
            <div key={p.id} style={{background:'white',border:'1px solid #e8e8e8',padding:16,marginBottom:10}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                {p.cover_image&&<img src={p.cover_image} alt="" style={{width:64,height:48,objectFit:'cover',flexShrink:0}}/>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                    <div style={{fontWeight:700,fontSize:14,color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</div>
                    <span style={{fontSize:11,padding:'2px 8px',background:p.published?'#dcfce7':'#f5f5f5',color:p.published?'#166534':'#888',border:'1px solid',borderColor:p.published?'#86efac':'#ddd',flexShrink:0,fontWeight:600}}>
                      {p.published?'✓ Publicado':'Borrador'}
                    </span>
                  </div>
                  <div style={{fontSize:12,color:'#aaa',marginTop:4}}>{p.category} · {fmt(p.created_at)}</div>
                  {p.excerpt&&<div style={{fontSize:13,color:'#666',marginTop:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.excerpt}</div>}
                </div>
              </div>
              <div style={{display:'flex',gap:8,marginTop:12}}>
                <button onClick={()=>toggle(p.id,p.published)}
                  style={{flex:1,padding:'6px 0',border:'1px solid #ddd',background:'white',cursor:'pointer',fontSize:12,fontFamily:'inherit',fontWeight:600}}>
                  {p.published?'Despublicar':'Publicar'}
                </button>
                <button onClick={()=>edit(p)}
                  style={{flex:1,padding:'6px 0',border:'1px solid #ddd',background:'white',cursor:'pointer',fontSize:12,fontFamily:'inherit',fontWeight:600}}>
                  ✏️ Editar
                </button>
                <button onClick={()=>del(p.id)}
                  style={{flex:1,padding:'6px 0',border:'1px solid #ef4444',background:'white',color:'#ef4444',cursor:'pointer',fontSize:12,fontFamily:'inherit',fontWeight:600}}>
                  🗑 Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
      }
