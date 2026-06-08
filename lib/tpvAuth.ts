// @ts-nocheck
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Sesión del TPV basada en un PIN compartido (TPV_PIN) + cookie httpOnly.
// El PIN no se almacena en la cookie: se guarda un token derivado, de modo
// que rotar el PIN invalida todas las sesiones abiertas.
const PIN = process.env.TPV_PIN || ''
export const TPV_COOKIE = 'bm_tpv'

export function tpvToken(): string {
  return crypto.createHash('sha256').update('bm-tpv:' + PIN).digest('hex')
}

// true si la cookie de la petición corresponde al PIN configurado.
export function tpvAuthorized(): boolean {
  if (!PIN) return false
  const c = cookies().get(TPV_COOKIE)?.value
  return !!c && c === tpvToken()
}
