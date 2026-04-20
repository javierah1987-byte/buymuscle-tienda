// @ts-nocheck
'use client'
import Link from 'next/link'
const OBJETIVOS=[
  {slug:'volumen',icon:'💪',title:'Ganar masa muscular',color:'#ff1e41',bg:'#fff0f0',cats:['Proteinas','Gainers','Creatina','Pre-Entreno'],
   desc:'Maximiza el crecimiento muscular con los suplementos ideales para la fase de volumen.',
   tips:['Whey protein post-entreno','Creatina monohidrato 5g/día','Gainer para aumentar calorías','Pre-entreno para más energía']},
  {slug:'definicion',icon:'🔥',title:'Perder grasa y definir',color:'#f59e0b',bg:'#fffbeb',cats:['Quemadores','Proteinas','BCAA','Vitaminas'],
   desc:'Conserva músculo mientras eliminas grasa con los complementos más efectivos.',
   tips:['Proteína isolada (menos carbos)','Quemadores termogénicos','BCAA para preservar músculo','L-Carnitina antes del cardio']},
  {slug:'resistencia',icon:'🏃',title:'Resistencia y cardio',color:'#3b82f6',bg:'#eff6ff',cats:['BCAA','Vitaminas','Sales Minerales','Proteinas'],
   desc:'Mejora tu rendimiento en deportes de resistencia con la nutrición adecuada.',
   tips:['Bebidas isotónicas en ruta','BCAA durante el entrenamiento','Proteína para recuperación','Magnesio para los calambres']},
  {slug:'veganos',icon:'🌱',title:'Nutrición vegana',color:'#22c55e',bg:'#f0fdf4',cats:['Veganos','Proteinas','Vitaminas'],
   desc:'Suplementos 100% plant-based para atletas que siguen una dieta vegana.',
   tips:['Proteína de guisante o arroz','Vitamina B12 esencial','Omega-3 de algas','Hierro + Vitamina C']},
  {slug:'fuerza',icon:'🏋️',title:'Fuerza y potencia',color:'#8b5cf6',bg:'#f5f3ff',cats:['Creatina','Pre-Entreno','Proteinas'],
   desc:'Aumenta tu fuerza máxima con los suplementos científicamente probados.',
   tips:['Creatina la más respaldada por ciencia','Beta-alanina para aguantar más','Pre-entreno con cafeína','Proteína abundante todo el día']},
  {slug:'recuperacion',icon:'😴',title:'Recuperación muscular',color:'#06b6d4',bg:'#ecfeff',cats:['BCAA','Proteinas','Vitaminas'],
   desc:'Reduce el dolor muscular y acelera la recuperación entre entrenamientos.',
   tips:['Proteína justo después de entrenar','BCAA antes de dormir','Magnesio y zinc por la noche','Vitamina C anti-inflamatoria']},
]
export default function Objetivos(){
  return(
    <div style={{background:'#f8f8f8',minHeight:'60vh',fontFamily:'Arial,sans-serif'}}>
      <div style={{background:'#111',color:'white',padding:'60px 20px',textAlign:'center'}}>
        <p style={{fontSize:12,color:'#ff1e41',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.15em',margin:'0 0 12px'}}>Encuentra tu camino</p>
        <h1 style={{fontSize:34,fontWeight:900,margin:'0 0 16px',textTransform:'uppercase'}}>¿Cuál es tu objetivo?</h1>
        <p style={{color:'rgba(255,255,255,0.65)',fontSize:16,maxWidth:560,margin:'0 auto'}}>
          Selecciona tu objetivo y te mostramos exactamente qué suplementos necesitas
        </p>
      </div>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'48px 20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
          {OBJETIVOS.map(o=>(
            <div key={o.slug} style={{background:'white',border:'2px solid #e8e8e8',padding:28,transition:'border-color 0.2s,transform 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=o.color;e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#e8e8e8';e.currentTarget.style.transform='translateY(0)'}}>
              <div style={{fontSize:40,marginBottom:14}}>{o.icon}</div>
              <h2 style={{fontSize:16,fontWeight:800,color:'#111',margin:'0 0 10px',textTransform:'uppercase'}}>{o.title}</h2>
              <p style={{fontSize:13,color:'#666',lineHeight:1.6,margin:'0 0 16px'}}>{o.desc}</p>
              <div style={{marginBottom:20}}>
                {o.tips.map(t=>(
                  <div key={t} style={{fontSize:12,color:'#555',padding:'4px 0',borderBottom:'1px solid #f5f5f5',display:'flex',alignItems:'center',gap:6}}>
                    <span style={{color:o.color,fontWeight:700,flexShrink:0}}>✓</span>{t}
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
                {o.cats.map(c=>(
                  <span key={c} style={{background:o.bg,color:o.color,fontSize:11,padding:'3px 10px',fontWeight:600,border:'1px solid '+o.color+'40'}}>{c}</span>
                ))}
              </div>
              <Link href={'/tienda?cat='+o.cats[0]} style={{display:'block',background:o.color,color:'white',textAlign:'center',padding:'10px',fontWeight:700,fontSize:13,textDecoration:'none',textTransform:'uppercase'}}>
                Ver productos →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
