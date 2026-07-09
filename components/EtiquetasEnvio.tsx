'use client'
// Etiquetas de envío imprimibles para el admin de pedidos.
// Reutiliza el enfoque de TicketTPV: abre una ventana aislada y escribe en ella
// SOLO las etiquetas + su print CSS, así al imprimir no aparece nada del admin.
//
// Formato de cada etiqueta (el que imprimen hoy): un bloque CENTRADO, 4 líneas:
//   1) Nombre y apellidos       -> customer_name
//   2) Dirección (calle, nº, piso) -> shipping_address
//   3) Código postal + ciudad   -> shipping_postal_code + shipping_city
//   4) Teléfono                 -> customer_phone
// Layout de lote: ~3 etiquetas por hoja A4, centradas y espaciadas en vertical.

// Campos del pedido que usa la etiqueta (todos opcionales: robustez ante datos
// que falten). Nombres tomados del esquema real de `orders` (lib/orderCore.ts).
export interface EtiquetaPedido {
  customer_name?: string | null
  shipping_address?: string | null
  shipping_postal_code?: string | null
  shipping_city?: string | null
  customer_phone?: string | null
}

// Escapa texto de la BD antes de inyectarlo en el HTML de la ventana de impresión
// (un nombre/dirección con < > & " no debe romper el layout).
function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function limpia(v: unknown): string {
  return v == null ? '' : String(v).trim()
}

// Devuelve las filas de la etiqueta en orden, omitiendo las vacías (sin "undefined").
// Cada fila lleva su rol (`nombre` va destacado) para no forzar el estilo de nombre
// sobre otra línea si el nombre faltara.
function filasEtiqueta(o: EtiquetaPedido): { text: string; nombre: boolean }[] {
  const cpCiudad = [o.shipping_postal_code, o.shipping_city]
    .map(limpia)
    .filter(Boolean)
    .join(' ')
  return [
    { text: limpia(o.customer_name), nombre: true },   // 1) Nombre y apellidos
    { text: limpia(o.shipping_address), nombre: false }, // 2) Dirección
    { text: cpCiudad, nombre: false },                   // 3) CP + ciudad
    { text: limpia(o.customer_phone), nombre: false },   // 4) Teléfono
  ].filter(f => f.text)
}

function etiquetaHTML(o: EtiquetaPedido): string {
  const filas = filasEtiqueta(o)
  if (!filas.length) return '' // pedido sin ningún dato imprimible -> se omite
  const lineas = filas
    .map(f => `<div class="linea${f.nombre ? ' nombre' : ''}">${esc(f.text)}</div>`)
    .join('')
  return `<div class="etiqueta"><div class="bloque">${lineas}</div></div>`
}

const ETIQUETAS_POR_HOJA = 3

const PRINT_CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000;
    font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .barra { display: flex; align-items: center; gap: 12px; padding: 10px 16px;
    background: #111; color: #fff; font-size: 13px; position: sticky; top: 0; }
  .barra button { background: #ff1e41; color: #fff; border: none; padding: 8px 16px;
    font-size: 13px; font-weight: 700; cursor: pointer; border-radius: 4px; font-family: inherit; }
  .hoja { width: 210mm; height: 297mm; padding: 12mm 0; display: flex; flex-direction: column; }
  .hoja + .hoja { page-break-before: always; }
  .etiqueta { flex: 1; display: flex; align-items: center; justify-content: center;
    text-align: center; page-break-inside: avoid; padding: 4mm 14mm; border-bottom: 1px dashed #ccc; }
  .etiqueta:last-child { border-bottom: none; }
  .bloque { width: 100%; }
  .linea { font-size: 13pt; line-height: 1.6; word-break: break-word; }
  .nombre { font-size: 16pt; font-weight: 700; margin-bottom: 2.5mm; }
  @media print { .barra { display: none !important; } }
`

// Genera y abre la vista imprimible de etiquetas para uno o varios pedidos.
// - 1 pedido  -> una etiqueta centrada en su hoja.
// - N pedidos -> una etiqueta por pedido, ~3 por hoja A4, listas para imprimir de golpe.
export function printEtiquetas(orders: EtiquetaPedido[] | EtiquetaPedido): void {
  const lista = Array.isArray(orders) ? orders : [orders]
  if (!lista.length) { alert('No hay pedidos para generar etiquetas.'); return }

  const bloques = lista.map(etiquetaHTML).filter(Boolean)
  if (!bloques.length) {
    alert('Los pedidos seleccionados no tienen datos de dirección para la etiqueta.')
    return
  }

  // Reparte las etiquetas en hojas de 3.
  const hojas: string[] = []
  for (let i = 0; i < bloques.length; i += ETIQUETAS_POR_HOJA) {
    hojas.push(`<div class="hoja">${bloques.slice(i, i + ETIQUETAS_POR_HOJA).join('')}</div>`)
  }

  const w = window.open('', '_blank', 'width=820,height=1000')
  if (!w) {
    alert('El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes e inténtalo de nuevo.')
    return
  }
  const titulo = bloques.length === 1 ? 'Etiqueta de envío' : `Etiquetas de envío (${bloques.length})`
  w.document.write(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(titulo)}</title>` +
    `<style>${PRINT_CSS}</style></head><body>` +
    `<div class="barra"><button onclick="window.print()">🖨️ Imprimir</button>` +
    `<span>${bloques.length} etiqueta${bloques.length === 1 ? '' : 's'} · ${hojas.length} hoja${hojas.length === 1 ? '' : 's'} A4</span></div>` +
    hojas.join('') +
    `</body></html>`
  )
  w.document.close()
  w.focus()
  // Igual que TicketTPV: pequeña espera a que la ventana pinte antes de imprimir.
  setTimeout(() => { try { w.print() } catch { /* el usuario puede usar el botón Imprimir */ } }, 350)
}

export default printEtiquetas
