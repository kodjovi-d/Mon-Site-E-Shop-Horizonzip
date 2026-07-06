import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

// ============================================
// Netlify Function: initiate-payment
// Récupère une commande et initie le paiement GeniusPay
// ============================================

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const geniusPayApiKey = process.env.GENIUSPAY_API_KEY || ''
const geniusPayApiSecret = process.env.GENIUSPAY_API_SECRET || ''
const geniusPayApiUrl = process.env.GENIUSPAY_API_URL || 'https://geniuspay.ci/api/v1/merchant'
const siteUrl = process.env.NETLIFY_SITE_URL || 'https://eshop-horizon.netlify.app'

const FETCH_TIMEOUT_MS = 15000 // 15 secondes timeout

// Helper: Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// Helper: Timeout pour fetch
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// Helper: Client Supabase server-side
async function supabaseRequest(path: string, method: string, body?: unknown) {
  const response = await fetchWithTimeout(`${supabaseUrl}/rest/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      Prefer: method === 'POST' ? 'return=representation' : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return response
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
      status: string
      payment_status: string
      total: number
      customer_email: string
      customer_name: string
      customer_phone: string
      shipping_address: Record<string, unknown>
    }>

    if (!orders.length) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Commande non trouvée' }),
      }
    }

    const order = orders[0]

    if (order.status !== 'pending' || order.payment_status !== 'pending') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Commande déjà traitée' }),
      }
    }

    // Créer le paiement GeniusPay
    const geniusPayBody = {
      amount: Math.round(order.total * 100), // GeniusPay attend le montant en CENTIMES
      currency: 'EUR',
      description: `Commande E-Shop Horizon #${order.id.slice(0, 8)}`,
      customer: {
        name: order.customer_name || order.customer_email,
        email: order.customer_email,
        phone: order.customer_phone || '',
      },
      success_url: `${siteUrl}/merci?order=${order.id}`,
      error_url: `${siteUrl}/checkout?error=payment_failed&order=${order.id}`,
      cancel_url: `${siteUrl}/checkout?error=cancelled&order=${order.id}`,
      webhook_url: `${siteUrl}/.netlify/functions/geniuspay-webhook`,
      metadata: {
        order_id: order.id,
        customer_email: order.customer_email,
      },
    }

    console.log('Initiate payment payload:', JSON.stringify(geniusPayBody))

    const paymentUrl = `${geniusPayApiUrl}/payments`
    console.log('GeniusPay URL appelée:', paymentUrl)

    const geniusPayResponse = await fetchWithTimeout(paymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': geniusPayApiKey,
        'X-API-Secret': geniusPayApiSecret,
      },
      body: JSON.stringify(geniusPayBody),
    })

    // Log le status et le type de réponse AVANT de parser
    console.log('GeniusPay response status:', geniusPayResponse.status)
    console.log('GeniusPay response content-type:', geniusPayResponse.headers.get('content-type'))

    // Lire le texte brut d'abord pour debug
    const responseText = await geniusPayResponse.text()
    console.log('GeniusPay response body (raw):', responseText.substring(0, 500))

    // Vérifier si c'est du HTML
    if (responseText.trim().startsWith('<')) {
      throw new Error(`GeniusPay a renvoyé du HTML au lieu de JSON. Status: ${geniusPayResponse.status}. URL: ${paymentUrl}. Vérifiez l'URL de l'API.`)
    }

    // Parser le JSON
    let geniusPayData: {
      data?: {
        reference?: string
        checkout_url?: string
        payment_url?: string
      }
      message?: string
    }

    try {
      geniusPayData = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`Réponse GeniusPay invalide: ${responseText.substring(0, 200)}`)
    }

    if (!geniusPayResponse.ok) {
      throw new Error(geniusPayData.message || 'Erreur création paiement GeniusPay')
    }

    // Mettre à jour la commande avec la référence GeniusPay
    await supabaseRequest(`/orders?id=eq.${order.id}`, 'PATCH', {
      payment_reference: geniusPayData.data?.reference || '',
      geniuspay_transaction_id: geniusPayData.data?.reference || '',
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        paymentUrl: geniusPayData.data?.checkout_url || geniusPayData.data?.payment_url,
      }),
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne'
    console.error('Initiate payment error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, message: message }),
    }
  }
}
