// Proxy para imágenes de tienda.buymuscle.es (bypass hotlink 403)
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url param required' }, { status: 400 })

  // Solo permitir imágenes del servidor autorizado: validar el HOST exacto
  // (un startsWith es burlable y, siguiendo redirecciones, abre la puerta a SSRF).
  let parsed: URL
  try { parsed = new URL(url) } catch { return NextResponse.json({ error: 'invalid url' }, { status: 400 }) }
  if (parsed.hostname !== 'tienda.buymuscle.es' || !['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ error: 'domain not allowed' }, { status: 403 })
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: {
        'Referer': 'https://tienda.buymuscle.es/',
        'User-Agent': 'Mozilla/5.0 (compatible; BuyMuscle/1.0)',
        'Accept': 'image/webp,image/avif,image/*,*/*;q=0.8',
      },
      // No seguir redirecciones: evita que el host permitido nos rebote a una IP interna (SSRF).
      redirect: 'manual',
      // Sin cache para que no se cachee el 403
      cache: 'no-store',
    })

    // Una redirección (3xx con body opaco) no es una imagen válida y no debe seguirse.
    if (res.status >= 300 && res.status < 400) {
      return NextResponse.json({ error: 'redirect blocked' }, { status: 502 })
    }
    if (!res.ok) {
      return NextResponse.json({ error: 'upstream ' + res.status }, { status: res.status })
    }
    // Asegurar que lo que devolvemos es realmente una imagen.
    const upstreamType = res.headers.get('content-type') || ''
    if (!upstreamType.startsWith('image/')) {
      return NextResponse.json({ error: 'not an image' }, { status: 502 })
    }

    const data = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000, s-maxage=2592000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 })
  }
}
