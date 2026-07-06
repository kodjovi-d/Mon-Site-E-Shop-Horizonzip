import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

// ============================================
// Netlify Function: resend-email
// Envoie des emails via Resend (templates génériques)
// ============================================

const resendApiKey = process.env.RESEND_API_KEY || ''
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'eshophorizon6@gmail.com'
const resendFromName = process.env.RESEND_FROM_NAME || 'E-Shop Horizon'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

interface EmailBody {
  to: string
  subject?: string
  html?: string
  template?: 'order-confirmation' | 'payment-received' | 'order-shipped' | 'order-delivered' | 'cart-abandoned' | 'welcome-newsletter'
  data?: Record<string, unknown>
}

// Templates d'emails prédéfinis
const templates: Record<string, (data: Record<string, unknown>) => { subject: string; html: string }> = {
  'order-confirmation': (data) => ({
    subject: '✅ Commande confirmée — E-Shop Horizon',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background-color: #7D9B76; padding: 30px; text-align: center;">
          <h1 style="color: #FAFAF7; margin: 0; font-size: 24px;">🐾 E-Shop Horizon</h1>
          <p style="color: #F5EDD7; margin: 10px 0 0 0;">L'hygiène premium pour votre compagnon</p>
        </div>
        <div style="padding: 30px; background-color: #FAFAF7;">
          <h2 style="color: #4A7C59; margin-bottom: 20px;">Merci pour votre commande, ${data.customerName || ''} !</h2>
          <p style="font-size: 16px; line-height: 1.6;">Nous avons bien reçu votre commande. Voici le récapitulatif :</p>
          <div style="background-color: #F5EDD7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #666;">Numéro de commande</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #4A7C59;">#${data.orderNumber || ''}</p>
          </div>
          <p style="margin: 0; font-size: 18px; font-weight: bold; text-align: right; color: #4A7C59;">Total : ${data.total || ''}€</p>
          <div style="background-color: #E8F5E9; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #4A7C59;">
            <p style="margin: 0; font-size: 16px;"><strong>Prochaines étapes :</strong></p>
            <p style="margin: 10px 0 0 0; line-height: 1.6;">Vous recevrez un email dès que votre commande sera expédiée avec votre numéro de suivi.</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${data.orderUrl || ''}" style="display: inline-block; background-color: #4A7C59; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Suivre ma commande</a>
          </div>
        </div>
        <div style="background-color: #2D2D2D; padding: 20px; text-align: center; color: #F5EDD7;">
          <p style="margin: 0; font-size: 14px;">Des questions ? Contactez-nous à <a href="mailto:eshophorizon6@gmail.com" style="color: #C9A84C;">eshophorizon6@gmail.com</a></p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">E-Shop Horizon - L'hygiène premium pour votre compagnon</p>
        </div>
      </div>
    `,
  }),
  
  'payment-received': (data) => ({
    subject: '💳 Paiement confirmé — E-Shop Horizon',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background-color: #4A7C59; padding: 30px; text-align: center;">
          <h1 style="color: #FAFAF7; margin: 0;">✅ Paiement confirmé</h1>
        </div>
        <div style="padding: 30px; background-color: #FAFAF7;">
          <h2 style="color: #4A7C59;">Bonjour ${data.customerName || ''},</h2>
          <p style="font-size: 16px; line-height: 1.6;">Votre paiement de <strong>${data.total || ''}€</strong> pour la commande <strong>#${data.orderNumber || ''}</strong> a été accepté.</p>
          <div style="background-color: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Méthode :</strong> ${data.paymentMethod || 'Carte bancaire'}</p>
            <p style="margin: 10px 0 0 0;"><strong>Statut :</strong> Payée ✅</p>
          </div>
          <h3 style="color: #4A7C59; margin-top: 30px;">Prochaines étapes :</h3>
          <ol style="line-height: 1.8; padding-left: 20px;">
            <li>Préparation de votre colis (1-2 jours ouvrés)</li>
            <li>Expédition avec numéro de suivi</li>
            <li>Livraison estimée : 3-5 jours ouvrés</li>
          </ol>
          <p style="margin-top: 30px; color: #666;">Vous recevrez un email dès l'expédition de votre commande.</p>
        </div>
        <div style="background-color: #2D2D2D; padding: 20px; text-align: center; color: #F5EDD7;">
          <p style="margin: 0; font-size: 14px;"><a href="mailto:eshophorizon6@gmail.com" style="color: #C9A84C;">eshophorizon6@gmail.com</a></p>
        </div>
      </div>
    `,
  }),
  
  'order-shipped': (data) => ({
    subject: '📦 Commande expédiée — E-Shop Horizon',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background-color: #C9A84C; padding: 30px; text-align: center;">
          <h1 style="color: #FAFAF7; margin: 0;">📦 Commande expédiée !</h1>
        </div>
        <div style="padding: 30px; background-color: #FAFAF7;">
          <h2 style="color: #4A7C59;">Bonjour ${data.customerName || ''},</h2>
          <p style="font-size: 16px; line-height: 1.6;">Excellente nouvelle ! Votre commande <strong>#${data.orderNumber || ''}</strong> vient d'être expédiée.</p>
          <div style="background-color: #FFF8E1; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #666;">Numéro de suivi</p>
            <p style="margin: 10px 0; font-size: 22px; font-weight: bold; color: #C9A84C;">${data.trackingNumber || ''}</p>
            <a href="${data.trackingUrl || `https://track.aftership.com/${data.trackingNumber || ''}`}" style="display: inline-block; background-color: #4A7C59; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">Suivre mon colis</a>
          </div>
          <p style="text-align: center; color: #666; margin-top: 20px;">Livraison estimée : <strong>${data.estimatedDelivery || '3-5 jours ouvrés'}</strong></p>
        </div>
        <div style="background-color: #2D2D2D; padding: 20px; text-align: center; color: #F5EDD7;">
          <p style="margin: 0; font-size: 14px;">Des questions ? <a href="mailto:eshophorizon6@gmail.com" style="color: #C9A84C;">eshophorizon6@gmail.com</a></p>
        </div>
      </div>
    `,
  }),
  
  'order-delivered': (data) => ({
    subject: '🎉 Commande livrée — E-Shop Horizon',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background-color: #4A7C59; padding: 30px; text-align: center;">
          <h1 style="color: #FAFAF7; margin: 0;">🎉 Commande livrée !</h1>
        </div>
        <div style="padding: 30px; background-color: #FAFAF7;">
          <h2 style="color: #4A7C59;">Bonjour ${data.customerName || ''},</h2>
          <p style="font-size: 16px; line-height: 1.6;">Votre commande <strong>#${data.orderNumber || ''}</strong> a été livrée. Nous espérons que vous et votre compagnon êtes satisfaits !</p>
          <div style="background-color: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 18px;">Votre avis compte ! 🌟</p>
            <p style="margin: 10px 0; color: #666;">Partagez votre expérience en 30 secondes</p>
            <a href="${data.reviewUrl || ''}" style="display: inline-block; background-color: #C9A84C; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Donner mon avis</a>
          </div>
          <div style="background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #E5E5E5; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #666;"><strong>Besoin d'aide ?</strong> Notre SAV est là pour vous : <a href="mailto:eshophorizon6@gmail.com" style="color: #4A7C59;">eshophorizon6@gmail.com</a></p>
          </div>
        </div>
        <div style="background-color: #2D2D2D; padding: 20px; text-align: center; color: #F5EDD7;">
          <p style="margin: 0; font-size: 14px;">Merci de votre confiance ! 🐾</p>
        </div>
      </div>
    `,
  }),
  
  'cart-abandoned': (data) => ({
    subject: '👋 Vous avez oublié quelque chose ? — E-Shop Horizon',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background-color: #7D9B76; padding: 30px; text-align: center;">
          <h1 style="color: #FAFAF7; margin: 0;">👋 Vous avez oublié quelque chose ?</h1>
        </div>
        <div style="padding: 30px; background-color: #FAFAF7;">
          <h2 style="color: #4A7C59;">Bonjour ${data.customerName || ''},</h2>
          <p style="font-size: 16px; line-height: 1.6;">Vous avez laissé des articles dans votre panier. Ils vous attendent !</p>
          <div style="margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; text-align: right;">Total : ${data.cartTotal || ''}€</p>
          </div>
          <div style="background-color: #FFF3E0; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #C9A84C;">
            <p style="margin: 0; font-weight: bold; color: #C9A84C;">⏰ Offre spéciale : -10% avec le code ${data.discountCode || 'BIENVENUE10'}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Valable 24h seulement</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${data.checkoutUrl || ''}" style="display: inline-block; background-color: #4A7C59; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Finaliser ma commande</a>
          </div>
        </div>
        <div style="background-color: #2D2D2D; padding: 20px; text-align: center; color: #F5EDD7;">
          <p style="margin: 0; font-size: 12px; color: #999;">E-Shop Horizon - Si vous avez déjà passé commande, ignorez cet email.</p>
        </div>
      </div>
    `,
  }),
  
  'welcome-newsletter': (data) => ({
    subject: '🎉 Bienvenue chez E-Shop Horizon !',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background-color: #7D9B76; padding: 30px; text-align: center;">
          <h1 style="color: #FAFAF7; margin: 0;">🐾 Bienvenue dans la famille !</h1>
        </div>
        <div style="padding: 30px; background-color: #FAFAF7;">
          <h2 style="color: #4A7C59;">Merci de votre inscription !</h2>
          <p style="font-size: 16px; line-height: 1.6;">Vous recevrez nos meilleures offres et conseils pour prendre soin de votre compagnon.</p>
          <div style="background-color: #E8F5E9; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; border: 2px dashed #4A7C59;">
            <p style="margin: 0; font-size: 14px; color: #666;">Votre code promo de bienvenue</p>
            <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #4A7C59; letter-spacing: 2px;">${data.promoCode || 'BIENVENUE10'}</p>
            <p style="margin: 0; font-size: 14px; color: #666;">-10% sur votre première commande</p>
          </div>
          <h3 style="color: #4A7C59; margin-top: 30px;">Nos best-sellers ⭐</h3>
          <div style="background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #E5E5E5;">
            <ul style="line-height: 1.8; padding-left: 20px; margin: 0;">
              <li>Shampooing Sec Premium Chien</li>
              <li>Brosse Démêlante Pro</li>
              <li>Spray Désodorisant Naturel</li>
              <li>Lingettes Nettoyantes Bio</li>
            </ul>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${data.shopUrl || ''}" style="display: inline-block; background-color: #4A7C59; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Découvrir nos produits</a>
          </div>
        </div>
        <div style="background-color: #2D2D2D; padding: 20px; text-align: center; color: #F5EDD7;">
          <p style="margin: 0; font-size: 14px;">E-Shop Horizon 🐾 L'hygiène premium pour votre compagnon</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
            <a href="${data.unsubscribeUrl || '#'}" style="color: #999;">Se désabonner</a>
          </p>
        </div>
      </div>
    `,
  }),
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const body: EmailBody = JSON.parse(event.body || '{}')

    if (!body.to) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Destinataire (to) requis' }),
      }
    }

    // Utiliser un template si spécifié
    let subject = body.subject || ''
    let html = body.html || ''

    if (body.template && templates[body.template]) {
      const template = templates[body.template](body.data || {})
      subject = template.subject
      html = template.html
    }

    if (!subject || !html) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Subject et html requis, ou template valide' }),
      }
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${resendFromName} <${resendFromEmail}>`,
        to: body.to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Resend error:', errorData)
      throw new Error('Erreur envoi email')
    }

    const data = await response.json()

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, id: data.id }),
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne'
    console.error('Resend email error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, message }),
    }
  }
}
