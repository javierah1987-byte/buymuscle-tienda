import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /distribuidores es portal privado (login + facturas): fuera del índice.
        // El middleware además manda X-Robots-Tag noindex en estas zonas.
        disallow: ['/admin', '/tpv', '/distribuidores', '/api', '/pedido-confirmado', '/mis-pedidos', '/mi-cuenta'],
      },
    ],
    sitemap: SITE_URL + '/sitemap.xml',
    host: SITE_URL,
  }
}
