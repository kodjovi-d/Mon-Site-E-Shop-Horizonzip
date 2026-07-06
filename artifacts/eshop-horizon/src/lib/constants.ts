export const SITE_CONFIG = {
  name: 'E-Shop Horizon',
  brand: 'PetCare',
  tagline: 'L\'hygiène premium pour votre compagnon',
  email: 'eshophorizon6@gmail.com',
  url: import.meta.env.VITE_SITE_URL || 'https://eshophorizon.netlify.app',
  currency: 'EUR',
  freeShippingThreshold: 49,
  shippingCost: 4.90,
} as const

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PREPARATION: 'preparation',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  PAYMENT_FAILED: 'payment_failed',
  REFUNDED: 'refunded',
} as const

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

export const GENIUSPAY_CONFIG = {
  apiUrl: 'https://pay.genius.ci/api/v1/merchant',
  checkoutUrl: 'https://pay.genius.ci/checkout',
  currency: 'EUR',
} as const

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  baseUrl: 'https://res.cloudinary.com',
} as const
