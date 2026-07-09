// @ts-nocheck
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminDb, hashToken, OTP_COOKIE } from '@/lib/misPedidosOtp'

export const dynamic = 'force-dynamic'

// GET /api/my-orders
// Devuelve los pedidos del email VERIFICADO por OTP (cookie de sesión mp_session).
// Ya NO acepta un email por query param: eso era el IDOR (cualquiera obtenía los
// pedidos + order_number de cualquier email). El email sale de la sesión, no del cliente.
export async function GET() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
      return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })

    const token = cookies().get(OTP_COOKIE)?.value
    if (!token) return NextResponse.json({ ok: false, error: 'no_verificado' }, { status: 401 })

    const db = adminDb()
    const nowISO = new Date().toISOString()

    // La cookie es un handle: se re-valida en servidor contra la sesión viva
    // (hash del token + no caducada + código consumido). Un token robado/caducado es inerte.
    const { data: session } = await db.from('mis_pedidos_otp')
      .select('email, session_expires_at')
      .eq('session_token_hash', hashToken(token))
      .eq('consumed', true)
      .gt('session_expires_at', nowISO)
      .order('created_at', { ascending: false })
      .limit(1).maybeSingle()

    if (!session?.email) return NextResponse.json({ ok: false, error: 'no_verificado' }, { status: 401 })

    // Solo los pedidos del email verificado. Campos acotados + líneas.
    const { data: orders } = await db.from('orders')
      .select('id, order_number, created_at, status, total, payment_method, tracking_number, holded_invoice_id, order_lines(product_name, quantity, unit_price, line_total)')
      .eq('customer_email', session.email)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ ok: true, email: session.email, orders: orders || [] })
  } catch (e) {
    console.error('my-orders error:', e)
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
