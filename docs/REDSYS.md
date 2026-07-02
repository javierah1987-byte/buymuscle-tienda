# Redsys (TPV virtual) — PREPARADO, pendiente de conectar

Integración lista en el código pero **inactiva**: mientras no existan las
variables `REDSYS_*`, las rutas `/api/redsys/*` devuelven `503` y la tienda sigue
cobrando por los medios actuales. En cuanto el banco (BBVA) dé los datos, es
**definir variables + añadir un botón**. Nada más.

## Lo que ya está montado

| Pieza | Qué hace |
|---|---|
| `lib/redsys.ts` | Firma HMAC-SHA256 v1 (algoritmo oficial de Redsys), construye el formulario de pago y verifica la notificación. |
| `app/api/redsys/create` | Crea el pedido como `pending` y devuelve el formulario firmado para redirigir al TPV. Elige terminal por canal. |
| `app/api/redsys/notification` | Recibe la confirmación server-to-server, **verifica la firma**, marca el pedido `paid` y descuenta stock **una sola vez** (idempotente). |

**Dos terminales = las dos cajas que pediste:** el canal del pedido decide cuál se
usa. Distribuidor autenticado → TPV de distribuidores; resto → TPV de particulares.
Va en línea con las **dos series de Holded** (`HOLDED_SERIE_DIST_ID` para
distribuidores, `HOLDED_SERIE_T_ID` para particulares), que **ya están cableadas**
en `lib/orderCore.ts` — sólo faltan sus IDs reales.

## Variables a definir en Vercel (cuando el banco dé los datos)

```
REDSYS_MERCHANT_CODE           = código de comercio (FUC)
REDSYS_SECRET                  = clave secreta SHA-256 (en base64, la del panel de Redsys)
REDSYS_TERMINAL_PARTICULARES   = nº de terminal para particulares (ej. 1)
REDSYS_TERMINAL_DISTRIBUIDORES = nº de terminal para distribuidores (ej. 2)
REDSYS_ENV                     = test   (pruebas)  |  prod  (real)
```

Se empieza con `REDSYS_ENV=test` y los datos de entorno de pruebas de Redsys; una
vez validado, se pasa a `prod`.

## Lo único que falta en el front (botón de pago)

En el carrito, un botón "Pagar con tarjeta" que llama a la ruta y auto-envía el
formulario devuelto al TPV:

```js
async function pagarConTarjeta(payload){           // payload = { items, customer, discount_code }
  const token = (await supabase.auth.getSession()).data.session?.access_token
  const r = await fetch('/api/redsys/create', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', ...(token ? { Authorization:'Bearer '+token } : {}) },
    body: JSON.stringify(payload),
  }).then(r=>r.json())
  if(!r.ok) return alert('No se pudo iniciar el pago')
  // Auto-POST al TPV de Redsys
  const f = document.createElement('form')
  f.method = 'POST'; f.action = r.redsys.url
  for(const k of ['Ds_SignatureVersion','Ds_MerchantParameters','Ds_Signature']){
    const i = document.createElement('input'); i.type='hidden'; i.name=k; i.value=r.redsys[k]; f.appendChild(i)
  }
  document.body.appendChild(f); f.submit()
}
```

Al volver: `URLOK` lleva a `/pedido-confirmado?n=<pedido>` (pago OK) y `URLKO` a
`/carrito?pago=ko` (cancelado). El stock **NO** se descuenta en el redirect: se
descuenta cuando Redsys confirma el cobro en `/api/redsys/notification` (así un
pago abandonado nunca reserva inventario).

## Cómo probar (entorno test de Redsys)

1. Definir las variables con los datos de pruebas y `REDSYS_ENV=test`.
2. Añadir el botón y hacer un pedido de prueba con una tarjeta de test de Redsys.
3. Verificar en Supabase que el pedido pasa de `pending` a `paid` y que baja el stock.
4. Confirmar que un segundo aviso de Redsys **no** vuelve a descontar stock (idempotencia).
5. Pasar a `REDSYS_ENV=prod` con los datos reales.
