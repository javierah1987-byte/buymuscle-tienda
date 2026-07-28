// lib/weeklyOffers.ts
// Helpers PUROS (server + client) para las ofertas semanales. Sin imports de
// supabase: solo slots, fechas en Atlantic/Canary, precio derivado y emoji.
// Es la lógica compartida por las 3 superficies que leen weekly_offers:
//   · web "oferta de la semana" (app/page.tsx, server)
//   · web "oferta del día"      (components/OfertaDia.tsx, client)
//   · newsletter del lunes       (lib/newsletterEmail.ts, server)
// Una sola fuente de verdad → no pueden divergir.

export const TZ = 'Atlantic/Canary'

export type Slot = 'week' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export const DAY_SLOTS: Slot[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
export const ALL_SLOTS: Slot[] = ['week', ...DAY_SLOTS]

export const DAY_META: Record<string, { abbr: string; name: string }> = {
  mon: { abbr: 'LUN', name: 'Lunes' },
  tue: { abbr: 'MAR', name: 'Martes' },
  wed: { abbr: 'MIÉ', name: 'Miércoles' },
  thu: { abbr: 'JUE', name: 'Jueves' },
  fri: { abbr: 'VIE', name: 'Viernes' },
  sat: { abbr: 'SÁB', name: 'Sábado' },
  sun: { abbr: 'DOM', name: 'Domingo' },
}

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Partes de fecha en hora de Canarias (robusto a DST vía Intl: en verano UTC+1,
// en invierno UTC+0 — el cálculo del día/semana no se desfasa).
function canaryParts(d: Date = new Date()) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  }).formatToParts(d)
  const get = (t: string) => p.find((x) => x.type === t)?.value || ''
  const y = Number(get('year')), m = Number(get('month')), day = Number(get('day'))
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }
  const weekday = map[get('weekday')] ?? 0 // 0 = lunes … 6 = domingo
  return { y, m, day, weekday }
}

function ymd(y: number, m: number, d: number) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${y}-${pad(m)}-${pad(d)}`
}

// Suma de días sobre una fecha YYYY-MM-DD (aritmética UTC pura sobre la fecha
// local de Canarias → sin horas, sin saltos DST).
export function addDaysYmd(ymdStr: string, days: number): string {
  const [y, m, d] = ymdStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())
}

// Lunes (YYYY-MM-DD) de la semana de Canarias que contiene `d`.
export function canaryWeekStart(d: Date = new Date()): string {
  const { y, m, day, weekday } = canaryParts(d)
  return addDaysYmd(ymd(y, m, day), -weekday)
}

// Slot del día de HOY en Canarias ('mon'..'sun').
export function todayDaySlot(d: Date = new Date()): Slot {
  return DAY_SLOTS[canaryParts(d).weekday]
}

// Fecha de hoy (YYYY-MM-DD) en Canarias.
export function canaryYmd(d: Date = new Date()): string {
  const { y, m, day } = canaryParts(d)
  return ymd(y, m, day)
}

// Etiqueta "Del lunes 28 jul al domingo 3 ago · válida los 7 días".
export function weekLabel(weekStart: string): string {
  const end = addDaysYmd(weekStart, 6)
  const fmt = (s: string) => { const [, m, d] = s.split('-').map(Number); return `${d} ${MONTHS_ES[m - 1]}` }
  return `Del lunes ${fmt(weekStart)} al domingo ${fmt(end)} · válida los 7 días`
}

// Ventana de validez ISO para starts_at/ends_at (día completo en Canarias, en UTC).
// Nota: usa el offset del propio día (verano/invierno) para no desfasar la medianoche.
export function slotWindowIso(weekStart: string, slot: Slot): { starts_at: string; ends_at: string } {
  const startDay = slot === 'week' ? weekStart : addDaysYmd(weekStart, DAY_SLOTS.indexOf(slot))
  const endDay = slot === 'week' ? addDaysYmd(weekStart, 6) : startDay
  return { starts_at: `${startDay}T00:00:00+00:00`, ends_at: `${addDaysYmd(endDay, 1)}T00:00:00+00:00` }
}

// Precio de oferta = precio con IVA menos el % (redondeo a 2 decimales).
export function salePrice(priceInclTax: number, pct: number): number {
  return Math.round(priceInclTax * (1 - pct / 100) * 100) / 100
}

// '50,30 €' (formato es-ES sin depender de Intl en el render del email).
export function eur(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' €'
}

// Emoji por categoría/nombre (misma paleta que el mockup de content).
export function offerEmoji(name = '', category = ''): string {
  const s = (name + ' ' + category).toLowerCase()
  if (/(isolate|isoluxe|whey|prote|case[ií]na|milk)/.test(s)) return '🥛'
  if (/(crea|creatin)/.test(s)) return '⚡'
  if (/(pre.?train|pre.?entren|roulette|russian|pump|booster)/.test(s)) return '🔥'
  if (/(arroz|oat|avena|carbo|gainer|maltodext|hidrato)/.test(s)) return '🍚'
  if (/(omega|fish|aceite|epa|dha)/.test(s)) return '🐟'
  if (/(magnes|vitam|mineral|zinc|zma|multi)/.test(s)) return '💊'
  if (/(bcaa|amino|glutam)/.test(s)) return '💪'
  if (/(quemador|burner|carnit|termog)/.test(s)) return '🎯'
  return '🏷️'
}

// Rotación determinista por semana (para que el autocompletar no repita los
// mismos 7 días cada semana). Sin Math.random.
export function weekRotation(weekStart: string): number {
  return weekStart.split('').reduce((a, c) => a + (c >= '0' && c <= '9' ? Number(c) : 0), 0)
}
