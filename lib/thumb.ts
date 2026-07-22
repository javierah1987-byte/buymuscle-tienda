// Miniatura al vuelo de Supabase Storage: sirve una versión reducida (WebP en
// navegador) en lugar del JPG original (que puede pesar hasta 2 MB). Igual que
// hace el TPV con su thumbUrl. Uso: <img src={thumbUrl(p.image_url, 150)} .../>
export function thumbUrl(url?: string | null, width = 200, quality = 60): string {
  if (!url) return (url as any) || ''
  return url.includes('/object/public/')
    ? url.replace('/object/public/', '/render/image/public/') + `?width=${width}&quality=${quality}&resize=contain`
    : url
}
