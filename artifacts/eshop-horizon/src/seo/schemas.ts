export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'E-Shop Horizon',
    url: 'https://eshophorizon.netlify.app',
    logo: 'https://eshophorizon.netlify.app/logo.png',
    email: 'eshophorizon6@gmail.com',
    description: 'Boutique spécialisée dans l\'hygiène premium pour animaux de compagnie',
  }
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'E-Shop Horizon',
    url: 'https://eshophorizon.netlify.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://eshophorizon.netlify.app/produits?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateProductSchema(product: {
  name: string
  description: string
  image: string
  price: number
  currency: string
  availability: string
  slug: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: product.availability,
      url: `https://eshophorizon.netlify.app/produit/${product.slug}`,
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
