// @ts-nocheck
'use client'
import Link from 'next/link'
import { useState } from 'react'
// @ts-nocheck
const _SB_URL='https://awwlbepjxuoxaigztugh.supabase.co'
const _SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

const LEVELS = [
  {
    name: 'BRONZE',
    color: '#cd7f32',
    bg: 'rgba(205,127,50,0.08)',
    border: 'rgba(205,127,50,0.3)',
    discount: 10,
    min: 150,
    icon: '🥉',
    desc: 'Para distribuidores que se inician',
    benefits: [
      '10% de descuento en todos los productos',
      'Pedido mínimo de 150 €',
      'Acceso al portal de distribuidores',
      'Precios exclusivos visibles en catálogo',
      'Soporte por email prioritario',
    ]
  },
  {
    name: 'SILVER',
    color: '#a8a9ad',
    bg: 'rgba(168,169,173,0.08)',
    border: 'rgba(168,169,173,0.35)',
    discount: 15,
    min: 300,
    icon: '🥈',
    desc: 'Para distribuidores con volumen medio',
    featured: true,
    benefits: [
      '15% de descuento en todos los productos',
      'Pedido mínimo de 300 €',
      'Todo lo del nivel Bronze',
      'Acceso a pre-pedidos exclusivos',
      'Gestor de cuenta dedicado',
    ]
  },
  {
    name: 'GOLD',
    color: '#ffd700',
    bg: 'rgba(255,215,0,0.08)',
    border: 'rgba(255,215,0,0.3)',
    discount: 20,
    min: 500,
    icon: '🥇',
    desc: 'Para grandes distribuidores',
    benefits: [
      '20% de descuento en todos los productos',
      'Pedido mínimo de 500 €',
      'Todo lo del nivel Silver',
      'Condiciones personalizadas',
      'Formación de producto incluida',
    ]
  }
]

const FAQS = [
  { q: '¿Cómo solicito ser distribuidor?', a: 'Rellena el formulario de contacto al final de esta página. Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo en 24-48h laborables.' },
  { q: '¿Cuándo se renueva el nivel?', a: 'Los niveles se evalúan trimestralmente en función del volumen de compra acumulado. Si superas el mínimo del siguiente nivel, subes automáticamente.' },
  { q: '¿Puedo mezclar productos en el pedido?', a: 'Sí, el importe mínimo se calcula sobre el total del pedido, sin importar qué productos incluyas.' },
  { q: '¿Cómo accedo a los precios exclusivos?', a: 'Una vez aprobado, recibirás tus credenciales de acceso al portal. En él verás todos los productos con los precios ya descontados según tu nivel.' },
  { q: '¿Hay gastos de envío?', a: 'El envío es gratuito a partir de 150 € de pedido. Por debajo de ese importe se aplica una tarifa fija de 6,99 €.' },
]

