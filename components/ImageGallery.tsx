// @ts-nocheck
'use client'
import{useState}from 'react'
export default function ImageGallery({images=[],name=''}){
  const[main,setMain]=useState(0)
  const[zoom,setZoom]=useState(false)
  const imgs=images.filter(Boolean)
  if(!imgs.length) return(
    <div style={{aspectRatio:'1',background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:60}}>📦</div>
  )
  return(
    <div>
      {/* Imagen principal */}
      <div style={{position:'relative',overflow:'hidden',cursor:'zoom-in',background:'#fafafa',border:'1px solid #f0f0f0'}} onClick={()=>setZoom(true)}>
        <img src={imgs[main]} alt={name} style={{width:'100%',aspectRatio:'1',objectFit:'contain',display:'block',transition:'transform 0.3s'}}
          onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();const x=((e.clientX-r.left)/r.width-0.5)*20;const y=((e.clientY-r.top)/r.height-0.5)*20;e.currentTarget.style.transform='scale(1.4) translate('+(-x)+'px,'+(-y)+'px)'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)'}}/>
        <div style={{position:'absolute',bottom:8,right:8,background:'rgba(0,0,0,0.4)',color:'white',padding:'2px 6px',fontSize:11,borderRadius:2}}>🔍 Zoom</div>
      </div>
      {/* Miniaturas */}
      {imgs.length>1&&<div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
        {imgs.map((img,i)=>(
          <button key={i} onClick={()=>setMain(i)}
            style={{border:main===i?'2px solid #ff1e41':'2px solid #f0f0f0',padding:0,background:'none',cursor:'pointer',width:64,height:64,flexShrink:0,overflow:'hidden'}}>
            <img src={img} alt={name+' '+i} style={{width:'100%',height:'100%',objectFit:'contain',display:'block'}}/>
          </button>
        ))}
      </div>}
      {/* Modal zoom */}
      {zoom&&(
        <div onClick={()=>setZoom(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <button onClick={()=>setZoom(false)} style={{position:'absolute',top:20,right:24,background:'none',border:'none',color:'white',fontSize:32,cursor:'pointer',lineHeight:1}}>✕</button>
          {imgs.length>1&&<button onClick={e=>{e.stopPropagation();setMain(m=>(m-1+imgs.length)%imgs.length)}}
            style={{position:'absolute',left:20,background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:28,cursor:'pointer',padding:'8px 14px',borderRadius:4}}>‹</button>}
          <img src={imgs[main]} alt={name} style={{maxWidth:'90vw',maxHeight:'90vh',objectFit:'contain'}} onClick={e=>e.stopPropagation()}/>
          {imgs.length>1&&<button onClick={e=>{e.stopPropagation();setMain(m=>(m+1)%imgs.length)}}
            style={{position:'absolute',right:20,background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:28,cursor:'pointer',padding:'8px 14px',borderRadius:4}}>›</button>}
          <div style={{position:'absolute',bottom:20,color:'rgba(255,255,255,0.6)',fontSize:13}}>{main+1} / {imgs.length}</div>
        </div>
      )}
    </div>
  )
      }
