// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { adminDb, persistOrder } from '@/lib/orderCore'
import { redsysConfigured, buildRedsysForm } from '@/lib/redsys'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Igual que /api/create-order: el % de distribuidor se valida en SERVIDOR contra
// la sesión Supabase; nunca se acepta del cliente. Sin token válido → retail.
async function resolveDistributor(db, req){
  try{
    const authz = req.headers.get('authorization') || ''
    const token = authz.startsWith('Bearer ') ? authz.slice(7).trim() : ''
    if(!token || token === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return { pct:0, levelId:null, channel:'web' }
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth:{ persistSession:false, autoRefreshToken:false } }
    )
    const { data:{ user } } = await anon.auth.getUser(token)
    if(!user) return { pct:0, levelId:null, channel:'web' }
    const { data } = await db.from('distributors')
      .select('level_id,active,distributor_levels(discount_pct)').eq('user_id', user.id).maybeSingle()
    if(!data || data.active === false) return { pct:0, levelId:null, channel:'web' }
    return { pct:Number(data.distributor_levels?.discount_pct)||0, levelId:data.level_id ?? null, channel:'distributor' }
  }catch{ return { pct:0, levelId:null, channel:'web' } }
}

// POST /api/redsys/create — crea el pedido 'pending' (pago aún no verificado) y
// devuelve el formulario FIRMADO para redirigir el navegador al TPV de Redsys.
// El pago se confirma en /api/redsys/notification (server-to-server). El terminal
// se elige por canal: distribuidor → su TPV; resto → TPV de particulares.
// INACTIVO hasta definir las variables REDSYS_* (mientras devuelve 503).
export async function POST(req){
  try{
    if(!redsysConfigured())
      return NextResponse.json({ ok:false, error:'redsys_no_configurado' }, { status:503 })
    if(!process.env.SUPABASE_SERVICE_ROLE_KEY)
      return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })

    const db = adminDb()
    const body = await req.json()
    const dist = await resolveDistributor(db, req)

    // El pedido nace 'pending': el stock NO se descuenta hasta que la
    // notificación de Redsys confirme el cobro (evita reservar sin pagar).
    const res = await persistOrder(db, body, {
      status: 'pending',
      payment_method: 'redsys',
      channel: dist.channel,
      distributorDiscountPct: dist.pct,
      distributorLevelId: dist.levelId,
    })
    if(!res.ok) return NextResponse.json(res, { status: res.status || 400 })

    // Redsys exige nº de pedido de 4-12 chars, los 4 primeros numéricos, ÚNICO por
    // transacción. Usamos 8 dígitos del reloj + 4 aleatorios; el nº interno viaja
    // en MerchantData y regresa en la notificación (no hace falta columna nueva).
    const redsysOrder = (String(Date.now()).slice(-8) + String(crypto.randomInt(1000, 9999))).slice(0, 12)
    const channel = dist.channel === 'distributor' ? 'distributor' : 'particular'
    // Método elegido en el checkout → hint a Redsys: 'C' tarjeta, 'z' Bizum.
    const paymethod = ({ card: 'C', bizum: 'z' })[body?.method] || ''
    const form = buildRedsysForm({ order: redsysOrder, amountEuros: res.total, channel, merchantData: res.order_number, paymethod })

    return NextResponse.json({ ok:true, order_number: res.order_number, redsys: form })
  }catch(e){
    console.error('redsys/create error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
