import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const authHeader = event.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'Unauthorized' }) }
    }

    // Vérifier le token avec Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid token' }) }
    }

    // Vérifier le rôle admin
    const { data: adminUser, error: roleError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (roleError || !adminUser || adminUser.role !== 'admin') {
      return { statusCode: 403, headers: corsHeaders, body: JSON.stringify({ error: 'Forbidden' }) }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, user: { id: user.id, email: user.email, role: adminUser.role } }),
    }

  } catch (error) {
    console.error('Admin auth error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal error' }),
    }
  }
}
