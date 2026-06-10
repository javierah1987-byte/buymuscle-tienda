import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'

export async function POST(req: Request) {
  // Guard: solo un admin de la allowlist puede editar precios en masa.
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { brand, factor } = await req.json()

  // Validación de entrada
  if (typeof brand !== 'string' || brand.trim() === '') {
    return NextResponse.json({ error: 'Marca inválida' }, { status: 400 })
  }
  if (typeof factor !== 'number' || !Number.isFinite(factor) || factor < 0.2 || factor > 5) {
    return NextResponse.json({ error: 'Factor inválido' }, { status: 400 })
  }

  // Cliente service-role: bypassa RLS para poder escribir en products.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const { data: products, error: selErr } = await supabaseAdmin
      .from('products')
      .select('id, price_incl_tax')
      .ilike('brand', '%' + brand + '%')
      .eq('active', true)
    if (selErr) throw new Error(selErr.message)

    let updated = 0
    for (const p of products ?? []) {
      const newPrice = Math.round(Number(p.price_incl_tax) * factor * 100) / 100
      const { error: updErr } = await supabaseAdmin
        .from('products')
        .update({ price_incl_tax: newPrice })
        .eq('id', p.id)
      if (updErr) throw new Error(updErr.message)
      updated++
    }

    return NextResponse.json({ ok: true, updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
