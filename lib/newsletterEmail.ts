// lib/newsletterEmail.ts
// Renderiza la newsletter semanal (Ruta A "Agenda" de content) con datos REALES
// de weekly_offers. Rojo de marca #ff1e41 (--red de globals.css; el mockup usaba
// #E11B24 de aproximación). El descuento SIEMPRE se deriva de discount_pct — nunca
// un número a mano. Días agotados/inactivos se OMITEN. Sin promesas no confirmadas.

import {
  DAY_SLOTS, DAY_META, Slot, salePrice, eur, offerEmoji, weekLabel,
} from './weeklyOffers'

const RED = '#ff1e41'

export type OfferProduct = {
  id: number
  name: string
  brand: string | null
  image_url: string | null
  price_incl_tax: number
  stock: number
  active: boolean
  has_variants?: boolean
  categories?: { name: string } | null
}

export type WeeklyOfferRow = {
  slot: Slot
  product_id: number
  discount_pct: number
  active: boolean
  products?: OfferProduct | null
}

export type ResolvedOffer = {
  slot: Slot
  productId: number
  name: string
  brand: string
  category: string
  imageUrl: string | null
  price: number
  pct: number
  sale: number
  saving: number
  emoji: string
  available: boolean
  url: string
}

export type NewsletterConfig = {
  siteUrl: string            // base para enlaces de producto/tienda (sin barra final)
  weekStart: string          // lunes YYYY-MM-DD
  todaySlot: Slot            // día de HOY (Canarias) para marcar "HOY"
  subject?: string
  razonSocial?: string       // ⚠️ dato fiscal real → pendiente Javier/security
  direccionPostal?: string   // ⚠️ idem
  unsubscribeUrl?: string    // ⚠️ baja real (one-click) → pendiente security/RGPD
  preferenciasUrl?: string
  ribbon?: string | null     // cinta superior (solo en vista previa admin)
}

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Convierte una fila de BD (con join products) en una oferta resuelta y honesta.
export function resolveOffer(row: WeeklyOfferRow, siteUrl: string): ResolvedOffer | null {
  const p = row.products
  if (!p) return null
  const price = Number(p.price_incl_tax)
  const pct = Number(row.discount_pct)
  const sale = salePrice(price, pct)
  const category = p.categories?.name || ''
  return {
    slot: row.slot,
    productId: p.id,
    name: p.name,
    brand: p.brand || '',
    category,
    imageUrl: p.image_url || null,
    price,
    pct,
    sale,
    saving: Math.round((price - sale) * 100) / 100,
    emoji: offerEmoji(p.name, category),
    available: !!p.active && Number(p.stock) > 0 && row.active,
    url: `${siteUrl}/producto/${p.id}`,
  }
}

// rows (todas las de la semana) → mapa por slot con solo ofertas disponibles.
export function resolveWeek(rows: WeeklyOfferRow[], siteUrl: string): Record<string, ResolvedOffer | null> {
  const out: Record<string, ResolvedOffer | null> = {}
  for (const s of ['week', ...DAY_SLOTS]) out[s] = null
  for (const r of rows) {
    const resolved = resolveOffer(r, siteUrl)
    if (resolved && resolved.available) out[r.slot] = resolved
  }
  return out
}

function badge(pct: number, size = 15, pad = '4px 10px') {
  return `<span style="display:inline-block; background:${RED}; color:#ffffff; font-family:'Heebo',Arial,sans-serif; font-weight:800; font-size:${size}px; padding:${pad}; border-radius:6px; letter-spacing:.5px;">−${Math.round(pct)}%</span>`
}

function heroPhoto(o: ResolvedOffer) {
  if (o.imageUrl) {
    return `<img src="${esc(o.imageUrl)}" width="180" alt="${esc(o.name)}" style="max-width:180px; max-height:180px; width:auto; height:auto; margin:0 auto; display:block;">`
  }
  return `<div style="font-size:64px; line-height:1;">${o.emoji}</div><div style="font-family:Arial,sans-serif; font-size:10px; color:#a1a1aa; padding-top:8px;">${esc(o.name).slice(0, 28)}</div>`
}

