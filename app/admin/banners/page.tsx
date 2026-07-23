// @ts-nocheck
'use client'
import{useState,useEffect}from 'react'
import Link from 'next/link'
const API='/api/admin/content'
const EMPTY={title:'',subtitle:'',url:'/',image_url:'',active:true,order_pos:0}
export default function AdminBanners(){
  const[banners,setBanners]=useState([])
  const[form,setForm]=useState(null)
  const[saving,setSaving]=useState(false)
  const[msg,setMsg]=useState('')
  useEffect(()=>{load()},[])
  function showErr(e){setMsg('❌ Error: '+e.message);setTimeout(()=>setMsg(''),5000)}
  async function load(){
    try{
      const r=await fetch(API+'?t=banners&order=order_pos.asc')
      const j=await r.json()
      if(!j.ok)throw new Error(j.error||'Error al cargar')
      setBanners(Array.isArray(j.data)?j.data:[])
    }catch(e){showErr(e)}
  }
  async function save(){
    setSaving(true)
    // Solo columnas reales de banners
    const fields={title:form.title||null,subtitle:form.subtitle||null,url:form.url||'/',
      image_url:form.image_url||null,active:!!form.active,order_pos:Number(form.order_pos)||0}
    try{
      const r=await fetch(API,{
        method:form.id?'PATCH':'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(form.id?{t:'banners',id:form.id,fields}:{t:'banners',row:fields})
      })
      const j=await r.json()
      if(!j.ok)throw new Error(j.error||'Error al guardar')
      setMsg('Guardado');setTimeout(()=>setMsg(''),2000)
      setForm(null);load()
    }catch(e){showErr(e)}
    setSaving(false)
  }
  async function toggle(b){
    try{
      const r=await fetch(API,{method:'PATCH',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({t:'banners',id:b.id,fields:{active:!b.active}})})
      const j=await r.json()
      if(!j.ok)throw new Error(j.error||'Error al cambiar estado')
      load()
    }catch(e){showErr(e)}
  }
  async function del(b){
    if(!confirm('Eliminar este banner?'))return
    try{
      const r=await fetch(API,{method:'DELETE',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({t:'banners',id:b.id})})
      const j=await r.json()
      if(!j.ok)throw new Error(j.error||'Error al eliminar')
      load()
    }catch(e){showErr(e)}
  }
  const F=form||{}
  return(
    <div style={{background:'#f4f5f7',minHeight:'100vh',fontFamily:'Arial,sans-serif',color:'#111'}}>
      <div style={{background:'#ffffff',padding:'18px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #eaeaea'}}>
        <h1 style={{margin:0,fontSize:18,fontWeight:900,textTransform:'uppercase'}}>🖼️ Banners del Slider</h1>
        <div style={{display:'flex',gap:12}}>
          <button onClick={()=>setForm({...EMPTY})} style={{background:'#ff1e41',color:'#111',border:'none',padding:'8px 16px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'Arial'}}>+ Nuevo banner</button>
          <Link href="/admin" style={{color:'#888888',textDecoration:'none',fontSize:13,display:'flex',alignItems:'center'}}>← Admin</Link>
        </div>
      </div>
      {msg&&<div style={msg.startsWith('❌')
        ?{background:'rgba(239,68,68,0.1)',padding:'10px 28px',fontSize:13,color:'#ef4444',borderBottom:'1px solid rgba(239,68,68,0.2)'}
        :{background:'rgba(34,197,94,0.1)',padding:'10px 28px',fontSize:13,color:'#22c55e',borderBottom:'1px solid rgba(34,197,94,0.2)'}}>{msg}</div>}
      <div style={{padding:28}}>
        <p style={{color:'#888888',fontSize:13,marginBottom:20}}>Los banners se muestran en el slider de la portada. Arrastra para reordenar (en desarrollo).</p>
        {banners.length===0&&!form?<div style={{textAlign:'center',padding:40,color:'#9a9a9a'}}>No hay banners. Crea el primero.</div>
        :banners.map((b,i)=>(
          <div key={b.id||i} style={{display:'flex',gap:16,alignItems:'center',background:'#ffffff',border:'1px solid #e8e8e8',padding:16,marginBottom:8,borderRadius:4}}>
            {b.image_url?<img src={b.image_url} alt={b.title} style={{width:120,height:60,objectFit:'cover',borderRadius:2}}/>:<div style={{width:120,height:60,background:'#f3f3f3',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#9a9a9a',flexShrink:0}}>Sin imagen</div>}
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:'#111',marginBottom:2}}>{b.title||'Sin título'}</div>
              <div style={{fontSize:12,color:'#888888'}}>{b.subtitle||''}</div>
              <div style={{fontSize:11,color:'rgba(255,30,65,0.7)',marginTop:2,fontFamily:'monospace'}}>{b.url||'/'}</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:11,padding:'3px 8px',background:b.active?'rgba(34,197,94,0.15)':'#f3f3f3',color:b.active?'#22c55e':'#9a9a9a',borderRadius:12}}>{b.active?'Activo':'Oculto'}</span>
              <button onClick={()=>toggle(b)} style={{padding:'4px 10px',background:'transparent',border:'1px solid #d5d5d5',color:'#5a5a5a',fontSize:11,cursor:'pointer',fontFamily:'Arial'}}>{b.active?'Ocultar':'Activar'}</button>
              <button onClick={()=>setForm({...b})} style={{padding:'4px 10px',background:'transparent',border:'1px solid #d5d5d5',color:'#5a5a5a',fontSize:11,cursor:'pointer',fontFamily:'Arial'}}>Editar</button>
              <button onClick={()=>del(b)} style={{padding:'4px 10px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',fontSize:11,cursor:'pointer',fontFamily:'Arial'}}>Eliminar</button>
            </div>
          </div>
        ))}
        {form&&(
          <div style={{background:'#ffffff',border:'1px solid rgba(255,30,65,0.2)',padding:24,marginTop:16,borderRadius:4}}>
            <h3 style={{margin:'0 0 16px',fontSize:15,fontWeight:700}}>{form.id?'Editar banner':'Nuevo banner'}</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              {[['title','Título'],['subtitle','Subtítulo'],['url','URL de destino (ej: /tienda)'],['image_url','URL de imagen']].map(([k,l])=>(
                <div key={k}>
                  <label style={{fontSize:11,color:'#6a6a6a',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.08em'}}>{l}</label>
                  <input value={F[k]||''} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    style={{width:'100%',padding:'8px 10px',background:'#eaeaea',border:'1px solid #e0e0e0',color:'#111',fontSize:13,fontFamily:'Arial',boxSizing:'border-box'}}/>
                </div>
              ))}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16}}>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
                <input type="checkbox" checked={F.active||false} onChange={e=>setForm(f=>({...f,active:e.target.checked}))}/>
                Activo (visible en el slider)
              </label>
              <label style={{fontSize:13}}>Posición: <input type="number" value={F.order_pos||0} onChange={e=>setForm(f=>({...f,order_pos:Number(e.target.value)}))} style={{width:60,padding:'4px 8px',background:'#eaeaea',border:'1px solid #e0e0e0',color:'#111',fontSize:13,fontFamily:'Arial'}}/></label>
            </div>
            {F.image_url&&<div style={{marginBottom:12}}><img src={F.image_url} alt="preview" style={{maxHeight:120,objectFit:'cover',borderRadius:2}} onError={e=>e.target.style.display='none'}/></div>}
            <div style={{display:'flex',gap:8}}>
              <button onClick={save} disabled={saving} style={{background:'#ff1e41',color:'#111',border:'none',padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'Arial'}}>{saving?'Guardando...':'Guardar banner'}</button>
              <button onClick={()=>setForm(null)} style={{background:'transparent',border:'1px solid #d5d5d5',color:'#5a5a5a',padding:'10px 16px',fontSize:13,cursor:'pointer',fontFamily:'Arial'}}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
