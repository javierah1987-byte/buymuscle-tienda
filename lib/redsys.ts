// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// Integración REDSYS (TPV virtual del banco). PREPARADO para conectar.
// Se ACTIVA sólo cuando existen las variables de entorno; mientras, las rutas
// /api/redsys/* devuelven 503 y la tienda sigue cobrando por los medios actuales.
//
// Variables a definir en Vercel cuando el banco (BBVA) dé los datos:
//   REDSYS_MERCHANT_CODE            → código de comercio (FUC)
//   REDSYS_SECRET                   → clave secreta SHA-256 (en base64)
//   REDSYS_TERMINAL_PARTICULARES    → nº de terminal para pedidos de particulares
//   REDSYS_TERMINAL_DISTRIBUIDORES  → nº de terminal para pedidos de distribuidores
//   REDSYS_ENV                      → 'test' (pruebas) | 'prod'
// Dos terminales = las dos "cajas" que pediste (particulares y distribuidores);
// el canal del pedido decide cuál se usa, en línea con las dos series de Holded.
// ─────────────────────────────────────────────────────────────────────────────
import crypto from 'crypto'

const CFG = {
  merchant: process.env.REDSYS_MERCHANT_CODE || '',
  secret: process.env.REDSYS_SECRET || '',
  terminals: {
    particular: process.env.REDSYS_TERMINAL_PARTICULARES || '1',
    distributor: process.env.REDSYS_TERMINAL_DISTRIBUIDORES || '2',
  },
  env: process.env.REDSYS_ENV || 'test',
  currency: '978', // EUR
}

export const REDSYS_URL = CFG.env === 'prod'
  ? 'https://sis.redsys.es/sis/realizarPago'
  : 'https://sis-t.redsys.es:25443/sis/realizarPago'

export function redsysConfigured(){ return !!(CFG.merchant && CFG.secret) }

function pad8(buf){ const p=(8 - (buf.length % 8)) % 8; return Buffer.concat([buf, Buffer.alloc(p)]) }
// Clave por pedido: 3DES-CBC del número de pedido con la clave del comercio (IV=0, sin padding).
function orderKey(order){
  const key = Buffer.from(CFG.secret, 'base64')
  const cipher = crypto.createCipheriv('des-ede3-cbc', key, Buffer.alloc(8))
  cipher.setAutoPadding(false)
  const data = pad8(Buffer.from(String(order), 'utf8'))
  return Buffer.concat([cipher.update(data), cipher.final()])
}
function sign(paramsB64, order){
  return crypto.createHmac('sha256', orderKey(order)).update(paramsB64).digest('base64')
}
const b64url = s => (s||'').replace(/\+/g,'-').replace(/\//g,'_')

// Construye el formulario firmado para redirigir el navegador a Redsys.
// order: 4-12 chars, los 4 primeros numéricos. channel 'distributor' usa su terminal.
export function buildRedsysForm({ order, amountEuros, channel='particular', merchantData='' }){
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://tienda.buymuscle.es'
  const params = {
    DS_MERCHANT_AMOUNT: String(Math.round(Number(amountEuros) * 100)),
    DS_MERCHANT_ORDER: String(order),
    DS_MERCHANT_MERCHANTCODE: CFG.merchant,
    DS_MERCHANT_CURRENCY: CFG.currency,
    DS_MERCHANT_TRANSACTIONTYPE: '0',
    DS_MERCHANT_TERMINAL: channel === 'distributor' ? CFG.terminals.distributor : CFG.terminals.particular,
    DS_MERCHANT_MERCHANTURL: site + '/api/redsys/notification',
    DS_MERCHANT_URLOK: site + '/pedido-confirmado' + (merchantData ? '?n=' + encodeURIComponent(merchantData) : ''),
    DS_MERCHANT_URLKO: site + '/carrito?pago=ko',
    DS_MERCHANT_MERCHANTDATA: String(merchantData || ''), // viaja de vuelta en la notificación (nº de pedido interno)
  }
  const paramsB64 = Buffer.from(JSON.stringify(params)).toString('base64')
  return {
    url: REDSYS_URL,
    Ds_SignatureVersion: 'HMAC_SHA256_V1',
    Ds_MerchantParameters: paramsB64,
    Ds_Signature: sign(paramsB64, order),
  }
}

// Verifica la notificación server-to-server de Redsys. Devuelve {ok, paid, merchantData, code}.
export function verifyRedsysNotification({ Ds_MerchantParameters, Ds_Signature }){
  const json = JSON.parse(Buffer.from(Ds_MerchantParameters, 'base64').toString('utf8'))
  const order = json.Ds_Order || json.DS_ORDER
  const code = parseInt(json.Ds_Response || json.DS_RESPONSE || '9999', 10)
  const expected = b64url(sign(Ds_MerchantParameters, order))
  const ok = b64url(Ds_Signature) === expected
  return {
    ok,
    paid: ok && code >= 0 && code <= 99,   // 0000-0099 = autorizado
    code,
    order,
    merchantData: json.Ds_MerchantData || json.DS_MERCHANTDATA || '',
    amount: Number(json.Ds_Amount || 0) / 100,
  }
}
