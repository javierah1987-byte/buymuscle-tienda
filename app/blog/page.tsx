'use client'
import Link from 'next/link'
import { useState } from 'react'

const BASE = 'https://tienda.buymuscle.es'

export const ARTICULOS = [
  { titulo:'Proteina sin lactosa: que opciones elegir si la proteina te cae pesada o tienes intolerancia', href:'/blog/news/proteina-sin-lactosa-que-opciones-elegir-si-la-proteina-te-cae-pesada-o-tienes-intolerancia', img:'/modules/ph_simpleblog/covers/115-thumb.jpg', fecha:'Marzo 3, 2026', cat:'Nutricion' },
  { titulo:'Suplementacion para deportes de resistencia: lo que necesitas si haces running, ciclismo o trail en Canarias', href:'/blog/news/suplementacion-para-deportes-de-resistencia-lo-que-necesitas-si-haces-running-ciclismo-o-trail-en-canarias', img:'/modules/ph_simpleblog/covers/114-thumb.jpg', fecha:'Febrero 18, 2026', cat:'Suplementacion' },
  { titulo:'Que tomar antes de entrenar? Opciones naturales y suplementos antes de entrenar para energia', href:'/blog/news/que-tomar-antes-de-entrenar-opciones-naturales-y-suplementos-antes-de-entrenar-para-energia', img:'/modules/ph_simpleblog/covers/113-thumb.jpg', fecha:'Febrero 2, 2026', cat:'Pre-entreno' },
  { titulo:'Errores en etapa de volumen muscular: lo que debes evitar al empezar en el gimnasio', href:'/blog/news/errores-en-etapa-de-volumen-muscular-lo-que-debes-evitar-al-empezar-en-el-gimnasio', img:'/modules/ph_simpleblog/covers/112-thumb.jpg', fecha:'Enero 21, 2026', cat:'Entrenamiento' },
  { titulo:'Creatina monohidratada: por que es el suplemento mas buscado en Espana en 2025', href:'/blog/news/creatina-monohidratada-por-que-es-el-suplemento-mas-buscado-en-espana-en-2025', img:'/modules/ph_simpleblog/covers/111-thumb.jpg', fecha:'Enero 7, 2026', cat:'Suplementacion' },
  { titulo:'Como combinar suplementos deportivos: lo que si y lo que no', href:'/blog/news/como-combinar-suplementos-deportivos-lo-que-si-y-lo-que-no', img:'/modules/ph_simpleblog/covers/53-thumb.jpg', fecha:'Diciembre 26, 2025', cat:'Suplementacion' },
  { titulo:'Suplementos para dormir mejor y recuperarte: claves para el rendimiento deportivo', href:'/blog/news/suplementos-para-dormir-mejor-y-recuperarte-claves-para-el-rendimiento-deportivo', img:'/modules/ph_simpleblog/covers/52-thumb.jpg', fecha:'Diciembre 10, 2025', cat:'Nutricion' },
  { titulo:'Cuanta proteina necesito para ganar musculo: senales y calculos basicos', href:'/blog/news/cuanta-proteina-necesito-para-ganar-musculo-senales-y-calculos-basicos', img:'/modules/ph_simpleblog/covers/51-thumb.jpg', fecha:'Noviembre 26, 2025', cat:'Nutricion' },
  { titulo:'Batido post entrenamiento ideal: que ingredientes incluir segun tu objetivo', href:'/blog/news/batido-post-entrenamiento-ideal-que-ingredientes-incluir-segun-tu-objetivo', img:'/modules/ph_simpleblog/covers/50-thumb.jpg', fecha:'Noviembre 12, 2025', cat:'Nutricion' },
]

const CATS = ['Todos','Nutricion','Suplementacion','Pre-entreno','Entrenamiento']

