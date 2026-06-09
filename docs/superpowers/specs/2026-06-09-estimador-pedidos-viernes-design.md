# Estimador de pedidos del viernes — Diseño

**Fecha:** 2026-06-09
**Proyecto:** BuyMuscle Tienda (Next.js 14.2.29 + Supabase)
**Estado:** Aprobado por el usuario, pendiente de plan de implementación

## Objetivo

Dar al administrador, cada viernes, un **estimado del pedido de reposición** basado en
las ventas y el stock actual, más **alertas de tendencia** que señalen productos que se
venden más (o menos) de lo habitual.

Petición original del usuario (verbatim):
> "según las ventas que se vienen haciendo por semana, todos los viernes le diga un
> estimado del pedido que hay que hacer. Y si hay algo que se ha vendido más esta semana
> que en otra, o ese mes que en otro, le diga que lo tenga en cuenta."

## Contexto / restricción de datos

A fecha de diseño la tienda tiene **solo 2 pedidos pagados** (21–29 abril 2026), es decir
~2 semanas de histórico y un único canal. Cualquier "media semanal" o comparación de
tendencia es ruido hasta que se acumulen ventas reales. El diseño asume **cold-start** y
hace que la parte avanzada se active automáticamente cuando llegue el histórico.

## Decisiones tomadas (brainstorming)

| Pregunta | Decisión |
|---|---|
| Entrega del estimado | Panel dentro de `/admin` (no email/cron por ahora) |
| Horizonte de cobertura | 2 semanas para todos los productos |
| Definición de "stock bajo" (fase fría) | < 5 unidades, global |
| Alertas de tendencia | Subidas **y** bajadas, en **dos bloques**: semana y mes |

## Diseño

### 1. Ubicación
- Página nueva: **`/admin/estimador`**.
- Enlace desde el menú de administración.
- Cálculo en tiempo de carga leyendo Supabase. Sin dependencia de email ni cron.

### 2. Dos fases con transición automática
El panel detecta cuántas semanas de ventas existen y se adapta sin intervención:

- **Fase fría** (`< ~4 semanas de datos`):
  - Lista principal **"Stock bajo"**: productos `active = true` con `stock < 5`,
    ordenados ascendente por stock.
  - Junto a cada producto, las ventas registradas (si las hay).
- **Fase con datos** (`>= ~4 semanas`, automática):
  - Aparece **"Pedido sugerido"**: por producto
    `cantidad_sugerida = max(0, round(ventas_medias_semanales * 2) - stock_actual)`.
  - La lista de "Stock bajo" se mantiene como red de seguridad.

Parámetros **editables en la propia página** (estado de UI, sin tocar código ni BD):
- Umbral de stock bajo (por defecto `5`).
- Horizonte de cobertura en semanas (por defecto `2`).

### 3. Alertas de tendencia (fase con datos) — dos bloques
- **Bloque semanal:** última semana vs. media de semanas previas.
- **Bloque mensual:** último mes vs. media de meses previos.

En cada bloque:
- 🔼 **Acelerando:** ventas significativamente por encima de la media → "pide más de lo
  que dice el cálculo base".
- 🔽 **Frenando:** ventas significativamente por debajo → "vende menos, no te sobrecargues".

Solo se listan productos con variación significativa (umbral de % a definir en el plan,
p. ej. ±40%, con un mínimo de unidades para evitar falsos positivos por volúmenes bajos).
En fase fría ambos bloques se muestran vacíos con el aviso "aún sin histórico suficiente".

### 4. Fuentes de datos
- **Ventas:** `orders` (solo estados pagados) + `order_lines`, agrupando por producto y
  por semana / mes.
- **Stock:** campo `stock` de `products`.
- **Solo lectura.** El estimador **no escribe nada** en la base de datos: únicamente lee
  y muestra. (Cumple la regla del usuario de no modificar datos sin permiso.)

### 5. Fuera de alcance (YAGNI)
- No genera el pedido al proveedor automáticamente (solo lo sugiere; decide el admin).
- No envía email ni WhatsApp (posible fase futura).
- Nada de IA ni modelos de estacionalidad: medias móviles simples, coherente con el
  volumen de datos real.

## Notas de implementación (para el plan)
- Reutilizar el patrón de páginas server de `/admin` existentes y el guard de auth de
  admin (ver `lib/adminAuth`).
- Definir con precisión qué `status` de `orders` cuenta como "pagado".
- Confirmar el join `order_lines` → producto (por `product_id` o por nombre) y el campo
  de cantidad (`quantity` / `qty`).
- Definir el umbral de "significativo" para las alertas y el mínimo de unidades.
- Decidir el corte exacto fase fría → fase con datos (nº de semanas con datos).
