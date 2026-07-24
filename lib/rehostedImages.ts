// Assets que estaban HOTLINKEADOS al PrestaShop viejo (tienda.buymuscle.es) y
// ahora sirve nuestro propio storage de Supabase.
//
// Por qué: ese LiteSpeed aplica hotlink protection — de ahí que ya existan
// `proxyImg()` (ProductCard/ImageGallery) y `/api/img`. Las secciones de BLOG y
// de BM TEAM eran las únicas que pedían la imagen en crudo, sin proxy, y por eso
// eran las que se veían rotas. Además ese host devuelve 403 a ficheros que ya no
// existen (Jose.jpg, JuanCarlos.jpg) y desaparecerá cuando se apague la tienda
// antigua: proxearlo solo aplaza el problema.
//
// Rehospedar lo quita de la ecuación: sin origen ajeno, sin salto de proxy y
// cacheado en el CDN de Supabase (mismo sitio que las fotos de producto).
//
// El mapa es EXPLÍCITO a propósito: una ruta que no esté aquí se devuelve tal
// cual y la sigue sirviendo el proxy como siempre. Así nunca apuntamos a un
// objeto de storage que no hayamos subido.

const CDN = 'https://awwlbepjxuoxaigztugh.supabase.co/storage/v1/object/public/product-images/'
const LEGACY_HOST = 'tienda.buymuscle.es'

const REHOSTED: Record<string, string> = {
  // --- Portadas del blog (tabla blog_posts + destacados de la home) ---
  '/modules/ph_simpleblog/covers/115-thumb.jpg': 'clon-home/blog-115.jpg',
  '/modules/ph_simpleblog/covers/114-thumb.jpg': 'clon-home/blog-114.jpg',
  '/modules/ph_simpleblog/covers/113-thumb.jpg': 'clon-home/blog-113.jpg',
  '/modules/ph_simpleblog/covers/112-thumb.jpg': 'clon-home/blog-112.jpg',
  '/modules/ph_simpleblog/covers/111-thumb.jpg': 'clon-home/blog-111.jpg',
  '/modules/ph_simpleblog/covers/53-thumb.jpg': 'clon-home/blog-53.jpg',
  '/modules/ph_simpleblog/covers/52-thumb.jpg': 'clon-home/blog-52.jpg',
  '/modules/ph_simpleblog/covers/51-thumb.jpg': 'clon-home/blog-51.jpg',
  '/modules/ph_simpleblog/covers/50-thumb.jpg': 'clon-home/blog-50.jpg',

  // --- BM Team ---
  '/img/cms/Logo-BM-Team.png': 'bm-team/logo-bm-team.png',
  '/img/cms/Pedro.jpg': 'bm-team/pedro.jpg',
  '/img/cms/Tino.jpg': 'bm-team/tino.jpg',
  '/img/cms/duplafitness22.jpg': 'bm-team/adassa-alberto.jpg',
  '/img/cms/Pili-2.jpg': 'bm-team/pili.jpg',
  '/img/cms/Cristina-2.jpg': 'bm-team/cristina.jpg',
  '/img/cms/Carolina.jpg': 'bm-team/carolina.jpg',
  '/img/cms/Sheila.jpg': 'bm-team/sheila.jpg',
  '/img/cms/Paula.jpg': 'bm-team/paula.jpg',
  '/img/cms/Ruben.jpg': 'bm-team/ruben.jpg',
  '/img/cms/Toni.jpg': 'bm-team/toni.jpg',
  // Jose.jpg ya no existe en el origen (403); la foto buena estaba en Jose-1.jpg
  '/img/cms/Jose-1.jpg': 'bm-team/jose.jpg',
  '/img/cms/Maria.jpg': 'bm-team/maria.jpg',
  '/img/cms/Angel.jpg': 'bm-team/angel.jpg',
  '/img/cms/Gabri.jpg': 'bm-team/gabri.jpg',

  // --- Banner de BM Sportswear / StreetFlavour (mismo arte que el slide 6) ---
  '/img/cms/BANNER-WEB-1600X630-STREETFLAVOUR.jpg': 'clon-home/slide-6-streetflavour.jpg',
}

/** URL pública de un asset rehospedado, por su clave de storage. */
export const cdn = (key: string) => CDN + key

/** Logo de BuyMuscle Team — fallback cuando un atleta no tiene foto. */
export const BM_LOGO = cdn('bm-team/logo-bm-team.png')

/**
 * Devuelve la versión rehospedada de una URL del PrestaShop viejo.
 * Si no está en el mapa (o no es de ese host), la devuelve intacta.
 */
export function rehost(url?: string | null): string {
  if (!url) return ''
  let path: string
  try {
    const u = new URL(url, 'https://' + LEGACY_HOST)
    if (u.hostname !== LEGACY_HOST) return url
    path = u.pathname
  } catch {
    return url
  }
  const key = REHOSTED[path]
  return key ? CDN + key : url
}
