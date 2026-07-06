import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

// ============================================
// Netlify Function: verify-payment
// Vérifie le statut d'une commande (page /merci)
// ============================================

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

async function supabaseRequest(path: string, method: string, body?: unknown) {
  return fetch(`${supabaseUrl}/rest/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const orderId = event.queryStringParameters?.orderId

    if (!orderId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'orderId requis' }),
      }
    }

    const response = await supabaseRequest(`/orders?id=eq.${orderId}&select=*`, 'GET')
    const orders = await response.json() as Array<Record<string, unknown>>

    if (!orders.length) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Commande introuvable' }),
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        order: orders[0],
      }),
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne'
    console.error('Verify payment error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message }),
    }
  }
}
