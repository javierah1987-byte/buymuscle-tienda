// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
const API='/api/admin/content'
const CATS=['Todos','nutricion','entrenamiento','recetas','suplementacion','lifestyle']
const EMPTY={title:'',slug:'',excerpt:'',content:'',cover_image:'',category:'nutricion',tags:'',published:false}

export default function BlogAdmin(){
  const[posts,setPosts]=useState([])
  const[form,setForm]=useState({...EMPTY})
  const[editing,setEditing]=useState(null)
  const[saving,setSaving]=useState(false)
  const[msg,setMsg]=useState('')

  useEffect(()=>{
    fetch(API+'?t=blog&order=created_at.desc')
      .then(r=>r.json())
      .then(j=>{
        if(j.ok)setPosts(Array.isArray(j.data)?j.data:[])
        else setMsg('❌ Error al cargar: '+(j.error||'desconocido'))
      })
      .catch(e=>setMsg('❌ Error al cargar: '+e.message))
  },[])

  function slugify(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}

  function handleTitle(v){
    setForm(f=>({...f,title:v,slug:editing?f.slug:slugify(v)}))
  }

  async function save(){
    if(!form.title||!form.slug)return
    setSaving(true)
    // Solo columnas reales de blog_posts (no propagar id/created_at del row editado)
    const fields={
      title:form.title,slug:form.slug,excerpt:form.excerpt||null,content:form.content||null,
      cover_image:form.cover_image||null,category:form.category||null,
      tags:form.tags?form.tags.split(',').map(t=>t.trim()).filter(Boolean):[],
      published:!!form.published,
      published_at:form.published?new Date().toISOString():null
    }
    try{
      if(editing){
        const r=await fetch(API,{
          method:'PATCH',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({t:'blog',id:editing,fields})
        })
        const j=await r.json()
        if(!j.ok)throw new Error(j.error||'Error al actualizar')
        setPosts(p=>p.map(x=>x.id===editing?j.data:x))
        setMsg('Artículo actualizado ✅')
      }else{
        const r=await fetch(API,{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({t:'blog',row:fields})
        })
        const j=await r.json()
        if(!j.ok)throw new Error(j.error||'Error al crear')
        setPosts(p=>[j.data,...p])
        setMsg('Artículo creado ✅')
      }
      setForm({...EMPTY});setEditing(null)
    }catch(e){
      setMsg('❌ Error: '+e.message)
    }
    setSaving(false)
    setTimeout(()=>setMsg(''),5000)
  }

  async function toggle(id,published){
    try{
      const r=await fetch(API,{
        method:'PATCH',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({t:'blog',id,fields:{published:!published,published_at:!published?new Date().toISOString():null}})
      })
      const j=await r.json()
      if(!j.ok)throw new Error(j.error||'Error al cambiar estado')
      setPosts(p=>p.map(x=>x.id===id?j.data:x))
    }catch(e){
      setMsg('❌ Error: '+e.message);setTimeout(()=>setMsg(''),5000)
    }
  }

  async function del(id){
    if(!confirm('¿Eliminar este artículo?'))return
    try{
      const r=await fetch(API,{
        method:'DELETE',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({t:'blog',id})
      })
      const j=await r.json()
      if(!j.ok)throw new Error(j.error||'Error al eliminar')
      setPosts(p=>p.filter(x=>x.id!==id))
    }catch(e){
      setMsg('❌ Error: '+e.message);setTimeout(()=>setMsg(''),5000)
    }
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
          {msg&&<div style={msg.startsWith('❌')
            ?{background:'#fef2f2',border:'1px solid #fca5a5',padding:'8px 12px',fontSize:13,color:'#991b1b',marginBottom:12}
            :{background:'#f0fdf4',border:'1px solid #86efac',padding:'8px 12px',fontSize:13,color:'#166534',marginBottom:12}}>{msg}</div>}
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
