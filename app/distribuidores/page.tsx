import Link from 'next/link'
import { supabase } from '@/lib/supabase'
async function getLevels(){const{data}=await supabase.from('distributor_levels').select('*').order('discount_pct');return data||[]}
export default async function DistribuidoresPage(){
  const levels=await getLevels()
  const colors:Record<string,string>={Bronze:'#cd7f32',Silver:'#c0c0c0',Gold:'#ffd700'}
  return(
    <div>
      <section style={{padding:'5rem 0',background:'var(--dark)',borderBottom:'1px solid var(--border)'}}>
        <div className="container"><div style={{maxWidth:640}}>
          <h1 className="section-title" style={{marginBottom:'1.5rem'}}>PORTAL DE <span>DISTRIBUIDORES</span></h1>
          <p style={{fontSize:18,color:'var(--muted)',marginBottom:'2.5rem',lineHeight:1.7}}>Accede con tus credenciales de distribuidor para ver precios exclusivos con descuentos según tu nivel.</p>
          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
            <Link href="/distribuidores/login" className="btn-primary">Acceder al portal</Link>
            <a href="mailto:distribuidores@buymuscle.es" className="btn-outline">Solicitar alta</a>
          </div>
        </div></div>
      </section>
      <section style={{padding:'5rem 0'}}>
        <div className="container">
          <h2 className="section-title" style={{textAlign:'center',marginBottom:'3rem'}}>NIVELES DE <span>DESCUENTO</span></h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.5rem',maxWidth:860,margin:'0 auto'}}>
            {levels.map((l:any)=>(
              <div key={l.id} className="card" style={{padding:'2rem',textAlign:'center',borderColor:colors[l.name]?`${colors[l.name]}40`:'var(--border)'}}>
                <div style={{width:64,height:64,borderRadius:'50%',background:`${colors[l.name]||'var(--green)'}20`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem',fontSize:32}}>
                  {l.name==='Bronze'?'🥉':l.name==='Silver'?'🥈':'🥇'}
                </div>
                <div style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:900,textTransform:'uppercase',color:colors[l.name]||'var(--green)',marginBottom:8}}>{l.name}</div>
                <div style={{fontFamily:'var(--font-display)',fontSize:52,fontWeight:900,color:'var(--white)',lineHeight:1,marginBottom:8}}>{l.discount_pct}%</div>
                <div style={{fontSize:14,color:'var(--muted)',marginBottom:'1.5rem'}}>descuento sobre PVP</div>
                <div style={{fontSize:13,color:'var(--muted)',padding:'10px',background:'var(--dark)',borderRadius:6}}>Pedido mínimo: <strong style={{color:'var(--white)'}}>{l.min_order_amount} €</strong></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{padding:'3rem 0 5rem'}}>
        <div className="container">
          <div style={{textAlign:'center',padding:'3rem',background:'var(--surface)',borderRadius:12,border:'1px solid var(--border)'}}>
            <h2 className="section-title" style={{marginBottom:'1rem'}}>¿YA ERES <span>DISTRIBUIDOR</span>?</h2>
            <p style={{color:'var(--muted)',marginBottom:'2rem'}}>Accede con tus credenciales para ver los precios exclusivos de tu nivel.</p>
            <Link href="/distribuidores/login" className="btn-primary" style={{fontSize:18,padding:'16px 40px'}}>Entrar al portal</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
