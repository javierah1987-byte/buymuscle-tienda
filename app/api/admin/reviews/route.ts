// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET ?filter=pending|approved|all -> lista de reseñas
export async function GET(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') || 'pending'

  const db = svc()
  try {
    let q = db.from('product_reviews').select('*').order('created_at', { ascending: false })
    if (filter === 'pending') q = q.eq('verified', false)
    else if (filter === 'approved') q = q.eq('verified', true)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true, reviews: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH { id, verified } -> aprobar/desaprobar
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
  if (id === undefined || id === null || id === '')
    return NextResponse.json({ error: 'id obligatorio' }, { status: 400 })

  const db = svc()
  try {
    const { error } = await db.from('product_reviews')
      .update({ verified: !!body?.verified }).eq('id', id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE { id } (o ?id=) -> eliminar reseña
export async function DELETE(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let id: any = new URL(req.url).searchParams.get('id')
  if (!id) {
    try {
      const body = await req.json()
      id = body?.id
    } catch {}
  }
  if (id === undefined || id === null || id === '')
    return NextResponse.json({ error: 'id obligatorio' }, { status: 400 })

  const db = svc()
  try {
    const { error } = await db.from('product_reviews').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST { product_id, name, rating, comment, verified } -> añadir reseña manual
export async function POST(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  const productId = Number(body?.product_id)
  if (!Number.isFinite(productId) || productId <= 0)
    return NextResponse.json({ error: 'product_id invalido' }, { status: 400 })

  const name = String(body?.name ?? '').trim()
  if (!name || name.length > 80)
    return NextResponse.json({ error: 'Nombre obligatorio (max 80 caracteres)' }, { status: 400 })

  const rating = Number(body?.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return NextResponse.json({ error: 'Valoracion invalida (1-5)' }, { status: 400 })

  const comment = String(body?.comment ?? '').trim()
  if (comment.length > 2000)
    return NextResponse.json({ error: 'Comentario demasiado largo (max 2000 caracteres)' }, { status: 400 })

  const db = svc()
  try {
    const { error } = await db.from('product_reviews').insert({
      product_id: productId,
      name,
      rating,
      comment: comment || null,
      verified: body?.verified !== undefined ? !!body.verified : true,
    })
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
