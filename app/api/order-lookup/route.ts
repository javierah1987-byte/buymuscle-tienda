// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// GET /api/order-lookup?n=<order_number>[&upsell=1]
// El order_number es un token de capacidad (aleatorio e inenumerable),
// por eso permite consultar un pedido concreto sin exponer toda la tabla.
export async function GET(req){
  try{
    if(!SERVICE_KEY) return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const { searchParams } = new URL(req.url)
    const num = (searchParams.get('n') || '').trim()
    const wantUpsell = searchParams.get('upsell') === '1'
    if(!num) return NextResponse.json({ ok:false, error:'missing_order_number' }, { status:400 })

    const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth:{ autoRefreshToken:false, persistSession:false } })

    const { data: order } = await db.from('orders')
      .select('*').eq('order_number', num.toUpperCase()).maybeSingle()
    if(!order) return NextResponse.json({ ok:false, error:'not_found' }, { status:404 })

    const { data: lines } = await db.from('order_lines')
      .select('*').eq('order_id', order.id)

    let upsell = []
    if(wantUpsell){
      const boughtIds = (lines||[]).map(l => l.product_id)
      const { data: ups } = await db.from('products')
        .select('id,name,price_incl_tax,sale_price,image_url')
        .eq('active', true).gt('stock', 0).order('id', { ascending:false }).limit(12)
      upsell = (ups||[]).filter(p => boughtIds.indexOf(p.id) === -1).slice(0, 4)
    }

    return NextResponse.json({ ok:true, order, lines: lines || [], upsell })
  }catch(e){
    console.error('order-lookup error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
