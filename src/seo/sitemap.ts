import { supabase } from '../lib/supabase'

type SitemapRoute = {
  url: string
  priority: string
  changefreq: string
  lastmod?: string
}

export async function generateSitemap(): Promise<string> {
  const siteUrl =
    import.meta.env.VITE_NETLIFY_SITE_URL ||
    'https://eshophorizon.netlify.app'

  const staticRoutes: SitemapRoute[] = [
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

  const productRoutes: SitemapRoute[] = (products || []).map((p) => ({
    url: `/produit/${p.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: p.updated_at
      ? new Date(p.updated_at).toISOString().split('T')[0]
      : undefined,
  }))

  const allRoutes = [...staticRoutes, ...productRoutes]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `
  <url>
    <loc>${siteUrl}${route.url}</loc>
    ${route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : ''}
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`
}
