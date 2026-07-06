import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

// ============================================
// Netlify Function: cj-create-order
// Crée une commande chez CJ Dropshipping
// ============================================

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const cjApiKey = process.env.CJ_DROPSHIPPING_API_KEY || ''
const cjApiUrl = process.env.CJ_DROPSHIPPING_API_URL || 'https://openapi.cjdropshipping.com'
const cjEmail = process.env.CJ_DROPSHIPPING_EMAIL || ''

// Helper: Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// Helper: Client Supabase server-side
async function supabaseRequest(path: string, method: string, body?: unknown) {
  return fetch(`${supabaseUrl}/rest/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      Prefer: method === 'POST' ? 'return=representation' : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const { orderId } = JSON.parse(event.body || '{}')

    if (!orderId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'orderId requis' }),
      }
    }

    // Récupérer la commande
    const orderResponse = await supabaseRequest(`/orders?id=eq.${orderId}&select=*`, 'GET')
    const orders = await orderResponse.json() as Array<{
      id: string
      shipping_address: Record<string, unknown>
      customer_email: string
      customer_name: string
      customer_phone: string
    }>

    if (!orders.length) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Commande non trouvée' }),
      }
    }

    const order = orders[0]

    // Récupérer les items
    const itemsResponse = await supabaseRequest(`/order_items?order_id=eq.${orderId}&select=*`, 'GET')
    const items = await itemsResponse.json() as Array<{
      product_id: string
      product_name: string
      quantity: number
      cj_variant_id: string | null
    }>

    if (!items.length) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Aucun item dans la commande' }),
      }
    }

    // Créer la commande CJ
    const cjPayload = {
      email: cjEmail,
      orderNumber: orderId,
      remark: 'Commande E-Shop Horizon',
      shippingAddress: {
        firstName: (order.shipping_address as Record<string, string>).firstName || '',
        lastName: (order.shipping_address as Record<string, string>).lastName || '',
        address: (order.shipping_address as Record<string, string>).address || '',
        city: (order.shipping_address as Record<string, string>).city || '',
        province: (order.shipping_address as Record<string, string>).city || '',
        country: (order.shipping_address as Record<string, string>).country || 'FR',
        zip: (order.shipping_address as Record<string, string>).postalCode || '',
        phone: (order.shipping_address as Record<string, string>).phone || '',
      },
      products: items
        .filter(item => item.cj_variant_id)
        .map(item => ({
          vid: item.cj_variant_id,
          quantity: item.quantity,
        })),
    }

    const cjResponse = await fetch(`${cjApiUrl}/order/createOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cjApiKey}`,
      },
      body: JSON.stringify(cjPayload),
    })

    const cjData = await cjResponse.json() as { 
      data?: { orderId?: string }
      orderId?: string
      id?: string
      message?: string 
    }

    if (!cjResponse.ok) {
      throw new Error(cjData.message || 'Erreur CJ Dropshipping')
    }

    const cjOrderId = cjData.data?.orderId || cjData.orderId || cjData.id

    // Mettre à jour Supabase
    if (cjOrderId) {
      await supabaseRequest(`/orders?id=eq.${orderId}`, 'PATCH', {
        cj_order_id: cjOrderId,
      })
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        cj_order_id: cjOrderId,
      }),
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne'
    console.error('CJ create order error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, message }),
    }
  }
}
