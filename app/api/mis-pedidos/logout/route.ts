// @ts-nocheck
// POST /api/mis-pedidos/logout — revoca la sesión verificada (stateful) y borra la cookie.
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminDb, hashToken, OTP_COOKIE } from '@/lib/misPedidosOtp'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const token = cookies().get(OTP_COOKIE)?.value
    if (token && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const db = adminDb()
      // Invalida la sesión en el servidor (no solo la cookie): revocación real.
      await db.from('mis_pedidos_otp')
        .update({ session_token_hash: null, session_expires_at: null })
        .eq('session_token_hash', hashToken(token))
    }
  } catch (e) { console.error('logout error:', e) }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(OTP_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}
