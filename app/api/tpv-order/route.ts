// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { tpvAuthorized } from '@/lib/tpvAuth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const IGIC = 0.07           // Canarias: IGIC general 7%

// Aleatorio criptográfico: 'BM-TPV-'+Date.now() era enumerable (cualquiera
// adivinaba números de ticket cercanos y los consultaba en /api/order-lookup).
function genId(){ return 'BM-TPV-' + crypto.randomBytes(8).toString('hex').toUpperCase() }
function round2(n){ return Math.round((Number(n) + Number.EPSILON) * 100) / 100 }

// ── HOLDED (factura del TPV, IGIC 7%) ────────────────────
async function createHoldedInvoice(order, lines){
  const key = process.env.HOLDED_API_KEY
  if(!key) return null
  try{
    const isDistrib = (order.channel||'').includes('distributor')
    const serie = isDistrib ? process.env.HOLDED_SERIE_DIST_ID : process.env.HOLDED_SERIE_T_ID
    const email = order.customer_email || 'tpv@buymuscle.es'
    const cRes = await fetch('https://api.holded.com/api/invoicing/v1/contacts?email='+encodeURIComponent(email),{headers:{key}})
    const contacts = await cRes.json()
    let contactId = contacts?.[0]?.id
    if(!contactId){
      const nc = await fetch('https://api.holded.com/api/invoicing/v1/contacts',{method:'POST',headers:{key,'Content-Type':'application/json'},body:JSON.stringify({name:order.customer_name||email,email,type:'client'})}).then(r=>r.json())
      contactId = nc?.id
    }
    const inv = {
      contactId,
      date: Math.floor(Date.now()/1000),
      notes: 'Venta TPV '+order.order_number,
      // Holded espera precio SIN impuesto; nuestros precios llevan IGIC incluido → desglosamos
      items: lines.map(l => ({ name: l.product_name||'Producto', units: l.qty||1, subtotal: round2(Number(l.unit_price)/(1+IGIC)), tax: 7 })),
      ...(serie && { numSerieId: serie })
    }
    const invRes = await fetch('https://api.holded.com/api/invoicing/v1/documents/invoice',{method:'POST',headers:{key,'Content-Type':'application/json'},body:JSON.stringify(inv)}).then(r=>r.json())
    return invRes?.id || null
  }catch(e){ console.error('holded tpv error:', e); return null }
}

