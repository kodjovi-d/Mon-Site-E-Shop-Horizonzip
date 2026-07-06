import { z } from 'zod'

export const emailSchema = z.string().email('Email invalide')

export const phoneSchema = z.string().regex(
  /^(\+33|0)[1-9](\d{8})$/,
  'Numéro de téléphone français invalide'
)

export const addressSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  address: z.string().min(5, 'Adresse requise'),
  address2: z.string().optional(),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  city: z.string().min(2, 'Ville requise'),
  country: z.string().min(2, 'Pays requis').default('FR'),
  phone: phoneSchema,
})

export const checkoutSchema = z.object({
  email: emailSchema,
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsShipping: z.boolean().default(true),
  notes: z.string().max(500).optional(),
})

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200),
  description: z.string().min(10),
  shortDescription: z.string().max(300),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  categoryId: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string().url()).min(1),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
  cjProductId: z.string().optional(),
  cjVariantId: z.string().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
export type AddressData = z.infer<typeof addressSchema>