export default function BlogPage() {
  const [cat, setCat] = useState('Todos')
  const filtered = cat === 'Todos' ? ARTICULOS : ARTICULOS.filter(a => a.cat === cat)

  return (
    <div style={{background:'#f5f5f5',minHeight:'100vh'}}>

      {/* Header fiel al original */}
      <div style={{background:'white',borderBottom:'1px solid #e0e0e0',padding:'1.25rem 20px'}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>
          <div style={{display:'flex',gap:6,alignItems:'center',fontSize:12,color:'#999',marginBottom:'0.75rem'}}>
            <Link href="/" style={{color:'#999',textDecoration:'none'}}>Inicio</Link>
            <span>›</span>
            <span style={{color:'#333',fontWeight:600}}>Blog</span>
          </div>
          <h1 style={{fontSize:22,fontWeight:800,textTransform:'uppercase',color:'#111',margin:0,letterSpacing:'0.03em'}}>NUESTRO BLOG</h1>
        </div>
      </div>

      <div style={{maxWidth:1280,margin:'0 auto',padding:'1.5rem 20px 3rem'}}>

        {/* Filtros por categoria */}
        <div style={{display:'flex',gap:6,marginBottom:'1.5rem',flexWrap:'wrap'}}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              style={{padding:'6px 16px',fontSize:12,fontWeight:700,border:'1px solid',borderColor:cat===c?'var(--red)':'#ddd',background:cat===c?'var(--red)':'white',color:cat===c?'white':'#555',cursor:'pointer',textTransform:'uppercase',letterSpacing:'0.04em',fontFamily:'var(--font-body)'}}>
              {c}
            </button>
          ))}
        </div>

        {/* Grid 3 columnas — igual que el original */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.5rem'}}>
          {filtered.map((art,i)=>(
            <a key={art.href} href={BASE+art.href} target="_blank" rel="noopener noreferrer"
              style={{background:'white',textDecoration:'none',color:'inherit',display:'flex',flexDirection:'column',border:'1px solid #ebebeb',transition:'box-shadow 0.2s',boxShadow: i===0?'0 2px 12px rgba(0,0,0,0.08)':'none'}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.12)';e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow=i===0?'0 2px 12px rgba(0,0,0,0.08)':'none';e.currentTarget.style.transform='none';}}>
              {/* Imagen real del CMS */}
              <div style={{height:200,overflow:'hidden',background:'#f0f0f0',flexShrink:0}}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BASE+art.img} alt={art.titulo}
                  style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.3s'}}
                  onMouseEnter={e=>{ (e.target as HTMLImageElement).style.transform='scale(1.04)'; }}
                  onMouseLeave={e=>{ (e.target as HTMLImageElement).style.transform='scale(1)'; }}/>
              </div>
              {/* Info */}
              <div style={{padding:'1rem 1.1rem 1.25rem',flex:1,display:'flex',flexDirection:'column'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'0.6rem'}}>
                  <span style={{fontSize:10,fontWeight:700,background:'#f0f0f0',color:'#666',padding:'2px 8px',textTransform:'uppercase',letterSpacing:'0.05em'}}>{art.cat}</span>
                  <span style={{fontSize:11,color:'#bbb'}}>📅 {art.fecha}</span>
                </div>
                <h2 style={{fontSize:15,fontWeight:700,color:'#111',lineHeight:1.45,margin:'0 0 0.75rem',flex:1,
                  display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical' as const,overflow:'hidden'}}>
                  {art.titulo}
                </h2>
                <div style={{fontSize:12,fontWeight:700,color:'var(--red)',marginTop:'auto',display:'flex',alignItems:'center',gap:4}}>
                  Leer articulo <span>→</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Ver todos en el blog original */}
        <div style={{textAlign:'center',padding:'2.5rem 20px 1rem'}}>
          <a href={BASE+'/blog'} target="_blank" rel="noopener noreferrer"
            style={{display:'inline-block',background:'var(--red)',color:'white',padding:'12px 36px',fontSize:13,fontWeight:700,textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.05em'}}>
            Ver todos los articulos →
          </a>
        </div>
      </div>
    </div>
  )
}
