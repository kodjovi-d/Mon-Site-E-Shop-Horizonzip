✅ Checklist Finale — E-Shop Horizon
Avant le Déploiement
🔴 Critique (Bloquant)
[ ] .env dans .gitignore (jamais commité)
[ ] .env.example commité (sans valeurs réelles)
[ ] Aucune clé API en dur dans le code source
[ ] SUPABASE_SERVICE_ROLE_KEY uniquement côté serveur (Netlify Functions)
[ ] GENIUSPAY_API_KEY sans préfixe VITE_ (serveur uniquement)
[ ] npm run build passe sans erreur en local
[ ] npm run build sans warning TypeScript critique
[ ] netlify.toml présent à la racine
[ ] robots.txt dans public/
[ ] URL webhook GeniusPay correcte : https://eshop-horizon.netlify.app/.netlify/functions/geniuspay-webhook
🟡 Important
[ ] Schéma Supabase exécuté (8 tables + indexes)
[ ] RLS policies activées
[ ] Seed data insérée (5 produits minimum)
[ ] Table admin_users avec au moins 1 admin
[ ] Variables d'environnement configurées dans Netlify Dashboard
[ ] Compte GeniusPay en mode Production
[ ] Compte CJ Dropshipping avec API activée
[ ] Compte Resend avec domaine vérifié
🟢 Recommandé
[ ] Toutes les pages ont un H1 unique
[ ] Open Graph / Twitter Card sur chaque page
[ ] JSON-LD valide (tester sur Google Rich Results)
[ ] Sitemap accessible à /.netlify/functions/sitemap
[ ] Images Cloudinary avec f_auto,q_auto
[ ] Mobile responsive testé (DevTools)
Tests Post-Déploiement
🛒 Parcours Client
[ ] Page d'accueil charge (< 3s)
[ ] Navigation produits fonctionne
[ ] Fiche produit s'affiche
[ ] Ajout au panier fonctionne
[ ] Panier persiste (localStorage)
[ ] Checkout multi-étapes fonctionne
[ ] Commande créée dans Supabase (status: pending)
[ ] Redirection GeniusPay fonctionne
[ ] Paiement test réussi
[ ] Webhook reçu et traité (status: paid)
[ ] Email de confirmation envoyé (Resend)
[ ] Commande CJ Dropshipping créée
[ ] Page /merci affiche la confirmation
[ ] Suivi de commande (/suivi) fonctionne
🔐 Authentification
[ ] /admin/login accessible
[ ] Connexion avec email + password fonctionne
[ ] Redirection vers /admin/dashboard après connexion
[ ] Routes admin protégées (redirect si non auth)
[ ] Déconnexion fonctionne
[ ] localStorage nettoyé au logout
🎛️ Back-office Admin
[ ] Dashboard affiche les KPIs
[ ] Liste des commandes (tri, filtres, pagination)
[ ] Détail commande avec produits
[ ] Changement de statut fonctionne
[ ] Email automatique envoyé au changement de statut
[ ] CRUD produits complet
[ ] Activation/désactivation produit
[ ] Upload image via URL Cloudinary
[ ] Liste clients avec stats
[ ] Export CSV clients
[ ] Liste newsletter avec export
[ ] Suppression abonné avec confirmation
📧 Emails
[ ] order-confirmation → reçu après commande
[ ] payment-received → reçu après paiement
[ ] order-shipped → reçu après expédition
[ ] order-delivered → reçu après livraison
[ ] welcome-newsletter → reçu après inscription
🔍 SEO & Performance
[ ] robots.txt accessible
[ ] sitemap.xml accessible et valide
[ ] Title unique sur chaque page
[ ] Meta description unique
[ ] H1 unique
[ ] Open Graph tags présents
[ ] Twitter Card tags présents
[ ] JSON-LD Organization sur Home
[ ] JSON-LD Product sur fiche produit
[ ] Lighthouse Performance > 80
[ ] Lighthouse Accessibility > 80
[ ] Lighthouse SEO > 80
🔒 Sécurité
[ ] CSP headers dans netlify.toml
[ ] X-Frame-Options: DENY
[ ] X-Content-Type-Options: nosniff
[ ] HTTPS forcé
[ ] Pas de any dans TypeScript
[ ] Pas de données mockées
[ ] Pas de localhost hardcodé
Sign-off
| Rôle          | Nom | Date | Signature |
| ------------- | --- | ---- | --------- |
| Développeur   |     |      |           |
| QA / Tests    |     |      |           |
| Product Owner |     |      |           |
Projet prêt pour production ? ✅ Toutes les cases cochées = GO !
