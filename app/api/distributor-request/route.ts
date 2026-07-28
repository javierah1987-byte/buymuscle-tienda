// @ts-nocheck
// Solicitudes de acceso de distribuidores. POST público (form) inserta vía service role
// (la tabla tiene RLS deny-all). GET/PATCH admin (getAdminUser) para listar y aprobar/rechazar.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const db = () => createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

// POST público: registrar una solicitud de distribuidor.
export async function POST(req) {
  try {
    if (!SERVICE_KEY) return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })
    const b = await req.json().catch(() => ({}))
    const company_name = String(b.company_name || '').trim()
    const email = String(b.email || '').trim().toLowerCase()
    if (!company_name || !email.includes('@'))
      return NextResponse.json({ ok: false, error: 'faltan_datos' }, { status: 400 })
    const row = {
      company_name,
      nif: String(b.nif || '').trim() || null,
      contact_name: String(b.contact_name || '').trim() || null,
      email,
      phone: String(b.phone || '').trim() || null,
      business_type: String(b.business_type || '').trim() || null,
      message: String(b.message || '').trim().slice(0, 2000) || null,
    }
    const { error } = await db().from('distributor_requests').insert(row)
    if (error) throw error
    // (flag) Notificación proactiva a admin (email/WhatsApp) pendiente; hoy queda en la tabla
    // y se ve en el panel admin de solicitudes.
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('distributor-request POST error:', e)
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

// GET admin: listar solicitudes.
export async function GET() {
  try {
    if (!(await getAdminUser())) return NextResponse.json({ ok: false, error: 'no_autorizado' }, { status: 401 })
    if (!SERVICE_KEY) return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })
    const { data, error } = await db().from('distributor_requests')
      .select('*').order('created_at', { ascending: false }).limit(200)
    if (error) throw error
    return NextResponse.json({ ok: true, requests: data || [] })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

// PATCH admin: aprobar/rechazar (actualiza estado + notas). ⚠️ La CREACIÓN de la cuenta de
// distribuidor (Auth user + distributors + distributor_profiles + nivel) queda como paso
// SIGUIENTE (flag): hoy aprobar marca el estado; crear la cuenta lo hace admin con esos datos.
export async function PATCH(req) {
  try {
    if (!(await getAdminUser())) return NextResponse.json({ ok: false, error: 'no_autorizado' }, { status: 401 })
    if (!SERVICE_KEY) return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })
    const b = await req.json().catch(() => ({}))
    const id = b.id, status = b.status
    if (!id || !['approved', 'rejected', 'pending'].includes(status))
      return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
    const { error } = await db().from('distributor_requests')
      .update({ status, admin_notes: b.admin_notes || null, reviewed_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
