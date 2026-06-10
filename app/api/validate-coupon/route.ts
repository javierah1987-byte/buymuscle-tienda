// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

// Límite de peticiones best-effort por IP (en memoria; mitiga enumeración de
// cupones dentro de una misma instancia). Ventana de 5 min, 20 intentos.
const attempts = new Map()
const MAX_ATTEMPTS = 20, WINDOW_MS = 5 * 60 * 1000
function tooMany(ip){
  const now = Date.now()
  const rec = attempts.get(ip)
  if(!rec || now - rec.ts > WINDOW_MS){ attempts.set(ip, { n:1, ts:now }); return false }
  rec.n++
  return rec.n > MAX_ATTEMPTS
}

// POST { code, subtotal } -> { ok:true, valid, type?, value?, discountAmt? }
// Validación INFORMATIVA para la UI del carrito (los invitados no pueden leer
// discount_codes por RLS). La validación autoritativa sigue siendo la de
// lib/orderCore.ts quoteOrder() al crear el pedido — misma lógica aquí.
export async function POST(req){
  try{
    if(!SERVICE_KEY) return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    if(tooMany(ip))
      return NextResponse.json({ ok:false, error:'demasiados_intentos' }, { status:429 })

    let body
    try { body = await req.json() } catch { return NextResponse.json({ ok:false, error:'json_invalido' }, { status:400 }) }
    const code = String(body?.code || '').trim()
    const subtotal = round2(Number(body?.subtotal) || 0)
    if(!code) return NextResponse.json({ ok:true, valid:false })

    const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth:{ autoRefreshToken:false, persistSession:false } })
    const { data: dc } = await db.from('discount_codes')
      .select('*').eq('code', code).eq('active', true).maybeSingle()

    if(!dc) return NextResponse.json({ ok:true, valid:false })

    // Mismos chequeos que quoteOrder() en lib/orderCore.ts
    const notExpired = !dc.expires_at || new Date(dc.expires_at) > new Date()
    const underMax = !dc.max_uses || (dc.uses || 0) < dc.max_uses
    const meetsMin = !dc.min_order || subtotal >= Number(dc.min_order)
    if(!notExpired || !underMax || !meetsMin)
      return NextResponse.json({ ok:true, valid:false })

    // Misma aritmética que quoteOrder(): porcentaje sobre subtotal o importe fijo capado.
    let discountAmt
    const isPercent = dc.type === 'percent' || dc.type === 'percentage'
    if(isPercent) discountAmt = round2(subtotal * (Number(dc.value) / 100))
    else discountAmt = round2(Math.min(Number(dc.value), subtotal))

    // Devolvemos SOLO lo necesario para pintar el descuento, nunca la fila entera.
    return NextResponse.json({
      ok:true, valid:true,
      type: isPercent ? 'percent' : 'fixed',
      value: Number(dc.value),
      discountAmt,
    })
  }catch(e){
    console.error('validate-coupon error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
