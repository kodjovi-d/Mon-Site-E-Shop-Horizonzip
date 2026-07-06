export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          price: number
          compare_price: number | null
          stock: number
          category_id: string | null
          tags: string[]
          images: string[]
          main_image: string | null
          weight: number | null
          dimensions: Json | null
          cj_product_id: string | null
          cj_variant_id: string | null
          seo_title: string | null
          seo_description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      orders: {
        Row: {
          id: string
          status: 'pending' | 'paid' | 'preparation' | 'shipped' | 'delivered' | 'cancelled' | 'payment_failed' | 'refunded'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: string | null
          payment_reference: string | null
          geniuspay_transaction_id: string | null
          geniuspay_checkout_url: string | null
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          shipping_address: Json
          billing_address: Json | null
          subtotal: number
          shipping_cost: number
          total: number
          currency: string
          tracking_number: string | null
          cj_order_id: string | null
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
          cj_variant_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      customers: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          addresses: Json[]
          newsletter_subscribed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['newsletter_subscribers']['Row'], 'id' | 'subscribed_at'>
        Update: Partial<Database['public']['Tables']['newsletter_subscribers']['Insert']>
      }
      cart_abandoned: {
        Row: {
          id: string
          email: string | null
          cart_items: Json
          total: number | null
          reminder_sent: boolean
          reminder_sent_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cart_abandoned']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cart_abandoned']['Insert']>
      }
      admin_users: {
        Row: {
          id: string
          role: 'admin' | 'super_admin'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
      }
    }
    Enums: {
      order_status: 'pending' | 'paid' | 'preparation' | 'shipped' | 'delivered' | 'cancelled' | 'payment_failed' | 'refunded'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Product = Tables<'products'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Customer = Tables<'customers'>
export type Category = Tables<'categories'>
export type NewsletterSubscriber = Tables<'newsletter_subscribers'>
export type CartAbandoned = Tables<'cart_abandoned'>
export type AdminUser = Tables<'admin_users'>
