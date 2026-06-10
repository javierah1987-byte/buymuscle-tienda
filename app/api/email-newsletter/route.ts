// @ts-nocheck
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// POST /api/email-newsletter  { subject, body, subs:[email] }
// Solo admin (evita usarlo como relé de spam). Envía en lotes de 50 vía Resend.
export async function POST(req){
  try{
    const admin = await getAdminUser()
    if(!admin) return NextResponse.json({ ok:false, error:'no_autorizado' }, { status:401 })

    const { subject, body, subs } = await req.json()
    const key = process.env.RESEND_API_KEY
    if(!key) return NextResponse.json({ ok:false, error:'No RESEND_API_KEY' }, { status:500 })
    if(!subject || !body) return NextResponse.json({ ok:false, error:'faltan_campos' }, { status:400 })

    const emails = Array.isArray(subs) ? subs.filter(Boolean) : []
    let sent = 0
    for(let i=0;i<emails.length;i+=50){
      const batch = emails.slice(i,i+50)
      await Promise.allSettled(batch.map(email =>
        fetch('https://api.resend.com/emails',{method:'POST',
          headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
          body:JSON.stringify({from:'BUYMUSCLE <newsletter@buymuscle.es>',to:email,subject,
            html:body+'<br><br><p style="font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:8px">Para darte de baja escribe a tienda@buymuscle.es · BUYMUSCLE, Telde, Las Palmas</p>'})})
      ))
      sent += batch.length
    }
    return NextResponse.json({ ok:true, sent })
  }catch(e){ return NextResponse.json({ ok:false, error:String(e) }, { status:500 }) }
}
