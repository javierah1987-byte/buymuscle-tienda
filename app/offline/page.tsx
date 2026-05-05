// @ts-nocheck
export default function OfflinePage() {
  return (
    <div style={{ minHeight:'100vh', background:'#111', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Heebo,Arial,sans-serif' }}>
      <div style={{ textAlign:'center', padding:40, maxWidth:400 }}>
        <div style={{ fontSize:80, marginBottom:20 }}>📶</div>
        <h1 style={{ color:'white', fontSize:24, fontWeight:900, margin:'0 0 12px', textTransform:'uppercase' }}>Sin conexión</h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, margin:'0 0 28px', lineHeight:1.6 }}>
          Parece que no tienes internet. Algunas páginas están disponibles offline.
        </p>
        <a href="/" style={{ display:'block', background:'#ff1e41', color:'white', padding:'13px 24px', textDecoration:'none', fontWeight:700, fontSize:14, borderRadius:4, marginBottom:10 }}>
          Volver al inicio
        </a>
      </div>
    </div>
  )
}
