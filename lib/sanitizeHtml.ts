// Saneador de HTML de confianza-media (contenido de autoría admin: descripción de
// producto). Defensa en profundidad: si una cuenta admin se compromete, un payload
// (<script>, <img onerror=...>, href="javascript:...") NO debe persistir como skimmer.
// Regex-based a propósito: funciona igual en SSR y en cliente (sin DOMParser, sin
// dependencia externa). NO es un saneador criptográficamente completo — para HTML de
// fuente NO confiable, usar sanitize-on-ingest + una librería auditada (DOMPurify).
//
// Estrategia: allowlist de tags de formato; se eliminan bloques ejecutables con su
// contenido, los atributos on* (handlers), las URLs javascript:/vbscript:/data: en
// href/src, y los style inline (pueden colar expression()/url(javascript:)).

const ALLOWED_TAGS = new Set([
  'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'small', 'sub', 'sup',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'span', 'div', 'a', 'img', 'blockquote', 'hr', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
])

export function sanitizeHtml(input: unknown): string {
  if (typeof input !== 'string' || !input) return ''
  let s = input

  // 1. Bloques ejecutables/peligrosos: fuera con TODO su contenido.
  s = s.replace(/<(script|style|iframe|object|embed|noscript|template|form|svg|math)\b[\s\S]*?<\/\1\s*>/gi, '')
  // 2. Tags peligrosos sin cierre (sueltos).
  s = s.replace(/<(script|style|iframe|object|embed|link|meta|base|form)\b[^>]*>/gi, '')

  // 3. Tags de apertura: quita los no permitidos (conserva el texto interior) y limpia atributos.
  s = s.replace(/<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (_m, tag: string, attrs: string) => {
    const t = tag.toLowerCase()
    if (!ALLOWED_TAGS.has(t)) return ''
    const cleaned = attrs
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')                                   // handlers on*
      .replace(/\s(href|src|xlink:href)\s*=\s*("(?:javascript|vbscript|data):[^"]*"|'(?:javascript|vbscript|data):[^']*'|(?:javascript|vbscript|data):[^\s>]+)/gi, '') // URLs peligrosas
      .replace(/\sstyle\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')                                       // style inline
    return '<' + t + cleaned + '>'
  })

  // 4. Tags de cierre no permitidos: fuera.
  s = s.replace(/<\/([a-zA-Z][a-zA-Z0-9]*)\s*>/g, (m, tag: string) => ALLOWED_TAGS.has(tag.toLowerCase()) ? m : '')

  return s
}