function heroBlock(o: ResolvedOffer | null) {
  if (!o) {
    return `<tr><td class="px" style="padding:10px 32px 4px 32px; font-family:Arial,sans-serif; font-size:13px; color:#a1a1aa;">— Oferta de la semana sin configurar —</td></tr>`
  }
  const sub = [o.brand, o.category].filter(Boolean).join(' · ')
  return `
          <tr>
            <td class="px" style="padding:10px 32px 4px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7; border-radius:12px; overflow:hidden;">
                <tr>
                  <td width="230" valign="middle" align="center" class="stack" style="background:#f4f4f5; padding:26px 10px;">
                    ${heroPhoto(o)}
                  </td>
                  <td valign="middle" class="stack px" style="padding:22px 24px;">
                    ${badge(o.pct)}
                    <div style="font-family:'Heebo',Arial,sans-serif; font-size:20px; font-weight:800; color:#18181b; line-height:1.25; padding:12px 0 2px 0;">
                      ${esc(o.name)}
                    </div>
                    <div style="font-family:Arial,sans-serif; font-size:12px; color:#71717a; padding-bottom:12px;">${esc(sub)}</div>
                    <div>
                      <span class="hero-price" style="font-family:'Heebo',Arial,sans-serif; font-size:34px; font-weight:800; color:${RED}; vertical-align:middle;">${eur(o.sale)}</span>
                      <span style="font-family:Arial,sans-serif; font-size:16px; color:#a1a1aa; text-decoration:line-through; vertical-align:middle; padding-left:8px;">${eur(o.price)}</span>
                    </div>
                    <div style="font-family:Arial,sans-serif; font-size:13px; font-weight:700; color:#16a34a; padding-top:4px;">Ahorras ${eur(o.saving)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
}

function dayRow(o: ResolvedOffer, isToday: boolean) {
  const meta = DAY_META[o.slot]
  const bg = isToday ? '#fdecec' : '#fafafa'
  const border = isToday ? '#f7c5c7' : '#eeeeef'
  const dayColor = isToday ? RED : '#71717a'
  const sub = [o.brand, o.category].filter(Boolean).join(' · ') || o.category
  const hoy = isToday
    ? `<div style="font-size:9px; font-weight:800; background:${RED}; color:#fff; border-radius:4px; padding:1px 0; margin-top:3px;">HOY</div>`
    : ''
  return `
                <tr>
                  <td class="day-cell" style="padding:12px 14px; background:${bg}; border:1px solid ${border}; border-radius:10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td width="58" valign="middle" align="center" style="font-family:'Heebo',Arial,sans-serif; color:${dayColor};">
                        <div style="font-size:11px; font-weight:800; letter-spacing:.5px;">${meta.abbr}</div>
                        ${hoy}
                      </td>
                      <td width="46" valign="middle" align="center" style="font-size:30px;">${o.emoji}</td>
                      <td valign="middle" style="padding-left:8px;">
                        <div style="font-family:'Heebo',Arial,sans-serif; font-size:15px; font-weight:700; color:#18181b; line-height:1.25;">${esc(o.name)}</div>
                        <div style="font-family:Arial,sans-serif; font-size:11px; color:#71717a;">${esc(sub)}</div>
                      </td>
                      <td valign="middle" align="right" style="white-space:nowrap;">
                        ${badge(o.pct, 12, '3px 7px')}
                        <div style="font-family:'Heebo',Arial,sans-serif; font-size:16px; font-weight:800; color:#18181b; padding-top:3px;">${eur(o.sale)}</div>
                      </td>
                    </tr></table>
                  </td>
                </tr>
                <tr><td style="height:8px; line-height:8px; font-size:0;">&nbsp;</td></tr>`
}

export function renderNewsletterHTML(
  offers: Record<string, ResolvedOffer | null>,
  cfg: NewsletterConfig,
): string {
  const site = cfg.siteUrl.replace(/\/$/, '')
  const tiendaUrl = `${site}/tienda`
  const week = offers.week
  const heroUrl = week ? week.url : tiendaUrl
  const razon = cfg.razonSocial || 'BuyMuscle'
  const dir = cfg.direccionPostal || 'Telde, Las Palmas'
  const unsub = cfg.unsubscribeUrl || 'mailto:tienda@buymuscle.es?subject=Baja%20newsletter'
  const prefs = cfg.preferenciasUrl || unsub

  // Días disponibles, en orden Lun→Dom (los agotados/sin-configurar se omiten).
  const dayRows = DAY_SLOTS
    .map((s) => offers[s])
    .filter((o): o is ResolvedOffer => !!o)
    .map((o) => dayRow(o, o.slot === cfg.todaySlot))
    .join('')

  const ribbon = cfg.ribbon
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111113;"><tr><td align="center" style="padding:6px 12px; font-family:Arial,sans-serif; font-size:11px; letter-spacing:.5px; color:#a1a1aa;">${esc(cfg.ribbon)}</td></tr></table>`
    : ''

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>BuyMuscle · Ofertas de la semana</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body,table,td,a{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table,td{ mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img{ -ms-interpolation-mode:bicubic; border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    body{ margin:0; padding:0; width:100% !important; height:100% !important; background:#f4f4f5; }
    a{ color:${RED}; }
    @media only screen and (max-width:600px){
      .container{ width:100% !important; }
      .px{ padding-left:20px !important; padding-right:20px !important; }
      .hero-price{ font-size:30px !important; }
      .stack{ display:block !important; width:100% !important; }
      .h2{ font-size:22px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f4f4f5;">
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#f4f4f5; opacity:0;">
    La OFERTA DE LA SEMANA + una oferta para cada día, de lunes a domingo. Entra y planifica tu compra.
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>
  ${ribbon}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
    <tr>
      <td align="center" style="padding:18px 12px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background:#ffffff; border-radius:14px; overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td class="px" style="padding:20px 32px 14px 32px; background:#111113;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td align="left" style="font-family:'Heebo',Arial,sans-serif; font-size:22px; font-weight:800; letter-spacing:.5px; color:#ffffff;">
                  BUY<span style="color:${RED};">MUSCLE</span>
                </td>
                <td align="right" style="font-family:Arial,sans-serif; font-size:10px; font-weight:700; letter-spacing:1px; color:#a1a1aa; text-transform:uppercase;">
                  Tienda oficial iO.GENIX
                </td>
              </tr></table>
            </td>
          </tr>

          <!-- OFERTA DE LA SEMANA -->
          <tr>
            <td class="px" style="padding:28px 32px 8px 32px;">
              <div style="font-family:'Heebo',Arial,sans-serif; font-size:12px; font-weight:800; letter-spacing:1.5px; color:${RED}; text-transform:uppercase;">⚡ Oferta de la semana</div>
              <div style="font-family:Arial,sans-serif; font-size:12px; color:#71717a; padding-top:2px;">${esc(weekLabel(cfg.weekStart))}</div>
            </td>
          </tr>
          ${heroBlock(week)}
          <tr>
            <td class="px" align="center" style="padding:18px 32px 6px 32px;">
              <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${heroUrl}" style="height:52px;v-text-anchor:middle;width:536px;" arcsize="16%" strokecolor="${RED}" fillcolor="${RED}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;">COMPRAR AHORA →</center></v:roundrect><![endif]-->
              <!--[if !mso]><!-->
              <a href="${heroUrl}" style="display:block; background:${RED}; color:#ffffff; font-family:'Heebo',Arial,sans-serif; font-size:17px; font-weight:800; letter-spacing:.5px; text-align:center; text-decoration:none; padding:16px 24px; border-radius:10px;">COMPRAR AHORA →</a>
              <!--<![endif]-->
            </td>
          </tr>
          <tr>
            <td class="px" align="center" style="padding:6px 32px 4px 32px; font-family:Arial,sans-serif; font-size:11px; color:#a1a1aa;">
              Precio válido toda la semana · IVA incl. · te lo entregamos en 24-48h
            </td>
          </tr>

          <tr><td class="px" style="padding:22px 32px 0 32px;"><div style="border-top:1px solid #e4e4e7; font-size:0; line-height:0;">&nbsp;</div></td></tr>

          <!-- PARRILLA SEMANA -->
          <tr>
            <td class="px" style="padding:22px 32px 4px 32px;" align="center">
              <div class="h2" style="font-family:'Heebo',Arial,sans-serif; font-size:24px; font-weight:800; color:#18181b;">📅 Una oferta para cada día</div>
              <div style="font-family:Arial,sans-serif; font-size:13px; color:#71717a; padding-top:4px;">La previsión de tu semana. Marca tu día — cada oferta vale solo su día.</div>
            </td>
          </tr>
          <tr>
            <td class="px" style="padding:16px 32px 4px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${dayRows}</table>
            </td>
          </tr>

          <!-- CTA FINAL -->
          <tr>
            <td class="px" align="center" style="padding:22px 32px 6px 32px;">
              <a href="${tiendaUrl}" style="display:inline-block; border:2px solid #18181b; color:#18181b; font-family:'Heebo',Arial,sans-serif; font-size:15px; font-weight:800; letter-spacing:.5px; text-decoration:none; padding:13px 30px; border-radius:10px;">VER TODA LA TIENDA →</a>
            </td>
          </tr>

          <!-- BARRA CONFIANZA -->
          <tr>
            <td style="padding:24px 24px 8px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111113; border-radius:12px;">
                <tr>
                  <td width="50%" class="stack" style="padding:16px 18px; font-family:Arial,sans-serif; font-size:12px; color:#e4e4e7; line-height:1.5;">🚀 <strong>Envío 24-48h</strong><br><span style="color:#a1a1aa;">Canarias y Península</span></td>
                  <td width="50%" class="stack" style="padding:16px 18px; font-family:Arial,sans-serif; font-size:12px; color:#e4e4e7; line-height:1.5;">✅ <strong>Marca oficial</strong><br><span style="color:#a1a1aa;">100% originales</span></td>
                </tr>
                <tr>
                  <td width="50%" class="stack" style="padding:16px 18px; font-family:Arial,sans-serif; font-size:12px; color:#e4e4e7; line-height:1.5;">💰 <strong>Precio mínimo</strong><br><span style="color:#a1a1aa;">garantizado</span></td>
                  <td width="50%" class="stack" style="padding:16px 18px; font-family:Arial,sans-serif; font-size:12px; color:#e4e4e7; line-height:1.5;">🔄 <strong>Devolución 14 días</strong><br><span style="color:#a1a1aa;">sin preguntas</span></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="px" align="center" style="padding:18px 32px 28px 32px;">
              <div style="font-family:'Heebo',Arial,sans-serif; font-size:15px; font-weight:800; color:#18181b;">BUY<span style="color:${RED};">MUSCLE</span></div>
              <div style="font-family:Arial,sans-serif; font-size:11px; color:#a1a1aa; line-height:1.6; padding-top:8px;">
                Sin humo, solo resultados. Somos de aquí.<br>
                ${esc(razon)} · ${esc(dir)} · Canarias<br>
                Recibes este correo porque te suscribiste a las ofertas de BuyMuscle.<br>
                <a href="${esc(unsub)}" style="color:#71717a; text-decoration:underline;">Darse de baja</a> ·
                <a href="${esc(prefs)}" style="color:#71717a; text-decoration:underline;">Gestionar preferencias</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// Asunto por defecto (evergreen, no depende de variable → siempre correcto).
export const DEFAULT_SUBJECT = 'Tus ofertas de la semana 💪 (una para cada día)'
