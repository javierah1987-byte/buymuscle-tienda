import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const BUCKET = 'product-images'
const MAX_BYTES = 8 * 1024 * 1024
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function POST(req: Request) {
  // Guard: only an authenticated admin (same notion as the /admin middleware) may upload.
  const cookieStore = cookies()
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await auth.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const form = await req.formData()
    const productId = Number(form.get('productId'))
    const file = form.get('file')

    if (!productId || !(file instanceof File)) {
      return NextResponse.json({ error: 'productId y file son obligatorios' }, { status: 400 })
    }
    const ext = EXT_BY_TYPE[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Formato no soportado (usa JPG, PNG, WEBP o GIF)' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'La imagen supera los 8 MB' }, { status: 400 })
    }

    const bytes = new Uint8Array(await file.arrayBuffer())
    const path = `products/${productId}.${ext}`

    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: true })
    if (upErr) throw new Error(upErr.message)

    const publicUrl = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    // Cache-bust so a re-upload to the same path is reflected immediately.
    const finalUrl = `${publicUrl}?v=${Date.now()}`

    const { error: updErr } = await supabaseAdmin
      .from('products')
      .update({ image_url: finalUrl })
      .eq('id', productId)
    if (updErr) throw new Error(updErr.message)

    return NextResponse.json({ ok: true, image_url: finalUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error desconocido' }, { status: 400 })
  }
}
