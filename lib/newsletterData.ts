// @ts-nocheck
// Carga + resuelve la semana de weekly_offers para el render del email y el guard
// de completitud. Service role (server only). Compartido por preview, test-send y
// el cron (dormido). Sitio para enlaces: NEXT_PUBLIC_SITE_URL o el dominio de prod.
import { createClient } from '@supabase/supabase-js'
import { resolveWeek, renderNewsletterHTML, DEFAULT_SUBJECT } from './newsletterEmail'
import { ALL_SLOTS, canaryWeekStart, todayDaySlot, weekLabel } from './weeklyOffers'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://buymuscle.es').replace(/\/$/, '')

const OFFER_SEL =
  'slot,product_id,discount_pct,active,products(id,name,brand,image_url,price_incl_tax,stock,active,has_variants,categories(name))'

export function svcClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Devuelve las ofertas DISPONIBLES de la semana + estado de completitud.
// missing = slots sin oferta disponible (sin configurar o agotado/inactivo).
export async function loadWeek(weekStart?: string, siteUrl: string = SITE_URL) {
  const db = svcClient()
  const week = weekStart || canaryWeekStart()
  const { data, error } = await db.from('weekly_offers').select(OFFER_SEL).eq('week_start', week)
  if (error) throw new Error(error.message)
  const rows = data || []
  const offers = resolveWeek(rows, siteUrl) // solo las disponibles pasan el filtro
  const missing = ALL_SLOTS.filter((s) => !offers[s])
  return {
    week_start: week,
    offers,
    rows,
    missing,
    complete: missing.length === 0,
    todaySlot: todayDaySlot(),
    label: weekLabel(week),
  }
}

// Render del email para una semana (con opciones de config/ribbon).
export function renderWeek(loaded: any, opts: { ribbon?: string | null; subject?: string } = {}) {
  return renderNewsletterHTML(loaded.offers, {
    siteUrl: SITE_URL,
    weekStart: loaded.week_start,
    todaySlot: loaded.todaySlot,
    subject: opts.subject || DEFAULT_SUBJECT,
    // ⚠️ pendientes de Javier/security (datos fiscales reales + baja one-click RGPD)
    razonSocial: process.env.NEWSLETTER_RAZON_SOCIAL || 'BuyMuscle',
    direccionPostal: process.env.NEWSLETTER_DIRECCION || 'Telde, Las Palmas',
    unsubscribeUrl: process.env.NEWSLETTER_UNSUB_URL || 'mailto:tienda@buymuscle.es?subject=Baja%20newsletter',
    preferenciasUrl: process.env.NEWSLETTER_PREFS_URL || 'mailto:tienda@buymuscle.es?subject=Preferencias%20newsletter',
    ribbon: opts.ribbon ?? null,
  })
}

// Envío por Resend a un conjunto de destinatarios (uso: test-send 1, cron N).
export async function sendViaResend(to: string[], subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('No RESEND_API_KEY')
  const from = process.env.NEWSLETTER_FROM || 'BUYMUSCLE <newsletter@buymuscle.es>'
  const results: any[] = []
  for (let i = 0; i < to.length; i += 50) {
    const batch = to.slice(i, i + 50)
    const r = await Promise.allSettled(
      batch.map((email) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to: email, subject, html }),
        }).then((res) => res.json()),
      ),
    )
    results.push(...r)
  }
  return results
}
