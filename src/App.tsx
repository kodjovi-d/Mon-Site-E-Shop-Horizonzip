import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { CartProvider } from './hooks/useCart'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import Layout from './components/layout/Layout'

// Chargement différé (Lazy loading)
const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const ThankYou = lazy(() => import('./pages/ThankYou'))
const OrderTracking = lazy(() => import('./pages/OrderTracking'))
const Contact = lazy(() => import('./pages/Contact'))
const About = lazy(() => import('./pages/About'))
const Commitments = lazy(() => import('./pages/Commitments'))
const Legal = lazy(() => import('./pages/Legal'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Returns = lazy(() => import('./pages/Returns'))
const Shipping = lazy(() => import('./pages/Shipping'))
const Cookies = lazy(() => import('./pages/Cookies'))

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminProducts = lazy(() => import('./pages/admin/Products'))
const AdminCustomers = lazy(() => import('./pages/admin/Customers'))
const AdminNewsletter = lazy(() => import('./pages/admin/Newsletter'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const AdminReviews = lazy(() => import('./pages/admin/Reviews'))
const AdminAICenter = lazy(() => import('./pages/admin/AICenter'))
const AdminAIValidation = lazy(() => import('./pages/admin/AIValidation'))

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-cream">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cta-green" />
  </div>
)

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Routes avec Layout */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/produits" element={<Products />} />
                  <Route path="/produit/:slug" element={<ProductDetail />} />
                  <Route path="/panier" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/merci" element={<ThankYou />} />
                  <Route path="/suivi" element={<OrderTracking />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/a-propos" element={<About />} />
                  <Route path="/engagements" element={<Commitments />} />
                  <Route path="/mentions-legales" element={<Legal />} />
                  <Route path="/confidentialite" element={<Privacy />} />
                  <Route path="/cgv" element={<Terms />} />
                  <Route path="/retours" element={<Returns />} />
                  <Route path="/expedition" element={<Shipping />} />
                  <Route path="/cookies" element={<Cookies />} />
                </Route>

                {/* Routes Admin */}
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/commandes" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/produits" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                <Route path="/admin/clients" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
                <Route path="/admin/newsletter" element={<ProtectedRoute><AdminNewsletter /></ProtectedRoute>} />
                <Route path="/admin/parametres" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
                <Route path="/admin/avis" element={<ProtectedRoute><AdminReviews /></ProtectedRoute>} />
                <Route path="/admin/ia" element={<ProtectedRoute><AdminAICenter /></ProtectedRoute>} />
                <Route path="/admin/ia/validation" element={<ProtectedRoute><AdminAIValidation /></ProtectedRoute>} />

                {/* Page 404 */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center bg-cream">
                    <div className="text-center">
                      <h1 className="text-6xl font-display text-anthracite mb-4">404</h1>
                      <p className="text-sage mb-6">Page non trouvée</p>
                      <a href="/" className="inline-flex items-center px-6 py-3 bg-cta-green text-white rounded-lg font-medium hover:bg-cta-green/90 transition-colors">
                        Retour à l'accueil
                      </a>
                    </div>
                  </div>
                } />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App
