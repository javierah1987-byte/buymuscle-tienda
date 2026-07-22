// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const num = (v: any): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}
const intOr = (v: any, def = 0): number => {
  const n = parseInt(v, 10)
  return Number.isNaN(n) ? def : n
}
const floatOr = (v: any, def = 0): number => {
  const n = parseFloat(v)
  return Number.isNaN(n) ? def : n
}

// POST -> crear producto (+ variantes opcionales)
export async function POST(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  const p = body?.product
  const variants = Array.isArray(body?.variants) ? body.variants : []

  if (!p || !p.name || String(p.name).trim() === '') {
    return NextResponse.json({ error: 'Nombre obligatorio' }, { status: 400 })
  }
  const price = num(p.price_incl_tax)
  if (price === null) {
    return NextResponse.json({ error: 'Precio invalido' }, { status: 400 })
  }

  const db = svc()

  try {
    const { data: prod, error: pe } = await db.from('products').insert({
      name: String(p.name).trim(),
      brand: p.brand ?? null,
      category_id: num(p.category_id),
      price_incl_tax: price,
      sale_price: num(p.sale_price),
      cost_price: num(p.cost_price),
      on_sale: p.on_sale !== undefined ? !!p.on_sale : !!num(p.sale_price),
      image_url: p.image_url ? String(p.image_url).trim() : null,
      stock: intOr(p.stock, 0),
      description: p.description ? String(p.description).trim() : null,
      active: p.active !== undefined ? !!p.active : true,
      has_variants: variants.length > 0,
    }).select().single()
    if (pe) throw new Error(pe.message)

    for (const v of variants) {
      const tipo = String(v?.tipo ?? '').trim()
      const valor = String(v?.valor ?? '').trim()
      if (!tipo || !valor) continue

      // find-or-create attribute_type by name
      let attrTypeId: number | null = null
      const { data: at } = await db.from('attribute_types').select('id').eq('name', tipo).maybeSingle()
      if (at) {
        attrTypeId = at.id
      } else {
        const { data: created, error: ce } = await db.from('attribute_types').insert({ name: tipo }).select().single()
        if (ce) throw new Error(ce.message)
        attrTypeId = created.id
      }

      const { data: av, error: ave } = await db.from('attribute_values')
        .insert({ value: valor, attribute_type_id: attrTypeId }).select().single()
      if (ave) throw new Error(ave.message)

      const { error: pve } = await db.from('product_variants').insert({
        product_id: prod.id,
        attribute_value_id: av.id,
        stock: intOr(v.stock, 0),
        price_modifier: floatOr(v.mod, 0),
        active: true,
      })
      if (pve) throw new Error(pve.message)
    }

    return NextResponse.json({ ok: true, id: prod.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH -> actualizar producto (+ stock/price_modifier de variantes)
export async function PATCH(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  const id = body?.id
  if (id === undefined || id === null || id === '') {
    return NextResponse.json({ error: 'id obligatorio' }, { status: 400 })
  }
  const fields = body?.fields
  if (!fields || typeof fields !== 'object') {
    return NextResponse.json({ error: 'fields obligatorio' }, { status: 400 })
  }
  const variants = Array.isArray(body?.variants) ? body.variants : []

  const db = svc()

  try {
    if (fields && Object.keys(fields).length > 0) {
      const { error: ue } = await db.from('products').update(fields).eq('id', id)
      if (ue) throw new Error(ue.message)
    }

    for (const v of variants) {
      if (v?.id === undefined || v?.id === null || v?.id === '') continue
      const { error: ve } = await db.from('product_variants').update({
        stock: intOr(v.stock, 0),
        price_modifier: floatOr(v.price_modifier, 0),
      }).eq('id', v.id)
      if (ve) throw new Error(ve.message)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
