// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { tpvAuthorized } from '@/lib/tpvAuth'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// GET /api/tpv-stats[?since=ISO] → ventas agregadas (sin exponer pedidos).
// Sin `since` agrega el día actual; con `since` agrega desde esa fecha
// (p. ej. apertura del turno) para el arqueo por turno.
export async function GET(req){
  try{
    if(!(await tpvAuthorized())) return NextResponse.json({ ok:false, error:'no_autorizado' }, { status:401 })
    if(!SERVICE_KEY) return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth:{ autoRefreshToken:false, persistSession:false } })

    const { searchParams } = new URL(req.url)
    const sinceParam = searchParams.get('since')
    let since
    if(sinceParam && !isNaN(Date.parse(sinceParam))) since = new Date(sinceParam)
    else { since = new Date(); since.setHours(0,0,0,0) }
    // SOLO ventas de los canales TPV (no las web PayPal/transferencia): si no se filtra,
    // el arqueo de caja física contaba pedidos online y salía inflado.
    const { data: orders } = await db.from('orders')
      .select('total,payment_method')
      .eq('status', 'paid')
      .in('channel', ['tpv_retail', 'tpv_distributor'])
      .gte('created_at', since.toISOString())

    const stats = (orders||[]).reduce((acc, o) => {
      acc.total += Number(o.total)
      acc.count += 1
      const m = o.payment_method || 'tarjeta'
      if (m.includes('efectivo')) acc.efectivo += Number(o.total)
      else if (m.includes('bizum')) acc.bizum += Number(o.total)
      else acc.tarjeta += Number(o.total)
      return acc
    }, { total:0, count:0, efectivo:0, tarjeta:0, bizum:0 })

    // Restar las devoluciones del periodo según su método (mismo criterio que el cierre Z
    // de /api/tpv-caja). Los tickets (count) NO se decrementan: la devolución no es una venta.
    const { data: devs } = await db.from('devoluciones')
      .select('total_devuelto,method')
      .gte('created_at', since.toISOString())
    for(const d of (devs||[])){
      const amt = Number(d.total_devuelto || 0)
      stats.total -= amt
      const m = d.method || ''
      if (m.includes('efectivo')) stats.efectivo -= amt
      else if (m.includes('bizum')) stats.bizum -= amt
      else stats.tarjeta -= amt
    }
    for(const k of ['total','efectivo','tarjeta','bizum']) stats[k] = Math.round((stats[k] + Number.EPSILON) * 100) / 100

    return NextResponse.json({ ok:true, stats })
  }catch(e){
    console.error('tpv-stats error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
