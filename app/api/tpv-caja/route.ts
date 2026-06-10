// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { tpvAuthorized } from '@/lib/tpvAuth'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function svc(){
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth:{ autoRefreshToken:false, persistSession:false } })
}

async function authorized(){
  return tpvAuthorized() || !!(await getAdminUser())
}

function round2(n){ return Math.round((Number(n) + Number.EPSILON) * 100) / 100 }

// GET /api/tpv-caja → { ok, open: <sesión abierta o null>, sessions: <últimas 30> }
export async function GET(){
  try{
    if(!(await authorized())) return NextResponse.json({ ok:false, error:'no_autorizado' }, { status:401 })
    if(!SERVICE_KEY) return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const db = svc()

    const { data: sessions, error: sErr } = await db.from('caja_sessions')
      .select('*').order('opened_at', { ascending:false }).limit(30)
    if(sErr) throw sErr

    const open = (sessions || []).find(s => !s.closed_at) || null
    return NextResponse.json({ ok:true, open, sessions: sessions || [] })
  }catch(e){
    console.error('tpv-caja GET error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}

// POST /api/tpv-caja → abrir caja. body: { cash_open, operator? }
export async function POST(req){
  try{
    if(!(await authorized())) return NextResponse.json({ ok:false, error:'no_autorizado' }, { status:401 })
    if(!SERVICE_KEY) return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const db = svc()

    const body = await req.json().catch(() => ({}))
    const cashOpen = Number(body?.cash_open)
    if(!isFinite(cashOpen) || cashOpen < 0)
      return NextResponse.json({ ok:false, error:'cash_open_invalido' }, { status:400 })
    const operator = body?.operator || 'TPV'

    // Rechazar si ya hay una sesión abierta
    const { data: yaAbierta, error: chkErr } = await db.from('caja_sessions')
      .select('id').is('closed_at', null).limit(1).maybeSingle()
    if(chkErr) throw chkErr
    if(yaAbierta) return NextResponse.json({ ok:false, error:'ya_abierta' }, { status:409 })

    const { data: session, error: insErr } = await db.from('caja_sessions').insert({
      opened_at: new Date().toISOString(),
      cash_open: cashOpen,
      operator,
      total_efectivo: 0,
      total_tarjeta: 0,
      total_vales: 0,
      num_tickets: 0,
    }).select().single()
    if(insErr) throw insErr

    return NextResponse.json({ ok:true, session })
  }catch(e){
    console.error('tpv-caja POST error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}

// PATCH /api/tpv-caja → cierre Z. body: { id, cash_close, notes? }
// Los totales se calculan SIEMPRE en servidor (no se confía en el cliente).
export async function PATCH(req){
  try{
    if(!(await authorized())) return NextResponse.json({ ok:false, error:'no_autorizado' }, { status:401 })
    if(!SERVICE_KEY) return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const db = svc()

    const body = await req.json().catch(() => ({}))
    const id = body?.id
    const cashClose = Number(body?.cash_close)
    const notes = body?.notes || ''
    if(!id) return NextResponse.json({ ok:false, error:'id_requerido' }, { status:400 })
    if(!isFinite(cashClose) || cashClose < 0)
      return NextResponse.json({ ok:false, error:'cash_close_invalido' }, { status:400 })

    const { data: session, error: sErr } = await db.from('caja_sessions')
      .select('*').eq('id', id).maybeSingle()
    if(sErr) throw sErr
    if(!session) return NextResponse.json({ ok:false, error:'sesion_no_encontrada' }, { status:404 })

    const since = session.opened_at

    // Ventas del turno (canales TPV, pagadas)
    const { data: orders, error: oErr } = await db.from('orders')
      .select('total,payment_method')
      .eq('status', 'paid')
      .gte('created_at', since)
      .in('channel', ['tpv_retail', 'tpv_distributor'])
    if(oErr) throw oErr

    let totalEfectivo = 0
    let totalTarjeta = 0
    let numTickets = 0
    for(const o of (orders || [])){
      const amt = Number(o.total || 0)
      const m = (o.payment_method || 'tarjeta')
      if(m.includes('efectivo')) totalEfectivo += amt
      else totalTarjeta += amt
      numTickets += 1
    }

    // Devoluciones del turno: restar lo devuelto según método
    const { data: devs, error: dErr } = await db.from('devoluciones')
      .select('total_devuelto,method')
      .gte('created_at', since)
    if(dErr) throw dErr

    for(const d of (devs || [])){
      const amt = Number(d.total_devuelto || 0)
      if((d.method || '').includes('efectivo')) totalEfectivo -= amt
      else totalTarjeta -= amt
    }

    totalEfectivo = round2(totalEfectivo)
    totalTarjeta = round2(totalTarjeta)

    const { data: updated, error: uErr } = await db.from('caja_sessions').update({
      closed_at: new Date().toISOString(),
      cash_close: cashClose,
      total_efectivo: totalEfectivo,
      total_tarjeta: totalTarjeta,
      num_tickets: numTickets,
      notes,
    }).eq('id', id).select().single()
    if(uErr) throw uErr

    const expected_cash = round2(Number(session.cash_open || 0) + totalEfectivo)
    return NextResponse.json({ ok:true, session: updated, expected_cash })
  }catch(e){
    console.error('tpv-caja PATCH error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
