// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Límite de envíos best-effort por IP (en memoria; mitiga spam dentro de
// una misma instancia). Ventana de 1 hora, 5 reseñas.
const attempts = new Map()
const MAX_ATTEMPTS = 5, WINDOW_MS = 60 * 60 * 1000
function tooMany(ip) {
  const now = Date.now()
  const rec = attempts.get(ip)
  if (!rec || now - rec.ts > WINDOW_MS) { attempts.set(ip, { n: 0, ts: now }); return false }
  return rec.n >= MAX_ATTEMPTS
}
function bump(ip) {
  const now = Date.now()
  const rec = attempts.get(ip)
  if (!rec || now - rec.ts > WINDOW_MS) attempts.set(ip, { n: 1, ts: now })
  else rec.n++
}

// POST { product_id, name, email?, rating, comment? }
// Crea una reseña pendiente de moderación (verified=false).
export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    if (tooMany(ip))
      return NextResponse.json({ ok: false, error: 'Demasiados intentos. Prueba más tarde.' }, { status: 429 })

    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ ok: false, error: 'JSON invalido' }, { status: 400 })
    }

    const productId = Number(body?.product_id)
    if (!Number.isFinite(productId) || productId <= 0)
      return NextResponse.json({ ok: false, error: 'Producto invalido' }, { status: 400 })

    const name = String(body?.name ?? '').trim()
    if (!name || name.length > 80)
      return NextResponse.json({ ok: false, error: 'Nombre obligatorio (max 80 caracteres)' }, { status: 400 })

    const rating = Number(body?.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return NextResponse.json({ ok: false, error: 'Valoracion invalida (1-5)' }, { status: 400 })

    const comment = String(body?.comment ?? '').trim()
    if (comment.length > 2000)
      return NextResponse.json({ ok: false, error: 'Comentario demasiado largo (max 2000 caracteres)' }, { status: 400 })

    let email = String(body?.email ?? '').trim()
    if (email && (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
      return NextResponse.json({ ok: false, error: 'Email invalido' }, { status: 400 })

    const db = svc()

    const { data: prod, error: pe } = await db.from('products')
      .select('id').eq('id', productId).eq('active', true).maybeSingle()
    if (pe) throw new Error(pe.message)
    if (!prod)
      return NextResponse.json({ ok: false, error: 'Producto no encontrado' }, { status: 404 })

    const { error: ie } = await db.from('product_reviews').insert({
      product_id: productId,
      name,
      email: email || null,
      rating,
      comment: comment || null,
      verified: false,
    })
    if (ie) throw new Error(ie.message)

    bump(ip)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}
