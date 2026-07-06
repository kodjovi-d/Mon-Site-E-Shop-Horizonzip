import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// ============================================
// Netlify Function: update-order-status
// Met à jour le statut d'une commande et envoie l'email correspondant
// ============================================

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const resendApiKey = process.env.RESEND_API_KEY || ''
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'eshophorizon6@gmail.com'
const resendFromName = process.env.RESEND_FROM_NAME || 'E-Shop Horizon'
const siteUrl = process.env.NETLIFY_SITE_URL || 'https://eshop-horizon.netlify.app'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mapping statut → template email
const statusEmails: Record<string, { template: string; subject: string }> = {
  'paid': { template: 'payment-received', subject: '💳 Paiement confirmé - E-Shop Horizon' },
  'shipped': { template: 'order-shipped', subject: '📦 Votre commande est expédiée !' },
  'delivered': { template: 'order-delivered', subject: '🎉 Commande livrée !' },
}

// Helper: Envoyer email via Resend (directement, sans appel HTTP interne)
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
      return false
    }

    return true
  } catch (err) {
    console.error('Email send error:', err)
    return false
  }
}

// Templates HTML inline (copie des templates de resend-email.ts pour éviter l'appel HTTP)
function getEmailTemplate(template: string, data: Record<string, unknown>): { subject: string; html: string } | null {
  const templates: Record<string, (data: Record<string, unknown>) => { subject: string; html: string }> = {
    'payment-received': (d) => ({
      subject: '💳 Paiement confirmé — E-Shop Horizon',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
          <div style="background-color: #4A7C59; padding: 30px; text-align: center;">
            <h1 style="color: #FAFAF7; margin: 0;">✅ Paiement confirmé</h1>
          </div>
          <div style="padding: 30px; background-color: #FAFAF7;">
            <h2 style="color: #4A7C59;">Bonjour ${d.customerName || ''},</h2>
            <p style="font-size: 16px; line-height: 1.6;">Votre paiement de <strong>${d.total || ''}€</strong> pour la commande <strong>#${d.orderNumber || ''}</strong> a été accepté.</p>
            <div style="background-color: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Statut :</strong> Payée ✅</p>
            </div>
            <h3 style="color: #4A7C59; margin-top: 30px;">Prochaines étapes :</h3>
            <ol style="line-height: 1.8; padding-left: 20px;">
              <li>Préparation de votre colis (1-2 jours ouvrés)</li>
              <li>Expédition avec numéro de suivi</li>
              <li>Livraison estimée : 3-5 jours ouvrés</li>
            </ol>
          </div>
          <div style="background-color: #2D2D2D; padding: 20px; text-align: center; color: #F5EDD7;">
            <p style="margin: 0; font-size: 14px;"><a href="mailto:eshophorizon6@gmail.com" style="color: #C9A84C;">eshophorizon6@gmail.com</a></p>
          </div>
        </div>
      `,
    }),
    
    'order-shipped': (d) => ({
      subject: '📦 Commande expédiée — E-Shop Horizon',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
          <div style="background-color: #C9A84C; padding: 30px; text-align: center;">
            <h1 style="color: #FAFAF7; margin: 0;">📦 Commande expédiée !</h1>
          </div>
          <div style="padding: 30px; background-color: #FAFAF7;">
            <h2 style="color: #4A7C59;">Bonjour ${d.customerName || ''},</h2>
            <p style="font-size: 16px; line-height: 1.6;">Excellente nouvelle ! Votre commande <strong>#${d.orderNumber || ''}</strong> vient d'être expédiée.</p>
            <div style="background-color: #FFF8E1; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #666;">Numéro de suivi</p>
              <p style="margin: 10px 0; font-size: 22px; font-weight: bold; color: #C9A84C;">${d.trackingNumber || ''}</p>
              <a href="${d.trackingUrl || `https://track.aftership.com/${d.trackingNumber || ''}`}" style="display: inline-block; background-color: #4A7C59; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">Suivre mon colis</a>
            </div>
            <p style="text-align: center; color: #666; margin-top: 20px;">Livraison estimée : <strong>${d.estimatedDelivery || '3-5 jours ouvrés'}</strong></p>
          </div>
          <div style="background-color: #2D2D2D; padding: 20px; text-align: center; color: #F5EDD7;">
            <p style="margin: 0; font-size: 14px;">Des questions ? <a href="mailto:eshophorizon6@gmail.com" style="color: #C9A84C;">eshophorizon6@gmail.com</a></p>
          </div>
        </div>
      `,
    }),
    
    'order-delivered': (d) => ({
      subject: '🎉 Commande livrée — E-Shop Horizon',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
          <div style="background-color: #4A7C59; padding: 30px; text-align: center;">
            <h1 style="color: #FAFAF7; margin: 0;">🎉 Commande livrée !</h1>
          </div>
          <div style="padding: 30px; background-color: #FAFAF7;">
            <h2 style="color: #4A7C59;">Bonjour ${d.customerName || ''},</h2>
            <p style="font-size: 16px; line-height: 1.6;">Votre commande <strong>#${d.orderNumber || ''}</strong> a été livrée. Nous espérons que vous et votre compagnon êtes satisfaits !</p>
            <div style="background-color: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 18px;">Votre avis compte ! 🌟</p>
              <a href="${d.reviewUrl || ''}" style="display: inline-block; background-color: #C9A84C; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Donner mon avis</a>
            </div>
          </div>
          <div style="background-color: #2D2D2D; padding: 20px; text-align: center; color: #F5EDD7;">
            <p style="margin: 0; font-size: 14px;">Merci de votre confiance ! 🐾</p>
          </div>
        </div>
      `,
    }),
  }

  if (!templates[template]) return null
  return templates[template](data)
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // Vérification admin
  const authHeader = event.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) }
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminUser || adminUser.role !== 'admin') {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) }
    }

    const { orderId, status, trackingNumber } = JSON.parse(event.body || '{}')

    if (!orderId || !status) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing orderId or status' }) }
    }

    // Mettre à jour la commande
    const updateData: Record<string, string> = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    if (trackingNumber) updateData.tracking_number = trackingNumber

    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) throw updateError

    // Envoyer l'email correspondant au statut
    const emailConfig = statusEmails[status]
    if (emailConfig && order) {
      const emailData = {
        orderNumber: order.id.slice(0, 8),
        customerName: order.customer_name || order.customer_email,
        total: order.total,
        trackingNumber: order.tracking_number || trackingNumber,
        trackingUrl: `https://cjdropshipping.com/track?number=${order.tracking_number || trackingNumber}`,
        reviewUrl: `${siteUrl}/avis?order=${order.id}`,
        estimatedDelivery: '3-5 jours ouvrés',
      }

      const template = getEmailTemplate(emailConfig.template, emailData)
      if (template) {
        await sendEmail(order.customer_email, template.subject, template.html)
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, order }),
    }

  } catch (error) {
    console.error('Update order status error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
    }
  }
}
