import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import { createHmac } from 'crypto'

// ============================================
// Netlify Function: geniuspay-webhook
// Gère les notifications de paiement GeniusPay
// ⚠️ TOUJOURS répondre 200 même en cas d'erreur
// ============================================

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const webhookSecret = process.env.GENIUSPAY_WEBHOOK_SECRET || ''
const resendApiKey = process.env.RESEND_API_KEY || ''
// Use verified sender: onboarding@resend.dev for testing, or configured VERIFIED_FROM_EMAIL
const resendFromEmail = process.env.VERIFIED_FROM_EMAIL || 'onboarding@resend.dev'
const resendFromName = process.env.RESEND_FROM_NAME || 'E-Shop Horizon'

interface WebhookPayload {
  event?: string
  data?: {
    reference?: string
    status?: string
    amount?: number
    currency?: string
    metadata?: {
      order_id?: string
      customer_email?: string
    }
  }
}

// Helper: Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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

// Helper: Envoyer email via Resend
async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${resendFromName} <${resendFromEmail}>`,
        to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      console.error('Resend error:', await response.text())
    }
  } catch (err) {
    console.error('Email send error:', err)
  }
}

// Helper: Créer commande CJ Dropshipping
async function createCJOrder(orderId: string, shippingAddress: Record<string, unknown>) {
  try {
    const cjApiKey = process.env.CJ_DROPSHIPPING_API_KEY || ''
    const cjApiUrl = process.env.CJ_DROPSHIPPING_API_URL || 'https://openapi.cjdropshipping.com'
    const cjEmail = process.env.CJ_DROPSHIPPING_EMAIL || ''

    // Récupérer les items de la commande
    const itemsResponse = await supabaseRequest(`/order_items?order_id=eq.${orderId}&select=*`, 'GET')
    const items = await itemsResponse.json() as Array<{
      product_id: string
      product_name: string
      quantity: number
      cj_variant_id: string | null
    }>

    if (!items.length) {
      console.error('No items found for CJ order')
      return null
    }

    const cjPayload = {
      email: cjEmail,
      orderNumber: orderId,
      remark: 'Commande E-Shop Horizon',
      shippingAddress: {
        firstName: (shippingAddress as Record<string, string>).firstName || '',
        lastName: (shippingAddress as Record<string, string>).lastName || '',
        address: (shippingAddress as Record<string, string>).address || '',
        city: (shippingAddress as Record<string, string>).city || '',
        province: (shippingAddress as Record<string, string>).city || '',
        country: (shippingAddress as Record<string, string>).country || 'FR',
        zip: (shippingAddress as Record<string, string>).postalCode || '',
        phone: (shippingAddress as Record<string, string>).phone || '',
      },
      products: items
        .filter(item => item.cj_variant_id)
        .map(item => ({
          vid: item.cj_variant_id,
          quantity: item.quantity,
        })),
    }

    const response = await fetch(`${cjApiUrl}/order/createOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cjApiKey}`,
      },
      body: JSON.stringify(cjPayload),
    })

    const data = await response.json() as { data?: { orderId?: string }; orderId?: string; id?: string; message?: string }

    if (!response.ok) {
      throw new Error(data.message || 'CJ API error')
    }

    // Mettre à jour la commande avec le CJ order ID
    const cjOrderId = data.data?.orderId || data.orderId || data.id
    if (cjOrderId) {
      await supabaseRequest(`/orders?id=eq.${orderId}`, 'PATCH', {
        cj_order_id: cjOrderId,
      })
    }

    return cjOrderId
  } catch (err) {
    console.error('CJ order creation error:', err)
    // On ne throw pas — la commande est payée, on loggue juste l'erreur
    return null
  }
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // ⚠️ TOUJOURS répondre 200 — même en cas d'erreur interne
  // Sinon GeniusPay retry en boucle

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  try {
    const payload: WebhookPayload = JSON.parse(event.body || '{}')
    console.log('Webhook received:', JSON.stringify(payload, null, 2))

    // ============================================
    // VÉRIFICATION DU WEBHOOK SECRET
    // GeniusPay format: HMAC-SHA256(timestamp + "." + body, secret)
    // ============================================
    const signature = event.headers['x-webhook-signature'] || event.headers['x-geniuspay-signature'] || ''
    const timestamp = event.headers['x-webhook-timestamp'] || event.headers['x-geniuspay-timestamp'] || ''

    if (webhookSecret && signature) {
      // GeniusPay expects: HMAC-SHA256(timestamp + "." + body, secret)
      const payloadToSign = timestamp ? `${timestamp}.${event.body || ''}` : event.body || ''
      const expectedSignature = createHmac('sha256', webhookSecret)
        .update(payloadToSign)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature. Expected:', expectedSignature.substring(0, 10) + '..., Got:', signature.substring(0, 10) + '...')
        // Return 200 anyway - don't let GeniusPay retry
        return { statusCode: 200, body: JSON.stringify({ received: true, warning: 'Invalid signature' }) }
      }
      console.log('Webhook signature valid')
    }

    const { event: eventType, data } = payload

    if (!data?.metadata?.order_id) {
      console.error('Missing order_id in metadata')
      return {
        statusCode: 200,
        body: JSON.stringify({ received: true, warning: 'Missing order_id' }),
      }
    }

    const orderId = data.metadata.order_id
    const paymentStatus = data.status || ''
    const eventName = eventType || ''

    console.log(`Processing webhook for order ${orderId}, event: ${eventName}, status: ${paymentStatus}`)

    // ============================================
    // DÉTERMINER LE STATUT
    // ============================================
    let orderStatus = 'pending'
    let paymentStatusValue = 'pending'

    const isSuccess = eventName.includes('success') || eventName.includes('paid') || paymentStatus === 'completed' || paymentStatus === 'paid'
    const isFailed = eventName.includes('failed') || paymentStatus === 'failed' || paymentStatus === 'cancelled'
    const isRefunded = eventName.includes('refunded') || paymentStatus === 'refunded'

    if (isSuccess) {
      orderStatus = 'paid'
      paymentStatusValue = 'paid'
    } else if (isFailed) {
      orderStatus = 'payment_failed'
      paymentStatusValue = 'failed'
    } else if (isRefunded) {
      orderStatus = 'refunded'
      paymentStatusValue = 'refunded'
    } else {
      console.log(`Unhandled status: ${eventName} / ${paymentStatus}`)
      return { statusCode: 200, body: JSON.stringify({ received: true, status: 'unhandled' }) }
    }

    // ============================================
    // METTRE À JOUR LA COMMANDE
    // ============================================
    const updateResponse = await supabaseRequest(`/orders?id=eq.${orderId}`, 'PATCH', {
      status: orderStatus,
      payment_status: paymentStatusValue,
      geniuspay_transaction_id: data.reference || '',
      updated_at: new Date().toISOString(),
    })

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      console.error('Supabase update error:', errorText)
      // On return 200 quand même — GeniusPay ne doit pas retry
      return { statusCode: 200, body: JSON.stringify({ received: true, error: 'DB update failed' }) }
    }

    console.log(`Order ${orderId} updated to: ${orderStatus}`)

    // ============================================
    // ACTIONS POST-PAIEMENT (si succès)
    // ============================================
    if (isSuccess) {
      // Récupérer la commande complète
      const orderResponse = await supabaseRequest(`/orders?id=eq.${orderId}&select=*`, 'GET')
      const orders = await orderResponse.json() as Array<{
        id: string
        customer_email: string
        total: number
        shipping_address: Record<string, unknown>
      }>

      const order = orders[0]

      if (order) {
        // 1. Créer commande CJ Dropshipping
        await createCJOrder(orderId, order.shipping_address)

        // 2. Envoyer email confirmation
        await sendEmail(
          order.customer_email,
          '✅ Commande confirmée — E-Shop Horizon',
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #4A7C59;">Merci pour votre commande !</h1>
              <p>Votre commande <strong>#${orderId.slice(0, 8)}</strong> a été confirmée.</p>
              <p><strong>Total :</strong> ${order.total}€</p>
              <p>Vous recevrez un email dès que votre commande sera expédiée.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">E-Shop Horizon | PetCare</p>
            </div>
          `
        )
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, processed: true, status: orderStatus }),
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook error'
    console.error('Webhook error:', error)
    // ⚠️ TOUJOURS 200 — ne jamais laisser GeniusPay retry
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, error: message }),
    }
  }
}
