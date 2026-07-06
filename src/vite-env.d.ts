/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GENIUSPAY_API_KEY: string
  readonly VITE_GENIUSPAY_API_URL: string
  readonly VITE_RESEND_FROM_EMAIL: string
  readonly VITE_RESEND_FROM_NAME: string
  readonly VITE_CJ_DROPSHIPPING_API_URL: string
  readonly VITE_CJ_DROPSHIPPING_EMAIL: string
  readonly VITE_NETLIFY_SITE_URL: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_SITE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
