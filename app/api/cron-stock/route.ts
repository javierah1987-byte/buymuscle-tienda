// @ts-nocheck
import{NextResponse}from 'next/server'
export const dynamic='force-dynamic'
// GET /api/cron-stock?key=BM_CRON_2025
// vercel.json: {"crons":[...,{"path":"/api/cron-stock?key=BM_CRON_2025","schedule":"0 8 * * *"}]}
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const h={apikey:K,'Authorization':'Bearer '+K}
export async function GET(req){
  const{searchParams}=new URL(req.url)
  if(searchParams.get('key')!=='BM_CRON_2025') return NextResponse.json({error:'Unauthorized'},{status:401})
  try{
    const threshold=parseInt(searchParams.get('threshold')||'10')
    const r=await fetch(S+'/rest/v1/products?active=eq.true&stock=lte.'+threshold+'&select=id,name,stock,brand&order=stock.asc&limit=50',{headers:h})
    const prods=await r.json()
    if(!Array.isArray(prods)||prods.length===0) return NextResponse.json({ok:true,sent:false,msg:'No stock critico'})
    const resendKey=process.env.RESEND_API_KEY
    if(!resendKey) return NextResponse.json({ok:true,sent:false,prods:prods.length,msg:'Sin Resend key'})
    const rows=prods.map(p=>'<tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0">'+p.name+'</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:center;color:'+(p.stock===0?'#ef4444':'#f59e0b')+';font-weight:700">'+(p.stock===0?'SIN STOCK':p.stock+' ud')+'</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;color:#888;font-size:12px">'+p.brand+'</td></tr>').join('')
    const html='<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#ff1e41;padding:20px 32px;text-align:center"><h1 style="color:white;margin:0;font-style:italic">BUYMUSCLE</h1></div><div style="padding:28px"><h2 style="color:#333;margin:0 0 16px">⚠️ Alerta de stock critico</h2><p style="color:#666;margin:0 0 20px">Los siguientes productos tienen stock por debajo de '+threshold+' unidades:</p><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f8f8f8"><th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#888">Producto</th><th style="padding:8px 12px;font-size:12px;text-transform:uppercase;color:#888">Stock</th><th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#888">Marca</th></tr></thead><tbody>'+rows+'</tbody></table><div style="margin-top:20px;text-align:center"><a href="https://buymuscle-tienda.vercel.app/admin/stock" style="background:#ff1e41;color:white;padding:12px 24px;text-decoration:none;font-weight:700;display:inline-block">Gestionar stock</a></div></div><div style="background:#111;padding:14px;text-align:center"><p style="color:#555;font-size:12px;margin:0">Alerta automatica diaria • BuyMuscle Admin</p></div></div>'
    await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+resendKey,'Content-Type':'application/json'},
      body:JSON.stringify({from:'BUYMUSCLE Admin <pedidos@pruebasgrupoaxen.com>',to:'javierah1987@gmail.com',subject:'⚠️ '+prods.length+' productos con stock critico hoy',html})})
    return NextResponse.json({ok:true,sent:true,products:prods.length})
  }catch(e){return NextResponse.json({ok:false,error:String(e)},{status:500})}
}
