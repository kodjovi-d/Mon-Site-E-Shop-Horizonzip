// netlify/functions/sitemap.ts
import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const handler: Handler = async () => {
  const siteUrl = process.env.NETLIFY_SITE_URL || 'https://eshop-horizon.netlify.app'

  const staticRoutes = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/produits', priority: '0.9', changefreq: 'daily' },
    { url: '/a-propos', priority: '0.6', changefreq: 'monthly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/engagements', priority: '0.5', changefreq: 'monthly' },
    { url: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
    { url: '/confidentialite', priority: '0.3', changefreq: 'yearly' },
    { url: '/cgv', priority: '0.3', changefreq: 'yearly' },
    { url: '/retours', priority: '0.3', changefreq: 'yearly' },
    { url: '/expedition', priority: '0.3', changefreq: 'yearly' },
    { url: '/cookies', priority: '0.3', changefreq: 'yearly' },
  ]

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)

  const productRoutes = (products || []).map((p) => ({
    url: `/produit/${p.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : undefined,
  }))

  const allRoutes = [...staticRoutes, ...productRoutes]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.url}</loc>
    ${route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : ''}
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
    body: xml,
  }
}
