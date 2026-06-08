// @ts-nocheck
// Cliente mínimo de PayPal Orders v2 (server-side). Usa credenciales REST:
//   PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_ENV ('live' | 'sandbox', def. sandbox)
const ENV = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase()
export const PAYPAL_BASE = ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

export function paypalConfigured(){
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET)
}

async function accessToken(){
  const id = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_SECRET
  if(!id || !secret) throw new Error('paypal_no_configurado')
  const basic = Buffer.from(id + ':' + secret).toString('base64')
  const r = await fetch(PAYPAL_BASE + '/v1/oauth2/token', {
    method:'POST',
    headers:{ 'Authorization':'Basic '+basic, 'Content-Type':'application/x-www-form-urlencoded' },
    body:'grant_type=client_credentials',
  })
  const d = await r.json()
  if(!d.access_token) throw new Error('paypal_token_error: '+JSON.stringify(d))
  return d.access_token
}

// Crea una orden PayPal por el importe dado (EUR). Devuelve { id }.
export async function createPaypalOrder(amount, reference){
  const token = await accessToken()
  const r = await fetch(PAYPAL_BASE + '/v2/checkout/orders', {
    method:'POST',
    headers:{ 'Authorization':'Bearer '+token, 'Content-Type':'application/json' },
    body: JSON.stringify({
      intent:'CAPTURE',
      purchase_units:[{
        amount:{ currency_code:'EUR', value: Number(amount).toFixed(2) },
        ...(reference ? { custom_id: String(reference).slice(0,127) } : {}),
      }],
    }),
  })
  const d = await r.json()
  if(!d.id) throw new Error('paypal_create_error: '+JSON.stringify(d))
  return d
}

// Captura una orden previamente aprobada. Devuelve el JSON de PayPal.
export async function capturePaypalOrder(orderId){
  const token = await accessToken()
  const r = await fetch(PAYPAL_BASE + '/v2/checkout/orders/' + encodeURIComponent(orderId) + '/capture', {
    method:'POST',
    headers:{ 'Authorization':'Bearer '+token, 'Content-Type':'application/json' },
  })
  return await r.json()
}
