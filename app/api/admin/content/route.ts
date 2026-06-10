// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'

// Whitelist estricta: alias publico -> tabla real
const TABLES = { blog: 'blog_posts', banners: 'banners', rrss: 'social_posts' }

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function err(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

async function parseBody(req: Request) {
  try {
    return await req.json()
  } catch {
    return null
  }
}

// GET ?t=blog|banners|rrss [&order=col.desc] -> lista completa (admin ve todo)
export async function GET(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return err('No autorizado', 401)

  const url = new URL(req.url)
  const table = TABLES[url.searchParams.get('t')]
  if (!table) return err('Tabla no permitida', 400)

  const order = url.searchParams.get('order') || 'created_at.desc'
  const [col, dir] = order.split('.')

  const { data, error } = await svc()
    .from(table)
    .select('*')
    .order(col || 'created_at', { ascending: dir !== 'desc' })

  if (error) return err(error.message)
  return NextResponse.json({ ok: true, data })
}

// POST { t, row } -> insertar, devuelve la fila insertada
export async function POST(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return err('No autorizado', 401)

  const body = await parseBody(req)
  if (!body) return err('JSON invalido', 400)

  const table = TABLES[body.t]
  if (!table) return err('Tabla no permitida', 400)
  if (!body.row || typeof body.row !== 'object') return err('row obligatorio', 400)

  const { data, error } = await svc().from(table).insert(body.row).select().single()
  if (error) return err(error.message)
  return NextResponse.json({ ok: true, data })
}

// PATCH { t, id, fields } -> actualizar
export async function PATCH(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return err('No autorizado', 401)

  const body = await parseBody(req)
  if (!body) return err('JSON invalido', 400)

  const table = TABLES[body.t]
  if (!table) return err('Tabla no permitida', 400)
  if (body.id === undefined || body.id === null || body.id === '') return err('id obligatorio', 400)
  if (!body.fields || typeof body.fields !== 'object') return err('fields obligatorio', 400)

  const { data, error } = await svc().from(table).update(body.fields).eq('id', body.id).select().single()
  if (error) return err(error.message)
  return NextResponse.json({ ok: true, data })
}

// DELETE { t, id } -> eliminar
export async function DELETE(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return err('No autorizado', 401)

  const body = await parseBody(req)
  if (!body) return err('JSON invalido', 400)

  const table = TABLES[body.t]
  if (!table) return err('Tabla no permitida', 400)
  if (body.id === undefined || body.id === null || body.id === '') return err('id obligatorio', 400)

  const { error } = await svc().from(table).delete().eq('id', body.id)
  if (error) return err(error.message)
  return NextResponse.json({ ok: true })
}
