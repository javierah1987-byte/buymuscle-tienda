'use client'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { useState } from 'react'

const SHIPPING_FREE_FROM = 50
const SHIPPING_COST = 4.99

export default function CarritoPage() {
  const { items, remove, updateQty, total, count } = useCart()
  const { isDistributor, levelName, discountPct } = useAuth()
  const [step, setStep] = useState<1|2|3>(1)
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', city:'', postal:'' })
  const [payment, setPayment] = useState<'card'|'bizum'|'transfer'>('card')
  const [placing, setPlacing] = useState(false)
  const [orderDone, setOrderDone] = useState<string|null>(null)

  const shipping = total >= SHIPPING_FREE_FROM ? 0 : SHIPPING_COST
  const grandTotal = total + shipping

  const handleOrder = async () => {
    setPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          items, total: grandTotal,
          shipping_cost: shipping,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_postal_code: form.postal,
          payment_method: payment,
          discountPct
        })
      })
      const data = await res.json()
      if (data.order_number) {
        setOrderDone(data.order_number)
        setStep(3)
      }
    } catch(e) { console.error(e) }
    setPlacing(false)
  }

  if (orderDone) return (
    <div style={{background:'#f5f5f5',minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'white',border:'1px solid #e8e8e8',padding:'3rem',textAlign:'center',maxWidth:480}}>
        <div style={{fontSize:56,marginBottom:'1rem'}}>✅</div>
        <h1 style={{fontSize:22,fontWeight:800,textTransform:'uppercase',color:'#111',marginBottom:'0.5rem'}}>¡Pedido confirmado!</h1>
        <div style={{fontSize:14,color:'#666',marginBottom:'1.5rem'}}>
          Tu número de pedido es <strong style={{color:'var(--red)'}}>{orderDone}</strong>.<br/>
          Recibirás un email de confirmación en breve.
        </div>
        <Link href="/tienda" style={{display:'inline-block',background:'var(--red)',color:'white',padding:'12px 28px',fontFamily:'var(--font-body)',fontSize:13,fontWeight:700,textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.05em'}}>
          Seguir comprando
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{background:'#f5f5f5',minHeight:'80vh',padding:'1.5rem 0 3rem'}}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{display:'flex',gap:6,alignItems:'center',fontSize:12,color:'#999',marginBottom:'1.5rem'}}>
          <Link href="/" style={{color:'#999',textDecoration:'none'}}>Inicio</Link><span>›</span>
          <Link href="/tienda" style={{color:'#999',textDecoration:'none'}}>Tienda</Link><span>›</span>
          <span style={{color:'#333',fontWeight:600}}>Mi Carrito</span>
        </div>

        {/* Steps */}
        <div style={{display:'flex',gap:0,marginBottom:'2rem',background:'white',border:'1px solid #e8e8e8'}}>
          {[{n:1,l:'CARRITO'},{n:2,l:'DATOS'},{n:3,l:'CONFIRMACIÓN'}].map(s=>(
            <div key={s.n} style={{flex:1,padding:'12px 16px',textAlign:'center',fontSize:12,fontWeight:700,letterSpacing:'0.05em',
              background: step===s.n ? 'var(--red)' : step>s.n ? '#28a745' : 'white',
              color: step>=s.n ? 'white' : '#999',
              borderRight:'1px solid #e8e8e8',cursor:'pointer'}}
              onClick={()=>step>s.n&&setStep(s.n as 1|2|3)}>
              {s.n}. {s.l}
            </div>
          ))}
        </div>

        {items.length === 0 ? (
          <div style={{background:'white',border:'1px solid #e8e8e8',padding:'4rem',textAlign:'center'}}>
            <div style={{fontSize:64,marginBottom:'1rem'}}>🛒</div>
            <h2 style={{fontSize:18,fontWeight:800,textTransform:'uppercase',color:'#111',marginBottom:'0.5rem'}}>TU CARRITO ESTÁ VACÍO</h2>
            <p style={{color:'#888',marginBottom:'1.5rem',fontSize:14}}>Añade productos desde el catálogo</p>
            <Link href="/tienda" style={{background:'var(--red)',color:'white',padding:'12px 28px',fontFamily:'var(--font-body)',fontSize:13,fontWeight:700,textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.05em',display:'inline-block'}}>
              VER CATÁLOGO
            </Link>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:'1.5rem',alignItems:'start'}}>
            {/* Columna izquierda */}
            <div>
              {/* PASO 1: Productos */}
              {step===1 && (
                <div style={{background:'white',border:'1px solid #e8e8e8'}}>
                  <div style={{padding:'14px 16px',borderBottom:'1px solid #e8e8e8',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <h2 style={{fontSize:14,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',margin:0}}>{count} {count===1?'producto':'productos'}</h2>
                    <Link href="/tienda" style={{fontSize:12,color:'var(--red)',textDecoration:'none',fontWeight:700}}>← Seguir comprando</Link>
                  </div>
                  {items.map((item,i) => (
                    <div key={i} style={{display:'grid',gridTemplateColumns:'80px 1fr auto',gap:'1rem',padding:'1rem 1.25rem',borderBottom:'1px solid #f5f5f5',alignItems:'center'}}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image_url||'https://placehold.co/80x80/f5f5f5/ccc?text=BM'} alt={item.name}
                        style={{width:80,height:80,objectFit:'contain',border:'1px solid #f0f0f0',padding:4}}/>
                      <div>
                        <Link href={`/producto/${item.id}`} style={{fontSize:14,fontWeight:600,color:'#111',textDecoration:'none',display:'block',marginBottom:4,lineHeight:1.3}}>
                          {item.name}
                        </Link>
                        {item.selectedVariant && <div style={{fontSize:12,color:'#888',marginBottom:6}}>Sabor: {item.selectedVariant}</div>}
                        <div style={{fontSize:13,fontWeight:700,color:'var(--red)'}}>
                          {item.discountPct>0 ? (item.price_incl_tax*(1-item.discountPct/100)).toFixed(2) : item.price_incl_tax.toFixed(2)} €
                          {item.discountPct>0 && <s style={{marginLeft:6,fontWeight:400,color:'#aaa',fontSize:12}}>{item.price_incl_tax.toFixed(2)} €</s>}
                        </div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column' as const,alignItems:'flex-end',gap:8}}>
                        {/* Cantidad */}
                        <div style={{display:'flex',border:'1px solid #ddd'}}>
                          <button onClick={()=>updateQty(i,Math.max(1,item.quantity-1))}
                            style={{width:28,height:28,background:'#f5f5f5',border:'none',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                          <span style={{width:32,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600}}>{item.quantity}</span>
                          <button onClick={()=>updateQty(i,item.quantity+1)}
                            style={{width:28,height:28,background:'#f5f5f5',border:'none',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                        </div>
                        <div style={{fontSize:14,fontWeight:700,color:'#333'}}>
                          {((item.discountPct>0?item.price_incl_tax*(1-item.discountPct/100):item.price_incl_tax)*item.quantity).toFixed(2)} €
                        </div>
                        <button onClick={()=>remove(i)} style={{background:'none',border:'none',cursor:'pointer',color:'#bbb',fontSize:11,padding:0,fontFamily:'var(--font-body)'}}>
                          ✕ Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PASO 2: Datos de envío */}
              {step===2 && (
                <div style={{background:'white',border:'1px solid #e8e8e8',padding:'1.5rem'}}>
                  <h2 style={{fontSize:14,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'1.25rem',paddingBottom:'0.75rem',borderBottom:'1px solid #eee'}}>Datos de envío</h2>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                    {[['name','Nombre y apellidos','text'],['email','Email','email'],['phone','Teléfono','tel'],['address','Dirección completa','text'],['city','Ciudad','text'],['postal','Código postal','text']].map(([k,l,t])=>(
                      <div key={k} style={{gridColumn: k==='address'?'1/-1':undefined}}>
                        <label style={{display:'block',fontSize:12,fontWeight:700,color:'#555',marginBottom:4,textTransform:'uppercase' as const,letterSpacing:'0.04em'}}>{l}</label>
                        <input type={t} value={(form as any)[k]}
                          onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
                          style={{width:'100%',padding:'10px 12px',fontSize:14,border:'1px solid #ddd',fontFamily:'var(--font-body)',margin:0,borderRadius:0,outline:'none'}}
                          onFocus={e=>(e.target.style.borderColor='var(--red)')}
                          onBlur={e=>(e.target.style.borderColor='#ddd')}/>
                      </div>
                    ))}
                  </div>
                  <h2 style={{fontSize:14,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',margin:'1.5rem 0 1rem',paddingBottom:'0.75rem',borderBottom:'1px solid #eee'}}>Método de pago</h2>
                  <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap' as const}}>
                    {[['card','💳 Tarjeta'],['bizum','📱 Bizum'],['transfer','🏦 Transferencia']].map(([v,l])=>(
                      <label key={v} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',border:payment===v?'2px solid var(--red)':'1px solid #ddd',cursor:'pointer',fontSize:13,fontWeight:600,background:payment===v?'rgba(255,30,65,0.03)':'white'}}>
                        <input type="radio" name="payment" value={v} checked={payment===v} onChange={()=>setPayment(v as any)} style={{accentColor:'var(--red)'}}/>
                        {l}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resumen del pedido */}
            <div>
              <div style={{background:'white',border:'1px solid #e8e8e8'}}>
                <div style={{padding:'14px 16px',borderBottom:'1px solid #eee'}}>
                  <h3 style={{fontSize:13,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',margin:0}}>Resumen del pedido</h3>
                </div>
                <div style={{padding:'1rem 1.25rem'}}>
                  {items.map((item,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'6px 0',fontSize:13,color:'#555',borderBottom:'1px solid #f8f8f8'}}>
                      <span style={{flex:1,paddingRight:8,lineHeight:1.3}}>{item.name.slice(0,35)}{item.name.length>35?'...':''} <span style={{color:'#999'}}>x{item.quantity}</span></span>
                      <span style={{fontWeight:600,color:'#333',flexShrink:0}}>
                        {((item.discountPct>0?item.price_incl_tax*(1-item.discountPct/100):item.price_incl_tax)*item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                  <div style={{marginTop:'0.75rem',paddingTop:'0.75rem',borderTop:'1px solid #eee'}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#666',marginBottom:6}}>
                      <span>Subtotal</span><span>{total.toFixed(2)} €</span>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#666',marginBottom:6}}>
                      <span>Envío</span>
                      <span style={{color:shipping===0?'#28a745':'#333'}}>{shipping===0?'GRATIS':shipping.toFixed(2)+' €'}</span>
                    </div>
                    {shipping>0&&(
                      <div style={{fontSize:11,color:'var(--red)',marginBottom:6}}>
                        Añade {(SHIPPING_FREE_FROM-total).toFixed(2)} € más para envío gratis
                      </div>
                    )}
                    {discountPct>0&&(
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#28a745',marginBottom:6}}>
                        <span>Descuento {levelName} -{discountPct}%</span>
                      </div>
                    )}
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:17,fontWeight:800,color:'var(--red)',marginTop:'0.75rem',paddingTop:'0.75rem',borderTop:'2px solid #eee'}}>
                      <span>TOTAL</span><span>{grandTotal.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
                {/* Botón acción */}
                <div style={{padding:'0 1.25rem 1.25rem'}}>
                  {step===1 && (
                    <button onClick={()=>setStep(2)}
                      style={{width:'100%',padding:'13px',background:'var(--red)',color:'white',border:'none',fontFamily:'var(--font-body)',fontSize:14,fontWeight:700,cursor:'pointer',textTransform:'uppercase' as const,letterSpacing:'0.05em'}}>
                      CONTINUAR → DATOS DE ENVÍO
                    </button>
                  )}
                  {step===2 && (
                    <>
                      <button onClick={handleOrder} disabled={placing||!form.name||!form.email||!form.address}
                        style={{width:'100%',padding:'13px',background:placing?'#ccc':'var(--red)',color:'white',border:'none',fontFamily:'var(--font-body)',fontSize:14,fontWeight:700,cursor:placing?'not-allowed':'pointer',textTransform:'uppercase' as const,letterSpacing:'0.05em',marginBottom:8}}>
                        {placing?'Procesando...':'✓ CONFIRMAR PEDIDO'}
                      </button>
                      <button onClick={()=>setStep(1)}
                        style={{width:'100%',padding:'10px',background:'white',color:'#666',border:'1px solid #ddd',fontFamily:'var(--font-body)',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                        ← Volver al carrito
                      </button>
                    </>
                  )}
                </div>
                {/* Garantías */}
                <div style={{padding:'0.75rem 1.25rem 1rem',borderTop:'1px solid #f5f5f5',display:'flex',gap:'0.5rem',flexWrap:'wrap' as const}}>
                  {[['🔒','Pago seguro'],['🚚','Envío 24/48h'],['🔄','Devoluciones']].map(([ic,t])=>(
                    <span key={t} style={{fontSize:11,color:'#999',display:'flex',alignItems:'center',gap:3}}>{ic} {t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
