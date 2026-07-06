import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import {
  Save,
  PawPrint,
  LogOut,
  Store,
  Truck,
  Shield,
  CheckCircle,
} from 'lucide-react'

interface SiteSettings {
  siteName: string
  supportEmail: string
  freeShippingThreshold: number
  currency: string
  legalName: string
  siret: string
  address: string
}

const defaultSettings: SiteSettings = {
  siteName: 'E-Shop Horizon',
  supportEmail: 'eshophorizon6@gmail.com',
  freeShippingThreshold: 49,
  currency: 'EUR',
  legalName: 'E-Shop Horizon',
  siret: '',
  address: '',
}

export default function AdminSettings() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simuler la sauvegarde (tu peux stocker dans Supabase plus tard)
    await new Promise((r) => setTimeout(r, 500))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const inputClass =
    'w-full px-4 py-2.5 border border-warm-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green bg-white'

  return (
    <>
      <Helmet>
        <title>Paramètres | Admin E-Shop Horizon</title>
      </Helmet>

      <div className="min-h-screen bg-cream">
        {/* Header */}
        <header className="bg-white border-b border-warm-beige sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-cta-green" />
              <span className="font-display font-bold text-anthracite">Paramètres</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Save Banner */}
          {saved && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span>Paramètres sauvegardés avec succès !</span>
            </div>
          )}

          <div className="bg-white rounded-xl border border-warm-beige overflow-hidden">
            {/* General */}
            <div className="p-6 border-b border-warm-beige">
              <div className="flex items-center gap-2 mb-6">
                <Store className="h-5 w-5 text-cta-green" />
                <h2 className="font-display text-lg font-bold text-anthracite">
                  Informations générales
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du site
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email support
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings((s) => ({ ...s, supportEmail: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seuil livraison gratuite (€)
                    </label>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, freeShippingThreshold: parseInt(e.target.value) || 0 }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Devise
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div className="p-6 border-b border-warm-beige">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-cta-green" />
                <h2 className="font-display text-lg font-bold text-anthracite">
                  Informations légales
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raison sociale
                  </label>
                  <input
                    type="text"
                    value={settings.legalName}
                    onChange={(e) => setSettings((s) => ({ ...s, legalName: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={settings.siret}
                    onChange={(e) => setSettings((s) => ({ ...s, siret: e.target.value }))}
                    className={inputClass}
                    placeholder="123 456 789 00010"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <textarea
                    rows={3}
                    value={settings.address}
                    onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="h-5 w-5 text-cta-green" />
                <h2 className="font-display text-lg font-bold text-anthracite">
                  Livraison
                </h2>
              </div>

              <div className="bg-cream/50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  La configuration de la livraison se fait via les variables d'environnement
                  et l'API CJ Dropshipping.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Seuil actuel : <strong className="text-cta-green">{settings.freeShippingThreshold}€</strong>
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="p-6 border-t border-warm-beige bg-cream/30">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-cta-green text-white rounded-lg font-medium hover:bg-[#3d6b4a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
