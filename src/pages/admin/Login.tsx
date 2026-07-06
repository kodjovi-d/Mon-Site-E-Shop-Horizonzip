import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Lock, CircleAlert as AlertCircle, PawPrint, Mail } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login, isAdmin, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect when isAdmin becomes true — must be in useEffect, never in render body
  useEffect(() => {
    if (!authLoading && isAdmin) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAdmin, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: loginError, isAdmin: userIsAdmin } = await login(email, password)

    setLoading(false)

    if (loginError) {
      const msg = String(loginError).toLowerCase()
      if (msg.includes('invalid') || msg.includes('credentials') || msg === '{}' || msg === 'undefined') {
        setError('Email ou mot de passe incorrect')
      } else {
        setError(String(loginError))
      }
      return
    }

    if (!userIsAdmin) {
      setError('Accès non autorisé — ce compte n\'a pas les droits administrateur')
      return
    }

    // The useEffect above will handle the redirect once isAdmin state updates
  }

  return (
    <>
      <Helmet>
        <title>Administration | E-Shop Horizon</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-anthracite px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <PawPrint className="h-10 w-10 text-cta-green" />
            </div>
            <h1 className="font-display text-2xl font-bold text-cream">
              E-Shop Horizon
            </h1>
            <p className="text-gray-400">Accès administrateur</p>
          </div>

          <div className="bg-anthracite-light rounded-xl border border-gray-700 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="h-5 w-5 text-sage" />
              <h2 className="font-display text-lg font-semibold text-cream">
                Connexion
              </h2>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/30 border border-red-800 p-3 rounded-lg mb-4">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-cream focus:outline-none focus:ring-2 focus:ring-cta-green focus:border-transparent"
                    placeholder="admin@eshophorizon.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-cream focus:outline-none focus:ring-2 focus:ring-cta-green focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cta-green text-white py-3 rounded-lg font-medium hover:bg-cta-green/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <a href="/" className="text-sm text-gray-500 hover:text-cta-green transition-colors">
              ← Retour au site
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
