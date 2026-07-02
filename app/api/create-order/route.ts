// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { adminDb, persistOrder } from '@/lib/orderCore'

export const dynamic = 'force-dynamic'

// Resuelve el descuento de distribuidor a partir del token de sesión Supabase
// que el checkout adjunta en la cabecera Authorization. El % NUNCA se acepta del
// cliente: se valida el token contra Supabase Auth, se obtiene el usuario y se
// lee su grupo con service role (bypassa RLS). Sin token válido → cliente retail.
async function resolveDistributor(db, req){
  try{
    const authz = req.headers.get('authorization') || ''
    const token = authz.startsWith('Bearer ') ? authz.slice(7).trim() : ''
    if(!token || token === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return { pct: 0, channel: 'web' }
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    const { data: { user } } = await anon.auth.getUser(token)
    if(!user) return { pct: 0, channel: 'web' }
    const { data } = await db.from('distributor_profiles')
      .select('discount_pct,active').eq('user_id', user.id).maybeSingle()
    if(!data || data.active === false) return { pct: 0, channel: 'web' }
    const pct = Number(data.discount_pct) || 0
    return pct > 0 ? { pct, channel: 'distributor' } : { pct: 0, channel: 'web' }
  }catch{ return { pct: 0, channel: 'web' } }
}

// POST /api/create-order — checkout web. Crea el pedido como 'pending'
// (pago no verificado: transferencia). Si el que compra es un distribuidor
// autenticado, aplica su descuento de grupo en SERVIDOR y marca el canal
// 'distributor' (→ serie B2B en Holded). El pago verificado por PayPal va por
// /api/paypal/capture.
export async function POST(req){
  try{
    if(!process.env.SUPABASE_SERVICE_ROLE_KEY)
      return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const db = adminDb()
    const body = await req.json()

    const dist = await resolveDistributor(db, req)

    const res = await persistOrder(db, body, {
      status: 'pending',
      payment_method: body.payment_method || 'card',
      channel: dist.channel,
      distributorDiscountPct: dist.pct,
    })
    if(!res.ok) return NextResponse.json(res, { status: res.status || 400 })
    return NextResponse.json({ ok:true, order_number: res.order_number, total: res.total })
  }catch(e){
    console.error('create-order error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
