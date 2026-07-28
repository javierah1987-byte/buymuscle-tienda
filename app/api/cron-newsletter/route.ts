// @ts-nocheck
// ┌───────────────────────────────────────────────────────────────────────────┐
// │ CRON NEWSLETTER SEMANAL — DORMIDO A PROPÓSITO (no activado).               │
// │ El envío MASIVO real a suscriptores es PROD y va en otra tanda: requiere   │
// │ (1) doble OK de Javier, (2) RGPD con security (doble opt-in, baja          │
// │ one-click, datos fiscales), (3) añadir la entrada a vercel.json.           │
// │                                                                            │
// │ Doble candado para que NO pueda dispararse hoy:                            │
// │   · denyIfUnauthorizedCron (Bearer CRON_SECRET, fail-closed).              │
// │   · NEWSLETTER_CRON_ENABLED !== 'true' → 503. La env NO está puesta.       │
// │   · NO está en vercel.json → Vercel no lo programa (y los cron solo        │
// │     corren en el deploy de PRODUCCIÓN, nunca en preview).                  │
// │                                                                            │
// │ Horario objetivo cuando se active: lunes ~07:30 Atlantic/Canary. Vercel    │
// │ Cron corre en UTC → verano (UTC+1) = "30 6 * * 1"; invierno (UTC+0) =      │
// │ "30 7 * * 1". Como no hay DST en cron, la ruta revalida abajo que sea      │
// │ realmente lunes en Canarias antes de enviar.                              │
// └───────────────────────────────────────────────────────────────────────────┘
import { NextResponse } from 'next/server'
import { denyIfUnauthorizedCron } from '@/lib/cronAuth'
import { loadWeek, renderWeek, sendViaResend, svcClient } from '@/lib/newsletterData'
import { DEFAULT_SUBJECT } from '@/lib/newsletterEmail'
import { todayDaySlot } from '@/lib/weeklyOffers'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const denied = denyIfUnauthorizedCron(req)
  if (denied) return denied

  if (process.env.NEWSLETTER_CRON_ENABLED !== 'true') {
    return NextResponse.json({
      ok: true, sent: false,
      msg: 'cron_newsletter_no_activado — pendiente OK Javier + RGPD (security) + entrada en vercel.json',
    })
  }

  try {
    // Solo lunes en Canarias (defensa DST del schedule UTC).
    if (todayDaySlot() !== 'mon') return NextResponse.json({ ok: true, sent: false, msg: 'no_es_lunes_canarias' })

    const loaded = await loadWeek() // semana actual
    // GUARD de completitud: mejor no enviar que enviar a medias.
    if (!loaded.complete) {
      return NextResponse.json({ ok: true, sent: false, msg: 'semana_incompleta', missing: loaded.missing })
    }

    const db = svcClient()
    const { data: subs } = await db.from('email_subscribers').select('email')
    const emails = (subs || []).map((s: any) => s.email).filter(Boolean)
    if (!emails.length) return NextResponse.json({ ok: true, sent: false, msg: 'sin_suscriptores' })

    const html = renderWeek(loaded)
    await sendViaResend(emails, DEFAULT_SUBJECT, html)
    await db.from('newsletter_campaigns').insert({
      subject: DEFAULT_SUBJECT, body_html: html, status: 'sent', sent_count: emails.length,
    })
    return NextResponse.json({ ok: true, sent: true, count: emails.length, week_start: loaded.week_start })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
