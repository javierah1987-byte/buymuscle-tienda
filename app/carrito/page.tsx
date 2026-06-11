// @ts-nocheck
'use client'
import { useCart } from '@/lib/cart'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import PayPalButton from '@/components/PayPalButton'
import { trackBeginCheckout } from '@/lib/analytics'

const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function RecomendadosVacio() {
  const [prods, setProds] = useState([])
  const { add } = useCart()
  useEffect(()=>{
    fetch(S+'/rest/v1/products?active=eq.true&stock=gt.0&order=id.desc&limit=4&select=id,name,price_incl_tax,sale_price,on_sale,image_url,categories(name)',{headers:{apikey:K,'Authorization':'Bearer '+K}})
      .then(r=>r.json()).then(d=>Array.isArray(d)&&setProds(d)).catch(()=>{})
  },[])
  if(!prods.length) return null
  return(
    <div style={{marginTop:32}}>
      <h3 style={{fontSize:14,fontWeight:700,color:'#111',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.05em'}}>Los mas vendidos — no te vayas sin nada 🔥</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
        {prods.map(p=>{
          const price = Number((p.on_sale&&p.sale_price)?p.sale_price:p.price_incl_tax)
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
  const { items, updateQty, remove, clear } = useCart()
  const [paso, setPaso] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(function(){
    function check(){ setIsMobile(window.innerWidth<=768) }
    check(); window.addEventListener('resize',check)
    return function(){ window.removeEventListener('resize',check) }
  },[])
  const [form, setForm] = useState({name:'',email:'',phone:'',address:'',city:'',postal_code:'',province:'',nif:'',notes:''})
  const [coupon, setCoupon] = useState('')
  const [discountInfo, setDiscountInfo] = useState(null) // { type:'percent'|'fixed', value, discountAmt }
  const [discountMsg, setDiscountMsg] = useState('')
  const [ordering, setOrdering] = useState(false)
  // Clave de idempotencia: una por carga de página. Si la red móvil reintenta
  // o el cliente pulsa dos veces, el servidor devuelve el MISMO pedido en vez
  // de crear un duplicado.
  const [idemKey] = useState(() =>
    (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2))

  // Analítica: begin_checkout al entrar en el paso de datos
  useEffect(()=>{
    if(paso===2) trackBeginCheckout(total)
  },[paso]) // eslint-disable-line react-hooks/exhaustive-deps

  // Captura de carrito abandonado: cuando el cliente ya dio su email en el
  // checkout, registramos el carrito (RLS permite INSERT público). Una vez por
  // email y sesión; si completa la compra, el servidor lo marca recuperado.
  useEffect(()=>{
    if(paso!==2||items.length===0) return
    const email=(form.email||'').trim().toLowerCase()
    if(!email.includes('@')||!email.includes('.')) return
    const flag='bm_abandoned_'+email
    if(sessionStorage.getItem(flag)) return
    const t=setTimeout(()=>{
      sessionStorage.setItem(flag,'1')
      fetch(S+'/rest/v1/abandoned_carts',{method:'POST',
        headers:{apikey:K,'Authorization':'Bearer '+K,'Content-Type':'application/json','Prefer':'return=minimal'},
        body:JSON.stringify({email,cart_data:items.map(i=>({name:i.name,price:i.price,qty:i.qty})),total})
      }).catch(()=>{})
    },2000)
    return ()=>clearTimeout(t)
  },[paso,form.email,items]) // eslint-disable-line react-hooks/exhaustive-deps

  const subtotal = items.reduce((s,i)=>s+i.price*i.qty,0)
  const shippingFree = subtotal >= 50
  const shipping = shippingFree ? 0 : 4.90
  // Se recalcula en cliente por si el carrito cambia tras aplicar el cupón
  // (misma aritmética que el servidor: % sobre subtotal o importe fijo capado).
  const discountAmt = discountInfo
    ? (discountInfo.type === 'percent'
        ? subtotal * (Number(discountInfo.value) / 100)
        : Math.min(Number(discountInfo.value), subtotal))
    : 0
  const total = subtotal - discountAmt + shipping

  // Validación informativa vía servidor (RLS impide leer discount_codes como
  // invitado). /api/create-order revalida el cupón de forma autoritativa.
  async function applyCoupon() {
    const code = coupon.trim()
    if(!code) return
    try {
      const r = await fetch('/api/validate-coupon', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ code, subtotal })
      })
      if(r.status === 429){ setDiscountInfo(null); setDiscountMsg('Demasiados intentos. Espera unos minutos y vuelve a probar.'); return }
      const d = await r.json()
      if(d && d.ok && d.valid) {
        setDiscountInfo({ type: d.type, value: Number(d.value), discountAmt: Number(d.discountAmt) })
        setDiscountMsg(d.type === 'percent'
          ? 'Descuento del '+d.value+'% aplicado'
          : 'Descuento de '+Number(d.discountAmt).toFixed(2)+' € aplicado')
      } else {
        setDiscountInfo(null)
        setDiscountMsg('Código no válido o caducado')
      }
    } catch {
      setDiscountInfo(null)
      setDiscountMsg('No se pudo comprobar el código. Inténtalo de nuevo.')
    }
  }

  async function doOrder(method) {
    if(!form.name||!form.email){ alert('Por favor indica tu nombre y email para continuar'); return }
    if(!items.length){ return }
    setOrdering(true)
    try {
      const r = await fetch('/api/create-order', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          customer: {
            name: form.name, email: form.email, phone: form.phone,
            address: form.address, city: form.city, postal_code: form.postal_code,
            province: form.province, nif: form.nif, notes: form.notes,
          },
          items: items.map(i => ({
            product_id: i.id,
            variant_id: i.variantId || null,
            name: i.name,
            qty: i.qty,
            variant: i.variant || '',
          })),
          payment_method: method || 'transfer',
          discount_code: discountInfo ? coupon.trim() : '',
          idempotency_key: idemKey,
          channel: 'web',
        })
      })
      const data = await r.json()
      if(!r.ok || !data.ok){
        if(data.error === 'sin_stock') alert('Lo sentimos, uno de los productos se ha quedado sin stock.')
        else alert('No se pudo procesar el pedido. Inténtalo de nuevo o llámanos al 828 048 310.')
        setOrdering(false)
        return
      }
      const orderNum = data.order_number
      clear()
      if(typeof window !== 'undefined') window.location.href = '/pedido-confirmado?n='+orderNum+(method==='transfer'?'&pm=transfer':'')
    } catch(e) {
      alert('Error de conexión al procesar el pedido. Inténtalo de nuevo.')
    }
    setOrdering(false)
  }

  // Datos del carrito para el flujo PayPal (importe se recalcula en servidor)
  function orderPayload(){
    return {
      customer: {
        name: form.name, email: form.email, phone: form.phone,
        address: form.address, city: form.city, postal_code: form.postal_code,
        province: form.province, nif: form.nif, notes: form.notes,
      },
      items: items.map(i => ({
        product_id: i.id, variant_id: i.variantId || null,
        name: i.name, qty: i.qty, variant: i.variant || '',
      })),
      discount_code: discountInfo ? coupon.trim() : '',
      channel: 'web',
    }
  }
  function paypalValidate(){
    if(!form.name||!form.email){ alert('Por favor indica tu nombre y email para continuar'); return false }
    if(!items.length) return false
    return true
  }
  function onPaypalSuccess(orderNum){
    clear()
    if(typeof window !== 'undefined') window.location.href = '/pedido-confirmado?n='+orderNum
  }

  return(
    <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 20px'}}>
      <h1 style={{fontSize:14,color:'#888',margin:'0 0 24px',fontWeight:400}}>Inicio › <strong style={{color:'#111'}}>Mi Carrito</strong></h1>

      {/* Pasos */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',marginBottom:24,border:'1px solid #e8e8e8',borderRadius:4,overflow:'hidden'}} className="checkout-steps">
        {['1. CARRITO','2. DATOS','3. CONFIRMACION'].map((s,i)=>(
          <div key={s} style={{padding:'12px',textAlign:'center',background:paso===i+1?'#ff1e41':paso>i+1?'#111':'white',color:paso===i+1||paso>i+1?'white':'#999',fontSize:12,fontWeight:700,letterSpacing:'0.05em'}}>{s}</div>
        ))}
      </div>

      <div className="carrito-grid" style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:24,alignItems:'start'}}>
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
                    <button onClick={clear} style={{background:'none',border:'none',color:'#767676',cursor:'pointer',fontSize:12}}>Vaciar carrito</button>
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
                        <button onClick={()=>remove(item.id,item.variant)} aria-label={'Eliminar '+item.name+' del carrito'} style={{background:'none',border:'none',color:'#ccc',cursor:'pointer',fontSize:18,lineHeight:1}}>✕</button>
                        <div style={{display:'flex',alignItems:'center',border:'1px solid #e8e8e8',borderRadius:4}}>
                          <button onClick={()=>updateQty(item.id,item.variant,Math.max(1,item.qty-1))} aria-label={'Disminuir cantidad de '+item.name} style={{width:28,height:28,border:'none',background:'none',cursor:'pointer',fontSize:16}}>−</button>
                          <span style={{width:32,textAlign:'center',fontSize:13,fontWeight:600}}>{item.qty}</span>
                          <button onClick={()=>updateQty(item.id,item.variant,item.qty+1)} aria-label={'Aumentar cantidad de '+item.name} style={{width:28,height:28,border:'none',background:'none',cursor:'pointer',fontSize:16}}>+</button>
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
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}} className="form-grid-2">
                {[['name','Nombre completo *'],['email','Email *'],['phone','Telefono'],['address','Direccion'],['city','Ciudad'],['postal_code','Cod. Postal'],['province','Provincia'],['nif','NIF/CIF']].map(([k,l])=>(
                  <div key={k} style={{gridColumn:k==='address'||k==='notes'?'1/-1':'auto'}}>
                    <label style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4}}>{l}</label>
                    <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} aria-label={l.replace(' *','')}
                      style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e0',borderRadius:4,fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}}/>
                  </div>
                ))}
                <div style={{gridColumn:'1/-1'}}>
                  <label style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4}}>Notas del pedido (opcional)</label>
                  <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} aria-label="Notas del pedido"
                    style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e0',borderRadius:4,fontSize:13,fontFamily:'inherit',resize:'vertical',boxSizing:'border-box'}}/>
                </div>
              </div>
              <button onClick={()=>setPaso(1)} style={{marginTop:12,background:'none',border:'none',color:'#767676',cursor:'pointer',fontSize:12}}>← Volver al carrito</button>
            </div>
          )}
        </div>

        {/* RESUMEN LATERAL */}
        <div className="carrito-resumen" style={{position:'sticky',top:20}}>
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
              {discountAmt>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#22c55e'}}><span>Descuento{discountInfo?.type==='percent'?' -'+discountInfo.value+'%':''}</span><span>-{discountAmt.toFixed(2)} €</span></div>}
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
                  <input value={coupon} onChange={e=>setCoupon(e.target.value)} onKeyDown={e=>e.key==='Enter'&&applyCoupon()} placeholder="Codigo descuento" aria-label="Código de descuento" style={{flex:1,padding:'8px 10px',border:'1px solid #e0e0e0',borderRadius:4,fontSize:12}}/>
                  <button onClick={applyCoupon} aria-label="Aplicar código de descuento" style={{padding:'8px 12px',background:'#111',color:'white',border:'none',borderRadius:4,cursor:'pointer',fontSize:12,fontWeight:700}}>OK</button>
                </div>
                {discountMsg&&<p style={{fontSize:11,color:discountInfo?'#22c55e':'#ef4444',marginTop:4}}>{discountMsg}</p>}
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
                <button onClick={()=>doOrder('transfer')} disabled={ordering||!form.name||!form.email}
                  style={{width:'100%',padding:'13px',background:ordering?'#ccc':'#ff1e41',border:'none',color:'white',fontWeight:700,fontSize:14,cursor:'pointer',borderRadius:4,opacity:(!form.name||!form.email||!form.address)?0.6:1}}>
                  {ordering?'Procesando...':'📦 PEDIDO POR TRANSFERENCIA — '+total.toFixed(2)+' €'}
                </button>
                <p style={{fontSize:11,color:'#888',margin:'6px 0 0',textAlign:'center'}}>Te enviaremos los datos bancarios. El pedido se prepara al recibir el pago.</p>
                {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && (
                  <>
                    <div style={{textAlign:'center',margin:'10px 0 4px',fontSize:11,color:'#bbb',letterSpacing:'0.05em'}}>— o paga con —</div>
                    <div style={{marginBottom:8}}>
                      <PayPalButton
                        getPayload={orderPayload}
                        validate={paypalValidate}
                        onSuccess={onPaypalSuccess}
                        onError={(e)=>alert(e?.message||'No se pudo completar el pago con PayPal')}
                      />
                    </div>
                  </>
                )}
                <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:10}}>
                  {['🔒 SSL','PayPal','Transferencia bancaria'].map(t=><span key={t} style={{fontSize:11,color:'#888'}}>{t}</span>)}
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
