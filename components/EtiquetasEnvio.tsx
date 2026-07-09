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
//
// LAYOUT FÍSICO (importante): el folio real trae 3 pegatinas por hoja A4 en
// posiciones FIJAS = tercios iguales de A4 (99mm cada uno: 0–99 / 99–198 / 198–297mm).
// Por eso NO usamos padding de hoja ni flex:1 (que repartiría 91mm y desalinearía):
// cada etiqueta vive en un SLOT rígido de 99mm que cae justo encima de su pegatina.
// Un slot vacío se imprime en blanco -> permite reaprovechar un folio a medio usar
// eligiendo en qué posición (arriba/centro/abajo) empezar.
import { useState } from 'react'

// Campos del pedido que usa la etiqueta (todos opcionales: robustez ante datos
// que falten). Nombres tomados del esquema real de `orders` (lib/orderCore.ts).
export interface EtiquetaPedido {
  customer_name?: string | null
  shipping_address?: string | null
  shipping_postal_code?: string | null
  shipping_city?: string | null
  customer_phone?: string | null
}

export const SLOTS_POR_HOJA = 3 // 3 pegatinas por A4 (tercios de 99mm)

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
    { text: limpia(o.customer_name), nombre: true },     // 1) Nombre y apellidos
    { text: limpia(o.shipping_address), nombre: false }, // 2) Dirección
    { text: cpCiudad, nombre: false },                   // 3) CP + ciudad
    { text: limpia(o.customer_phone), nombre: false },   // 4) Teléfono
  ].filter(f => f.text)
}

// Devuelve el bloque INTERIOR de una etiqueta (sin el slot; el slot lo pone el layout).
// '' si el pedido no tiene ningún dato imprimible (-> el slot quedará en blanco).
function bloqueHTML(o: EtiquetaPedido): string {
  const filas = filasEtiqueta(o)
  if (!filas.length) return ''
  const lineas = filas
    .map(f => `<div class="linea${f.nombre ? ' nombre' : ''}">${esc(f.text)}</div>`)
    .join('')
  return `<div class="bloque">${lineas}</div>`
}

const PRINT_CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000;
    font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .barra { display: flex; align-items: center; gap: 12px; padding: 10px 16px;
    background: #111; color: #fff; font-size: 13px; position: sticky; top: 0; }
  .barra button { background: #ff1e41; color: #fff; border: none; padding: 8px 16px;
    font-size: 13px; font-weight: 700; cursor: pointer; border-radius: 4px; font-family: inherit; }
  /* Cada hoja = A4 exacto. 3 slots de 99mm = 297mm, sin márgenes -> alinean a las pegatinas. */
  .hoja { width: 210mm; height: 297mm; overflow: hidden; }
  .hoja + .hoja { page-break-before: always; }
  .slot { height: 99mm; overflow: hidden; page-break-inside: avoid;
    display: flex; align-items: center; justify-content: center;
    text-align: center; padding: 6mm 14mm; }
  .bloque { width: 100%; }
  .linea { font-size: 13pt; line-height: 1.6; word-break: break-word; }
  .nombre { font-size: 16pt; font-weight: 700; margin-bottom: 2.5mm; }
  @media print { .barra { display: none !important; } }
`

export interface PrintEtiquetasOpts {
  startSlot?: number // 0=arriba, 1=centro, 2=abajo (posición de la 1ª etiqueta)
}

// Genera y abre la vista imprimible de etiquetas para uno o varios pedidos.
// Las etiquetas se colocan en slots de 99mm empezando en `startSlot`; los slots
// no usados quedan EN BLANCO (para reaprovechar un folio a medio pegar).
export function printEtiquetas(
  orders: EtiquetaPedido[] | EtiquetaPedido,
  opts: PrintEtiquetasOpts = {},
): void {
  const lista = Array.isArray(orders) ? orders : [orders]
  if (!lista.length) { alert('No hay pedidos para generar etiquetas.'); return }

  const bloques = lista.map(bloqueHTML).filter(Boolean)
  if (!bloques.length) {
    alert('Los pedidos seleccionados no tienen datos de dirección para la etiqueta.')
    return
  }

  const startSlot = Math.min(SLOTS_POR_HOJA - 1, Math.max(0, Math.floor(Number(opts.startSlot) || 0)))
  const totalSlots = startSlot + bloques.length
  const numPages = Math.ceil(totalSlots / SLOTS_POR_HOJA)

  // Rejilla de páginas × slots; se rellena desde startSlot, el resto en blanco.
  const pages: string[][] = Array.from({ length: numPages }, () =>
    Array.from({ length: SLOTS_POR_HOJA }, () => ''))
  bloques.forEach((html, i) => {
    const s = startSlot + i
    pages[Math.floor(s / SLOTS_POR_HOJA)][s % SLOTS_POR_HOJA] = html
  })
  const hojasHTML = pages
    .map(slots => `<div class="hoja">${slots.map(h => `<div class="slot">${h}</div>`).join('')}</div>`)
    .join('')

  const w = window.open('', '_blank', 'width=820,height=1000')
  if (!w) {
    alert('El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes e inténtalo de nuevo.')
    return
  }
  const n = bloques.length
  const titulo = n === 1 ? 'Etiqueta de envío' : `Etiquetas de envío (${n})`
  const posTxt = ['arriba', 'centro', 'abajo'][startSlot]
  w.document.write(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(titulo)}</title>` +
    `<style>${PRINT_CSS}</style></head><body>` +
    `<div class="barra"><button onclick="window.print()">🖨️ Imprimir</button>` +
    `<span>${n} etiqueta${n === 1 ? '' : 's'} · ${numPages} hoja${numPages === 1 ? '' : 's'} A4 · empieza ${posTxt}</span></div>` +
    hojasHTML +
    `</body></html>`,
  )
  w.document.close()
  w.focus()
  // Igual que TicketTPV: pequeña espera a que la ventana pinte antes de imprimir.
  setTimeout(() => { try { w.print() } catch { /* el usuario puede usar el botón Imprimir */ } }, 350)
}

