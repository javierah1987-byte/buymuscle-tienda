// @ts-nocheck
import { NextResponse } from 'next/server'
import { tpvToken, tpvAuthorized, TPV_COOKIE } from '@/lib/tpvAuth'

export const dynamic = 'force-dynamic'

// GET  -> { ok, authorized }  (estado de sesión TPV)
// POST { pin } -> valida el PIN y deja cookie httpOnly de 12h
// DELETE -> cierra la sesión TPV
export async function GET(){
  return NextResponse.json({ ok:true, authorized: tpvAuthorized() })
}

export async function POST(req){
  try{
    if(!process.env.TPV_PIN)
      return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const { pin } = await req.json()
    if(!pin || String(pin) !== String(process.env.TPV_PIN))
      return NextResponse.json({ ok:false, error:'pin_invalido' }, { status:401 })
    const res = NextResponse.json({ ok:true })
    res.cookies.set(TPV_COOKIE, tpvToken(), {
      httpOnly:true, secure:true, sameSite:'lax', path:'/', maxAge: 60*60*12,
    })
    return res
  }catch(e){
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 })
  }
}

export async function DELETE(){
  const res = NextResponse.json({ ok:true })
  res.cookies.set(TPV_COOKIE, '', { httpOnly:true, path:'/', maxAge:0 })
  return res
}
