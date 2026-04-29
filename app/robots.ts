import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/tpv', '/api', '/pedido-confirmado', '/mis-pedidos', '/mi-cuenta'],
      },
    ],
    sitemap: 'https://buymuscle-tienda.vercel.app/sitemap.xml',
    host: 'https://buymuscle-tienda.vercel.app',
  }
}
