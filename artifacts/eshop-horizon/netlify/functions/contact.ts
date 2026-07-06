import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

// Netlify Function: contact
// Envoie un email via Resend à partir du formulaire de contact

const resendApiKey = process.env.RESEND_API_KEY || ''
// Use verified sender: onboarding@resend.dev for testing, or configured VERIFIED_FROM_EMAIL
const fromEmail = process.env.VERIFIED_FROM_EMAIL || 'onboarding@resend.dev'
const toEmail = process.env.VITE_RESEND_TO_EMAIL || 'eshophorizon6@gmail.com'

interface ContactBody {
  name: string
  email: string
  subject: string
  message: string
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const body: ContactBody = JSON.parse(event.body || '{}')

    if (!body.name || !body.email || !body.subject || !body.message) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Tous les champs sont requis' }),
      }
    }

    // Envoyer l'email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${body.name} <${fromEmail}>`,
        to: [toEmail],
        reply_to: body.email,
        subject: `[E-Shop Horizon] ${body.subject}`,
        html: `
          <h2>Nouveau message de contact</h2>
          <p><strong>Nom :</strong> ${escapeHtml(body.name)}</p>
          <p><strong>Email :</strong> ${escapeHtml(body.email)}</p>
          <p><strong>Sujet :</strong> ${escapeHtml(body.subject)}</p>
          <p><strong>Message :</strong></p>
          <p>${escapeHtml(body.message).replace(/\n/g, '<br>')}</p>
        `,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text()
      console.error('Resend error:', errorData)
      throw new Error('Erreur lors de l\'envoi de l\'email')
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true, message: 'Email envoyé' }),
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne'
    console.error('Contact error:', error)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    }
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m] || m)
}