// ── POST /api/tpv-order ──────────────────────────────────
export async function POST(req){
  try{
    if(!tpvAuthorized()) return NextResponse.json({ ok:false, error:'no_autorizado' }, { status:401 })
    if(!SERVICE_KEY) return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth:{ autoRefreshToken:false, persistSession:false } })

    const body = await req.json()
    const {
      items = [],
      discount_pct = 0,
      payment_method = 'efectivo',
      customer = {},
      channel = 'tpv_retail',
    } = body

    if(!Array.isArray(items) || items.length === 0)
      return NextResponse.json({ ok:false, error:'empty_cart' }, { status:400 })

    const disc = Math.min(100, Math.max(0, Number(discount_pct) || 0))

    // 1. Precios autoritativos desde BD (evita manipulación del cliente)
    const productIds = [...new Set(items.map(i => Number(i.product_id ?? i.id)).filter(Boolean))]
    const { data: prods } = await db.from('products')
      .select('id,name,price_incl_tax,sale_price,on_sale,active').in('id', productIds)
    const prodMap = new Map((prods||[]).map(p => [p.id, p]))

    const variantIds = [...new Set(items.map(i => Number(i.variant_id)).filter(Boolean))]
    let varMap = new Map()
    if(variantIds.length){
      const { data: vars } = await db.from('product_variants')
        .select('id,product_id,price_modifier,active').in('id', variantIds)
      varMap = new Map((vars||[]).map(v => [v.id, v]))
    }

    // 2. Construir líneas autoritativas (descuento aplicado en servidor)
    const lines = []
    for(const it of items){
      const pid = Number(it.product_id ?? it.id)
      const p = prodMap.get(pid)
      if(!p || p.active === false)
        return NextResponse.json({ ok:false, error:'product_unavailable:'+pid }, { status:400 })
      const qty = Math.max(1, parseInt(it.qty ?? it.quantity ?? 1))
      let unit = (p.on_sale && p.sale_price) ? Number(p.sale_price) : Number(p.price_incl_tax)
      const vid = Number(it.variant_id) || null
      if(vid && varMap.has(vid)) unit += Number(varMap.get(vid).price_modifier || 0)
      unit = round2(unit * (1 - disc / 100))
      // Validación: si el cliente envió un precio y no coincide con el autoritativo, log (posible manipulación)
      const clientUnit = Number(it.unit_price ?? it.price)
      if(!isNaN(clientUnit) && Math.abs(round2(clientUnit) - unit) > 0.01)
        console.warn('[tpv-order] precio cliente != autoritativo', { product_id: pid, cliente: round2(clientUnit), autoritativo: unit })
      lines.push({
        product_id: pid,
        variant_id: vid,
        product_name: p.name + (it.variant ? ' – ' + it.variant : ''),
        qty,
        unit_price: unit,
        line_total: round2(unit * qty),
      })
    }

    // 3. Totales (precios con IGIC incluido → desglose hacia dentro, sin envío)
    const totalGross = round2(lines.reduce((s, l) => s + l.line_total, 0))
    const base = round2(totalGross / (1 + IGIC))
    const taxAmount = round2(totalGross - base)

    // 4. Crear pedido (status 'paid' = venta presencial cobrada)
    const order_number = genId()
    const { data: orderRow, error: orderErr } = await db.from('orders').insert({
      order_number,
      channel,
      customer_name: customer.name || 'Venta directa',
      customer_email: customer.email || 'tpv@buymuscle.es',
      customer_nif: customer.nif || null,
      subtotal: base,
      tax_amount: taxAmount,
      shipping_cost: 0,
      total: totalGross,
      discount_pct: disc,
      payment_method,
      status: 'paid',
      notes: 'TPV · ' + payment_method + (customer.name ? ' · ' + customer.name : ''),
    }).select().single()
    if(orderErr) throw orderErr
    const orderId = orderRow.id

    // 5. Líneas del pedido (order_lines NO tiene columna variant_id)
    const { error: linesErr } = await db.from('order_lines').insert(
      lines.map(l => ({
        order_id: orderId,
        product_id: l.product_id,
        product_name: l.product_name,
        quantity: l.qty,
        unit_price: l.unit_price,
        tax_rate: 7,
        line_total: l.line_total,
      }))
    )
    if(linesErr){
      await db.from('orders').delete().eq('id', orderId)
      throw linesErr
    }

    // 6. Descontar stock de forma atómica (revierte el pedido si falta stock)
    const { error: stockErr } = await db.rpc('process_order_stock', {
      p_lines: lines.map(l => ({ product_id: l.product_id, variant_id: l.variant_id, qty: l.qty })),
    })
    if(stockErr){
      await db.from('order_lines').delete().eq('order_id', orderId)
      await db.from('orders').delete().eq('id', orderId)
      const msg = String(stockErr.message || stockErr)
      if(msg.includes('INSUFFICIENT_STOCK'))
        return NextResponse.json({ ok:false, error:'sin_stock' }, { status:409 })
      throw stockErr
    }

    // 7. CRM: upsert cliente si dio email/NIF (best-effort)
    if(customer.email && customer.email !== 'tpv@buymuscle.es'){
      await db.from('customers').upsert({
        email: customer.email,
        name: customer.name || '',
        last_order_date: new Date().toISOString(),
      }, { onConflict: 'email' }).catch(()=>{})
    }

    // 8. Facturar en Holded con IGIC 7% (best-effort, no bloquea la respuesta)
    createHoldedInvoice(orderRow, lines).then(hid => {
      if(hid) db.from('orders').update({ holded_invoice_id: hid, holded_synced_at: new Date().toISOString() }).eq('id', orderId)
    }).catch(console.error)

    return NextResponse.json({
      ok:true,
      order_number,
      total: totalGross,
      subtotal: base,
      igic: taxAmount,
      lines: lines.map(l => ({ name: l.product_name, qty: l.qty, unit_price: l.unit_price, subtotal: l.line_total })),
    })
  }catch(e){
    console.error('tpv-order error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
