// @ts-nocheck
import { NextResponse } from 'next/server'

const esc = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// POST -> solicitud "Unirse al BM Team" desde la web -> email a la tienda vía Resend.
export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }

  const nombre = esc(String(body?.nombre || '').trim().slice(0, 120))
  const email = String(body?.email || '').trim().slice(0, 160)
  const telefono = esc(String(body?.telefono || '').trim().slice(0, 40))
  const instagram = esc(String(body?.instagram || '').trim().slice(0, 80))
  const mensaje = esc(String(body?.mensaje || '').trim().slice(0, 2000)).replace(/\n/g, '<br>')

  if (!nombre || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Nombre y un email válido son obligatorios' }, { status: 400 })
  }
  const key = process.env.RESEND_API_KEY
  if (!key) { console.error('bm-team-apply: sin RESEND_API_KEY'); return NextResponse.json({ error: 'Email no configurado' }, { status: 500 }) }

  const html = '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#222;max-width:600px;margin:0 auto">'
    + '<div style="background:#00F399;padding:20px 32px;text-align:center"><h1 style="color:#111;margin:0;font-size:22px;font-weight:900">BM TEAM · Nueva solicitud</h1></div>'
    + '<div style="padding:28px;font-size:15px;line-height:1.7">'
    + '<p style="margin:0 0 6px"><strong>Nombre:</strong> ' + nombre + '</p>'
    + '<p style="margin:0 0 6px"><strong>Email:</strong> <a href="mailto:' + esc(email) + '">' + esc(email) + '</a></p>'
    + '<p style="margin:0 0 6px"><strong>Teléfono:</strong> ' + (telefono || '—') + '</p>'
    + '<p style="margin:0 0 6px"><strong>Instagram:</strong> ' + (instagram || '—') + '</p>'
    + '<p style="margin:14px 0 0"><strong>Mensaje:</strong><br>' + (mensaje || '—') + '</p>'
    + '</div><div style="background:#111;padding:14px 32px;text-align:center"><p style="color:#777;font-size:12px;margin:0">Solicitud recibida desde la web · BM Team</p></div></body></html>'

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'BuyMuscle <pedidos@buymuscle.es>',
        to: ['tienda@buymuscle.es'],
        reply_to: email,
        subject: 'BM Team — Solicitud de ' + (body?.nombre || '').toString().trim().slice(0, 60),
        html,
      }),
    })
    if (!r.ok) { const t = await r.text(); console.error('bm-team resend fail', r.status, t); return NextResponse.json({ error: 'No se pudo enviar la solicitud' }, { status: 502 }) }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
