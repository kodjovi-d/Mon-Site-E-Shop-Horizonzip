Guide de Déploiement — E-Shop Horizon 🚀
Étape 1 : Préparer Supabase
1.1 Créer un projet
Aller sur supabase.com
Créer un nouveau projet
Nom : e-shop-horizon
Région : Europe (Frankfurt) ou la plus proche
1.2 Exécuter le schéma SQL
Aller dans SQL Editor
Copier-coller le contenu de supabase/schema.sql
Exécuter
1.3 Exécuter les policies
Copier-coller supabase/policies.sql
Exécuter
1.4 Exécuter les données initiales
Copier-coller supabase/seed.sql
Exécuter
1.5 Créer l'utilisateur admin
Aller dans Authentication → Users
Cliquer Add User ou Invite
Email : admin@eshophorizon.com (ou ton email)
Mot de passe : sécurisé
Copier l'UUID de l'utilisateur
1.6 Ajouter l'admin dans la table
SQL Editor :
INSERT INTO admin_users (id, role)
VALUES ('UUID-DE-L-UTILISATEUR', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
GUIDE_DEPLOIEMENT.md
Guide de Déploiement — E-Shop Horizon 🚀
Étape 1 : Préparer Supabase
1.1 Créer un projet
Aller sur supabase.com
Créer un nouveau projet
Nom : e-shop-horizon
Région : Europe (Frankfurt) ou la plus proche
1.2 Exécuter le schéma SQL
Aller dans SQL Editor
Copier-coller le contenu de supabase/schema.sql
Exécuter
1.3 Exécuter les policies
Copier-coller supabase/policies.sql
Exécuter
1.4 Exécuter les données initiales
Copier-coller supabase/seed.sql
Exécuter
1.5 Créer l'utilisateur admin
Aller dans Authentication → Users
Cliquer Add User ou Invite
Email : admin@eshophorizon.com (ou ton email)
Mot de passe : sécurisé
Copier l'UUID de l'utilisateur
1.6 Ajouter l'admin dans la table
SQL Editor :
sql
INSERT INTO admin_users (id, role)
VALUES ('UUID-DE-L-UTILISATEUR', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
1.7 Récupérer les clés
Project Settings → API
Copier :
URL → VITE_SUPABASE_URL et SUPABASE_URL
anon public → VITE_SUPABASE_ANON_KEY
service_role secret → SUPABASE_SERVICE_ROLE_KEY
Étape 2 : Préparer Netlify
2.1 Créer un site
Aller sur netlify.com
Add new site → Import from GitHub
Sélectionner le repo Mon-Site-E-Shop-Horizonzip
Branch : main
2.2 Configurer le build
Build command : npm run build
Publish directory : dist
Functions directory : netlify/functions (déjà dans netlify.toml)
2.3 Ajouter les variables d'environnement
Site Settings → Environment Variables
Ajouter TOUTES les variables du .env.example
Contexte : All (Production + Deploy Preview)
2.4 Récupérer l'URL
L'URL sera : https://eshop-horizon.netlify.app
Si différente, mettre à jour NETLIFY_SITE_URL
Étape 3 : Configurer GeniusPay
3.1 Créer un compte
geniuspay.ci
Compléter le KYC
Passer en mode Production
3.2 Récupérer les clés API
Dashboard → Intégration → Clés API
pk_live_... → GENIUSPAY_API_KEY
sk_live_... → GENIUSPAY_API_SECRET
3.3 Configurer le webhook
Dashboard → Webhooks → Ajouter
URL : https://eshop-horizon.netlify.app/.netlify/functions/geniuspay-webhook
Événements : payment.success, payment.failed, payment.cancelled
Copier le Webhook Secret → GENIUSPAY_WEBHOOK_SECRET
3.4 Vérifier l'URL API
Point d'entrée : https://geniuspay.ci/api/v1/merchant
→ GENIUSPAY_API_URL
Étape 4 : Configurer CJ Dropshipping
4.1 Créer un compte
cjdropshipping.com
Activer l'API dans les paramètres
4.2 Récupérer les clés
API → API Key
CJ5... → CJ_DROPSHIPPING_API_KEY
Email du compte → CJ_DROPSHIPPING_EMAIL
4.3 Vérifier l'URL API
https://openapi.cjdropshipping.com → CJ_DROPSHIPPING_API_URL
Étape 5 : Configurer Resend
5.1 Créer un compte
resend.com
Vérifier le domaine (ou utiliser onboarding@resend.dev)
5.2 Récupérer la clé API
API Keys → Create API Key
Permission : Sending access
re_... → RESEND_API_KEY
5.3 Configurer l'email
Email vérifié : eshophorizon6@gmail.com → RESEND_FROM_EMAIL
Nom : E-Shop Horizon → RESEND_FROM_NAME
Étape 6 : Déployer
6.1 Push sur GitHub
git add .
git commit -m "Ready for production"
git push origin main
GUIDE_DEPLOIEMENT.md
Guide de Déploiement — E-Shop Horizon 🚀
Étape 1 : Préparer Supabase
1.1 Créer un projet
Aller sur supabase.com
Créer un nouveau projet
Nom : e-shop-horizon
Région : Europe (Frankfurt) ou la plus proche
1.2 Exécuter le schéma SQL
Aller dans SQL Editor
Copier-coller le contenu de supabase/schema.sql
Exécuter
1.3 Exécuter les policies
Copier-coller supabase/policies.sql
Exécuter
1.4 Exécuter les données initiales
Copier-coller supabase/seed.sql
Exécuter
1.5 Créer l'utilisateur admin
Aller dans Authentication → Users
Cliquer Add User ou Invite
Email : admin@eshophorizon.com (ou ton email)
Mot de passe : sécurisé
Copier l'UUID de l'utilisateur
1.6 Ajouter l'admin dans la table
SQL Editor :
sql
INSERT INTO admin_users (id, role)
VALUES ('UUID-DE-L-UTILISATEUR', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
1.7 Récupérer les clés
Project Settings → API
Copier :
URL → VITE_SUPABASE_URL et SUPABASE_URL
anon public → VITE_SUPABASE_ANON_KEY
service_role secret → SUPABASE_SERVICE_ROLE_KEY
Étape 2 : Préparer Netlify
2.1 Créer un site
Aller sur netlify.com
Add new site → Import from GitHub
Sélectionner le repo Mon-Site-E-Shop-Horizonzip
Branch : main
2.2 Configurer le build
Build command : npm run build
Publish directory : dist
Functions directory : netlify/functions (déjà dans netlify.toml)
2.3 Ajouter les variables d'environnement
Site Settings → Environment Variables
Ajouter TOUTES les variables du .env.example
Contexte : All (Production + Deploy Preview)
2.4 Récupérer l'URL
L'URL sera : https://eshop-horizon.netlify.app
Si différente, mettre à jour NETLIFY_SITE_URL
Étape 3 : Configurer GeniusPay
3.1 Créer un compte
geniuspay.ci
Compléter le KYC
Passer en mode Production
3.2 Récupérer les clés API
Dashboard → Intégration → Clés API
pk_live_... → GENIUSPAY_API_KEY
sk_live_... → GENIUSPAY_API_SECRET
3.3 Configurer le webhook
Dashboard → Webhooks → Ajouter
URL : https://eshop-horizon.netlify.app/.netlify/functions/geniuspay-webhook
Événements : payment.success, payment.failed, payment.cancelled
Copier le Webhook Secret → GENIUSPAY_WEBHOOK_SECRET
3.4 Vérifier l'URL API
Point d'entrée : https://geniuspay.ci/api/v1/merchant
→ GENIUSPAY_API_URL
Étape 4 : Configurer CJ Dropshipping
4.1 Créer un compte
cjdropshipping.com
Activer l'API dans les paramètres
4.2 Récupérer les clés
API → API Key
CJ5... → CJ_DROPSHIPPING_API_KEY
Email du compte → CJ_DROPSHIPPING_EMAIL
4.3 Vérifier l'URL API
https://openapi.cjdropshipping.com → CJ_DROPSHIPPING_API_URL
Étape 5 : Configurer Resend
5.1 Créer un compte
resend.com
Vérifier le domaine (ou utiliser onboarding@resend.dev)
5.2 Récupérer la clé API
API Keys → Create API Key
Permission : Sending access
re_... → RESEND_API_KEY
5.3 Configurer l'email
Email vérifié : eshophorizon6@gmail.com → RESEND_FROM_EMAIL
Nom : E-Shop Horizon → RESEND_FROM_NAME
Étape 6 : Déployer
6.1 Push sur GitHub
bash
git add .
git commit -m "Ready for production"
git push origin main
6.2 Vérifier le déploiement
Netlify déploie automatiquement
Vérifier le build log (pas d'erreur TypeScript)
6.3 Tester le site
Ouvrir l'URL Netlify
Vérifier :
[ ] Page d'accueil charge
[ ] Produits s'affichent
[ ] Panier fonctionne
[ ] Checkout crée une commande
[ ] Paiement GeniusPay se lance
[ ] Webhook reçoit la confirmation
Étape 7 : Tester une commande complète
7.1 Commande test (petit montant)
Ajouter un produit au panier
Passer commande avec un vrai email
Payer via GeniusPay (mode production)
Vérifier :
[ ] Email de confirmation reçu
[ ] Commande CJ créée
[ ] Statut mis à jour dans l'admin
7.2 Vérifier les emails
Vérifier la réception des emails Resend
Vérifier le dashboard Resend (logs)
Étape 8 : Post-déploiement
8.1 SEO
Soumettre le sitemap à Google Search Console
URL : https://eshop-horizon.netlify.app/.netlify/functions/sitemap
Vérifier robots.txt accessible
8.2 SSL/HTTPS
Netlify fournit SSL automatiquement
Vérifier HTTPS forcé dans les settings
8.3 Performance
Tester sur PageSpeed Insights
Objectif : Lighthouse > 80
8.4 Monitoring
Activer les logs Netlify Functions
Surveiller les erreurs dans Supabase Logs
🔧 Dépannage
| Problème              | Solution                                    |
| --------------------- | ------------------------------------------- |
| Build échoue          | Vérifier `npm run build` en local           |
| Erreur TypeScript     | `npx tsc --noEmit`                          |
| Variables manquantes  | Vérifier Netlify Environment Variables      |
| Webhook non reçu      | Vérifier URL webhook dans GeniusPay         |
| Email non envoyé      | Vérifier Resend API key + domaine vérifié   |
| Commande CJ non créée | Vérifier `cj_product_id` et `cj_variant_id` |
| Accès admin refusé    | Vérifier `admin_users` table + UUID         |
📞 Support
Email : eshophorizon6@gmail.com
GitHub Issues : repo
