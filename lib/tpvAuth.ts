// @ts-nocheck
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Sesión del TPV basada en un PIN compartido + cookie httpOnly.
// El hash del PIN vive en la tabla app_secrets (key='tpv_pin_hash', RLS sin
// políticas → solo service role). Si no hay fila, cae a la env var TPV_PIN.
// En la cookie se guarda un token derivado del hash: cambiar el PIN invalida
// todas las sesiones abiertas.
export const TPV_COOKIE = 'bm_tpv'

const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

async function getPinHash(): Promise<string> {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data } = await db.from('app_secrets').select('value').eq('key', 'tpv_pin_hash').maybeSingle()
    if (data?.value) return data.value
  } catch { /* cae al fallback de env */ }
  if (process.env.TPV_PIN) return sha('pin:' + process.env.TPV_PIN)
  return ''
}

// ¿Hay PIN configurado (BD o env)?
export async function tpvPinConfigured(): Promise<boolean> {
  return !!(await getPinHash())
}

// Valida un PIN introducido (comparación en tiempo constante sobre hashes).
export async function validateTpvPin(pin: unknown): Promise<boolean> {
  const stored = await getPinHash()
  if (!stored || !pin) return false
  const candidate = sha('pin:' + String(pin))
  const a = Buffer.from(candidate), b = Buffer.from(stored)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

// Token de sesión derivado del hash del PIN.
export async function tpvToken(): Promise<string> {
  const stored = await getPinHash()
  return stored ? sha('bm-tpv:' + stored) : ''
}

// true si la cookie de la petición corresponde al PIN vigente.
export async function tpvAuthorized(): Promise<boolean> {
  const token = await tpvToken()
  if (!token) return false
  const c = cookies().get(TPV_COOKIE)?.value
  return !!c && c === token
}
