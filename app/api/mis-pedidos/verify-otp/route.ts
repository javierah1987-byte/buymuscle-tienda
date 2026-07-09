// @ts-nocheck
// POST /api/mis-pedidos/verify-otp  { email, code }
// Verifica el OTP. Al acertar: marca el código como consumido (un solo uso),
// crea una sesión efímera (token aleatorio, hash en tabla, 30 min) y la entrega
// en una cookie httpOnly. A partir de ahí /api/my-orders confía en esa cookie.
import { NextResponse } from 'next/server'
import {
  adminDb, hashCode, genToken, hashToken, timingEq, normEmail, isEmail,
  inMinutesISO, sessionCookieOpts, OTP_COOKIE, MAX_ATTEMPTS, SESSION_TTL_MIN,
} from '@/lib/misPedidosOtp'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
      return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })

    const body = await req.json().catch(() => ({}))
    const email = normEmail(body?.email)
    const code = String(body?.code ?? '').trim()
    if (!isEmail(email) || !/^\d{6}$/.test(code))
      return NextResponse.json({ ok: false, error: 'invalid_input' }, { status: 400 })

    const db = adminDb()
    const nowISO = new Date().toISOString()

    // Último código no consumido y no caducado de ese email.
    const { data: row } = await db.from('mis_pedidos_otp')
      .select('id, code_hash, attempts')
      .eq('email', email).eq('consumed', false).gt('expires_at', nowISO)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()

    // Respuesta genérica para código inexistente/caducado (no distingue de fallo).
    const invalid = () => NextResponse.json({ ok: false, error: 'invalid_or_expired' }, { status: 401 })
    if (!row) return invalid()

    if ((row.attempts || 0) >= MAX_ATTEMPTS) {
      // Demasiados intentos: quema el código (fuerza pedir uno nuevo).
      await db.from('mis_pedidos_otp').update({ consumed: true }).eq('id', row.id)
      return NextResponse.json({ ok: false, error: 'too_many_attempts' }, { status: 429 })
    }

    if (!timingEq(row.code_hash, hashCode(code, email))) {
      await db.from('mis_pedidos_otp').update({ attempts: (row.attempts || 0) + 1 }).eq('id', row.id)
      return invalid()
    }

    // OK: consume el código y abre sesión verificada (misma fila).
    const token = genToken()
    const { error: updErr } = await db.from('mis_pedidos_otp').update({
      consumed: true,
      session_token_hash: hashToken(token),
      session_expires_at: inMinutesISO(SESSION_TTL_MIN),
    }).eq('id', row.id).eq('consumed', false) // guard anti-carrera: un solo consumo
    if (updErr) return invalid()

    const res = NextResponse.json({ ok: true })
    res.cookies.set(OTP_COOKIE, token, sessionCookieOpts())
    return res
  } catch (e: any) {
    console.error('verify-otp error:', e)
    return NextResponse.json({ ok: false, error: 'error' }, { status: 500 })
  }
}
