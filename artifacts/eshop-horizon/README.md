# E-Shop Horizon 🐾

Boutique e-commerce de produits d'hygiène premium pour animaux de compagnie.
Stack moderne : React 18 + TypeScript + Vite + Tailwind CSS + Supabase + Netlify.

## 🚀 Stack Technique

| Technologie | Usage |
|-------------|-------|
| React 18 | UI Framework |
| TypeScript 5 | Typage strict |
| Vite 5 | Build tool |
| Tailwind CSS 3 | Styling |
| Supabase | Base de données PostgreSQL + Auth |
| Netlify | Hébergement + Serverless Functions |
| GeniusPay | Paiement mobile (CI) |
| CJ Dropshipping | Dropshipping |
| Resend | Emails transactionnels |
| Cloudinary | Images optimisées |

## 📁 Structure du Projet
e-shop-horizon/
├── .env.example              # Variables d'environnement (template)
├── .gitignore
├── netlify.toml              # Config Netlify (redirects, headers, CSP)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── public/
│   └── robots.txt
├── supabase/
│   ├── schema.sql            # Structure BDD
│   ├── seed.sql              # Données initiales
│   └── policies.sql          # RLS policies
├── netlify/functions/        # Serverless functions
│   ├── create-order.ts
│   ├── initiate-payment.ts
│   ├── geniuspay-webhook.ts
│   ├── cj-create-order.ts
│   ├── cj-tracking.ts
│   ├── resend-email.ts
│   ├── update-order-status.ts
│   ├── admin-auth.ts
│   ├── admin-login.ts
│   ├── newsletter-subscribe.ts
│   ├── contact.ts
│   ├── sitemap.ts
│   └── verify-payment.ts
├── src/
│   ├── types/
│   │   └── database.ts       # Types TypeScript générés
│   ├── lib/
│   │   ├── supabase.ts       # Client Supabase (browser + server)
│   │   └── utils.ts          # Helpers (formatPrice, etc.)
│   ├── context/
│   │   ├── AuthContext.tsx   # Auth admin (Supabase Auth)
│   │   └── CartContext.tsx   # State panier global
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useProducts.ts
│   │   ├── useProduct.ts
│   │   └── useCategories.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   └── ProductDetails.tsx
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── OrderBump.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ErrorBoundary.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── ThankYou.tsx
│   │   ├── OrderTracking.tsx
│   │   ├── Contact.tsx
│   │   ├── About.tsx
│   │   ├── Commitments.tsx
│   │   ├── Legal.tsx
│   │   ├── Privacy.tsx
│   │   ├── Terms.tsx
│   │   ├── Returns.tsx
│   │   ├── Shipping.tsx
│   │   ├── Cookies.tsx
│   │   └── admin/
│   │       ├── Login.tsx
│   │       ├── Dashboard.tsx
│   │       ├── Orders.tsx
│   │       ├── Products.tsx
│   │       ├── Customers.tsx
│   │       ├── Newsletter.tsx
│   │       └── Settings.tsx
│   ├── emails/               # Templates email (React components)
│   │   ├── order-confirmation.tsx
│   │   ├── payment-received.tsx
│   │   ├── order-shipped.tsx
│   │   ├── order-delivered.tsx
│   │   ├── cart-abandoned.tsx
│   │   └── welcome-newsletter.tsx
│   ├── seo/
│   │   ├── SEO.tsx
│   │   ├── schemas.ts
│   │   └── sitemap.ts
│   ├── App.tsx
│   └── main.tsx
# 1. Cloner le repo
git clone https://github.com/kodjovi-d/Mon-Site-E-Shop-Horizonzip.git
cd Mon-Site-E-Shop-Horizonzip

# 2. Installer les dépendances
npm install

# 3. Copier les variables d'environnement
cp .env.example .env

# 4. Remplir .env avec tes credentials (voir ci-dessous)

# 5. Lancer en dev
npm run dev

# 6. Build de production
npm run build
🔐 Variables d'Environnement
Crée# === CLIENT (préfixe VITE_) ===
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# === SERVEUR (sans préfixe) ===
SUPABASE_URL=https://ton-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# GeniusPay
GENIUSPAY_API_KEY=pk_live_...
GENIUSPAY_API_SECRET=sk_live_...
GENIUSPAY_API_URL=https://geniuspay.ci/api/v1/merchant
GENIUSPAY_WEBHOOK_SECRET=whsec_...

# CJ Dropshipping
CJ_DROPSHIPPING_API_KEY=CJ5...
CJ_DROPSHIPPING_API_URL=https://openapi.cjdropshipping.com
CJ_DROPSHIPPING_EMAIL=ton-email@cj.com

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=eshophorizon6@gmail.com
RESEND_FROM_NAME=E-Shop Horizon

# Admin
ADMIN_SECRET_KEY=une-longue-chaine-aleatoire-32-caracteres

# Netlify
NETLIFY_SITE_URL=https://eshop-horizon.netlify.app un fichier .env (jamais commité) :
📦 Dépendances Clés
{
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "react-router-dom": "6.23.1",
  "react-helmet-async": "2.0.5",
  "@supabase/supabase-js": "2.43.4",
  "resend": "3.2.0",
  "tailwindcss": "3.4.4",
  "typescript": "5.4.5",
  "vite": "5.2.13",
  "zod": "3.23.8",
  "date-fns": "3.6.0",
  "lucide-react": "0.394.0"
}
🎨 Design System
| Token                | Valeur    | Usage            |
| -------------------- | --------- | ---------------- |
| `--color-sage`       | `#7D9B76` | Primaire, header |
| `--color-cream`      | `#FAFAF7` | Fond             |
| `--color-warm-beige` | `#F5EDD7` | Accents          |
| `--color-anthracite` | `#2D2D2D` | Texte            |
| `--color-cta-green`  | `#4A7C59` | CTA, boutons     |
| `--color-soft-gold`  | `#C9A84C` | Promo, badges    |
Typographie : Playfair Display (titres) + Inter (corps)
🧪 Tests & Build
# Vérifier le build
npm run build

# Vérifier TypeScript (si configuré)
npx tsc --noEmit

# Lint (si configuré)
npm run lint
# Vérifier le build
npm run build

# Vérifier TypeScript (si configuré)
npx tsc --noEmit

# Lint (si configuré)
npm run lint



