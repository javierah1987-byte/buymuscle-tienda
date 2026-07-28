// @ts-nocheck
// GET /api/admin/newsletter-preview?week=<ymd> → HTML del email renderizado con
// datos REALES de weekly_offers (para el botón "Vista previa" del panel). Admin.
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'
import { loadWeek, renderWeek } from '@/lib/newsletterData'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ ok: false, error: 'no_autorizado' }, { status: 401 })
  try {
    const week = new URL(req.url).searchParams.get('week') || undefined
    const loaded = await loadWeek(week)
    const ribbon = loaded.complete
      ? null
      : `🔧 VISTA PREVIA · faltan ${loaded.missing.length} ofertas (${loaded.missing.join(', ')}) — el envío automático NO saldría hasta completarlas`
    const html = renderWeek(loaded, { ribbon })
    return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
