'use client'
import{useCart}from '@/lib/cart'
import Link from 'next/link'
export default function CarritoPage(){
  const{items,remove,update,total,clear}=useCart()
  if(items.length===0)return(
    <div className="container" style={{padding:'5rem 0',textAlign:'center'}}>
      <div style={{fontSize:64,marginBottom:'1.5rem'}}>🛒</div>
      <h2 style={{fontFamily:'var(--font-display)',fontSize:32,fontWeight:900,textTransform:'uppercase',marginBottom:'1rem'}}>Tu carrito está vacío</h2>
      <p style={{color:'var(--muted)',marginBottom:'2rem'}}>Descubre nuestros productos y añade lo que necesites.</p>
      <Link href="/tienda" className="btn-primary">Ir a la tienda</Link>
    </div>
  )
  const iva=total*0.21/1.21,base=total-iva,shipping=total>=50?0:4.99
  return(
    <div style={{padding:'3rem 0 5rem'}}><div className="container">
      <h1 className="section-title" style={{marginBottom:'2.5rem'}}>MI <span>CARRITO</span></h1>
      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'2.5rem',alignItems:'start'}}>
        <div className="card" style={{padding:'0 1.5rem'}}>
          {items.map(item=>(
            <div key={item.product.id} className="cart-item">
              <img src={item.product.image_url||'https://placehold.co/72x72/1a1a1a/888?text=BM'} alt={item.product.name} onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/72x72/1a1a1a/888?text=BM'}}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,textTransform:'uppercase',marginBottom:4}}>{item.product.name}</div>
                <div style={{fontSize:14,color:'var(--muted)',marginBottom:10}}>{item.unitPrice.toFixed(2)} € / ud</div>
                <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={()=>update(item.product.id,item.quantity-1)}>−</button>
                    <span style={{fontFamily:'var(--font-display)',fontSize:18,fontWeight:700,minWidth:28,textAlign:'center'}}>{item.quantity}</span>
                    <button className="qty-btn" onClick={()=>update(item.product.id,item.quantity+1)}>+</button>
                  </div>
                  <button onClick={()=>remove(item.product.id)} style={{fontSize:12,color:'var(--red)',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>Eliminar</button>
                </div>
              </div>
              <div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900,color:'var(--green)',minWidth:80,textAlign:'right'}}>{(item.unitPrice*item.quantity).toFixed(2)} €</div>
            </div>
          ))}
          <div style={{padding:'1rem 0',display:'flex',justifyContent:'flex-end'}}><button onClick={clear} style={{fontSize:13,color:'var(--muted)',textDecoration:'underline',background:'none',border:'none',cursor:'pointer'}}>Vaciar carrito</button></div>
        </div>
        <div className="card" style={{padding:'1.5rem'}}>
          <h3 style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,textTransform:'uppercase',marginBottom:'1.5rem'}}>Resumen del pedido</h3>
          <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:'1.5rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:14,color:'var(--muted)'}}><span>Base imponible</span><span>{base.toFixed(2)} €</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:14,color:'var(--muted)'}}><span>IVA (21%)</span><span>{iva.toFixed(2)} €</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:14,color:'var(--muted)'}}><span>Envío</span><span style={{color:shipping===0?'#4caf50':'var(--white)'}}>{shipping===0?'GRATIS':`${shipping.toFixed(2)} €`}</span></div>
            {shipping>0&&<div style={{fontSize:12,color:'var(--muted)',background:'var(--dark)',padding:'8px 10px',borderRadius:4}}>Añade {(50-total).toFixed(2)} € más para envío gratis</div>}
            <div style={{borderTop:'1px solid var(--border)',paddingTop:12,display:'flex',justifyContent:'space-between'}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:18,fontWeight:700,textTransform:'uppercase'}}>Total</span>
              <span style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:900,color:'var(--green)'}}>{(total+shipping).toFixed(2)} €</span>
            </div>
          </div>
          <button className="btn-primary" style={{width:'100%',padding:'16px',fontSize:'17px',justifyContent:'center'}}>Finalizar pedido</button>
          <Link href="/tienda" className="btn-outline" style={{width:'100%',padding:'12px',fontSize:'14px',justifyContent:'center',marginTop:10,display:'flex'}}>Seguir comprando</Link>
          <div style={{marginTop:'1rem',fontSize:12,color:'var(--muted)',textAlign:'center'}}>🔒 Pago seguro · SSL encriptado</div>
        </div>
      </div>
    </div></div>
  )
}
