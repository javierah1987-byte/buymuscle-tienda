// @ts-nocheck
import{NextResponse}from 'next/server'
export const dynamic='force-dynamic'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K}
// GET /api/cron-abandoned?key=BM_CRON_2025
// Configura en vercel.json: {"crons":[{"path":"/api/cron-abandoned?key=BM_CRON_2025","schedule":"0 */2 * * *"}]}
export async function GET(req){
  const{searchParams}=new URL(req.url)
  if(searchParams.get('key')!=='BM_CRON_2025') return NextResponse.json({error:'Unauthorized'},{status:401})
  try{
    const twoHoursAgo=new Date(Date.now()-2*60*60*1000).toISOString()
    const r=await fetch(
      S+'/rest/v1/abandoned_carts?recovery_email_sent=eq.false&created_at=lt.'+twoHoursAgo+'&customer_email=not.is.null&limit=50',
      {headers:h}
    )
    const carts=await r.json()
    if(!Array.isArray(carts)||carts.length===0) return NextResponse.json({ok:true,sent:0})
    const resendKey=process.env.RESEND_API_KEY
    let sent=0
    for(const cart of carts){
      if(!cart.customer_email) continue
      let items=[]
      try{items=typeof cart.items==='string'?JSON.parse(cart.items):(cart.items||[])}catch{}
      const total=items.reduce((s,i)=>s+(Number(i.price||0)*(i.qty||1)),0)
      const name=cart.customer_name||'cliente'
      if(resendKey){
        const itemsHtml=items.slice(0,3).map(i=>
          '<tr><td style="padding:6px 0;border-bottom:1px solid #f5f5f5">'+i.name+'</td><td style="padding:6px 0;border-bottom:1px solid #f5f5f5;text-align:right">'+Number((i.price||0)*(i.qty||1)).toFixed(2)+' €</td></tr>'
        ).join('')
        const html='<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">'+
          '<div style="background:#ff1e41;padding:20px 32px;text-align:center"><span style="color:white;font-size:24px;font-weight:900;font-style:italic">BUYMUSCLE</span></div>'+
          '<div style="padding:32px"><h2 style="color:#111;margin:0 0 12px">🛒 '+name+', dejaste algo en tu carrito</h2>'+
          '<p style="color:#555;margin:0 0 20px">Tienes artículos esperándote. No dejes que se agoten.</p>'+
          '<table style="width:100%;border-collapse:collapse;margin-bottom:20px">'+itemsHtml+'</table>'+
          '<div style="text-align:center;margin:24px 0"><a href="https://buymuscle-tienda.vercel.app/carrito" style="background:#ff1e41;color:white;padding:14px 32px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block">Completar mi pedido →</a></div>'+
          '<p style="color:#888;font-size:13px;text-align:center">Total estimado: <strong>'+total.toFixed(2)+' €</strong> &middot; Envío GRATIS en pedidos +50 €</p>'+
          '</div><div style="background:#111;padding:14px;text-align:center"><p style="color:#555;font-size:11px;margin:0">&copy; BuyMuscle &middot; Telde, Las Palmas &middot; <a href="mailto:tienda@buymuscle.es" style="color:#555">Darte de baja</a></p></div></div>'
        try{
          await fetch('https://api.resend.com/emails',{method:'POST',
            headers:{'Authorization':'Bearer '+resendKey,'Content-Type':'application/json'},
            body:JSON.stringify({from:'BUYMUSCLE <pedidos@pruebasgrupoaxen.com>',to:cart.customer_email,
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
