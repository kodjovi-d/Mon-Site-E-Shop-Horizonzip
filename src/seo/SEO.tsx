import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: string
  noIndex?: boolean
}

export function SEO({ 
  title, 
  description, 
  canonical, 
  ogImage = '/og-image.jpg',
  ogType = 'website',
  noIndex = false 
}: SEOProps) {
  const siteUrl = import.meta.env.VITE_NETLIFY_SITE_URL || 'https://eshophorizon.netlify.app'
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  )
}
