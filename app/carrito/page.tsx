'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const SHIPPING_FREE_THRESHOLD = 50
const SHIPPING_COST = 4.99

type Step = 'cart' | 'checkout' | 'confirmation'

interface OrderForm {
  name: string; email: string; phone: string
  address: string; city: string; postal_code: string
  notes: string; payment_method: string
}

export default function CarritoPage() {
  const { items, remove, updateQty, total, count, clear } = useCart()
  const [step, setStep] = useState<Step>('cart')
  const [form, setForm] = useState<OrderForm>({ name:'', email:'', phone:'', address:'', city:'', postal_code:'', notes:'', payment_method:'card' })
  const [loading, setLoading] = useState(false)
  const [orderNum, setOrderNum] = useState('')
  const [error, setError] = useState('')

  const shipping = total >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST
  const iva = total * 0.21 / 1.21
  const base = total - iva
  const grandTotal = total + shipping

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.address || !form.city || !form.postal_code) {
      setError('Por favor rellena todos los campos obligatorios'); return
    }
    setLoading(true); setError('')
    try {
      // Crear pedido
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        channel: 'online_retail',
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_postal_code: form.postal_code,
        notes: form.notes,
        payment_method: form.payment_method,
        subtotal: base,
        tax_amount: iva,
        shipping_cost: shipping,
        total: grandTotal,
        status: 'pending'
      }).select('id, order_number').single()
      if (orderErr) throw orderErr

      // Insertar líneas
      const lines = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.qty,
        unit_price: item.price,
        tax_rate: 21,
        line_total: item.price * item.qty
      }))
      const { error: linesErr } = await supabase.from('order_lines').insert(lines)
      if (linesErr) throw linesErr

      // Descontar stock
      for (const item of items) {
        await supabase.from('products').update({ stock: Math.max(0, item.product.stock - item.qty) }).eq('id', item.product.id)
      }

      setOrderNum(order.order_number)
      clear()
      setStep('confirmation')
    } catch (err: any) {
      setError('Error al procesar el pedido: ' + (err.message || 'Inténtalo de nuevo'))
    }
    setLoading(false)
  }

  // CONFIRMACIÓN
  if (step === 'confirmation') return (
    <div style={{background:'var(--bg)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem'}}>
      <div style={{background:'var(--white)', border:'1px solid var(--border)', padding:'3rem', maxWidth:480, width:'100%', textAlign:'center'}}>
        <div style={{fontSize:64, marginBottom:'1rem'}}>✅</div>
        <h1 style={{fontFamily:'var(--font-body)', fontSize:28, fontWeight:900, textTransform:'uppercase', color:'var(--text)', marginBottom:'0.5rem'}}>
          ¡Pedido realizado!
        </h1>
        <p style={{color:'var(--muted)', marginBottom:'1.5rem'}}>
          Gracias por tu compra. Hemos recibido tu pedido correctamente.
        </p>
        <div style={{background:'var(--bg)', border:'1px solid var(--border)', padding:'1rem', marginBottom:'1.5rem'}}>
          <div style={{fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--muted)', marginBottom:4}}>Número de pedido</div>
          <div style={{fontSize:24, fontWeight:900, color:'var(--red)', fontFamily:'var(--font-body)'}}>{orderNum}</div>
        </div>
        <p style={{fontSize:13, color:'var(--muted)', marginBottom:'2rem'}}>
          Recibirás una confirmación en <strong>{form.email}</strong>. 
          Tu pedido será enviado en 24/48h.
        </p>
        <div style={{display:'flex', gap:'0.75rem', justifyContent:'center'}}>
          <Link href="/tienda" className="btn-primary" style={{fontSize:13, padding:'10px 24px', justifyContent:'center'}}>Seguir comprando</Link>
        </div>
      </div>
    </div>
  )

  // CHECKOUT FORM
  if (step === 'checkout') return (
    <div style={{background:'var(--bg)', minHeight:'100vh', paddingBottom:'4rem'}}>
      <div className="container" style={{paddingTop:'2rem', maxWidth:900}}>
        <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.5rem'}}>
          <button onClick={() => setStep('cart')} style={{fontSize:13, color:'var(--muted)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4}}>
            ← Volver al carrito
          </button>
        </div>

        {/* Steps */}
        <div style={{display:'flex', gap:0, marginBottom:'2rem', background:'var(--white)', border:'1px solid var(--border)'}}>
          {[{n:1,l:'Carrito'},{n:2,l:'Datos envío'},{n:3,l:'Confirmación'}].map((s,i) => (
            <div key={i} style={{flex:1, padding:'12px', textAlign:'center', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', borderRight: i<2?'1px solid var(--border)':'none', background: s.n===2?'var(--red)':'transparent', color: s.n===2?'white':s.n<2?'var(--red)':'var(--muted)'}}>
              {s.n}. {s.l}
            </div>
          ))}
        </div>

        <form onSubmit={handleCheckout}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 340px', gap:'1.5rem', alignItems:'start'}}>
            {/* Left: form */}
            <div>
              <div style={{background:'var(--white)', border:'1px solid var(--border)', padding:'1.5rem', marginBottom:'1rem'}}>
                <h2 style={{fontSize:16, fontWeight:800, textTransform:'uppercase', marginBottom:'1.25rem'}}>Datos de contacto</h2>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem'}}>
                  <div style={{gridColumn:'1/-1'}}>
                    <label>Nombre completo *</label>
                    <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Nombre y apellidos" required/>
                  </div>
                  <div>
                    <label>Email *</label>
                    <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="tu@email.com" required/>
                  </div>
                  <div>
                    <label>Teléfono</label>
                    <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="600 000 000"/>
                  </div>
                </div>
              </div>

              <div style={{background:'var(--white)', border:'1px solid var(--border)', padding:'1.5rem', marginBottom:'1rem'}}>
                <h2 style={{fontSize:16, fontWeight:800, textTransform:'uppercase', marginBottom:'1.25rem'}}>Dirección de envío</h2>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem'}}>
                  <div style={{gridColumn:'1/-1'}}>
                    <label>Dirección *</label>
                    <input value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} placeholder="Calle, número, piso..." required/>
                  </div>
                  <div>
                    <label>Ciudad *</label>
                    <input value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} placeholder="Ciudad" required/>
                  </div>
                  <div>
                    <label>Código postal *</label>
                    <input value={form.postal_code} onChange={e=>setForm(p=>({...p,postal_code:e.target.value}))} placeholder="41000" required maxLength={5}/>
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label>Notas del pedido</label>
                    <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Instrucciones especiales (opcional)"/>
                  </div>
                </div>
              </div>

              <div style={{background:'var(--white)', border:'1px solid var(--border)', padding:'1.5rem'}}>
                <h2 style={{fontSize:16, fontWeight:800, textTransform:'uppercase', marginBottom:'1.25rem'}}>Método de pago</h2>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem'}}>
                  {[{v:'card',l:'💳 Tarjeta'},{v:'bizum',l:'📱 Bizum'},{v:'transfer',l:'🏦 Transferencia'}].map(m => (
                    <button key={m.v} type="button" onClick={() => setForm(p=>({...p,payment_method:m.v}))}
                      style={{padding:'12px 8px', border: form.payment_method===m.v?'2px solid var(--red)':'1px solid var(--border)', background: form.payment_method===m.v?'rgba(255,30,65,0.04)':'var(--white)', color: form.payment_method===m.v?'var(--red)':'var(--muted)', fontFamily:'var(--font-body)', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.12s'}}>
                      {m.l}
                    </button>
                  ))}
                </div>
                {form.payment_method === 'transfer' && (
                  <div style={{background:'var(--bg)', border:'1px solid var(--border)', padding:'0.75rem', marginTop:'0.75rem', fontSize:12, color:'var(--muted)'}}>
                    IBAN: ES00 0000 0000 0000 0000 0000 · Concepto: tu número de pedido
                  </div>
                )}
              </div>
            </div>

            {/* Right: resumen */}
            <div style={{background:'var(--white)', border:'1px solid var(--border)', padding:'1.25rem', position:'sticky', top:'120px'}}>
              <h3 style={{fontSize:14, fontWeight:800, textTransform:'uppercase', marginBottom:'1rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--border)'}}>Resumen ({count} {count===1?'artículo':'artículos'})</h3>
              {items.map(item => (
                <div key={item.product.id} style={{display:'flex', gap:'0.75rem', marginBottom:'0.75rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--border)'}}>
                  <img src={item.product.image_url||'https://placehold.co/48x48/f5f5f5/ccc?text=BM'} alt="" style={{width:48,height:48,objectFit:'contain',background:'var(--bg)',flexShrink:0}}/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:12, fontWeight:700, textTransform:'uppercase', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.product.name}</div>
                    <div style={{fontSize:12, color:'var(--muted)'}}>x{item.qty}</div>
                  </div>
                  <div style={{fontSize:13, fontWeight:700, color:'var(--red)', flexShrink:0}}>{(item.price*item.qty).toFixed(2)} €</div>
                </div>
              ))}
              <div style={{display:'flex', flexDirection:'column', gap:8, paddingTop:'0.75rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--muted)'}}>
                  <span>Base imponible</span><span>{base.toFixed(2)} €</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--muted)'}}>
                  <span>IVA (21%)</span><span>{iva.toFixed(2)} €</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color: shipping===0?'#28a745':'var(--muted)'}}>
                  <span>Envío</span><span>{shipping===0?'GRATIS':shipping.toFixed(2)+' €'}</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', paddingTop:8, borderTop:'2px solid var(--text)', marginTop:4}}>
                  <span style={{fontSize:16, fontWeight:800, textTransform:'uppercase'}}>TOTAL</span>
                  <span style={{fontSize:22, fontWeight:900, color:'var(--red)'}}>{grandTotal.toFixed(2)} €</span>
                </div>
              </div>
              {error && <div style={{background:'rgba(255,30,65,0.06)', border:'1px solid var(--red)', padding:'0.75rem', marginTop:'0.75rem', fontSize:13, color:'var(--red)'}}>{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%', marginTop:'1rem', padding:'14px', fontSize:15, justifyContent:'center'}}>
                {loading ? 'Procesando...' : `Confirmar pedido · ${grandTotal.toFixed(2)} €`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )

  // CARRITO
  return (
    <div style={{background:'var(--bg)', minHeight:'100vh', paddingBottom:'4rem'}}>
      <div className="container" style={{paddingTop:'2rem'}}>
        <h1 style={{fontSize:28, fontWeight:900, textTransform:'uppercase', marginBottom:'1.5rem'}}>
          Mi carrito {count>0 && <span style={{fontSize:16, color:'var(--muted)', fontWeight:400}}>({count} {count===1?'artículo':'artículos'})</span>}
        </h1>

        {items.length === 0 ? (
          <div style={{background:'var(--white)', border:'1px solid var(--border)', padding:'4rem 2rem', textAlign:'center'}}>
            <div style={{fontSize:64, marginBottom:'1rem'}}>🛒</div>
            <h2 style={{fontFamily:'var(--font-body)', fontSize:22, fontWeight:800, textTransform:'uppercase', marginBottom:'0.75rem'}}>Tu carrito está vacío</h2>
            <p style={{color:'var(--muted)', marginBottom:'2rem'}}>Añade productos desde el catálogo</p>
            <Link href="/tienda" className="btn-primary" style={{fontSize:14, padding:'12px 28px', justifyContent:'center'}}>Ver catálogo</Link>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'1fr 340px', gap:'1.5rem', alignItems:'start'}}>
            {/* Items */}
            <div style={{background:'var(--white)', border:'1px solid var(--border)'}}>
              {/* Header */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 100px 80px 80px 32px', gap:'1rem', padding:'0.75rem 1rem', borderBottom:'2px solid var(--border)', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', color:'var(--muted)'}}>
                <span>Producto</span><span style={{textAlign:'center'}}>Cantidad</span><span style={{textAlign:'right'}}>Precio</span><span style={{textAlign:'right'}}>Total</span><span></span>
              </div>
              {items.map(item => (
                <div key={item.product.id} style={{display:'grid', gridTemplateColumns:'1fr 100px 80px 80px 32px', gap:'1rem', padding:'1rem', borderBottom:'1px solid var(--border)', alignItems:'center'}}>
                  <div style={{display:'flex', gap:'1rem', alignItems:'center', minWidth:0}}>
                    <img src={item.product.image_url||'https://placehold.co/64x64/f5f5f5/ccc?text=BM'} alt="" style={{width:64,height:64,objectFit:'contain',background:'var(--bg)',flexShrink:0,border:'1px solid var(--border)'}}/>
                    <div style={{minWidth:0}}>
                      <Link href={`/producto/${item.product.id}`} style={{fontSize:13,fontWeight:700,textTransform:'uppercase',display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.product.name}</Link>
                      <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>Ref: {item.product.id}</div>
                      {item.discountPct>0 && <span className="badge badge-red" style={{marginTop:4}}>-{item.discountPct}%</span>}
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:4, justifyContent:'center'}}>
                    <button onClick={()=>updateQty(item.product.id,item.qty-1)} className="qty-btn">−</button>
                    <span style={{minWidth:28,textAlign:'center',fontWeight:700}}>{item.qty}</span>
                    <button onClick={()=>updateQty(item.product.id,item.qty+1)} className="qty-btn">+</button>
                  </div>
                  <div style={{textAlign:'right',fontSize:14,fontWeight:700,color:'var(--red)'}}>{item.price.toFixed(2)} €</div>
                  <div style={{textAlign:'right',fontSize:15,fontWeight:800,color:'var(--red)'}}>{(item.price*item.qty).toFixed(2)} €</div>
                  <button onClick={()=>remove(item.product.id)} style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'1px solid var(--border)',cursor:'pointer',color:'var(--muted)',fontSize:16,transition:'all 0.12s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--red)';(e.currentTarget as HTMLElement).style.color='var(--red)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.color='var(--muted)'}}>×</button>
                </div>
              ))}
              <div style={{padding:'0.75rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <button onClick={clear} style={{fontSize:13, color:'var(--muted)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}>Vaciar carrito</button>
                <Link href="/tienda" style={{fontSize:13, color:'var(--red)', fontWeight:700}}>← Continuar comprando</Link>
              </div>
            </div>

            {/* Resumen */}
            <div style={{background:'var(--white)', border:'1px solid var(--border)', padding:'1.25rem', position:'sticky', top:'120px'}}>
              <h3 style={{fontSize:14, fontWeight:800, textTransform:'uppercase', marginBottom:'1rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--border)'}}>Resumen del pedido</h3>
              <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:'1.25rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--muted)'}}>
                  <span>Base imponible</span><span>{base.toFixed(2)} €</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--muted)'}}>
                  <span>IVA (21%)</span><span>{iva.toFixed(2)} €</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color: shipping===0?'#28a745':'var(--muted)'}}>
                  <span>Envío</span>
                  <span style={{fontWeight: shipping===0?700:400}}>{shipping===0?'🎉 GRATIS':shipping.toFixed(2)+' €'}</span>
                </div>
                {shipping > 0 && (
                  <div style={{background:'rgba(40,167,69,0.06)', border:'1px solid rgba(40,167,69,0.2)', padding:'6px 10px', fontSize:12, color:'#28a745', borderRadius:0}}>
                    Añade <strong>{(SHIPPING_FREE_THRESHOLD - total).toFixed(2)} € más</strong> y el envío es gratis
                  </div>
                )}
                <div style={{display:'flex', justifyContent:'space-between', paddingTop:10, borderTop:'2px solid var(--text)', marginTop:4}}>
                  <span style={{fontSize:18, fontWeight:800, textTransform:'uppercase'}}>TOTAL</span>
                  <span style={{fontSize:26, fontWeight:900, color:'var(--red)'}}>{grandTotal.toFixed(2)} €</span>
                </div>
              </div>
              <button onClick={() => setStep('checkout')} className="btn-primary" style={{width:'100%', padding:'14px', fontSize:15, justifyContent:'center'}}>
                Tramitar pedido →
              </button>
              <div style={{marginTop:'1rem', display:'flex', gap:'0.5rem', justifyContent:'center', flexWrap:'wrap'}}>
                {['🔒 Pago seguro','📦 Envío 24/48h','🔄 Devoluciones'].map(t => (
                  <span key={t} style={{fontSize:11, color:'var(--muted)', fontWeight:600}}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
