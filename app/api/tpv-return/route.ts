// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { tpvAuthorized } from '@/lib/tpvAuth'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Autorizado si hay PIN de TPV (cookie) O sesión de admin (allowlist),
// mismo patrón dual que /api/tpv-caja.
async function authorized(){
  return (await tpvAuthorized()) || !!(await getAdminUser())
}

const IGIC = 0.07
function round2(n){ return Math.round((Number(n) + Number.EPSILON) * 100) / 100 }

// Crea una factura rectificativa (abono/creditnote) en Holded por los items
// devueltos. Best-effort: si Holded falla no se interrumpe la devolución.
async function createHoldedCreditNote(order, itemsDev){
  const key = process.env.HOLDED_API_KEY
  if(!key || !order?.customer_email) return null
  try{
    const cRes = await fetch('https://api.holded.com/api/invoicing/v1/contacts?email='+encodeURIComponent(order.customer_email),{headers:{key}})
    const contacts = await cRes.json()
    let contactId = contacts?.[0]?.id
    if(!contactId){
      const nc = await fetch('https://api.holded.com/api/invoicing/v1/contacts',{method:'POST',headers:{key,'Content-Type':'application/json'},body:JSON.stringify({name:order.customer_name||order.customer_email,email:order.customer_email,type:'client'})}).then(r=>r.json())
      contactId = nc?.id
    }
    if(!contactId) return null
    const cn = {
      contactId,
      date: Math.floor(Date.now()/1000),
      notes: 'Rectificativa devolución pedido '+order.order_number,
      // Precios con IGIC incluido → desglosamos como en la factura original.
      items: itemsDev.map(i => ({ name: i.product_name||'Producto', units: i.qty_dev, subtotal: round2(Number(i.unit_price)/(1+IGIC)), tax: 7 })),
    }
    const res = await fetch('https://api.holded.com/api/invoicing/v1/documents/creditnote',{method:'POST',headers:{key,'Content-Type':'application/json'},body:JSON.stringify(cn)}).then(r=>r.json())
    return res?.id || null
  }catch(e){ console.error('holded creditnote error:', e); return null }
}

// POST /api/tpv-return → procesa una devolución (registra + repone stock)
// body: { order_number, items:[{line_id,product_id,product_name,qty_dev,unit_price}], method, motivo }
export async function POST(req){
  try{
    if(!(await authorized())) return NextResponse.json({ ok:false, error:'no_autorizado' }, { status:401 })
    if(!SERVICE_KEY) return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth:{ autoRefreshToken:false, persistSession:false } })

    const body = await req.json()
    const { order_number = '', items = [], method = 'efectivo', motivo = '' } = body
    if(!order_number || !Array.isArray(items) || items.length === 0)
      return NextResponse.json({ ok:false, error:'invalid_request' }, { status:400 })

    // Verificar que el pedido existe
    const { data: order } = await db.from('orders')
      .select('id,order_number,status,customer_email,customer_name').eq('order_number', String(order_number).toUpperCase()).maybeSingle()
    if(!order) return NextResponse.json({ ok:false, error:'order_not_found' }, { status:404 })

    // Solo se permiten devoluciones sobre pedidos pagados/cumplidos
    if(order.status === 'pending' || order.status === 'cancelled')
      return NextResponse.json({ ok:false, error:'pedido_no_reembolsable' }, { status:400 })

    // Cargar devoluciones previas para no exceder lo ya devuelto por línea
    const { data: prevDevs } = await db.from('devoluciones').select('items').eq('order_id', order.id)
    const alreadyReturned = {}
    for(const dev of (prevDevs||[])){
      for(const di of (Array.isArray(dev?.items) ? dev.items : [])){
        const lid = di?.line_id
        if(lid == null) continue
        alreadyReturned[lid] = (alreadyReturned[lid] || 0) + (parseInt(di?.qty_dev) || 0)
      }
    }

    // Recalcular importes a partir de precios reales de las líneas (anti-manipulación)
    const { data: dbLines } = await db.from('order_lines').select('id,product_id,product_name,unit_price,quantity').eq('order_id', order.id)
    const lineMap = new Map((dbLines||[]).map(l => [l.id, l]))

    const itemsDev = []
    for(const it of items){
      const dbl = lineMap.get(it.line_id)
      if(!dbl) continue
      const remaining = Number(dbl.quantity) - (alreadyReturned[dbl.id] || 0)
      const qty = Math.max(0, Math.min(parseInt(it.qty_dev || 0), remaining))
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
    const { data: devRow, error: devErr } = await db.from('devoluciones').insert({
      order_number: order.order_number,
      order_id: order.id,
      items: itemsDev,
      total_devuelto: totalDev,
      method,
      motivo,
      operator: 'TPV',
      created_at: new Date().toISOString(),
    }).select('id').single()
    if(devErr) throw devErr

    // Reponer stock
    for(const item of itemsDev){
      const { data: p } = await db.from('products').select('stock').eq('id', item.product_id).maybeSingle()
      if(p) await db.from('products').update({ stock: Number(p.stock) + item.qty_dev }).eq('id', item.product_id)
    }

    // Rectificativa en Holded (best-effort, no bloquea la devolución)
    const creditNoteId = await createHoldedCreditNote(order, itemsDev)
    if(creditNoteId && devRow?.id)
      await db.from('devoluciones').update({ holded_creditnote_id: creditNoteId }).eq('id', devRow.id).catch(()=>{})

    return NextResponse.json({ ok:true, total: totalDev, method, items: itemsDev, creditNoteId })
  }catch(e){
    console.error('tpv-return error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
