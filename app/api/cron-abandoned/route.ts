// @ts-nocheck
import{NextResponse}from 'next/server'
import{denyIfUnauthorizedCron}from '@/lib/cronAuth'
export const dynamic='force-dynamic'
const S=process.env.NEXT_PUBLIC_SUPABASE_URL
// Service role: la tabla abandoned_carts solo permite LECTURA/UPDATE a roles
// privilegiados (RLS). Con la anon key el cron leía 0 filas y el PATCH se
// rechazaba en silencio → nunca enviaba ni marcaba nada.
const SK=process.env.SUPABASE_SERVICE_ROLE_KEY
const h={apikey:SK,'Authorization':'Bearer '+SK}
// GET /api/cron-abandoned  — autorizado por 'Authorization: Bearer <CRON_SECRET>'
// (lo inyecta Vercel Cron) o, por compat, ?key=<CRON_SECRET>. FAIL-CLOSED: sin
// CRON_SECRET en el entorno se deniega (ya no hay default committeado).
export async function GET(req){
  const denied=denyIfUnauthorizedCron(req); if(denied) return denied
  if(!S||!SK) return NextResponse.json({error:'server_misconfigured'},{status:500})
  try{
    const twoHoursAgo=new Date(Date.now()-2*60*60*1000).toISOString()
    // Columnas reales de abandoned_carts: email, cart_data (jsonb), total
    // (el código anterior filtraba por customer_email/items, que no existen →
    // el cron nunca encontraba carritos).
    const r=await fetch(
      S+'/rest/v1/abandoned_carts?recovery_email_sent=eq.false&recovered=eq.false&created_at=lt.'+twoHoursAgo+'&email=not.is.null&limit=50',
      {headers:h}
    )
    const carts=await r.json()
    if(!Array.isArray(carts)||carts.length===0) return NextResponse.json({ok:true,sent:0})
    const resendKey=process.env.RESEND_API_KEY
    let sent=0
    for(const cart of carts){
      if(!cart.email) continue
      // cart_data puede ser array de items o {items:[...]} (mismo parseo que /admin/abandoned)
      let items=[]
      try{
        const raw=typeof cart.cart_data==='string'?JSON.parse(cart.cart_data):cart.cart_data
        if(Array.isArray(raw)) items=raw
        else if(raw&&Array.isArray(raw.items)) items=raw.items
      }catch{}
      const total=Number(cart.total)||items.reduce((s,i)=>s+(Number(i.price||0)*(i.qty||1)),0)
      const name='cliente'
      if(resendKey){
        const itemsHtml=items.slice(0,3).map(i=>
          '<tr><td style="padding:6px 0;border-bottom:1px solid #f5f5f5">'+i.name+'</td><td style="padding:6px 0;border-bottom:1px solid #f5f5f5;text-align:right">'+Number((i.price||0)*(i.qty||1)).toFixed(2)+' €</td></tr>'
        ).join('')
        const html='<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">'+
          '<div style="background:#ff1e41;padding:20px 32px;text-align:center"><span style="color:white;font-size:24px;font-weight:900;font-style:italic">BUYMUSCLE</span></div>'+
          '<div style="padding:32px"><h2 style="color:#111;margin:0 0 12px">🛒 '+name+', dejaste algo en tu carrito</h2>'+
          '<p style="color:#555;margin:0 0 20px">Tienes artículos esperándote. No dejes que se agoten.</p>'+
          '<table style="width:100%;border-collapse:collapse;margin-bottom:20px">'+itemsHtml+'</table>'+
          '<div style="text-align:center;margin:24px 0"><a href="https://tienda.buymuscle.es/carrito" style="background:#ff1e41;color:white;padding:14px 32px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block">Completar mi pedido →</a></div>'+
          '<p style="color:#888;font-size:13px;text-align:center">Total estimado: <strong>'+total.toFixed(2)+' €</strong> &middot; Envío GRATIS en pedidos +50 €</p>'+
          '</div><div style="background:#111;padding:14px;text-align:center"><p style="color:#555;font-size:11px;margin:0">&copy; BuyMuscle &middot; Telde, Las Palmas &middot; <a href="mailto:tienda@buymuscle.es" style="color:#555">Darte de baja</a></p></div></div>'
        try{
          await fetch('https://api.resend.com/emails',{method:'POST',
            headers:{'Authorization':'Bearer '+resendKey,'Content-Type':'application/json'},
            body:JSON.stringify({from:'BUYMUSCLE <pedidos@buymuscle.es>',to:cart.email,
              subject:'🛒 '+name+', olvidaste completar tu pedido',html})})
        }catch(e){console.error('email error:',e)}
      }
      await fetch(S+'/rest/v1/abandoned_carts?id=eq.'+cart.id,{method:'PATCH',
        headers:{...h,'Content-Type':'application/json'},
        body:JSON.stringify({recovery_email_sent:true,recovery_sent_at:new Date().toISOString()})})
      sent++
    }
    return NextResponse.json({ok:true,sent,total:carts.length})
  }catch(e){return NextResponse.json({ok:false,error:String(e)},{status:500})}
          }
