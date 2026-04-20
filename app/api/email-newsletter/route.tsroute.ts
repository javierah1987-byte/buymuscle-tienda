// @ts-nocheck
import{NextResponse}from 'next/server'
export const dynamic='force-dynamic'
export async function POST(req){
  try{
    const{subject,body,subs}=await req.json()
    const key=process.env.RESEND_API_KEY
    if(!key) return NextResponse.json({ok:false,error:'No RESEND_API_KEY'})
    const emails=Array.isArray(subs)?subs.filter(Boolean):[]
    let sent=0
    for(let i=0;i<emails.length;i+=50){
      const batch=emails.slice(i,i+50)
      await Promise.allSettled(batch.map(email=>
        fetch('https://api.resend.com/emails',{method:'POST',
          headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
          body:JSON.stringify({from:'BUYMUSCLE <newsletter@pruebasgrupoaxen.com>',to:email,subject,
            html:body+'<br><br><p style="font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:8px">Para darte de baja escribe a tienda@buymuscle.es · BUYMUSCLE, Telde, Las Palmas</p>'})})
      ))
      sent+=batch.length
    }
    return NextResponse.json({ok:true,sent})
  }catch(e){return NextResponse.json({ok:false,error:String(e)})}
}
