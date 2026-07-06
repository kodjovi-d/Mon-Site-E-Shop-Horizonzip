import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

// ============================================
// Netlify Function: cj-stock-check
// Vérifie le stock fournisseur CJ Dropshipping
// et met à jour Supabase avec le statut
// ============================================

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const cjApiKey = process.env.CJ_DROPSHIPPING_API_KEY || ''
const cjApiUrl = process.env.CJ_DROPSHIPPING_API_URL || 'https://openapi.cjdropshipping.com'
const adminSecret = process.env.ADMIN_SECRET_KEY || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret',
  'Content-Type': 'application/json',
}

type StockStatus = 'empty' | 'low' | 'medium' | 'high' | 'unknown'

function classifyStock(quantity: number | null | undefined): StockStatus {
  if (quantity === null || quantity === undefined || isNaN(quantity)) return 'unknown'
  if (quantity <= 0) return 'empty'
  if (quantity <= 10) return 'low'
  if (quantity <= 50) return 'medium'
  return 'high'
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

async function checkCJStock(cjProductId: string): Promise<{ quantity: number | null; status: StockStatus }> {
  try {
    const response = await fetch(
      `${cjApiUrl}/product/getProductDetail?pid=${encodeURIComponent(cjProductId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cjApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error(`CJ API error for product ${cjProductId}: ${response.status}`)
      return { quantity: null, status: 'unknown' }
    }

    const data = await response.json() as {
      data?: {
        variants?: Array<{ sellQuantity?: number; quantity?: number }>
        sellQuantity?: number
        quantity?: number
        stock?: number
      }
      sellQuantity?: number
      quantity?: number
    }

    // CJ returns sellQuantity or quantity at product or variant level
    let totalStock: number | null = null

    if (data.data) {
      if (data.data.variants && data.data.variants.length > 0) {
        // Sum all variant stocks
        totalStock = data.data.variants.reduce((sum, v) => {
          const qty = v.sellQuantity ?? v.quantity ?? 0
          return sum + (typeof qty === 'number' ? qty : 0)
        }, 0)
      } else {
        totalStock = data.data.sellQuantity ?? data.data.quantity ?? data.data.stock ?? null
      }
    } else {
      totalStock = data.sellQuantity ?? data.quantity ?? null
    }

    return { quantity: totalStock, status: classifyStock(totalStock) }
  } catch (err) {
    console.error('CJ stock check error:', err)
    return { quantity: null, status: 'unknown' }
  }
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  // Vérification du secret admin
  const providedSecret = event.headers['x-admin-secret'] || ''
  if (adminSecret && providedSecret !== adminSecret) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Non autorisé' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}') as {
      productId?: string  // UUID Supabase — vérifier un produit spécifique
      checkAll?: boolean  // Vérifier tous les produits avec cj_product_id
    }

    if (body.productId) {
      // Vérifier UN produit
      const res = await supabaseRequest(
        `/products?id=eq.${body.productId}&select=id,name,cj_product_id,cj_variant_id`,
        'GET'
      )
      const products = await res.json() as Array<{
        id: string
        name: string
        cj_product_id: string | null
        cj_variant_id: string | null
      }>

      if (!products.length) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Produit introuvable' }),
        }
      }

      const product = products[0]

      if (!product.cj_product_id) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            productId: product.id,
            name: product.name,
            status: 'unknown',
            quantity: null,
            message: 'Aucun cj_product_id configuré pour ce produit',
          }),
        }
      }

      const { quantity, status } = await checkCJStock(product.cj_product_id)

      // Mettre à jour Supabase
      await supabaseRequest(`/products?id=eq.${product.id}`, 'PATCH', {
        cj_stock_status: status,
        cj_stock_checked_at: new Date().toISOString(),
      })

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          productId: product.id,
          name: product.name,
          cj_product_id: product.cj_product_id,
          quantity,
          status,
          label: { empty: '🔴 Rupture', low: '🟡 Faible', medium: '🟢 Disponible', high: '🟢 Élevé', unknown: '⚪ Inconnu' }[status],
        }),
      }

    } else if (body.checkAll) {
      // Vérifier TOUS les produits CJ
      const res = await supabaseRequest(
        '/products?cj_product_id=not.is.null&select=id,name,cj_product_id',
        'GET'
      )
      const products = await res.json() as Array<{
        id: string
        name: string
        cj_product_id: string
      }>

      const results = []

      for (const product of products) {
        const { quantity, status } = await checkCJStock(product.cj_product_id)

        await supabaseRequest(`/products?id=eq.${product.id}`, 'PATCH', {
          cj_stock_status: status,
          cj_stock_checked_at: new Date().toISOString(),
        })

        results.push({
          productId: product.id,
          name: product.name,
          quantity,
          status,
          label: { empty: '🔴 Rupture', low: '🟡 Faible', medium: '🟢 Disponible', high: '🟢 Élevé', unknown: '⚪ Inconnu' }[status],
        })

        // Pause courte pour éviter rate limit CJ
        await new Promise(r => setTimeout(r, 300))
      }

      const summary = {
        total: results.length,
        empty: results.filter(r => r.status === 'empty').length,
        low: results.filter(r => r.status === 'low').length,
        medium: results.filter(r => r.status === 'medium').length,
        high: results.filter(r => r.status === 'high').length,
        unknown: results.filter(r => r.status === 'unknown').length,
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, summary, results }),
      }

    } else {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Paramètre requis: productId ou checkAll:true' }),
      }
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne'
    console.error('CJ stock check handler error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, message }),
    }
  }
}