// ── Selector visual de posición (modal) ─────────────────────────────────────
// Muestra un mini-folio A4 con sus 3 tercios clicables. Al elegir uno imprime.
// batch=false -> "coloca ESTA etiqueta en …" (1 etiqueta, resto en blanco).
// batch=true  -> "empieza a colocar en …" (rellena en orden desde ese slot).
const SLOT_LABEL = ['Arriba', 'Centro', 'Abajo']

export function EtiquetaSlotPicker({
  orders, batch = false, onClose,
}: {
  orders: EtiquetaPedido[]
  batch?: boolean
  onClose: () => void
}) {
  const [hover, setHover] = useState<number | null>(null)
  const n = orders.length

  function go(startSlot: number) {
    printEtiquetas(orders, { startSlot })
    onClose()
  }

  const titulo = batch ? '¿Desde qué posición empezar?' : '¿En qué posición del folio?'
  const ayuda = batch
    ? `${n} etiqueta${n === 1 ? '' : 's'} en orden. Empieza arriba para un folio nuevo, o en otra posición para reaprovechar un folio a medio usar.`
    : 'Elige el hueco libre de tu folio (los otros dos se imprimen en blanco). Útil para reaprovechar un folio con pegatinas ya despegadas.'

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 10, padding: '20px 22px', width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{titulo}</div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 14, lineHeight: 1.5 }}>{ayuda}</div>

        {/* Mini-folio A4 (proporción 210×297): 3 tercios clicables */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 130, height: 184, border: '1px solid #ccc', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
            {[0, 1, 2].map(i => {
              const active = hover === i
              const primary = batch && i === 0
              return (
                <button
                  key={i}
                  onClick={() => go(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    flex: 1, border: 'none', borderBottom: i < 2 ? '1px dashed #ccc' : 'none',
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
                    background: active ? '#0ea5e9' : primary ? '#e0f2fe' : 'transparent',
                    color: active ? 'white' : '#334155', transition: 'background 0.12s',
                  }}
                >
                  {SLOT_LABEL[i]}{primary ? ' ✓' : ''}
                </button>
              )
            })}
          </div>
        </div>

        <button onClick={onClose} style={{ width: '100%', padding: '8px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default printEtiquetas
