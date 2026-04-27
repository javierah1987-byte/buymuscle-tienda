// @ts-nocheck
'use client'
import { useCart } from '@/lib/cart'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

function RecomendadosVacio() {
  const [prods, setProds] = useState([])
  const { add } = useCart()
  useEffect(()=>{
    fetch(S+'/rest/v1/products?active=eq.true&stock=gt.0&order=id.desc&limit=4&select=id,name,price_incl_tax,sale_price,image_url,categories(name)',{headers:{apikey:K,'Authorization':'Bearer '+K}})
      .then(r=>r.json()).then(d=>Array.isArray(d)&&setProds(d)).catch(()=>{})
  },[])
  if(!prods.length) return null
  return(
    <div style={{marginTop:32}}>
      <h3 style={{fontSize:14,fontWeight:700,color:'#111',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.05em'}}>Los mas vendidos — no te vayas sin nada 🔥</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
        {prods.map(p=>{
          const price = Number(p.sale_price||p.price_incl_tax)
          return(
            <Link key={p.id} href={'/producto/'+p.id} style={{textDecoration:'none',color:'inherit',background:'white',border:'1px solid #f0f0f0',borderRadius:6,overflow:'hidden',display:'flex',flexDirection:'column'}}>
              <div style={{background:'#f9f9f9',aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',padding:8}}>
                {p.image_url?<img src={p.image_url} alt="" style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/>:<div style={{fontSize:32,opacity:.3}}>📦</div>}
              </div>
              <div style={{padding:'8px 10px',flex:1,display:'flex',flexDirection:'column',gap:4}}>
                <div style={{fontSize:12,fontWeight:600,color:'#111',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.name}</div>
                <div style={{fontSize:14,fontWeight:900,color:'#ff1e41',marginTop:'auto'}}>{price.toFixed(2)} €</div>
                <button onClick={e=>{e.preventDefault();add({id:p.id,name:p.name,price,image:p.image_url,variant:'',qty:1})}}
                  style={{marginTop:4,padding:'6px',border:'1px solid #ff1e41',background:'transparent',color:'#ff1e41',fontSize:11,fontWeight:700,cursor:'pointer',borderRadius:2}}>
                  + Añadir
                </button>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function CarritoPage() {
  const { items, update, remove, clear } = useCart()
  const [paso, setPaso] = useState(1)
  const [form, setForm] = useState({name:'',email:'',phone:'',address:'',city:'',postal_code:'',province:'',nif:'',notes:''})
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [discountMsg, setDiscountMsg] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [orderDone, setOrderDone] = useState(null)
  const [upsellProds, setUpsellProds] = useState([])

  const subtotal = items.reduce((s,i)=>s+i.price*i.qty,0)
  const shippingFree = subtotal >= 50
  const shipping = shippingFree ? 0 : 4.90
  const discountAmt = discount > 0 ? subtotal*(discount/100) : 0
  const total = subtotal - discountAmt + shipping

  async function applyCoupon() {
    if(!coupon.trim()) return
    const r = await fetch(S+'/rest/v1/discount_codes?code=eq.'+encodeURIComponent(coupon.trim())+'&active=eq.true',{headers:{apikey:K,'Authorization':'Bearer '+K}})
    const d = await r.json()
    if(d&&d[0]) {
      setDiscount(Number(d[0].value))
      setDiscountMsg('Descuento '+d[0].value+'% aplicado')
    } else setDiscountMsg('Codigo no valido o caducado')
  }

  async function doOrder(method) {
    setOrdering(true)
    const orderNum = 'ORD-'+Date.now().toString().slice(-8)
    const r = await fetch(S+'/rest/v1/orders',{method:'POST',headers:{apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json','Prefer':'return=representation'},
      body:JSON.stringify({order_number:orderNum,customer_email:form.email,customer_name:form.name,customer_phone:form.phone,shipping_address:form.address+', '+form.city+' '+form.postal_code,nif:form.nif,notes:form.notes,subtotal,discount:discountAmt,shipping,total,status:'pending',payment_method:method||'card',channel:'web'})
    })
    const order = await r.json()
    const orderId = Array.isArray(order)?order[0]?.id:order?.id
    if(orderId) {
      // a3: CRM - upsert del cliente
      if(form.email) {
        fetch(S+'/rest/v1/customers',{method:'POST',headers:{apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates,return=minimal'},
          body:JSON.stringify({email:form.email,name:form.name,phone:form.phone||'',last_order_date:new Date().toISOString(),orders_count:1,total_spent:total})
        }).catch(function(){})
      }
      await fetch(S+'/rest/v1/order_lines',{method:'POST',headers:{apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json'},
        body:JSON.stringify(items.map(i=>({order_id:orderId,product_id:i.id,product_name:i.name,qty:i.qty,price:i.price,variant:i.variant||''})))
      })
      // Cargar upsell
      fetch(S+'/rest/v1/products?active=eq.true&stock=gt.0&order=id.desc&limit=4&select=id,name,price_incl_tax,image_url',{headers:{apikey:K,'Authorization':'Bearer '+K}})
        .then(r2=>r2.json()).then(d=>Array.isArray(d)&&setUpsellProds(d)).catch(()=>{})
      clear()
      setOrderDone({orderNum,email:form.email})
      setPaso(3)
    }
    setOrdering(false)
  }

  async function doPayPal(){
    if(!form.name||!form.email||!form.address||!form.city||!form.postal_code){alert('Por favor completa todos los campos para continuar con PayPal');return}
    window.open('https://www.paypal.com/paypalme/buymuscle/'+total.toFixed(2)+'EUR','_blank')
    await doOrder('paypal')
  }

  // PASO 3 — Confirmación c5
  if(paso===3&&orderDone){return(
    <div style={{maxWidth:640,margin:'3rem auto',padding:'0 20px'}}>
      <div style={{background:'white',border:'1px solid #e8e8e8',borderRadius:8,padding:'2.5rem',textAlign:'center'}}>
        <div style={{fontSize:56,marginBottom:16}}>🎉</div>
        <h1 style={{fontSize:22,fontWeight:900,color:'#111',margin:'0 0 8px'}}>¡Pedido confirmado!</h1>
        <p style={{fontSize:14,color:'#666',margin:'0 0 4px'}}>Pedido <strong style={{color:'#111'}}>{orderDone.orderNum}</strong></p>
        <p style={{fontSize:13,color:'#888',margin:'0 0 24px'}}>Te hemos enviado la confirmacion a <strong>{orderDone.email}</strong></p>
        <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/tienda" style={{padding:'10px 24px',background:'#ff1e41',color:'white',borderRadius:4,textDecoration:'none',fontWeight:700,fontSize:13}}>Seguir comprando</Link>
          <Link href="/mis-pedidos" style={{padding:'10px 24px',border:'1px solid #ddd',color:'#555',borderRadius:4,textDecoration:'none',fontWeight:600,fontSize:13}}>Ver mis pedidos</Link>
        </div>
      </div>
      {/* c5 UPSELL */}
      {upsellProds.length>0&&(
        <div style={{marginTop:32}}>
          <h3 style={{fontSize:14,fontWeight:700,color:'#111',marginBottom:12,textTransform:'uppercase'}}>Tambien te puede gustar</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
            {upsellProds.map(p=>(
              <Link key={p.id} href={'/producto/'+p.id} style={{textDecoration:'none',color:'inherit',background:'white',border:'1px solid #f0f0f0',borderRadius:6,overflow:'hidden',textAlign:'center',padding:10}}>
                {p.image_url&&<img src={p.image_url} alt="" style={{width:'100%',aspectRatio:'1',objectFit:'contain',background:'#f9f9f9'}}/>}
                <div style={{fontSize:11,color:'#111',marginTop:6,fontWeight:600,lineHeight:1.3}}>{p.name.slice(0,40)}</div>
                <div style={{fontSize:13,color:'#ff1e41',fontWeight:900,marginTop:4}}>{Number(p.price_incl_tax).toFixed(2)} €</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )}

  return(
    <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 20px'}}>
      <h1 style={{fontSize:14,color:'#888',margin:'0 0 24px',fontWeight:400}}>Inicio › <strong style={{color:'#111'}}>Mi Carrito</strong></h1>

      {/* Pasos */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',marginBottom:24,border:'1px solid #e8e8e8',borderRadius:4,overflow:'hidden'}}>
        {['1. CARRITO','2. DATOS','3. CONFIRMACION'].map((s,i)=>(
          <div key={s} style={{padding:'12px',textAlign:'center',background:paso===i+1?'#ff1e41':paso>i+1?'#111':'white',color:paso===i+1||paso>i+1?'white':'#999',fontSize:12,fontWeight:700,letterSpacing:'0.05em'}}>{s}</div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:24,alignItems:'start'}}>
        <div>
          {/* PASO 1 CARRITO */}
          {paso===1&&(
            <div>
              {items.length===0?(
                <div style={{background:'white',border:'1px solid #e8e8e8',borderRadius:8,padding:'3rem',textAlign:'center'}}>
                  <div style={{fontSize:56,marginBottom:12}}>🛒</div>
                  <h2 style={{fontSize:18,fontWeight:700,margin:'0 0 8px'}}>TU CARRITO ESTA VACIO</h2>
                  <p style={{fontSize:13,color:'#888',margin:'0 0 20px'}}>Añade productos desde el catalogo</p>
                  <Link href="/tienda" style={{padding:'11px 28px',background:'#ff1e41',color:'white',borderRadius:4,textDecoration:'none',fontWeight:700,fontSize:13}}>VER CATALOGO</Link>
                  {/* c1 RECOMENDADOS */}
                  <RecomendadosVacio/>
                </div>
              ):(
                <div style={{background:'white',border:'1px solid #e8e8e8',borderRadius:8,overflow:'hidden'}}>
                  <div style={{padding:'14px 20px',borderBottom:'1px solid #f0f0f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:700,fontSize:14}}>{items.length} PRODUCTOS</span>
                    <button onClick={clear} style={{background:'none',border:'none',color:'#aaa',cursor:'pointer',fontSize:12}}>Vaciar carrito</button>
                  </div>
                  {items.map(item=>(
                    <div key={item.id+item.variant} style={{display:'grid',gridTemplateColumns:'60px 1fr auto',gap:14,padding:'14px 20px',borderBottom:'1px solid #f9f9f9',alignItems:'center'}}>
                      <Link href={'/producto/'+item.id}>{item.image?<img src={item.image} alt="" style={{width:60,height:60,objectFit:'contain',background:'#f9f9f9',borderRadius:4}}/>:<div style={{width:60,height:60,background:'#f9f9f9',borderRadius:4}}/>}</Link>
                      <div>
                        <Link href={'/producto/'+item.id} style={{textDecoration:'none',color:'#111',fontSize:13,fontWeight:600,lineHeight:1.3}}>{item.name}</Link>
                        {item.variant&&<div style={{fontSize:11,color:'#888',marginTop:2}}>{item.variant}</div>}
                        <div style={{fontSize:14,fontWeight:900,color:'#ff1e41',marginTop:4}}>{item.price.toFixed(2)} €</div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
                        <button onClick={()=>remove(item.id,item.variant)} style={{background:'none',border:'none',color:'#ccc',cursor:'pointer',fontSize:18,lineHeight:1}}>✕</button>
                        <div style={{display:'flex',alignItems:'center',border:'1px solid #e8e8e8',borderRadius:4}}>
                          <button onClick={()=>update(item.id,item.variant,Math.max(1,item.qty-1))} style={{width:28,height:28,border:'none',background:'none',cursor:'pointer',fontSize:16}}>−</button>
                          <span style={{width:32,textAlign:'center',fontSize:13,fontWeight:600}}>{item.qty}</span>
                          <button onClick={()=>update(item.id,item.variant,item.qty+1)} style={{width:28,height:28,border:'none',background:'none',cursor:'pointer',fontSize:16}}>+</button>
                        </div>
                        <span style={{fontSize:13,fontWeight:700,color:'#111'}}>{(item.price*item.qty).toFixed(2)} €</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* c4 texto guardar carrito */}
              {items.length>0&&<p style={{textAlign:'center',fontSize:11,color:'#aaa',marginTop:8}}>🔒 Tu carrito se guarda 7 dias · Puedes continuar mas tarde</p>}
            </div>
          )}

          {/* PASO 2 DATOS */}
          {paso===2&&(
            <div style={{background:'white',border:'1px solid #e8e8e8',borderRadius:8,padding:24}}>
              <h2 style={{fontSize:15,fontWeight:700,margin:'0 0 20px',color:'#111'}}>DATOS DE ENVIO</h2>
              {/* c2 CONFIANZA */}
              <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20,padding:'12px 14px',background:'#f9f9f9',borderRadius:6}}>
                {[{i:'🔒',t:'Pago 100% seguro'},{i:'🔄',t:'Devolucion 14 dias'},{i:'📞',t:'Tel: 828 048 310'},{i:'🚀',t:'Envio 24-48h'}].map(({i,t})=>(
                  <div key={t} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#555'}}>
                    <span>{i}</span><span>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[['name','Nombre completo *'],['email','Email *'],['phone','Telefono'],['address','Direccion *'],['city','Ciudad *'],['postal_code','Cod. Postal *'],['province','Provincia'],['nif','NIF/CIF']].map(([k,l])=>(
                  <div key={k} style={{gridColumn:k==='address'||k==='notes'?'1/-1':'auto'}}>
                    <label style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4}}>{l}</label>
                    <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                      style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e0',borderRadius:4,fontSize:13,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}}/>
                  </div>
                ))}
                <div style={{gridColumn:'1/-1'}}>
                  <label style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4}}>Notas del pedido (opcional)</label>
                  <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2}
                    style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e0',borderRadius:4,fontSize:13,outline:'none',fontFamily:'inherit',resize:'vertical',boxSizing:'border-box'}}/>
                </div>
              </div>
              <button onClick={()=>setPaso(1)} style={{marginTop:12,background:'none',border:'none',color:'#aaa',cursor:'pointer',fontSize:12}}>← Volver al carrito</button>
            </div>
          )}
        </div>

        {/* RESUMEN LATERAL */}
        <div style={{position:'sticky',top:20}}>
          <div style={{background:'white',border:'1px solid #e8e8e8',borderRadius:8,padding:20}}>
            <h3 style={{fontSize:13,fontWeight:700,margin:'0 0 16px',textTransform:'uppercase',letterSpacing:'0.06em'}}>Resumen</h3>
            {paso===2&&items.map(i=>(
              <div key={i.id+i.variant} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#555',marginBottom:6}}>
                <span style={{flex:1,paddingRight:8}}>{i.name.slice(0,30)}{i.qty>1?' x'+i.qty:''}</span>
                <span style={{fontWeight:600}}>{(i.price*i.qty).toFixed(2)} €</span>
              </div>
            ))}
            <div style={{borderTop:'1px solid #f0f0f0',paddingTop:12,marginTop:8,display:'flex',flexDirection:'column',gap:6}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#555'}}><span>Subtotal</span><span>{subtotal.toFixed(2)} €</span></div>
              {discountAmt>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#22c55e'}}><span>Descuento -{discount}%</span><span>-{discountAmt.toFixed(2)} €</span></div>}
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:shippingFree?'#22c55e':'#555'}}>
                <span>Envio</span><span>{shippingFree?'🎉 GRATIS':shipping.toFixed(2)+' €'}</span>
              </div>
              {!shippingFree&&<div style={{fontSize:11,color:'#aaa',textAlign:'right'}}>Faltan {(50-subtotal).toFixed(2)} € para envio gratis</div>}
            </div>
            <div style={{borderTop:'2px solid #111',paddingTop:12,marginTop:8,display:'flex',justifyContent:'space-between',fontSize:17,fontWeight:900,color:'#111'}}>
              <span>TOTAL</span><span style={{color:'#ff1e41'}}>{total.toFixed(2)} €</span>
            </div>

            {/* Cupon */}
            {paso===1&&(
              <div style={{marginTop:14}}>
                <div style={{display:'flex',gap:6}}>
                  <input value={coupon} onChange={e=>setCoupon(e.target.value)} onKeyDown={e=>e.key==='Enter'&&applyCoupon()} placeholder="Codigo descuento" style={{flex:1,padding:'8px 10px',border:'1px solid #e0e0e0',borderRadius:4,fontSize:12,outline:'none'}}/>
                  <button onClick={applyCoupon} style={{padding:'8px 12px',background:'#111',color:'white',border:'none',borderRadius:4,cursor:'pointer',fontSize:12,fontWeight:700}}>OK</button>
                </div>
                {discountMsg&&<p style={{fontSize:11,color:discount>0?'#22c55e':'#ef4444',marginTop:4}}>{discountMsg}</p>}
              </div>
            )}

            {/* CTA */}
            {paso===1&&items.length>0&&(
              <button onClick={()=>setPaso(2)} style={{width:'100%',marginTop:16,padding:'13px',background:'#ff1e41',border:'none',color:'white',fontWeight:700,fontSize:14,cursor:'pointer',borderRadius:4,letterSpacing:'0.03em'}}>
                CONTINUAR →
              </button>
            )}

            {/* c3 BOTÓN CON PRECIO */}
            {paso===2&&(
              <div style={{marginTop:16}}>
                <button onClick={()=>doOrder('card')} disabled={ordering||!form.name||!form.email||!form.address||!form.city||!form.postal_code}
                  style={{width:'100%',padding:'13px',background:ordering?'#ccc':'#ff1e41',border:'none',color:'white',fontWeight:700,fontSize:14,cursor:'pointer',borderRadius:4,opacity:(!form.name||!form.email||!form.address)?0.6:1}}>
                  {ordering?'Procesando...':'✓ CONFIRMAR Y PAGAR '+total.toFixed(2)+' €'}
                </button>
                <div style={{textAlign:'center',margin:'10px 0 4px',fontSize:11,color:'#bbb',letterSpacing:'0.05em'}}>— o paga con —</div>
                <button onClick={doPayPal} disabled={ordering}
                  style={{width:'100%',background:'#ffc439',border:'none',borderRadius:4,cursor:'pointer',padding:'11px',fontWeight:800,fontSize:14,color:'#111',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:8}}>
                  🅿️ Pagar con PayPal
                </button>
                <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:10}}>
                  {['🔒 SSL','💳 Tarjeta','📱 Bizum'].map(t=><span key={t} style={{fontSize:11,color:'#888'}}>{t}</span>)}
                </div>
              </div>
            )}
            {paso===1&&<p style={{textAlign:'center',fontSize:11,color:'#aaa',marginTop:8}}>🔒 Pago seguro · Devolución 14 días</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
