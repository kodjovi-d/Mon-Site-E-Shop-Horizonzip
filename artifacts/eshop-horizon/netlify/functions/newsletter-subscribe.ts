import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

// ============================================
// Netlify Function: newsletter-subscribe
// Inscription à la newsletter
// ============================================

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const resendApiKey = process.env.RESEND_API_KEY || ''
// Use verified sender: onboarding@resend.dev for testing, or configured VERIFIED_FROM_EMAIL
const resendFromEmail = process.env.VERIFIED_FROM_EMAIL || 'onboarding@resend.dev'

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

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const { email, source = 'website' } = JSON.parse(event.body || '{}')

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Email invalide' }),
      }
    }

    // 1. Insérer dans Supabase
    const response = await supabaseRequest('/newsletter_subscribers', 'POST', {
      email: email.toLowerCase().trim(),
      source,
      subscribed_at: new Date().toISOString(),
    })

    // Si email déjà existant (409 conflict), c'est OK
    if (!response.ok && response.status !== 409) {
      const errorText = await response.text()
      console.error('Newsletter insert error:', errorText)
      throw new Error('Erreur inscription')
    }

    // 2. Envoyer email de bienvenue
    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `E-Shop Horizon <${resendFromEmail}>`,
          to: email,
          subject: '🎉 Bienvenue chez E-Shop Horizon !',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #4A7C59;">Bienvenue !</h1>
              <p>Merci de vous être inscrit à notre newsletter.</p>
              <p>Profitez de <strong>10% de réduction</strong> sur votre premier achat avec le code :</p>
              <p style="font-size: 24px; font-weight: bold; color: #C9A84C; text-align: center; padding: 20px; background: #F5EDD7; border-radius: 8px;">WELCOME10</p>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">E-Shop Horizon | PetCare</p>
            </div>
          `,
        }),
      })
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Inscription confirmée !',
      }),
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne'
    console.error('Newsletter error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, message }),
    }
  }
}