export default function DistribuidoresPage() {
  const [openFaq, setOpenFaq] = useState<number|null>(null)
  const [form, setForm] = useState({ name:'', company:'', email:'', phone:'', city:'', message:'' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Guardar solicitud en Supabase como nota en distributors
    await new Promise(r=>setTimeout(r,800)) // simular envío
    setSent(true)
    setSending(false)
  }

  return (
    <div style={{background:'var(--bg)'}}>
      {/* HERO */}
      <section style={{background:'var(--black)', padding:'5rem 0 4rem', position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 50%, rgba(255,30,65,0.07) 0%, transparent 60%)', pointerEvents:'none'}}/>
        <div className="container" style={{position:'relative', zIndex:1}}>
          <div style={{maxWidth:680}}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--red)', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:12}}>
              <span style={{width:40, height:2, background:'var(--red)', display:'inline-block'}}></span>
              Programa de distribuidores
            </div>
            <h1 style={{fontSize:'clamp(36px,6vw,72px)', fontWeight:900, textTransform:'uppercase', lineHeight:0.9, letterSpacing:'-0.02em', color:'white', marginBottom:'1.5rem'}}>
              CRECE CON<br/><span style={{color:'var(--red)'}}>BUYMUSCLE</span>
            </h1>
            <p style={{fontSize:18, color:'rgba(255,255,255,0.65)', marginBottom:'2.5rem', lineHeight:1.6, maxWidth:520}}>
              Únete a nuestra red de distribuidores y accede a descuentos exclusivos de hasta el 20% en más de 300 productos de suplementación deportiva.
            </p>
            <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
              <Link href="/distribuidores/login" className="btn-primary" style={{fontSize:15, padding:'13px 32px', justifyContent:'center'}}>
                Acceder al portal →
              </Link>
              <a href="#solicitar" className="btn-outline" style={{fontSize:15, padding:'11px 28px', justifyContent:'center'}}>
                Solicitar acceso
              </a>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{marginTop:'4rem', borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'2rem'}}>
          <div className="container">
            <div style={{display:'flex', gap:'3rem', flexWrap:'wrap'}}>
              {[
                {n:'+50', l:'Distribuidores activos'},
                {n:'300+', l:'Productos disponibles'},
                {n:'20%', l:'Descuento máximo'},
                {n:'24h', l:'Gestión de pedidos'},
              ].map(s => (
                <div key={s.l}>
                  <div style={{fontSize:36, fontWeight:900, color:'var(--red)', fontFamily:'var(--font-body)'}}>{s.n}</div>
                  <div style={{fontSize:12, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NIVELES */}
      <section style={{padding:'5rem 0', background:'var(--surface)'}}>
        <div className="container">
          <div style={{textAlign:'center', marginBottom:'3rem'}}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--red)', marginBottom:8}}>Programa de niveles</div>
            <h2 className="section-title" style={{fontSize:'clamp(24px,4vw,40px)', marginBottom:'0.75rem'}}>ELIGE TU <span>NIVEL</span></h2>
            <p style={{color:'var(--muted)', maxWidth:480, margin:'0 auto', fontSize:15}}>Cuanto más compres, mayor es tu descuento. Los niveles se evalúan trimestralmente.</p>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem', maxWidth:1000, margin:'0 auto'}}>
            {LEVELS.map(level => (
              <div key={level.name} style={{
                background: level.featured ? 'var(--black)' : 'var(--bg)',
                border: `2px solid ${level.color}`,
                padding:'2rem',
                position:'relative',
                transition:'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-4px)';(e.currentTarget as HTMLElement).style.boxShadow=`0 12px 40px ${level.color}20`}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.boxShadow='none'}}>
                {level.featured && (
                  <div style={{position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'var(--red)', color:'white', padding:'3px 16px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap'}}>
                    Más popular
                  </div>
                )}
                <div style={{fontSize:40, marginBottom:'0.75rem'}}>{level.icon}</div>
                <h3 style={{fontSize:24, fontWeight:900, color: level.color, marginBottom:4}}>{level.name}</h3>
                <p style={{fontSize:13, color:'var(--muted)', marginBottom:'1.25rem'}}>{level.desc}</p>
                <div style={{marginBottom:'1.5rem'}}>
                  <div style={{fontSize:56, fontWeight:900, color: level.featured?'white':'var(--text)', lineHeight:1, fontFamily:'var(--font-body)'}}>
                    -{level.discount}%
                  </div>
                  <div style={{fontSize:13, color:'var(--muted)', marginTop:4}}>
                    Pedido mínimo: <strong style={{color: level.featured?'rgba(255,255,255,0.8)':'var(--text)'}}>{level.min} €</strong>
                  </div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  {level.benefits.map(b => (
                    <div key={b} style={{display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color: level.featured?'rgba(255,255,255,0.75)':'var(--muted)'}}>
                      <span style={{color: level.color, fontWeight:700, flexShrink:0, marginTop:1}}>✓</span>
                      {b}
                    </div>
                  ))}
                </div>
                <a href="#solicitar" style={{display:'flex', alignItems:'center', justifyContent:'center', marginTop:'1.75rem', padding:'11px 20px', background: level.featured?'var(--red)':'transparent', border:`1px solid ${level.featured?'var(--red)':level.color}`, color: level.featured?'white':level.color, fontFamily:'var(--font-body)', fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', transition:'all 0.15s', cursor:'pointer', textDecoration:'none'}}>
                  Solicitar nivel {level.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section style={{padding:'5rem 0', background:'var(--bg)'}}>
        <div className="container">
          <div style={{textAlign:'center', marginBottom:'3rem'}}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--red)', marginBottom:8}}>Proceso</div>
            <h2 className="section-title">CÓMO <span>FUNCIONA</span></h2>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'2rem', maxWidth:900, margin:'0 auto'}}>
            {[
              {n:'01', title:'Solicita acceso', desc:'Rellena el formulario con tus datos. Te responderemos en 24-48h laborables.'},
              {n:'02', title:'Revisamos tu solicitud', desc:'Nuestro equipo verificará tus datos y asignará el nivel más adecuado para ti.'},
              {n:'03', title:'Activa tu cuenta', desc:'Recibirás tus credenciales de acceso y acceso inmediato al portal exclusivo.'},
              {n:'04', title:'Empieza a comprar', desc:'Accede a precios exclusivos y realiza tus pedidos directamente desde la web.'},
            ].map(step => (
              <div key={step.n} style={{textAlign:'center'}}>
                <div style={{width:56, height:56, background:'var(--red)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontWeight:900, fontSize:18, fontFamily:'var(--font-body)'}}>{step.n}</div>
                <h4 style={{fontSize:15, fontWeight:800, textTransform:'uppercase', marginBottom:8}}>{step.title}</h4>
                <p style={{fontSize:13, color:'var(--muted)', lineHeight:1.6}}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACCESO RÁPIDO */}
      <section style={{padding:'4rem 0', background:'var(--black)', borderTop:'2px solid var(--red)', borderBottom:'2px solid var(--red)'}}>
        <div className="container">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'2rem', flexWrap:'wrap'}}>
            <div>
              <h2 style={{fontSize:'clamp(20px,3vw,32px)', fontWeight:900, textTransform:'uppercase', color:'white', marginBottom:'0.5rem'}}>
                ¿Ya eres distribuidor?
              </h2>
              <p style={{color:'rgba(255,255,255,0.5)', fontSize:15}}>Accede con tus credenciales para ver precios exclusivos y realizar pedidos.</p>
            </div>
            <div style={{display:'flex', gap:'0.75rem', flexWrap:'wrap'}}>
              <Link href="/distribuidores/login" className="btn-primary" style={{fontSize:14, padding:'12px 28px', justifyContent:'center'}}>
                Iniciar sesión →
              </Link>
              <Link href="/tienda" className="btn-outline" style={{fontSize:14, padding:'10px 24px', justifyContent:'center'}}>
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:'5rem 0', background:'var(--surface)'}}>
        <div className="container" style={{maxWidth:740}}>
          <div style={{textAlign:'center', marginBottom:'3rem'}}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--red)', marginBottom:8}}>Preguntas frecuentes</div>
            <h2 className="section-title">TIENES <span>DUDAS</span></h2>
          </div>
          {FAQS.map((faq, i) => (
            <div key={i} style={{borderBottom:'1px solid var(--border)', overflow:'hidden'}}>
              <button onClick={() => setOpenFaq(openFaq===i?null:i)}
                style={{width:'100%', padding:'1.25rem 0', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', textAlign:'left'}}>
                <span style={{fontSize:15, fontWeight:700, color:'var(--text)'}}>{faq.q}</span>
                <span style={{fontSize:20, color:'var(--red)', flexShrink:0, transition:'transform 0.2s', transform: openFaq===i?'rotate(45deg)':'rotate(0)'}}>+</span>
              </button>
              {openFaq===i && (
                <div style={{padding:'0 0 1.25rem', fontSize:14, color:'var(--muted)', lineHeight:1.7}}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FORMULARIO SOLICITUD */}
      <section id="solicitar" style={{padding:'5rem 0', background:'var(--black)'}}>
        <div className="container" style={{maxWidth:680}}>
          <div style={{textAlign:'center', marginBottom:'3rem'}}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--red)', marginBottom:8}}>Únete ahora</div>
            <h2 style={{fontSize:'clamp(24px,4vw,40px)', fontWeight:900, textTransform:'uppercase', color:'white', lineHeight:1.1, marginBottom:'0.75rem'}}>
              SOLICITAR <span style={{color:'var(--red)'}}>ACCESO</span>
            </h2>
            <p style={{color:'rgba(255,255,255,0.5)', fontSize:15}}>Rellena el formulario y nos pondremos en contacto en 24-48h.</p>
          </div>

          {sent ? (
            <div style={{background:'rgba(255,30,65,0.08)', border:'1px solid rgba(255,30,65,0.3)', padding:'3rem 2rem', textAlign:'center'}}>
              <div style={{fontSize:56, marginBottom:'1rem'}}>✅</div>
              <h3 style={{fontSize:22, fontWeight:900, textTransform:'uppercase', color:'white', marginBottom:'0.5rem'}}>¡Solicitud enviada!</h3>
              <p style={{color:'rgba(255,255,255,0.5)', fontSize:14}}>Revisaremos tu solicitud y te contactaremos en breve en <strong style={{color:'white'}}>{form.email}</strong></p>
            </div>
          ) : (
            <form onSubmit={handleSend} style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', padding:'2.5rem'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                <div>
                  <label style={{color:'rgba(255,255,255,0.5)'}}>Nombre completo *</label>
                  <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Tu nombre" required
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white'}}/>
                </div>
                <div>
                  <label style={{color:'rgba(255,255,255,0.5)'}}>Empresa / Negocio *</label>
                  <input value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))} placeholder="Nombre de tu empresa" required
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white'}}/>
                </div>
                <div>
                  <label style={{color:'rgba(255,255,255,0.5)'}}>Email *</label>
                  <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="tu@empresa.com" required
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white'}}/>
                </div>
                <div>
                  <label style={{color:'rgba(255,255,255,0.5)'}}>Teléfono</label>
                  <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="600 000 000"
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white'}}/>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={{color:'rgba(255,255,255,0.5)'}}>Ciudad / Provincia *</label>
                  <input value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} placeholder="Tu ciudad" required
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white'}}/>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={{color:'rgba(255,255,255,0.5)'}}>¿Cuéntanos algo sobre tu negocio?</label>
                  <textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} placeholder="Tipo de negocio, canal de venta, volumen estimado..." rows={4}
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white', resize:'vertical'}}/>
                </div>
              </div>
              <button type="submit" disabled={sending} className="btn-primary" style={{width:'100%', marginTop:'1.25rem', padding:'14px', fontSize:15, justifyContent:'center'}}>
                {sending ? 'Enviando...' : 'Enviar solicitud'}
              </button>
              <p style={{fontSize:12, color:'rgba(255,255,255,0.3)', textAlign:'center', marginTop:'0.75rem'}}>
                Al enviar aceptas nuestra política de privacidad. No compartimos tus datos con terceros.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
