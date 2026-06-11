const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  compress: true,
  images: {
    // Solo los hosts reales de imágenes de producto. Con el optimizador activo
    // (sin `unoptimized`), un comodín '**' lo convertiría en proxy abierto.
    remotePatterns: [
      { protocol: 'https', hostname: 'tienda.buymuscle.es' },
      { protocol: 'https', hostname: 'awwlbepjxuoxaigztugh.supabase.co' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    // CSP: solo pueden ejecutarse scripts propios o de los servicios que usamos
    // (GA4, Meta Pixel, PayPal). Es la principal defensa contra inyección de
    // scripts (skimmers de tarjetas). 'unsafe-inline' en script/style es
    // necesario por los scripts de hidratación de Next y los estilos inline.
    // img/media van permisivos (https:) porque una imagen no ejecuta código y
    // así no se rompen banners/blog con orígenes variados.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://www.paypal.com https://*.paypal.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https:",
      "font-src 'self' data:",
      "connect-src 'self' https://awwlbepjxuoxaigztugh.supabase.co https://*.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://www.paypal.com https://*.paypal.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
      "frame-src https://www.paypal.com https://*.paypal.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://www.paypal.com",
      "frame-ancestors 'self'",
    ].join('; ')
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  // Solo subir source maps si hay token de Sentry configurado (no rompe el build sin él)
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  telemetry: false,
})
