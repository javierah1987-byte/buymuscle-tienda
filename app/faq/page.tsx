// @ts-nocheck
'use client'
import{useState}from 'react'
const FAQS=[
  {c:'🚚 Envíos',q:[
    ['¿Cuánto tarda el pedido?','Pedidos antes de las 14:00h salen el mismo día. Plazo: 24-48h península, 3-5 días Canarias.'],
    ['¿Cuánto cuesta el envío?','4,90€. Pedidos superiores a 50€ tienen envío GRATIS automáticamente.'],
    ['¿Puedo hacer seguimiento?','Sí. Recibirás el número de seguimiento por email en cuanto salga tu pedido.'],
  ]},
  {c:'💳 Pagos',q:[
    ['¿Qué métodos de pago aceptan?','Tarjeta (Visa/Mastercard), transferencia bancaria y contra reembolso. Todos 100% seguros.'],
    ['¿Los precios incluyen IVA?','Sí, todos los precios incluyen IVA (21%). Sin sorpresas en el checkout.'],
    ['¿Es seguro comprar aquí?','Completamente. Certificado SSL, cumplimiento RGPD. Nunca guardamos datos de tu tarjeta.'],
  ]},
  {c:'📦 Productos',q:[
    ['¿Los productos son originales?','100%. Solo trabajamos con distribuidores y marcas oficiales. Sin falsificaciones.'],
    ['¿Qué proteína recomendáis para empezar?','Para principiantes: whey concentrada. Con intolerancia a lactosa: isolada. Escríbenos y te asesoramos.'],
    ['¿Los suplementos tienen fecha de caducidad?','Sí, todos visible en el envase. Garantizamos mínimo 6 meses de vida útil.'],
  ]},
  {c:'🔄 Devoluciones',q:[
    ['¿Puedo devolver un producto?','14 días desde recepción, sin abrir y en perfecto estado. Productos alimenticios abiertos no aplica.'],
    ['¿Cuándo recibo el reembolso?','3-5 días laborables desde que recibimos y verificamos el producto.'],
  ]},
]
export default function FAQ(){
  const[open,setOpen]=useState(null)
  return(
    <div style={{background:'#f8f8f8',minHeight:'60vh',fontFamily:'Arial,sans-serif'}}>
      <div style={{background:'#111',color:'white',padding:'50px 20px',textAlign:'center'}}>
        <h1 style={{fontSize:32,fontWeight:900,margin:'0 0 12px',textTransform:'uppercase'}}>Preguntas Frecuentes</h1>
        <p style={{color:'rgba(255,255,255,0.65)',fontSize:15,margin:0}}>Todo lo que necesitas saber sobre BuyMuscle</p>
      </div>
      <div style={{maxWidth:780,margin:'0 auto',padding:'48px 20px'}}>
        {FAQS.map(cat=>(
          <div key={cat.c} style={{marginBottom:36}}>
            <h2 style={{fontSize:15,fontWeight:800,color:'#111',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:16,paddingBottom:8,borderBottom:'2px solid #ff1e41'}}>{cat.c}</h2>
            {cat.q.map(([q,a],i)=>{
              const id=cat.c+i,isOpen=open===id
              return(
                <div key={i} style={{background:'white',marginBottom:6,border:'1px solid #e8e8e8'}}>
                  <button onClick={()=>setOpen(isOpen?null:id)}
                    style={{width:'100%',textAlign:'left',padding:'14px 18px',background:'none',border:'none',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',fontFamily:'inherit'}}>
                    <span style={{fontSize:14,fontWeight:600,color:'#111',flex:1,paddingRight:12}}>{q}</span>
                    <span style={{fontSize:20,color:'#ff1e41',flexShrink:0,display:'inline-block',transform:isOpen?'rotate(45deg)':'none',transition:'transform 0.2s'}}>+</span>
                  </button>
                  {isOpen&&<p style={{padding:'12px 18px 16px',fontSize:14,color:'#555',lineHeight:1.7,margin:0}}>{a}</p>}
                </div>
              )
            })}
          </div>
        ))}
        <div style={{background:'#ff1e41',padding:'32px',textAlign:'center',marginTop:20}}>
          <h3 style={{color:'white',fontSize:16,fontWeight:700,margin:'0 0 12px'}}>¿No encuentras tu respuesta?</h3>
          <a href="https://wa.me/34828048310" style={{background:'white',color:'#ff1e41',padding:'10px 24px',textDecoration:'none',fontWeight:700,fontSize:13,display:'inline-block'}}>WhatsApp 828 048 310</a>
        </div>
      </div>
    </div>
  )
}
