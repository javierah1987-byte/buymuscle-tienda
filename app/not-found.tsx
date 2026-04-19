// @ts-nocheck
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0a0a',fontFamily:'var(--font-body,Arial)'}}>
      <div style={{textAlign:'center',padding:'40px 20px'}}>
        <div style={{fontSize:120,fontWeight:900,color:'#1a1a1a',lineHeight:1,marginBottom:0}}>404</div>
        <div style={{color:'#ff1e41',fontWeight:900,fontSize:28,letterSpacing:2,marginBottom:8}}>BUYMUSCLE</div>
        <h1 style={{fontSize:18,color:'#ccc',fontWeight:700,margin:'0 0 8px'}}>Página no encontrada</h1>
        <p style={{color:'#555',fontSize:13,marginBottom:32,maxWidth:320,margin:'0 auto 32px'}}>
          La página que buscas no existe o ha sido movida. Usa el buscador o vuelve al inicio.
        </p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/" style={{background:'#ff1e41',color:'white',padding:'12px 24px',textDecoration:'none',fontWeight:700,fontSize:13,textTransform:'uppercase',letterSpacing:'0.05em'}}>
            ← Volver al inicio
          </Link>
          <Link href="/tienda" style={{background:'#1a1a1a',color:'#ccc',padding:'12px 24px',textDecoration:'none',fontWeight:700,fontSize:13,textTransform:'uppercase',letterSpacing:'0.05em',border:'1px solid #333'}}>
            Ver productos
          </Link>
        </div>
        <div style={{marginTop:40,display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
          {[['Proteínas','/tienda'],['Ofertas','/tienda'],['Veganos','/veganos'],['Blog','/blog']].map(([l,h])=>(
            <Link key={l} href={h} style={{fontSize:12,color:'#555',textDecoration:'none',padding:'6px 12px',border:'1px solid #1a1a1a'}}>
              {l}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
