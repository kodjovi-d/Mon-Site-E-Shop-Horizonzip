declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, unknown>) => void
  }
}

function fbq(action: string, event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(action, event, params)
  }
}

export function trackAddToCart(params: {
  content_ids: string[]
  content_name: string
  content_type: string
  value: number
  currency: string
}) {
  fbq('track', 'AddToCart', params)
}

export function trackInitiateCheckout(params: {
  content_ids: string[]
  num_items: number
  value: number
  currency: string
}) {
  fbq('track', 'InitiateCheckout', params)
}

export function trackPurchase(params: {
  value: number
  currency: string
  content_ids: string[]
  num_items: number
}) {
  fbq('track', 'Purchase', params)
}

export function trackViewContent(params: {
  content_ids: string[]
  content_name: string
  content_type: string
  value: number
  currency: string
}) {
  fbq('track', 'ViewContent', params)
}
