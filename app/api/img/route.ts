// Proxy para imágenes de tienda.buymuscle.es (bypass hotlink 403)
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url param required' }, { status: 400 })

  // Solo permitir imágenes del servidor autorizado
  if (!url.startsWith('https://tienda.buymuscle.es/') && !url.startsWith('http://tienda.buymuscle.es/')) {
    return NextResponse.json({ error: 'domain not allowed' }, { status: 403 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Referer': 'https://tienda.buymuscle.es/',
        'User-Agent': 'Mozilla/5.0 (compatible; BuyMuscle/1.0)',
        'Accept': 'image/webp,image/avif,image/*,*/*;q=0.8',
      },
      // Sin cache para que no se cachee el 403
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'upstream ' + res.status }, { status: res.status })
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
