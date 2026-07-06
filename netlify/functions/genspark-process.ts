import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const gensparkApiKey = process.env.GENSPARK_API_KEY || ''
const gensparkApiUrl = process.env.GENSPARK_API_URL || 'https://api.genspark.ai/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

async function supabaseRequest(path: string, method: string, body?: unknown) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: supabaseServiceKey,
    Authorization: `Bearer ${supabaseServiceKey}`,
  }
  if (method === 'POST' || method === 'PATCH') {
    headers['Prefer'] = 'return=representation'
  }
  return fetch(`${supabaseUrl}/rest/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}

async function callGensparkAI(prompt: string, model: string = 'claude-3-sonnet'): Promise<{ content: string; cost: number }> {
  const response = await fetch(`${gensparkApiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${gensparkApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Genspark API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''
  const costUsd = (data.usage?.total_tokens || 0) * 0.00001 // Estimate cost

  return { content, cost: costUsd }
}

function parseJsonFromAI(text: string): Record<string, unknown> | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // Try to find JSON array
    try {
      const arrayMatch = text.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        return { items: JSON.parse(arrayMatch[0]) }
      }
    } catch {}
  }
  return null
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod === 'GET') {
    // Process pending tasks
    try {
      const { data: tasks } = await supabaseRequest(
        `/genspark_tasks?status=eq.pending&select=*&limit=5`,
        'GET'
      ).then(r => r.json())

      if (!tasks || tasks.length === 0) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'No pending tasks', processed: 0 }),
        }
      }

      let processed = 0
      for (const task of tasks) {
        try {
          // Mark as processing
          await supabaseRequest(`/genspark_tasks?id=eq.${task.id}`, 'PATCH', {
            status: 'processing',
            started_at: new Date().toISOString(),
          })

          const productName = task.input_data?.product_name || 'Produit'
          const supplierUrl = task.input_data?.supplier_url || ''
          let outputData: Record<string, unknown> | null = null
          let costUsd = 0.01

          if (task.task_type === 'seo') {
            const prompt = `Génère un titre SEO (max 60 caractères) et une meta description (max 160 caractères) pour ce produit e-commerce:
Produit: ${productName}
Description: ${task.input_data?.current_description || ''}
URL fournisseur: ${supplierUrl}

Réponds UNIQUEMENT en JSON: {"meta_title": "...", "meta_description": "..."}`
            const result = await callGensparkAI(prompt)
            outputData = parseJsonFromAI(result.content)
            costUsd = result.cost
          } else if (task.task_type === 'description') {
            const prompt = `Rédige une description commerciale attractive pour ce produit e-commerce:
Produit: ${productName}
Fournisseur: ${supplierUrl}

Crée une description longue (150-200 mots) et une description courte (50 mots max).
Réponds UNIQUEMENT en JSON: {"description": "...", "short_description": "..."}`
            const result = await callGensparkAI(prompt)
            outputData = parseJsonFromAI(result.content)
            costUsd = result.cost
          } else if (task.task_type === 'faq') {
            const prompt = `Génère 5 FAQ pertinentes pour ce produit e-commerce:
Produit: ${productName}
Fournisseur: ${supplierUrl}

Réponds UNIQUEMENT en JSON: {"faq": [{"question": "...", "answer": "..."}, ...]}`
            const result = await callGensparkAI(prompt)
            outputData = parseJsonFromAI(result.content)
            costUsd = result.cost
          } else if (task.task_type === 'image') {
            // For images, generate enhancement suggestions
            const prompt = `Suggère des améliorations d'images pour ce produit e-commerce:
Produit: ${productName}
Fournisseur: ${supplierUrl}

Suggère: angles de prise de vue, style d'éclairage, accessoires à ajouter, style de fond.
Réponds UNIQUEMENT en JSON: {"image_suggestions": [{"type": "...", "description": "..."}, ...]}`
            const result = await callGensparkAI(prompt)
            outputData = parseJsonFromAI(result.content)
            costUsd = result.cost
          } else if (task.task_type === 'video') {
            const prompt = `Génère un script vidéo promotionnel de 30 secondes pour ce produit:
Produit: ${productName}
Fournisseur: ${supplierUrl}

Réponds UNIQUEMENT en JSON: {"video_script": "...", "scenes": [{"duration_seconds": 3, "description": "..."}, ...]}`
            const result = await callGensparkAI(prompt)
            outputData = parseJsonFromAI(result.content)
            costUsd = result.cost
          }

          await supabaseRequest(`/genspark_tasks?id=eq.${task.id}`, 'PATCH', {
            status: 'completed',
            output_data: outputData,
            estimated_cost: costUsd,
            completed_at: new Date().toISOString(),
          })

          processed++
        } catch (taskError) {
          console.error(`Task ${task.id} error:`, taskError)
          await supabaseRequest(`/genspark_tasks?id=eq.${task.id}`, 'PATCH', {
            status: 'error',
            error_message: taskError instanceof Error ? taskError.message : 'Unknown error',
            completed_at: new Date().toISOString(),
          })
        }
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Processed', processed }),
      }
    } catch (error) {
      console.error('Process error:', error)
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      }
    }
  }

  if (event.httpMethod === 'POST') {
    // Create or trigger task processing
    try {
      const body = JSON.parse(event.body || '{}')

      if (body.action === 'generate' && body.task_type && body.product_id) {
        // Get product info
        const productRes = await supabaseRequest(
          `/products?id=eq.${body.product_id}&select=id,name,description,supplier_url`,
          'GET'
        )
        const products = await productRes.json()
        const product = products?.[0]

        if (!product) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Product not found' }),
          }
        }

        // Create task
        await supabaseRequest('/genspark_tasks', 'POST', {
          product_id: body.product_id,
          task_type: body.task_type,
          status: 'pending',
          input_data: {
            product_name: product.name,
            current_description: product.description,
            supplier_url: product.supplier_url,
          },
        })

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Task created' }),
        }
      }

      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid action' }),
      }
    } catch (error) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      }
    }
  }

  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ message: 'Method not allowed' }),
  }
}
