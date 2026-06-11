// @ts-nocheck
import { NextResponse } from 'next/server'
import { tpvToken, tpvAuthorized, tpvPinConfigured, validateTpvPin, TPV_COOKIE } from '@/lib/tpvAuth'

export const dynamic = 'force-dynamic'

// Límite de intentos best-effort por IP (en memoria; mitiga fuerza bruta
// dentro de una misma instancia). Ventana de 5 min, 8 intentos.
const attempts = new Map()
const MAX_ATTEMPTS = 8, WINDOW_MS = 5 * 60 * 1000
function tooMany(ip){
  const now = Date.now()
  const rec = attempts.get(ip)
  if(!rec || now - rec.ts > WINDOW_MS){ attempts.set(ip, { n:0, ts:now }); return false }
  return rec.n >= MAX_ATTEMPTS
}
function bump(ip){
  const now = Date.now()
  const rec = attempts.get(ip)
  if(!rec || now - rec.ts > WINDOW_MS) attempts.set(ip, { n:1, ts:now })
  else rec.n++
}

// GET  -> { ok, authorized }  (estado de sesión TPV)
// POST { pin } -> valida el PIN y deja cookie httpOnly de 12h
// DELETE -> cierra la sesión TPV
export async function GET(){
  return NextResponse.json({ ok:true, authorized: await tpvAuthorized() })
}

export async function POST(req){
  try{
    if(!(await tpvPinConfigured()))
      return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    if(tooMany(ip))
      return NextResponse.json({ ok:false, error:'demasiados_intentos' }, { status:429 })
    const { pin } = await req.json()
    if(!(await validateTpvPin(pin))){
      bump(ip)
      return NextResponse.json({ ok:false, error:'pin_invalido' }, { status:401 })
    }
    const res = NextResponse.json({ ok:true })
    res.cookies.set(TPV_COOKIE, await tpvToken(), {
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
