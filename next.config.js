/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'tienda.buymuscle.es' },
      { protocol: 'https', hostname: '**' },
    ]
  }
}
module.exports = nextConfig
