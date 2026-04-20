// @ts-nocheck
export const dynamic='force-dynamic'

export async function POST(req:Request){
  try{
    const body=await req.json()
    const{order_id,customer_email,customer_name,items,total,shipping_address}=body

    if(!customer_email||!order_id) return new Response(JSON.stringify({error:'Faltan datos'}),{status:400})

    const RESEND_KEY=process.env.RESEND_API_KEY
    if(!RESEND_KEY) return new Response(JSON.stringify({error:'Sin Resend key'}),{status:500})

    const itemsHtml=(items||[]).map((i:any)=>`
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f5f5f5;font-size:14px;color:#333">${i.name}${i.variant?' ('+i.variant+')':''}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f5f5f5;font-size:14px;text-align:center">${i.qty}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f5f5f5;font-size:14px;text-align:right;font-weight:700;color:#ff1e41">${Number(i.price*i.qty).toFixed(2)} €</td>
      </tr>
    `).join('')

    const html=`
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
      <div style="max-width:600px;margin:0 auto;padding:20px">
        <!-- Header -->
        <div style="background:#111;padding:32px;text-align:center;margin-bottom:0">
          <h1 style="color:#ff1e41;font-size:28px;font-weight:900;margin:0;letter-spacing:-1px">BUYMUSCLE</h1>
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:8px 0 0">Tu tienda de suplementación en Canarias</p>
        </div>
        <!-- Confirmación -->
        <div style="background:#ff1e41;padding:20px 32px;text-align:center">
          <div style="font-size:32px;margin-bottom:8px">✅</div>
          <h2 style="color:white;font-size:20px;font-weight:900;margin:0 0 6px;text-transform:uppercase">¡Pedido confirmado!</h2>
          <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0">Nº de pedido: <strong>#${order_id.slice(0,8).toUpperCase()}</strong></p>
        </div>
        <!-- Cuerpo -->
        <div style="background:white;padding:32px">
          <p style="font-size:15px;color:#333;margin:0 0 24px">Hola <strong>${customer_name||'cliente'}</strong>,</p>
          <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px">
            ¡Gracias por tu pedido! Lo estamos preparando con todo el cuidado. Recibirás una notificación cuando salga de nuestro almacén con el número de seguimiento.
          </p>
          <!-- Productos -->
          <h3 style="font-size:14px;font-weight:700;text-transform:uppercase;color:#111;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #ff1e41">Resumen del pedido</h3>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th style="text-align:left;font-size:12px;color:#aaa;font-weight:600;padding-bottom:8px;text-transform:uppercase">Producto</th>
                <th style="text-align:center;font-size:12px;color:#aaa;font-weight:600;padding-bottom:8px;text-transform:uppercase">Cant.</th>
                <th style="text-align:right;font-size:12px;color:#aaa;font-weight:600;padding-bottom:8px;text-transform:uppercase">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px 0 0;font-size:15px;font-weight:700;color:#111">TOTAL</td>
                <td style="padding:12px 0 0;font-size:18px;font-weight:900;color:#ff1e41;text-align:right">${Number(total||0).toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>
          ${shipping_address?`<div style="background:#f9f9f9;padding:16px;margin-top:24px;border-left:3px solid #ff1e41">
            <div style="font-size:12px;color:#aaa;font-weight:600;text-transform:uppercase;margin-bottom:4px">Dirección de envío</div>
            <div style="font-size:14px;color:#333">${shipping_address}</div>
          </div>`:''}
          <!-- Contacto -->
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #f0f0f0;text-align:center">
            <p style="font-size:13px;color:#666;margin:0 0 12px">¿Tienes alguna pregunta sobre tu pedido?</p>
            <a href="https://wa.me/34828048310" style="background:#25D366;color:white;padding:10px 20px;text-decoration:none;font-weight:700;font-size:13px;display:inline-block">WhatsApp 828 048 310</a>
          </div>
        </div>
        <!-- Footer -->
        <div style="text-align:center;padding:20px;font-size:11px;color:#aaa">
          <p style="margin:0">BUYMUSCLE · Las Palmas de Gran Canaria · <a href="https://buymuscle-tienda.vercel.app" style="color:#ff1e41">tienda.buymuscle.es</a></p>
        </div>
      </div>
    </body></html>
    `

    const r=await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{'Authorization':'Bearer '+RESEND_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({
        from:'BuyMuscle <pedidos@buymuscle.es>',
        to:[customer_email],
        subject:'✅ Pedido confirmado #'+order_id.slice(0,8).toUpperCase()+' - BUYMUSCLE',
        html
      })
    })
    const d=await r.json()
    if(!r.ok) return new Response(JSON.stringify({error:d}),{status:500})
    return new Response(JSON.stringify({ok:true,id:d.id}),{status:200})
  }catch(e:any){
    return new Response(JSON.stringify({error:e.message}),{status:500})
  }
                        }
