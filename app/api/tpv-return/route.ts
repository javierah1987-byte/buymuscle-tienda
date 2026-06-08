// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { tpvAuthorized } from '@/lib/tpvAuth'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function round2(n){ return Math.round((Number(n) + Number.EPSILON) * 100) / 100 }

// POST /api/tpv-return → procesa una devolución (registra + repone stock)
// body: { order_number, items:[{line_id,product_id,product_name,qty_dev,unit_price}], method, motivo }
export async function POST(req){
  try{
    if(!tpvAuthorized()) return NextResponse.json({ ok:false, error:'no_autorizado' }, { status:401 })
    if(!SERVICE_KEY) return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth:{ autoRefreshToken:false, persistSession:false } })

    const body = await req.json()
    const { order_number = '', items = [], method = 'efectivo', motivo = '' } = body
    if(!order_number || !Array.isArray(items) || items.length === 0)
      return NextResponse.json({ ok:false, error:'invalid_request' }, { status:400 })

    // Verificar que el pedido existe
    const { data: order } = await db.from('orders')
      .select('id,order_number').eq('order_number', String(order_number).toUpperCase()).maybeSingle()
    if(!order) return NextResponse.json({ ok:false, error:'order_not_found' }, { status:404 })

    // Recalcular importes a partir de precios reales de las líneas (anti-manipulación)
    const { data: dbLines } = await db.from('order_lines').select('id,product_id,product_name,unit_price,quantity').eq('order_id', order.id)
    const lineMap = new Map((dbLines||[]).map(l => [l.id, l]))

    const itemsDev = []
    for(const it of items){
      const dbl = lineMap.get(it.line_id)
      if(!dbl) continue
      const qty = Math.max(0, Math.min(parseInt(it.qty_dev || 0), Number(dbl.quantity)))
      if(qty <= 0) continue
      itemsDev.push({
        line_id: dbl.id,
        product_id: dbl.product_id,
        product_name: dbl.product_name,
        qty_dev: qty,
        unit_price: Number(dbl.unit_price),
        importe: round2(Number(dbl.unit_price) * qty),
      })
    }
    if(!itemsDev.length) return NextResponse.json({ ok:false, error:'no_items' }, { status:400 })

    const totalDev = round2(itemsDev.reduce((s, i) => s + i.importe, 0))

    // Registrar devolución
    const { error: devErr } = await db.from('devoluciones').insert({
      order_number: order.order_number,
      order_id: order.id,
      items: itemsDev,
      total_devuelto: totalDev,
      method,
      motivo,
      operator: 'TPV',
      created_at: new Date().toISOString(),
    })
    if(devErr) throw devErr

    // Reponer stock
    for(const item of itemsDev){
      const { data: p } = await db.from('products').select('stock').eq('id', item.product_id).maybeSingle()
      if(p) await db.from('products').update({ stock: Number(p.stock) + item.qty_dev }).eq('id', item.product_id)
    }

    return NextResponse.json({ ok:true, total: totalDev, method, items: itemsDev })
  }catch(e){
    console.error('tpv-return error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
