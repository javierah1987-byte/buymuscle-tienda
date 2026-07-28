// @ts-nocheck
// POST /api/admin/newsletter-test-send { email, week? } → renderiza la semana y
// envía SOLO a ese email (validación). NUNCA a la lista de suscriptores: el envío
// masivo real es el cron (dormido) y es PROD/más adelante (doble OK + RGPD).
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'
import { loadWeek, renderWeek, sendViaResend } from '@/lib/newsletterData'
import { DEFAULT_SUBJECT } from '@/lib/newsletterEmail'

export const dynamic = 'force-dynamic'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ ok: false, error: 'no_autorizado' }, { status: 401 })
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: 'json_invalido' }, { status: 400 }) }

  const email = String(body?.email || '').trim()
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: 'email_invalido' }, { status: 400 })

  try {
    const loaded = await loadWeek(body?.week || undefined)
    // Test-send permite semana incompleta (es una prueba a ti mismo); el aviso va en la respuesta.
    const html = renderWeek(loaded, { ribbon: '🔧 PRUEBA · este correo es una vista de validación, no un envío a clientes' })
    const subject = '[PRUEBA] ' + (body?.subject || DEFAULT_SUBJECT)
    const results = await sendViaResend([email], subject, html)
    const first: any = results[0]
    const val = first?.status === 'fulfilled' ? first.value : null
    if (val?.id) {
      return NextResponse.json({ ok: true, id: val.id, to: email, complete: loaded.complete, missing: loaded.missing, week_start: loaded.week_start })
    }
    return NextResponse.json({ ok: false, error: 'resend_fallo', detail: val || first?.reason?.message || 'sin id' }, { status: 502 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
