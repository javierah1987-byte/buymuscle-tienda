// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { tpvAuthorized } from '@/lib/tpvAuth'
import { getAdminUser } from '@/lib/adminAuth'
import { createCreditNoteV2 } from '@/lib/holdedV2'

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

// ── HOLDED v2 — abono/rectificativa migrado a lib/holdedV2 (serie CN). Antes v1 (key header).
// El guard (prod / preview con HOLDED_ALLOW_PREVIEW=1) vive en el módulo. Best-effort.
async function createHoldedCreditNote(order, itemsDev){ return createCreditNoteV2(order, itemsDev) }

// POST /api/tpv-return → procesa una devolución (registra + repone stock)
// body: { order_number, items:[{line_id,qty_dev}], method, motivo }
//
// TODO el trabajo con integridad (tope de lo ya devuelto, importes autoritativos,
// registro y reposición de stock) ocurre dentro de la función process_return, en UNA
// transacción y con la fila del pedido bloqueada. Antes se hacía en 4 pasos sueltos
// desde aquí: el stock se reponía leyendo-y-escribiendo (dos devoluciones a la vez
// perdían una reposición) y el tope se comprobaba fuera de transacción (dos a la vez
// devolvían dos veces lo mismo = doble reembolso). Ver la migración
// supabase/migrations/20260724_process_return_atomic.sql.
// Lo que el cliente manda de `items` solo se usa como SELECCIÓN (qué línea, cuánto);
// el precio y el máximo devolvible los pone la BD desde order_lines.
export async function POST(req){
  try{
    if(!(await authorized())) return NextResponse.json({ ok:false, error:'no_autorizado' }, { status:401 })
    if(!SERVICE_KEY) return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth:{ autoRefreshToken:false, persistSession:false } })

    const body = await req.json()
    const { order_number = '', items = [], method = 'efectivo', motivo = '' } = body
    if(!order_number || !Array.isArray(items) || items.length === 0)
      return NextResponse.json({ ok:false, error:'invalid_request' }, { status:400 })

    // Solo para localizar el pedido y tener los datos de contacto de la rectificativa.
    // Las reglas de negocio (estado reembolsable, tope por línea) las decide la función.
    const { data: order } = await db.from('orders')
      .select('id,order_number,status,customer_email,customer_name').eq('order_number', String(order_number).toUpperCase()).maybeSingle()
    if(!order) return NextResponse.json({ ok:false, error:'order_not_found' }, { status:404 })

    const { data: dev, error: devErr } = await db.rpc('process_return', {
      p_order_id: order.id,
      p_items: items.map(i => ({ line_id: i.line_id, qty_dev: parseInt(i.qty_dev) || 0 })),
      p_method: method,
      p_motivo: motivo,
      p_operator: 'TPV',
    })
    if(devErr){
      const msg = String(devErr.message || devErr)
      if(msg.includes('ORDER_NOT_FOUND'))      return NextResponse.json({ ok:false, error:'order_not_found' }, { status:404 })
      if(msg.includes('ORDER_NOT_REFUNDABLE')) return NextResponse.json({ ok:false, error:'pedido_no_reembolsable' }, { status:400 })
      // NO_ITEMS: nada devolvible (ya se devolvió todo, cantidades a 0 o líneas de otro pedido).
      if(msg.includes('NO_ITEMS'))             return NextResponse.json({ ok:false, error:'no_items' }, { status:400 })
      throw devErr
    }

    const itemsDev = dev?.items || []
    const totalDev = Number(dev?.total || 0)

    // Rectificativa en Holded (best-effort, no bloquea la devolución: ya está registrada
    // y el stock repuesto de forma atómica; si Holded falla, se emite a mano).
    const creditNoteId = await createHoldedCreditNote(order, itemsDev)
    if(creditNoteId && dev?.dev_id)
      await db.from('devoluciones').update({ holded_creditnote_id: creditNoteId }).eq('id', dev.dev_id).catch(()=>{})

    return NextResponse.json({ ok:true, total: totalDev, method, items: itemsDev, creditNoteId })
  }catch(e){
    console.error('tpv-return error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
