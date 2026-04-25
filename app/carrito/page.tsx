// @ts-nocheck
'use client'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { useState } from 'react'
import CartUpsell from '@/components/CartUpsell'

const FREE_SHIP = 50
const SHIP_COST = 4.95

export default function CarritoPage() {
  const { items, removeItem, updateQty, clearCart, count } = useCart()
  const { isDistributor, discountPct } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [orderNum, setOrderNum] = useState('')
  const [orderEmail, setOrderEmail] = useState('')
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', city:'', postal_code:'', province:'Las Palmas', nif:'', notes:'' })
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponMsg, setCouponMsg] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const f = k => e => setForm(p => ({...p,[k]:e.target.value}))

  // Calculos — items ahora son {id,name,price,image,qty,variant}
  const sub0 = items.reduce((s,i)=>s+i.price*i.qty,0)
  const disc = isDistributor&&discountPct ? sub0*(discountPct/100) : 0
  const couponDisc = coupon ? (coupon.type==='percent' ? (sub0-disc)*(coupon.value/100) : Math.min(coupon.value, sub0-disc)) : 0
  const sub = sub0 - disc - couponDisc
  const free = sub >= FREE_SHIP
  const ship = free ? 0 : SHIP_COST
  const tax = sub * 0.21
  const total = sub + tax + ship

  const validateCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true); setCouponMsg('')
    const SUPA='https://awwlbepjxuoxaigztugh.supabase.co'
    const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
    try {
      const r=await fetch(SUPA+'/rest/v1/discount_codes?code=eq.'+encodeURIComponent(couponCode.toUpperCase().trim())+'&active=eq.true&select=*',{headers:{'apikey':KEY,'Authorization':'Bearer '+KEY}})
      const data=await r.json()
      const code=data?.[0]
      if(!code){setCouponMsg('Codigo no valido');setCouponLoading(false);return}
      if(code.expires_at&&new Date(code.expires_at)<new Date()){setCouponMsg('Codigo expirado');setCouponLoading(false);return}
      if(code.max_uses&&code.uses>=code.max_uses){setCouponMsg('Codigo agotado');setCouponLoading(false);return}
      if(code.min_order&&sub0<code.min_order){setCouponMsg('Pedido minimo '+code.min_order.toFixed(2)+' EUR');setCouponLoading(false);return}
      setCoupon({id:code.id,value:code.value,type:code.type})
      setCouponMsg(code.type==='percent'?'-'+code.value+'% aplicado':'-'+code.value.toFixed(2)+' EUR aplicado')
    } catch(e){setCouponMsg('Error al validar')}
    setCouponLoading(false)
  }

  const doOrder = async () => {
    if (!form.name||!form.email||!form.address||!form.city||!form.postal_code) { alert('Rellena los campos obligatorios (*)'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/create-order', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          items: items.map(i=>({id:i.id, name:i.name, qty:i.qty, price:i.price})),
          customer: form,
          shipping_cost: ship,
          discount_pct: isDistributor&&discountPct?discountPct:0
        })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error||'Error')
      clearCart(); window.location.href = '/pedido-confirmado?n=' + d.order_number
    } catch(e) { alert(e.message||'Error al procesar. Intenta de nuevo.') }
    finally { setLoading(false) }
  }

  const S = {
    red: {background:'var(--red)',color:'white',border:'none',padding:'13px',fontFamily:'var(--font-body)',fontSize:13,fontWeight:700,textTransform:'uppercase',cursor:'pointer',letterSpacing:'0.05em',width:'100%',display:'block'},
    label: {display:'block',fontSize:11,fontWeight:700,color:'#666',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4},
    input: {width:'100%',padding:'10px 12px',border:'1px solid #ddd',fontSize:13,fontFamily:'var(--font-body)',boxSizing:'border-box',outline:'none'},
  }

  return (
    <div style={{background:'#f5f5f5',minHeight:'80vh',padding:'1.5rem 20px 3rem'}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <div style={{fontSize:12,color:'#999',marginBottom:'1rem',display:'flex',gap:6}}>
          <Link href="/" style={{color:'#999',textDecoration:'none'}}>Inicio</Link><span>›</span>
          <span style={{color:'#333',fontWeight:600}}>Mi Carrito</span>
        </div>

        {/* Steps */}
        <div style={{display:'flex',background:'white',marginBottom:'1.5rem',border:'1px solid #ebebeb',overflow:'hidden'}}>
          {[['1','Carrito'],['2','Datos'],['3','Confirmacion']].map(([n,label])=>(
            <div key={n} onClick={()=>step>Number(n)&&setStep(Number(n))}
              style={{flex:1,padding:'13px 0',textAlign:'center',fontWeight:700,fontSize:13,textTransform:'uppercase',
                background:step===Number(n)?'var(--red)':step>Number(n)?'#444':'#f5f5f5',
                color:step>=Number(n)?'white':'#aaa',
                cursor:step>Number(n)?'pointer':'default',
                borderRight:n<'3'?'1px solid rgba(0,0,0,0.1)':'none'}}>
              {n}. {label}
            </div>
          ))}
        </div>

        {/* PASO 1 */}
        {step===1 && (
          <div style={items.length?{display:'grid',gridTemplateColumns:'1fr 320px',gap:'1.5rem',alignItems:'start'}:{maxWidth:560,margin:'0 auto'}}>
            <div style={{background:'white',border:'1px solid #ebebeb'}}>
              {items.length===0 ? (
                <div style={{padding:'4rem',textAlign:'center'}}>
                  <div style={{fontSize:64,marginBottom:'1rem'}}>🛒</div>
                  <h2 style={{fontSize:18,fontWeight:700,marginBottom:'0.5rem',textTransform:'uppercase'}}>Tu carrito esta vacio</h2>
                  <p style={{color:'#999',marginBottom:'1.5rem'}}>Añade productos desde el catalogo</p>
                  <Link href="/tienda" style={{background:'var(--red)',color:'white',padding:'12px 28px',textDecoration:'none',fontWeight:700,fontSize:13,textTransform:'uppercase',display:'inline-block'}}>Ver catalogo</Link>
                  <div style={{marginTop:'2rem',textAlign:'left',width:'100%',maxWidth:600,margin:'2rem auto 0'}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#999',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>Productos que te pueden interesar</div>
                    <RecomendadosVacio />
                  </div>
                </div>
              ) : (
                <>
                  <div style={{padding:'0.875rem 1.5rem',borderBottom:'1px solid #f0f0f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:700,fontSize:13,textTransform:'uppercase'}}>{count} producto{count!==1?'s':''}</span>
                    
              {/* c2 ELEMENTOS DE CONFIANZA */}
              <div style={{border:'1px solid #e8e8e8',borderRadius:6,padding:'12px 14px',marginBottom:12,fontSize:12}}>
                <div style={{display:'flex',flexDirection:'column',gap:7}}>
                  {[
                    {icon:'🔒',t:'Pago 100% seguro',s:'SSL y cifrado de extremo a extremo'},
                    {icon:'🚚',t:'Envio 24-48h',s:'Canarias y Peninsula desde 4.90€'},
                    {icon:'🔄',t:'Devolucion 14 dias',s:'Sin preguntas ni complicaciones'},
                    {icon:'📞',t:'Atencion al cliente',s:'828 048 310 · Lun-Sab 9-20h'},
                  ].map(({icon,t,s})=>(
                    <div key={t} style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
                      <div>
                        <div style={{fontWeight:600,color:'#333'}}>{t}</div>
                        <div style={{color:'#999',fontSize:11}}>{s}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={clearCart} style={{fontSize:11,color:'#aaa',background:'none',border:'none',cursor:'pointer',textDecoration:'underline',fontFamily:'var(--font-body)'}}>Vaciar</button>
                  </div>
                  {items.map(item=>(
                    <div key={item.id+item.variant} style={{display:'flex',gap:'1rem',padding:'1rem 1.5rem',borderBottom:'1px solid #f8f8f8',alignItems:'center'}}>
                      {item.image&&(
                        <div style={{width:70,height:70,flexShrink:0,background:'#f9f9f9',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <img src={item.image} alt={item.name} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}} onError={e=>e.target.style.display='none'}/>
                        </div>
                      )}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:'#111',lineHeight:1.35,marginBottom:3}}>{item.name}</div>
                        {item.variant&&<div style={{fontSize:11,color:'#888',marginBottom:3}}>{item.variant}</div>}
                        <div style={{fontSize:14,fontWeight:800,color:'var(--red)'}}>{item.price.toFixed(2)} €</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                        <div style={{display:'flex',border:'1px solid #e0e0e0'}}>
                          <button onClick={()=>updateQty(item.id,item.variant||'',item.qty-1)} style={{width:28,height:30,border:'none',background:'none',cursor:'pointer',fontSize:15,color:'#555',fontFamily:'var(--font-body)'}}>−</button>
                          <span style={{width:30,textAlign:'center',lineHeight:'30px',fontSize:13,fontWeight:700}}>{item.qty}</span>
                          <button onClick={()=>updateQty(item.id,item.variant||'',item.qty+1)} style={{width:28,height:30,border:'none',background:'none',cursor:'pointer',fontSize:15,color:'#555',fontFamily:'var(--font-body)'}}>+</button>
                        </div>
                        <span style={{fontSize:14,fontWeight:800,minWidth:65,textAlign:'right'}}>{(item.price*item.qty).toFixed(2)} €</span>
                        <button onClick={()=>removeItem(item.id,item.variant||'')} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:16,padding:'4px'}} onMouseEnter={e=>e.target.style.color='var(--red)'} onMouseLeave={e=>e.target.style.color='#ccc'}>✕</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            {items.length>0 && <CartUpsell/>}
            {items.length>0 && <Summary step={1} sub0={sub0} disc={disc} discountPct={discountPct} tax={tax} ship={ship} free={free} sub={sub} total={total} FREE_SHIP={FREE_SHIP} onContinue={()=>setStep(2)} items={items}/>}
          </div>
        )}

        {/* PASO 2 */}
        {step===2 && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:'1.5rem',alignItems:'start'}}>
            <div style={{background:'white',border:'1px solid #ebebeb',padding:'2rem'}}>
              <h2 style={{fontSize:15,fontWeight:800,textTransform:'uppercase',marginBottom:'1.5rem',borderBottom:'1px solid #f0f0f0',paddingBottom:'0.75rem'}}>Datos de envio</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                {[{l:'Nombre completo *',k:'name',full:true},{l:'Email *',k:'email'},{l:'Telefono',k:'phone'},{l:'Direccion *',k:'address',full:true},{l:'Ciudad *',k:'city'},{l:'Cod. Postal *',k:'postal_code'},{l:'Provincia',k:'province'},{l:'NIF/CIF',k:'nif'}].map(({l,k,full})=>(
                  <div key={k} style={{gridColumn:full?'1/-1':'auto'}}>
                    <label style={S.label}>{l}</label>
                    <input value={form[k]} onChange={f(k)} style={S.input}/>
                  </div>
                ))}
                <div style={{gridColumn:'1/-1'}}>
                  <label style={S.label}>Notas del pedido</label>
                  <textarea value={form.notes} onChange={f('notes')} rows={2} style={{...S.input,resize:'vertical'}} placeholder="Instrucciones especiales..."/>
                </div>
              </div>
            </div>
            <div style={{background:'white',border:'1px solid #ebebeb',padding:'1.5rem',position:'sticky',top:120}}>
              <SummaryInner sub0={sub0} disc={disc} discountPct={discountPct} tax={tax} ship={ship} free={free} total={total} FREE_SHIP={FREE_SHIP} items={items}/>
              <div style={{background:'#f9f9f9',border:'1px solid #e8e8e8',padding:'10px',marginBottom:'0.75rem'}}>
                <div style={{fontSize:10,fontWeight:700,color:'#888',textTransform:'uppercase',marginBottom:6}}>Pago seguro</div>
                <div style={{display:'flex',gap:6}}>{['💳 Tarjeta','🏦 Bizum','🔒 SSL'].map(m=><span key={m} style={{fontSize:11,background:'white',border:'1px solid #ddd',padding:'3px 8px',color:'#666'}}>{m}</span>)}</div>
              </div>
              <button onClick={doOrder} disabled={loading} style={{...S.red,background:loading?'#aaa':'var(--red)',cursor:loading?'not-allowed':'pointer'}}>
                {loading?'⏳ Procesando...':'✓ Confirmar y pagar ${total.toFixed(2)}€'}
              </button>
              <div style={{textAlign:'center',margin:'12px 0 4px',fontSize:11,color:'#bbb',letterSpacing:'0.05em'}}>— o paga con —</div>
              <button onClick={()=>doPayPal()} style={{width:'100%',background:'#ffc439',border:'none',borderRadius:4,cursor:'pointer',padding:'11px',fontWeight:800,fontSize:14,color:'#111',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:8}}>
                <span style={{fontSize:18}}>🅿️</span> Pagar con PayPal
              </button>
              <button onClick={()=>setStep(1)} style={{width:'100%',background:'none',border:'none',cursor:'pointer',marginTop:'0.5rem',fontSize:12,color:'#999',fontFamily:'var(--font-body)',padding:'6px'}}>← Volver</button>
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {step===3 && (
          <div style={{background:'white',border:'1px solid #ebebeb',maxWidth:520,margin:'0 auto',padding:'3rem 2rem',textAlign:'center'}}>
            <div style={{fontSize:72,marginBottom:'1rem'}}>✅</div>
            <h2 style={{fontSize:22,fontWeight:900,textTransform:'uppercase',color:'#111',marginBottom:'0.5rem'}}>Pedido confirmado</h2>
            <p style={{fontSize:14,color:'#888',marginBottom:'1.5rem'}}>Hemos recibido tu pedido correctamente</p>
            <div style={{background:'var(--red)',color:'white',display:'inline-block',padding:'1rem 2rem',marginBottom:'1.5rem',minWidth:220}}>
              <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.1em',opacity:0.85,marginBottom:4}}>Numero de pedido</div>
              <div style={{fontSize:26,fontWeight:900,letterSpacing:'0.08em'}}>{orderNum}</div>
            </div>
            <p style={{fontSize:13,color:'#777',lineHeight:1.8,marginBottom:'2rem'}}>
              Recibirás confirmacion en <strong style={{color:'#333'}}>{orderEmail}</strong>
            </p>
            <Link href="/tienda" style={{background:'var(--red)',color:'white',padding:'12px 28px',textDecoration:'none',fontWeight:700,fontSize:13,textTransform:'uppercase',display:'inline-block'}}>Seguir comprando</Link>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryInner({sub0,disc,discountPct,tax,ship,free,total,FREE_SHIP,items}) {
  return (
    <>
      {items&&items.length>0&&(
        <div style={{maxHeight:130,overflowY:'auto',marginBottom:'1rem'}}>
          {items.map(i=>(
            <div key={i.id+i.variant} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#666',marginBottom:5}}>
              <span style={{flex:1,marginRight:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.name} x{i.qty}</span>
              <span style={{flexShrink:0,fontWeight:600}}>{(i.price*i.qty).toFixed(2)}€</span>
            </div>
          ))}
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:'1rem'}}>
        <Row l="Subtotal" v={sub0.toFixed(2)+' €'}/>
        {disc>0&&<Row l={'Descuento ('+discountPct+'%)'} v={'−'+disc.toFixed(2)+' €'} g/>}
        <Row l="IVA (21%)" v={tax.toFixed(2)+' €'} m/>
        <Row l="Envio" v={free?'🎉 GRATIS':ship.toFixed(2)+' €'} g={free} m={!free}/>
        {!free&&<div style={{background:'#fff8e1',padding:'7px 10px',fontSize:11,color:'#b8860b',borderLeft:'3px solid #ffc107'}}>Añade {(FREE_SHIP-(sub0-disc)).toFixed(2)}€ para envio GRATIS</div>}
      </div>
      <div style={{borderTop:'2px solid #111',paddingTop:'0.75rem',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
        <span style={{fontWeight:800,fontSize:15,textTransform:'uppercase'}}>Total</span>
        <span style={{fontWeight:900,fontSize:22,color:'var(--red)'}}>{total.toFixed(2)} €</span>
      </div>
    </>
  )
}

function Summary({step,sub0,disc,discountPct,tax,ship,free,sub,total,FREE_SHIP,onContinue,items}) {
  return (
    <div style={{background:'white',border:'1px solid #ebebeb',padding:'1.5rem',position:'sticky',top:120}}>
      <h3 style={{fontSize:13,fontWeight:800,textTransform:'uppercase',marginBottom:'1rem',borderBottom:'1px solid #f0f0f0',paddingBottom:'0.75rem'}}>Resumen</h3>
      <SummaryInner sub0={sub0} disc={disc} discountPct={discountPct} tax={tax} ship={ship} free={free} total={total} FREE_SHIP={FREE_SHIP} items={null}/>
      {step===2&&(<div style={{marginBottom:'0.75rem'}}>
        <div style={{fontSize:12,color:'#666',marginBottom:4,fontWeight:600}}>Codigo de descuento</div>
        <div style={{display:'flex',gap:6}}>
          <input value={couponCode||''} onChange={e=>setCouponCode(e.target.value.toUpperCase())}
            placeholder="CODIGO" disabled={!!coupon}
            onKeyDown={e=>e.key==='Enter'&&validateCoupon()}
            style={{flex:1,padding:'8px 10px',border:'1px solid '+(coupon?'#22c55e':'#ddd'),fontSize:13,fontFamily:'inherit',letterSpacing:1,fontWeight:coupon?700:400,color:coupon?'#22c55e':'#333'}}/>
          {!coupon
            ?<button type="button" onClick={validateCoupon} disabled={couponLoading}
               style={{padding:'8px 14px',background:'#111',color:'white',border:'none',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{couponLoading?'...':'Aplicar'}</button>
            :<button type="button" onClick={()=>{setCoupon(null);setCouponCode('');setCouponMsg('')}}
               style={{padding:'8px 12px',background:'none',border:'1px solid #ddd',fontSize:12,cursor:'pointer',fontFamily:'inherit',color:'#888'}}>x</button>}
        </div>
        {couponMsg&&<div style={{fontSize:11,marginTop:4,color:coupon?'#22c55e':'#ef4444'}}>{couponMsg}</div>}
      </div>)}
      <button onClick={onContinue} style={{background:'var(--red)',color:'white',border:'none',padding:'13px',fontFamily:'var(--font-body)',fontSize:13,fontWeight:700,textTransform:'uppercase',cursor:'pointer',letterSpacing:'0.05em',width:'100%',display:'block'}}>Continuar →</button>
      <Link href="/tienda" style={{display:'block',textAlign:'center',marginTop:'0.75rem',fontSize:12,color:'var(--red)',fontWeight:600,textDecoration:'none'}}>← Seguir comprando</Link>
    </div>
  )
}

function Row({l,v,g,m}) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:g?'#00aa55':m?'#888':'#555'}}>
      <span>{l}</span><span style={{fontWeight:600}}>{v}</span>
    </div>
  )
}
  async function doPayPal(){
    // Valida datos primero
    if(!form.name||!form.email||!form.address||!form.city||!form.postal_code){
      alert('Por favor completa todos los campos obligatorios antes de continuar con PayPal');
      return;
    }
    // Guarda el pedido como pendiente y redirige a PayPal
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if(!clientId){
      // Sin CLIENT_ID: abrir PayPal.me como fallback
      const amount = total.toFixed(2);
      window.open('https://www.paypal.com/paypalme/buymuscle/'+amount+'EUR','_blank');
      // Crear igualmente el pedido en BD con estado pending
      await doOrder('paypal');
      return;
    }
    // Con CLIENT_ID: usar PayPal SDK (requiere NEXT_PUBLIC_PAYPAL_CLIENT_ID en Vercel)
    await doOrder('paypal');
  }

