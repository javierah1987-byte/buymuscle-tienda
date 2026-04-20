// @ts-nocheck
'use client'
import{useCart}from'@/lib/cart'
import Link from'next/link'
export default function SideCart({open,onClose}){
  const{items,remove,updateQty}=useCart()
  const sub=items.reduce((s,i)=>s+i.price*i.qty,0)
  const ship=sub>=50?0:4.90,total=sub*1.21+ship
  const rem=Math.max(0,50-sub),pct=Math.min(100,sub/50*100)
  return(<>
    {open&&<div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000}}/>}
    <div style={{position:'fixed',top:0,right:0,height:'100vh',width:380,maxWidth:'90vw',background:'white',zIndex:1001,boxShadow:'-4px 0 20px rgba(0,0,0,0.15)',transform:open?'translateX(0)':'translateX(100%)',transition:'transform 0.3s ease',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'16px 20px',borderBottom:'1px solid #f0f0f0',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#111'}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:900,color:'white',textTransform:'uppercase'}}>🛒 Carrito ({items.reduce((s,i)=>s+i.qty,0)})</h3>
        <button onClick={onClose} style={{background:'none',border:'none',color:'white',fontSize:22,cursor:'pointer',lineHeight:1}}>✕</button>
      </div>
      <div style={{background:sub>=50?'#22c55e':'#f5f5f5',padding:'10px 20px',fontSize:12,fontWeight:700}}>
        {sub>=50?<span style={{color:'white'}}>🎉 ¡Envío GRATIS!</span>
        :<><span style={{color:'#555'}}>🚚 Te faltan <strong style={{color:'#ff1e41'}}>{rem.toFixed(2)} €</strong> para envío gratis</span>
          <div style={{height:3,background:'#ddd',marginTop:6,borderRadius:2}}><div style={{height:3,background:'linear-gradient(90deg,#ff1e41,#ffd700)',width:pct+'%',borderRadius:2,transition:'width 0.4s'}}/></div></>}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'0 20px'}}>
        {items.length===0?
          <div style={{textAlign:'center',padding:'3rem 0',color:'#aaa'}}>
            <div style={{fontSize:48,marginBottom:12}}>🛒</div>
            <p style={{margin:'0 0 16px'}}>Tu carrito está vacío</p>
            <Link href="/tienda" onClick={onClose} style={{background:'#ff1e41',color:'white',padding:'10px 20px',textDecoration:'none',fontWeight:700,fontSize:13,display:'inline-block'}}>Ver productos</Link>
          </div>
        :items.map(i=>(
          <div key={i.id+(i.variant||'')} style={{display:'flex',gap:12,padding:'14px 0',borderBottom:'1px solid #f5f5f5',alignItems:'center'}}>
            <Link href={'/producto/'+i.id} onClick={onClose}>
              {i.image?<img src={i.image} alt={i.name} style={{width:60,height:60,objectFit:'contain',background:'#f9f9f9',flexShrink:0}}/>
              :<div style={{width:60,height:60,background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>📦</div>}
            </Link>
            <div style={{flex:1,minWidth:0}}>
              <p style={{margin:'0 0 4px',fontSize:12,fontWeight:600,color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.name}</p>
              {i.variant&&<p style={{margin:'0 0 6px',fontSize:11,color:'#aaa'}}>{i.variant}</p>}
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{display:'flex',border:'1px solid #ddd'}}>
                  <button onClick={()=>updateQty(i.id,i.variant,i.qty-1)} style={{border:'none',background:'none',width:28,height:28,cursor:'pointer',fontSize:16}}>−</button>
                  <span style={{width:28,textAlign:'center',fontSize:13,fontWeight:600,lineHeight:'28px'}}>{i.qty}</span>
                  <button onClick={()=>updateQty(i.id,i.variant,i.qty+1)} style={{border:'none',background:'none',width:28,height:28,cursor:'pointer',fontSize:16}}>+</button>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:'#ff1e41'}}>{(i.price*i.qty).toFixed(2)} €</span>
              </div>
            </div>
            <button onClick={()=>remove(i.id,i.variant)} style={{background:'none',border:'none',color:'#ccc',cursor:'pointer',fontSize:18,padding:0,flexShrink:0}}>🗑</button>
          </div>
        ))}
      </div>
      {items.length>0&&(
        <div style={{padding:'16px 20px',borderTop:'2px solid #f0f0f0'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13,color:'#666'}}><span>Subtotal (IVA)</span><span>{(sub*1.21).toFixed(2)} €</span></div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12,fontSize:13,color:'#666'}}><span>Envío</span><span style={{color:ship===0?'#22c55e':'inherit'}}>{ship===0?'GRATIS':ship.toFixed(2)+' €'}</span></div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,fontSize:18,fontWeight:900}}><span>TOTAL</span><span style={{color:'#ff1e41'}}>{total.toFixed(2)} €</span></div>
          <Link href="/carrito" onClick={onClose} style={{display:'block',background:'#ff1e41',color:'white',textAlign:'center',padding:'14px',fontWeight:900,fontSize:14,textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.05em'}}>Finalizar pedido →</Link>
        </div>
      )}
    </div>
  </>)
                       }
