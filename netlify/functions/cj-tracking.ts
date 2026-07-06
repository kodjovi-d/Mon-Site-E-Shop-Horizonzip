import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

// ============================================
// Netlify Function: cj-tracking
// Récupère le numéro de suivi CJ et met à jour Supabase
// ============================================

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const cjApiKey = process.env.CJ_DROPSHIPPING_API_KEY || ''
const cjApiUrl = process.env.CJ_DROPSHIPPING_API_URL || 'https://openapi.cjdropshipping.com'
const resendApiKey = process.env.RESEND_API_KEY || ''
const resendFromEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

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
      Prefer: method === 'POST' ? 'return=representation' : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `E-Shop Horizon <${resendFromEmail}>`,
        to,
        subject,
        html,
      }),
    })
  } catch (err) {
    console.error('Email error:', err)
  }
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const { orderId } = JSON.parse(event.body || '{}')

    if (!orderId) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ message: 'orderId requis' }) }
    }

    // 1. Récupérer la commande
    const orderResponse = await supabaseRequest(`/orders?id=eq.${orderId}&select=*`, 'GET')
    const orders = await orderResponse.json() as Array<{
      id: string
      cj_order_id: string | null
      tracking_number: string | null
      customer_email: string
      status: string
    }>

    if (!orders.length) {
      return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ message: 'Commande introuvable' }) }
    }

    const order = orders[0]

    if (!order.cj_order_id) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ message: 'Pas de cj_order_id' }) }
    }

    // 2. Appeler CJ API pour le tracking
    const response = await fetch(`${cjApiUrl}/order/getOrderDetail?orderId=${order.cj_order_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cjApiKey}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erreur CJ tracking')
    }

    const trackingNumber = data.data?.trackingNumber || data.trackingNumber || null

    // 3. Si nouveau tracking, mettre à jour et envoyer email
    if (trackingNumber && trackingNumber !== order.tracking_number) {
      await supabaseRequest(`/orders?id=eq.${orderId}`, 'PATCH', {
        tracking_number: trackingNumber,
        status: 'shipped',
        updated_at: new Date().toISOString(),
      })

      // Envoyer email "commande expédiée"
      await sendEmail(
        order.customer_email,
        '📦 Votre commande est expédiée — E-Shop Horizon',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4A7C59;">Votre commande est en route !</h1>
            <p>Bonne nouvelle, votre commande <strong>#${orderId.slice(0, 8)}</strong> a été expédiée.</p>
            <p><strong>Numéro de suivi :</strong> ${trackingNumber}</p>
            <p><a href="https://track.aftership.com/${trackingNumber}" style="color: #4A7C59;">Suivre mon colis</a></p>
          </div>
        `
      )
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        tracking_number: trackingNumber,
        status: trackingNumber ? 'shipped' : order.status,
      }),
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne'
    console.error('CJ tracking error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, message }),
    }
  }
}
