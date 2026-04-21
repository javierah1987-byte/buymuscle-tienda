// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient('https://awwlbepjxuoxaigztugh.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo')

const MARCAS = ['BuyMuscle','MVP','IO.Genix','Applied Nutrition','GN Nutrition','BioTechUSA','Scitec','HSN','Quamtrax']
const INP = {width:'100%',padding:'9px 11px',border:'1px solid #333',borderRadius:4,background:'#1a1a1a',color:'white',fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}
const LBL = {display:'block',fontSize:11,fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:5}

export default function NuevoProducto() {
  const [cats,setCats]=useState([])
  const [saving,setSaving]=useState(false)
  const [msg,setMsg]=useState(null)
  const [form,setForm]=useState({name:'',brand:'BuyMuscle',category_id:'',price_incl_tax:'',sale_price:'',image_url:'',stock:'0',description:'',active:true})
  const [variantes,setVariantes]=useState([])
  const [nv,setNv]=useState({tipo:'Sabor',valor:'',stock:'10',mod:'0'})

  useEffect(()=>{
    supabase.from('categories').select('id,name').order('name').then(({data})=>setCats(data||[]))
  },[])

  const set=(k,v)=>setForm(f=>({...f,[k]:v}))

  const addVar=()=>{
    if(!nv.valor.trim()) return
    setVariantes(vs=>[...vs,{...nv,uid:Date.now()}])
    setNv(v=>({...v,valor:'',stock:'10',mod:'0'}))
  }

  const handleSave=async()=>{
    if(!form.name||!form.price_incl_tax){setMsg({err:true,text:'Nombre y precio obligatorios'});return}
    setSaving(true);setMsg(null)
    try{
      const{data:prod,error:pe}=await supabase.from('products').insert({
        name:form.name.trim(),brand:form.brand,
        category_id:form.category_id?Number(form.category_id):null,
        price_incl_tax:Number(form.price_incl_tax),
        sale_price:form.sale_price?Number(form.sale_price):null,
        on_sale:!!form.sale_price,
        image_url:form.image_url.trim()||null,
        stock:Number(form.stock)||0,
        description:form.description.trim()||null,
        active:form.active,
      }).select().single()
      if(pe) throw pe
      for(const v of variantes){
        let{data:at}=await supabase.from('attribute_types').select('id').eq('name',v.tipo).single()
        if(!at){const r=await supabase.from('attribute_types').insert({name:v.tipo}).select().single();at=r.data}
        const{data:av}=await supabase.from('attribute_values').insert({value:v.valor.trim(),attribute_type_id:at.id}).select().single()
        await supabase.from('product_variants').insert({product_id:prod.id,attribute_value_id:av.id,stock:Number(v.stock)||0,price_modifier:Number(v.mod)||0,active:true})
      }
      setMsg({err:false,text:'Producto #'+prod.id+' creado. '+variantes.length+' variantes.'})
      setForm({name:'',brand:'BuyMuscle',category_id:'',price_incl_tax:'',sale_price:'',image_url:'',stock:'0',description:'',active:true})
      setVariantes([])
    }catch(e){setMsg({err:true,text:'Error: '+e.message})}
    setSaving(false)
  }

  return(
    <div style={{minHeight:'100vh',background:'#111',color:'white',paddingBottom:60}}>
      <div style={{background:'#1a1a1a',borderBottom:'1px solid #333',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:900,color:'#ff1e41',margin:0}}>NUEVO PRODUCTO</h1>
          <p style={{fontSize:12,color:'#888',margin:'2px 0 0'}}>Añadir producto al catalogo</p>
        </div>
        <Link href="/admin" style={{color:'#888',fontSize:13,textDecoration:'none'}}>Admin</Link>
      </div>
      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 20px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:8,padding:20}}>
            <h2 style={{fontSize:13,fontWeight:700,color:'#ff1e41',textTransform:'uppercase',marginBottom:16}}>Informacion basica</h2>
            <div style={{marginBottom:14}}><label style={LBL}>Nombre *</label><input style={INP} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="WHEY 80 PROFESSIONAL 2KG MVP"/></div>
            <div style={{marginBottom:14}}><label style={LBL}>Marca</label><select style={INP} value={form.brand} onChange={e=>set('brand',e.target.value)}>{MARCAS.map(m=><option key={m}>{m}</option>)}</select></div>
            <div style={{marginBottom:14}}><label style={LBL}>Categoria</label><select style={INP} value={form.category_id} onChange={e=>set('category_id',e.target.value)}><option value="">Sin categoria</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
              <div><label style={LBL}>Precio IVA incl. * (EUR)</label><input style={INP} type="number" step="0.01" min="0" value={form.price_incl_tax} onChange={e=>set('price_incl_tax',e.target.value)} placeholder="29.95"/></div>
              <div><label style={LBL}>Precio oferta (EUR)</label><input style={INP} type="number" step="0.01" min="0" value={form.sale_price} onChange={e=>set('sale_price',e.target.value)} placeholder="Opcional"/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12,marginBottom:14}}>
              <div><label style={LBL}>URL imagen</label><input style={INP} value={form.image_url} onChange={e=>set('image_url',e.target.value)} placeholder="https://...jpg"/></div>
              <div><label style={LBL}>Stock general</label><input style={INP} type="number" min="0" value={form.stock} onChange={e=>set('stock',e.target.value)}/></div>
            </div>
            <div style={{marginBottom:14}}><label style={LBL}>Descripcion</label><textarea style={{...INP,height:80,resize:'vertical'}} value={form.description} onChange={e=>set('description',e.target.value)}/></div>
            <div style={{display:'flex',alignItems:'center',gap:10}}><label style={{...LBL,margin:0}}>Activo</label><input type="checkbox" checked={form.active} onChange={e=>set('active',e.target.checked)} style={{width:18,height:18}}/></div>
          </div>
          {form.image_url&&<div style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:8,padding:16,textAlign:'center'}}><img src={form.image_url} alt="" style={{maxHeight:140,maxWidth:'100%',objectFit:'contain'}} onError={e=>{e.target.style.display='none'}}/></div>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:8,padding:20}}>
            <h2 style={{fontSize:13,fontWeight:700,color:'#ff1e41',textTransform:'uppercase',marginBottom:4}}>Variantes (sabores / tallas)</h2>
            <p style={{fontSize:11,color:'#888',marginBottom:14}}>Opcional</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <div><label style={LBL}>Tipo</label><select style={INP} value={nv.tipo} onChange={e=>setNv(v=>({...v,tipo:e.target.value}))}>{['Sabor','Talla','Gramaje','Formato'].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={LBL}>Valor</label><input style={INP} value={nv.valor} onChange={e=>setNv(v=>({...v,valor:e.target.value}))} placeholder="Chocolate"/></div>
              <div><label style={LBL}>Stock</label><input style={INP} type="number" min="0" value={nv.stock} onChange={e=>setNv(v=>({...v,stock:e.target.value}))}/></div>
              <div><label style={LBL}>Mod. precio EUR</label><input style={INP} type="number" step="0.01" value={nv.mod} onChange={e=>setNv(v=>({...v,mod:e.target.value}))}/></div>
            </div>
            <button onClick={addVar} style={{width:'100%',padding:9,background:'#333',border:'1px solid #555',color:'white',borderRadius:4,cursor:'pointer',fontSize:13,fontWeight:700,marginBottom:16}}>+ Añadir variante</button>
            {variantes.length>0&&<div style={{display:'flex',flexDirection:'column',gap:6}}>{variantes.map(v=>(
              <div key={v.uid} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#222',border:'1px solid #444',borderRadius:4,padding:'8px 12px'}}>
                <span style={{fontSize:12}}><span style={{color:'#ff1e41',fontWeight:700}}>{v.tipo}</span> <span style={{color:'white'}}>{v.valor}</span> <span style={{color:'#888'}}>· {v.stock} uds</span></span>
                <button onClick={()=>setVariantes(vs=>vs.filter(x=>x.uid!==v.uid))} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:16}}>x</button>
              </div>
            ))}</div>}
          </div>
          <div style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:8,padding:20}}>
            <h2 style={{fontSize:13,fontWeight:700,color:'#ff1e41',textTransform:'uppercase',marginBottom:12}}>Guardar</h2>
            <div style={{background:'#222',borderRadius:6,padding:12,marginBottom:14,fontSize:12,color:'#ccc',lineHeight:1.8}}>
              <div><b style={{color:'white'}}>Nombre:</b> {form.name||'—'}</div>
              <div><b style={{color:'white'}}>Precio:</b> {form.price_incl_tax||'—'} EUR</div>
              <div><b style={{color:'white'}}>Stock:</b> {form.stock}</div>
              <div><b style={{color:'white'}}>Variantes:</b> {variantes.length}</div>
              <div><b style={{color:'white'}}>Activo:</b> {form.active?'Si':'No'}</div>
            </div>
            {msg&&<div style={{padding:'10px 14px',borderRadius:6,marginBottom:14,fontSize:13,background:msg.err?'#7f1d1d':'#14532d',border:msg.err?'1px solid #ef4444':'1px solid #22c55e',color:msg.err?'#fca5a5':'#86efac'}}>{msg.text}</div>}
            <button onClick={handleSave} disabled={saving} style={{width:'100%',padding:14,background:saving?'#555':'#ff1e41',border:'none',color:'white',borderRadius:4,cursor:saving?'not-allowed':'pointer',fontSize:14,fontWeight:900,textTransform:'uppercase',letterSpacing:'0.05em'}}>
              {saving?'Guardando...':'CREAR PRODUCTO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
