// Helpers del flujo OTP de /mis-pedidos (verificación de email para invitados).
// Todo server-side: la tabla mis_pedidos_otp solo la toca el service_role.
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const OTP_COOKIE = 'mp_session'
export const OTP_TTL_MIN = 10        // validez del código OTP
export const SESSION_TTL_MIN = 30    // validez de la sesión verificada
export const MAX_ATTEMPTS = 5        // intentos de código antes de invalidarlo
export const RL_EMAIL_15MIN = 5      // máx OTP enviados por email / 15 min
export const RL_IP_15MIN = 20        // máx OTP enviados por IP / 15 min

export function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

// El hash del código va ligado al email → un code_hash no se puede reutilizar
// con otro email, y el valor en claro nunca se guarda.
export const hashCode = (code: string, email: string) => sha256(code + ':' + email.toLowerCase())
export const hashToken = (token: string) => sha256(token)

export const genCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
export const genToken = () => crypto.randomBytes(32).toString('hex')

// Comparación en tiempo constante (evita timing sobre el hash).
export function timingEq(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb)
}

export function normEmail(v: unknown): string {
  return String(v ?? '').trim().toLowerCase()
}
export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || ''
  return xff.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'
}

export function minutesAgoISO(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString()
}
export function inMinutesISO(min: number): string {
  return new Date(Date.now() + min * 60_000).toISOString()
}

// Opciones de la cookie de sesión verificada (httpOnly + secure + sameSite).
export function sessionCookieOpts() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_MIN * 60,
  }
}
