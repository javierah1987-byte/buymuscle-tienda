// Autorización de los endpoints de cron. FAIL-CLOSED: sin CRON_SECRET en el entorno
// se DENIEGA (nunca hay un default committeado). El secreto se acepta por la cabecera
// 'Authorization: Bearer <secret>' —que Vercel Cron inyecta automáticamente cuando
// CRON_SECRET está en el entorno y no queda en logs— o, por compatibilidad, por ?key=
// (jamás contra un default). Comparación en tiempo constante.
import { NextResponse } from 'next/server'
import crypto from 'crypto'

function timingEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

// Devuelve una NextResponse de error si la petición NO está autorizada, o null si SÍ.
export function denyIfUnauthorizedCron(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET
  // Sin secreto configurado → fail-closed (no ejecutar el cron con un default público).
  if (!secret) return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })

  const bearer = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  let key = ''
  try { key = new URL(req.url).searchParams.get('key') || '' } catch { /* url inválida */ }
  const provided = bearer || key

  if (!provided || !timingEqual(provided, secret))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return null
}
