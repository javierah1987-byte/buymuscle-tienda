// @ts-nocheck
// POST /api/mis-pedidos/request-otp  { email }
// Envía un código OTP de 6 dígitos al email SOLO si ese email tiene pedidos.
// Respuesta SIEMPRE genérica: no revela si el email existe (anti-enumeración) ni
// si se envió (anti-open-relay). Rate-limit por email y por IP (tabla compartida).
import { NextResponse } from 'next/server'
import {
  adminDb, hashCode, genCode, normEmail, isEmail, clientIp,
  minutesAgoISO, inMinutesISO, OTP_TTL_MIN, RL_EMAIL_15MIN, RL_IP_15MIN,
} from '@/lib/misPedidosOtp'

export const dynamic = 'force-dynamic'

async function sendOtpEmail(email: string, code: string) {
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) { console.error('mis-pedidos OTP: sin RESEND_API_KEY'); return }
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
    <div style="max-width:480px;margin:0 auto;padding:20px">
      <div style="background:#111;padding:28px;text-align:center">
        <h1 style="color:#ff1e41;font-size:26px;font-weight:900;margin:0">BUYMUSCLE</h1>
      </div>
      <div style="background:white;padding:32px;text-align:center">
        <h2 style="font-size:18px;color:#111;margin:0 0 8px">Tu código para ver tus pedidos</h2>
        <p style="font-size:14px;color:#555;margin:0 0 24px">Introduce este código en la web para acceder a tu historial de pedidos.</p>
        <div style="font-size:34px;font-weight:900;letter-spacing:8px;color:#ff1e41;background:#fff5f6;padding:16px;border:1px dashed #ff1e41">${code}</div>
        <p style="font-size:13px;color:#888;margin:24px 0 0">Caduca en ${OTP_TTL_MIN} minutos. Si no lo has solicitado tú, ignora este correo.</p>
      </div>
      <div style="text-align:center;padding:16px;font-size:11px;color:#aaa">BUYMUSCLE · Telde, Las Palmas</div>
    </div>
  </body></html>`
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'BuyMuscle <pedidos@buymuscle.es>',
        to: [email],
        subject: 'Tu código de acceso: ' + code + ' · BUYMUSCLE',
        html,
      }),
    })
  } catch (e) { console.error('mis-pedidos OTP email error:', e) }
}

export async function POST(req: Request) {
  // Respuesta genérica común (no revela nada).
  const generic = () => NextResponse.json({ ok: true })
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
      return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })

    const body = await req.json().catch(() => ({}))
    const email = normEmail(body?.email)
    if (!isEmail(email)) return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })

    const ip = clientIp(req)
    const db = adminDb()
    const since = minutesAgoISO(15)

    // Rate-limit por email y por IP (cuenta OTP realmente emitidos = filas creadas).
    const [{ count: emailCount }, { count: ipCount }] = await Promise.all([
      db.from('mis_pedidos_otp').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', since),
      db.from('mis_pedidos_otp').select('id', { count: 'exact', head: true }).eq('ip', ip).gte('created_at', since),
    ])
    if ((emailCount || 0) >= RL_EMAIL_15MIN || (ipCount || 0) >= RL_IP_15MIN)
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

    // Solo emitimos OTP si el email tiene algún pedido (no somos relay de correo abierto).
    // La respuesta es genérica igual, así que no se filtra la existencia.
    const { data: hasOrder } = await db.from('orders')
      .select('id').eq('customer_email', email).limit(1).maybeSingle()
    if (!hasOrder) return generic()

    const code = genCode()
    const { error: insErr } = await db.from('mis_pedidos_otp').insert({
      email,
      code_hash: hashCode(code, email),
      expires_at: inMinutesISO(OTP_TTL_MIN),
      ip,
    })
    if (insErr) { console.error('mis-pedidos OTP insert error:', insErr); return generic() }

    await sendOtpEmail(email, code)
    return generic()
  } catch (e: any) {
    console.error('request-otp error:', e)
    // Ante error interno, seguimos siendo genéricos para no filtrar por diferencia de respuesta.
    return NextResponse.json({ ok: true })
  }
}
