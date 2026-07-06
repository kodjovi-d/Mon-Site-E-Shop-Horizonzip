import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

// ============================================
// Netlify Function: create-order
// Crée une commande dans Supabase + initie paiement GeniusPay
// ============================================

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const geniusPayApiKey = process.env.GENIUSPAY_API_KEY || ''
const geniusPayApiSecret = process.env.GENIUSPAY_API_SECRET || ''
const geniusPayApiUrl = process.env.GENIUSPAY_API_URL || 'https://geniuspay.ci/api/v1/merchant'
const siteUrl = process.env.NETLIFY_SITE_URL || 'https://eshop-horizon.netlify.app'

const FETCH_TIMEOUT_MS = 15000

interface CartItem {
  productId: string
  quantity: number
}

interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  country: string
  phone: string
}

interface CreateOrderBody {
  items: CartItem[]
  customerEmail: string
  customerName: string
  customerPhone: string
  shippingAddress: ShippingAddress
  shippingCost?: number
  total?: number
  idempotenceKey?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

async function supabaseRequest(path: string, method: string, body?: unknown) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: supabaseServiceKey,
    Authorization: `Bearer ${supabaseServiceKey}`,
  }
  if (method === 'POST') {
    headers['Prefer'] = 'return=representation'
  }
  const response = await fetchWithTimeout(`${supabaseUrl}/rest/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  return response
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

function isValidString(str: unknown, maxLength: number = 255): str is string {
  return typeof str === 'string' && str.trim().length > 0 && str.length <= maxLength
}

// Server-side shipping cost calculation (source of truth — must match frontend Checkout.tsx)
function computeShipping(country: string, subtotal: number): number {
  const c = (country || '').toUpperCase().trim()
  // Per-country rates matching frontend
  const RATES: Record<string, { cost: number; free: number }> = {
    FR: { cost: 5.90, free: 49 }, MC: { cost: 5.90, free: 49 },
    BE: { cost: 6.90, free: 49 }, LU: { cost: 6.90, free: 49 },
    DE: { cost: 7.90, free: 49 }, IT: { cost: 7.90, free: 49 },
    ES: { cost: 7.90, free: 49 }, NL: { cost: 7.90, free: 49 },
    AT: { cost: 7.90, free: 49 }, PT: { cost: 8.90, free: 49 },
    CH: { cost: 8.90, free: 49 }, DK: { cost: 8.90, free: 49 },
    IE: { cost: 9.90, free: 49 }, SE: { cost: 9.90, free: 49 },
    AD: { cost: 9.90, free: 49 }, SM: { cost: 9.90, free: 49 },
    VA: { cost: 9.90, free: 49 }, NO: { cost: 10.90, free: 49 },
    FI: { cost: 10.90, free: 49 }, PL: { cost: 9.90, free: 49 },
    CZ: { cost: 9.90, free: 49 }, SK: { cost: 10.90, free: 49 },
    HU: { cost: 10.90, free: 49 }, SI: { cost: 10.90, free: 49 },
    LI: { cost: 10.90, free: 49 }, HR: { cost: 11.90, free: 49 },
    RO: { cost: 11.90, free: 49 }, EE: { cost: 11.90, free: 49 },
    LV: { cost: 11.90, free: 49 }, LT: { cost: 11.90, free: 49 },
    BG: { cost: 12.90, free: 49 }, GR: { cost: 12.90, free: 49 },
    MT: { cost: 12.90, free: 49 }, GB: { cost: 12.90, free: 49 },
    IS: { cost: 14.90, free: 49 }, CY: { cost: 13.90, free: 49 },
    TG: { cost: 15.90, free: 69 }, MA: { cost: 14.90, free: 69 },
    TN: { cost: 14.90, free: 69 }, DZ: { cost: 15.90, free: 69 },
    EG: { cost: 16.90, free: 69 }, LY: { cost: 17.90, free: 69 },
    CI: { cost: 15.90, free: 69 }, SN: { cost: 15.90, free: 69 },
    GH: { cost: 15.90, free: 69 }, BJ: { cost: 15.90, free: 69 },
  }
  const rate = RATES[c]
  if (rate) return subtotal >= rate.free ? 0 : rate.cost
  // Default international
  return subtotal >= 69 ? 0 : 15.90
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const body: CreateOrderBody = JSON.parse(event.body || '{}')

    // Idempotence check - prevent duplicate orders
    if (body.idempotenceKey) {
      const existingOrder = await supabaseRequest(
        `/orders?idempotency_key=eq.${body.idempotenceKey}&select=id,status,payment_reference`,
        'GET'
      )
      if (existingOrder.ok) {
        const orders = await existingOrder.json() as Array<{ id: string; status: string; payment_reference: string }>
        if (orders.length > 0) {
          const existing = orders[0]
          console.log(`Idempotence: order ${existing.id} already exists with key ${body.idempotenceKey}`)
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
              success: true,
              order_id: existing.id,
              checkout_url: existing.payment_reference
                ? `${siteUrl}/.netlify/functions/initiate-payment?order=${existing.id}`
                : undefined,
              idempotent: true,
            }),
          }
        }
      }
    }

    if (!isValidEmail(body.customerEmail)) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ message: 'Email client invalide' }) }
    }

    if (!body.shippingAddress) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ message: 'Adresse de livraison requise' }) }
    }

    const addr = body.shippingAddress
    if (
      !isValidString(addr.firstName, 100) ||
      !isValidString(addr.lastName, 100) ||
      !isValidString(addr.address, 500) ||
      !isValidString(addr.city, 100) ||
      !isValidString(addr.postalCode, 20) ||
      !isValidString(addr.country, 100) ||
      !isValidString(addr.phone, 50)
    ) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ message: 'Adresse de livraison invalide ou incomplète' }) }
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ message: 'Le panier est vide' }) }
    }

    const itemMap = new Map<string, number>()
    for (const item of body.items) {
      if (!isValidUUID(item.productId)) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ message: `ID produit invalide: ${item.productId}` }) }
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ message: `Quantité invalide pour le produit ${item.productId}` }) }
      }
      itemMap.set(item.productId, (itemMap.get(item.productId) || 0) + item.quantity)
    }

    const productIds = Array.from(itemMap.keys())
    const productsResponse = await supabaseRequest(
      `/products?id=in.(${productIds.join(',')})&select=id,name,sku,price,stock,cj_product_id,weight,is_active`,
      'GET'
    )

    if (!productsResponse.ok) {
      throw new Error('Erreur récupération produits')
    }

    const products = await productsResponse.json() as Array<{
      id: string
      name: string
      sku: string
      price: number
      stock: number
      cj_product_id: string | null
      weight: number
      is_active: boolean
    }>

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map(p => p.id))
      const missing = productIds.filter(id => !foundIds.has(id))
      throw new Error(`Produit(s) introuvable(s): ${missing.join(', ')}`)
    }

    let subtotal = 0
    const orderItems = []

    for (const [productId, quantity] of itemMap) {
      const product = products.find(p => p.id === productId)
      if (!product) throw new Error(`Produit ${productId} introuvable`)
      if (!product.is_active) throw new Error(`Produit "${product.name}" indisponible`)
      if (product.stock < quantity) {
        throw new Error(`Stock insuffisant pour "${product.name}" (disponible: ${product.stock}, demandé: ${quantity})`)
      }
      const itemTotal = Math.round(product.price * quantity * 100) / 100
      subtotal += itemTotal
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        sku: product.sku || product.id.slice(0, 8).toUpperCase(),
        quantity: quantity,
        unit_price: product.price,
        total_price: itemTotal,
      })
    }

    // Server-side shipping cost calculation - source of truth
    const shippingCost = computeShipping(addr.country, subtotal)
    const total = Math.round((subtotal + shippingCost) * 100) / 100

    // Generate unique order number: ORD-YYYYMMDD-XXXXX
    const now = new Date()
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randPart = Math.random().toString(36).substring(2, 7).toUpperCase()
    const orderNumber = `ORD-${datePart}-${randPart}`

    // Build order data
    const orderData: Record<string, unknown> = {
      order_number: orderNumber,
      status: 'pending',
      payment_status: 'pending',
      customer_email: body.customerEmail.trim().toLowerCase(),
      customer_name: isValidString(body.customerName, 200) ? body.customerName.trim() : '',
      customer_phone: isValidString(body.customerPhone, 50) ? body.customerPhone.trim() : '',
      shipping_address: body.shippingAddress,
      billing_address: body.shippingAddress,
      subtotal: subtotal,
      shipping_cost: shippingCost,
      total: total,
      currency: 'EUR',
    }

    // Add idempotence key if provided (DB column is idempotency_key)
    if (body.idempotenceKey && isValidString(body.idempotenceKey, 100)) {
      orderData.idempotency_key = body.idempotenceKey
    }

    const orderResponse = await supabaseRequest('/orders', 'POST', orderData)

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text()
      console.error('Supabase order error:', errorText)
      throw new Error('Erreur création commande')
    }

    const orderResult = await orderResponse.json() as Array<{ id: string }>
    if (!Array.isArray(orderResult) || orderResult.length === 0 || !orderResult[0]?.id) {
      throw new Error('Réponse Supabase invalide lors de la création de commande')
    }
    const order = orderResult[0]

    // Insert order items
    const itemsResponse = await supabaseRequest('/order_items', 'POST', orderItems.map(item => ({
      ...item,
      order_id: order.id,
    })))
    if (!itemsResponse.ok) {
      const itemsError = await itemsResponse.text()
      console.error('Order items error:', itemsError)
    }

    // Decrement stock for each product
    for (const [productId, quantity] of itemMap) {
      const product = products.find(p => p.id === productId)
      if (product) {
        await supabaseRequest(
          `/products?id=eq.${productId}`,
          'PATCH',
          { stock: Math.max(0, product.stock - quantity) }
        )
      }
    }

    // ============================================
    // ÉTAPE 4: CRÉER LE PAIEMENT GENIUSPAY
    // ============================================
    const geniusPayBody = {
      amount: Math.round(total * 100), // GeniusPay attend le montant en CENTIMES
      currency: 'EUR',
      description: `Commande E-Shop Horizon #${order.id.slice(0, 8)}`,
      customer: {
        name: isValidString(body.customerName, 200) ? body.customerName.trim() : body.customerEmail,
        email: body.customerEmail.trim().toLowerCase(),
        phone: isValidString(body.customerPhone, 50) ? body.customerPhone.trim() : '',
      },
      success_url: `${siteUrl}/merci?order=${order.id}`,
      error_url: `${siteUrl}/checkout?error=payment_failed`,
      cancel_url: `${siteUrl}/checkout?error=cancelled&order=${order.id}`,
      webhook_url: `${siteUrl}/.netlify/functions/geniuspay-webhook`,
      metadata: {
        order_id: order.id,
        customer_email: body.customerEmail,
      },
    }

    console.log('GeniusPay payload:', JSON.stringify(geniusPayBody))

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
    let geniusPayData: { data?: { reference?: string; checkout_url?: string; payment_url?: string }; message?: string }
    try {
      geniusPayData = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`Réponse GeniusPay invalide: ${responseText.substring(0, 200)}`)
    }

    if (!geniusPayResponse.ok) {
      await supabaseRequest(`/orders?id=eq.${order.id}`, 'PATCH', {
        status: 'payment_failed',
        payment_status: 'failed',
      })
      throw new Error(geniusPayData.message || 'Erreur création paiement GeniusPay')
    }

    await supabaseRequest(`/orders?id=eq.${order.id}`, 'PATCH', {
      payment_reference: geniusPayData.data?.reference || '',
      geniuspay_transaction_id: geniusPayData.data?.reference || '',
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        order_id: order.id,
        checkout_url: geniusPayData.data?.checkout_url || geniusPayData.data?.payment_url,
      }),
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne'
    console.error('Create order error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, message: message }),
    }
  }
}
