import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, Lock, AlertCircle, CheckCircle, Truck } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../lib/utils'
import { trackInitiateCheckout } from '../lib/pixel'

// ============================================
// 🌍 TOUS LES PAYS — Europe + Afrique
// ============================================
const COUNTRIES = [
  // 🇪🇺 EUROPE (35 pays)
  { code: 'FR', name: '🇫🇷 France', region: 'Europe', shipping: 5.90, freeShippingThreshold: 49 },
  { code: 'BE', name: '🇧🇪 Belgique', region: 'Europe', shipping: 6.90, freeShippingThreshold: 49 },
  { code: 'LU', name: '🇱🇺 Luxembourg', region: 'Europe', shipping: 6.90, freeShippingThreshold: 49 },
  { code: 'MC', name: '🇲🇨 Monaco', region: 'Europe', shipping: 5.90, freeShippingThreshold: 49 },
  { code: 'DE', name: '🇩🇪 Allemagne', region: 'Europe', shipping: 7.90, freeShippingThreshold: 49 },
  { code: 'IT', name: '🇮🇹 Italie', region: 'Europe', shipping: 7.90, freeShippingThreshold: 49 },
  { code: 'ES', name: '🇪🇸 Espagne', region: 'Europe', shipping: 7.90, freeShippingThreshold: 49 },
  { code: 'PT', name: '🇵🇹 Portugal', region: 'Europe', shipping: 8.90, freeShippingThreshold: 49 },
  { code: 'NL', name: '🇳🇱 Pays-Bas', region: 'Europe', shipping: 7.90, freeShippingThreshold: 49 },
  { code: 'AT', name: '🇦🇹 Autriche', region: 'Europe', shipping: 7.90, freeShippingThreshold: 49 },
  { code: 'IE', name: '🇮🇪 Irlande', region: 'Europe', shipping: 9.90, freeShippingThreshold: 49 },
  { code: 'DK', name: '🇩🇰 Danemark', region: 'Europe', shipping: 8.90, freeShippingThreshold: 49 },
  { code: 'SE', name: '🇸🇪 Suède', region: 'Europe', shipping: 9.90, freeShippingThreshold: 49 },
  { code: 'FI', name: '🇫🇮 Finlande', region: 'Europe', shipping: 10.90, freeShippingThreshold: 49 },
  { code: 'PL', name: '🇵🇱 Pologne', region: 'Europe', shipping: 9.90, freeShippingThreshold: 49 },
  { code: 'CZ', name: '🇨🇿 République tchèque', region: 'Europe', shipping: 9.90, freeShippingThreshold: 49 },
  { code: 'SK', name: '🇸🇰 Slovaquie', region: 'Europe', shipping: 10.90, freeShippingThreshold: 49 },
  { code: 'HU', name: '🇭🇺 Hongrie', region: 'Europe', shipping: 10.90, freeShippingThreshold: 49 },
  { code: 'SI', name: '🇸🇮 Slovénie', region: 'Europe', shipping: 10.90, freeShippingThreshold: 49 },
  { code: 'HR', name: '🇭🇷 Croatie', region: 'Europe', shipping: 11.90, freeShippingThreshold: 49 },
  { code: 'RO', name: '🇷🇴 Roumanie', region: 'Europe', shipping: 11.90, freeShippingThreshold: 49 },
  { code: 'BG', name: '🇧🇬 Bulgarie', region: 'Europe', shipping: 12.90, freeShippingThreshold: 49 },
  { code: 'EE', name: '🇪🇪 Estonie', region: 'Europe', shipping: 11.90, freeShippingThreshold: 49 },
  { code: 'LV', name: '🇱🇻 Lettonie', region: 'Europe', shipping: 11.90, freeShippingThreshold: 49 },
  { code: 'LT', name: '🇱🇹 Lituanie', region: 'Europe', shipping: 11.90, freeShippingThreshold: 49 },
  { code: 'MT', name: '🇲🇹 Malte', region: 'Europe', shipping: 12.90, freeShippingThreshold: 49 },
  { code: 'CY', name: '🇨🇾 Chypre', region: 'Europe', shipping: 13.90, freeShippingThreshold: 49 },
  { code: 'GR', name: '🇬🇷 Grèce', region: 'Europe', shipping: 12.90, freeShippingThreshold: 49 },
  { code: 'IS', name: '🇮🇸 Islande', region: 'Europe', shipping: 14.90, freeShippingThreshold: 49 },
  { code: 'LI', name: '🇱🇮 Liechtenstein', region: 'Europe', shipping: 10.90, freeShippingThreshold: 49 },
  { code: 'CH', name: '🇨🇭 Suisse', region: 'Europe', shipping: 8.90, freeShippingThreshold: 49 },
  { code: 'AD', name: '🇦🇩 Andorre', region: 'Europe', shipping: 9.90, freeShippingThreshold: 49 },
  { code: 'SM', name: '🇸🇲 Saint-Marin', region: 'Europe', shipping: 9.90, freeShippingThreshold: 49 },
  { code: 'VA', name: '🇻🇦 Vatican', region: 'Europe', shipping: 9.90, freeShippingThreshold: 49 },
  { code: 'NO', name: '🇳🇴 Norvège', region: 'Europe', shipping: 10.90, freeShippingThreshold: 49 },
  { code: 'GB', name: '🇬🇧 Royaume-Uni', region: 'Europe', shipping: 12.90, freeShippingThreshold: 49 },
  
  // 🇹🇬 AFRIQUE — Togo (pour tes tests)
  { code: 'TG', name: '🇹🇬 Togo', region: 'Afrique', shipping: 15.90, freeShippingThreshold: 69 },
  
  // 🇲🇦 AFRIQUE DU NORD
  { code: 'MA', name: '🇲🇦 Maroc', region: 'Afrique', shipping: 14.90, freeShippingThreshold: 69 },
  { code: 'TN', name: '🇹🇳 Tunisie', region: 'Afrique', shipping: 14.90, freeShippingThreshold: 69 },
  { code: 'DZ', name: '🇩🇿 Algérie', region: 'Afrique', shipping: 15.90, freeShippingThreshold: 69 },
  { code: 'EG', name: '🇪🇬 Égypte', region: 'Afrique', shipping: 16.90, freeShippingThreshold: 69 },
  { code: 'LY', name: '🇱🇾 Libye', region: 'Afrique', shipping: 17.90, freeShippingThreshold: 69 },
  
  // 🇨🇮 AFRIQUE DE L'OUEST
  { code: 'CI', name: "🇨🇮 Côte d'Ivoire", region: 'Afrique', shipping: 15.90, freeShippingThreshold: 69 },
  { code: 'SN', name: '🇸🇳 Sénégal', region: 'Afrique', shipping: 15.90, freeShippingThreshold: 69 },
  { code: 'GH', name: '🇬🇭 Ghana', region: 'Afrique', shipping: 15.90, freeShippingThreshold: 69 },
  { code: 'BJ', name: '🇧🇯 Bénin', region: 'Afrique', shipping: 15.90, freeShippingThreshold: 69 },
  { code: 'BF', name: '🇧🇫 Burkina Faso', region: 'Afrique', shipping: 16.90, freeShippingThreshold: 69 },
  { code: 'ML', name: '🇲🇱 Mali', region: 'Afrique', shipping: 16.90, freeShippingThreshold: 69 },
  { code: 'NE', name: '🇳🇪 Niger', region: 'Afrique', shipping: 16.90, freeShippingThreshold: 69 },
  { code: 'NG', name: '🇳🇬 Nigeria', region: 'Afrique', shipping: 17.90, freeShippingThreshold: 69 },
  
  // 🇨🇲 AFRIQUE CENTRALE
  { code: 'CM', name: '🇨🇲 Cameroun', region: 'Afrique', shipping: 16.90, freeShippingThreshold: 69 },
  { code: 'GA', name: '🇬🇦 Gabon', region: 'Afrique', shipping: 16.90, freeShippingThreshold: 69 },
  { code: 'CG', name: '🇨🇬 Congo', region: 'Afrique', shipping: 17.90, freeShippingThreshold: 69 },
  { code: 'CD', name: '🇨🇩 RDC', region: 'Afrique', shipping: 18.90, freeShippingThreshold: 69 },
  
  // 🇰🇪 AFRIQUE DE L'EST
  { code: 'KE', name: '🇰🇪 Kenya', region: 'Afrique', shipping: 17.90, freeShippingThreshold: 69 },
  { code: 'ET', name: '🇪🇹 Éthiopie', region: 'Afrique', shipping: 18.90, freeShippingThreshold: 69 },
  { code: 'TZ', name: '🇹🇿 Tanzanie', region: 'Afrique', shipping: 18.90, freeShippingThreshold: 69 },
  { code: 'UG', name: '🇺🇬 Ouganda', region: 'Afrique', shipping: 18.90, freeShippingThreshold: 69 },
  
  // 🇿🇦 AFRIQUE AUSTRALE
  { code: 'ZA', name: '🇿🇦 Afrique du Sud', region: 'Afrique', shipping: 19.90, freeShippingThreshold: 69 },
  { code: 'ZW', name: '🇿🇼 Zimbabwe', region: 'Afrique', shipping: 19.90, freeShippingThreshold: 69 },
  
] as const

type CountryCode = typeof COUNTRIES[number]['code']

// ============================================
// 💶 DEVISE : TOUJOURS EUROS
// ============================================
const CURRENCY = 'EUR'
const CURRENCY_SYMBOL = '€'

// ============================================
// 🧮 FONCTIONS UTILITAIRES
// ============================================
function getCountry(code: CountryCode) {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0]
}

function calculateShipping(countryCode: CountryCode, cartTotal: number): number {
  const country = getCountry(countryCode)
  if (cartTotal >= country.freeShippingThreshold) {
    return 0
  }
  return country.shipping
}

function getShippingMessage(countryCode: CountryCode, cartTotal: number): string {
  const country = getCountry(countryCode)
  const remaining = country.freeShippingThreshold - cartTotal
  
  if (remaining <= 0) {
    return 'Livraison gratuite ! 🎉'
  }
  return `Plus que ${formatPrice(remaining)} pour la livraison gratuite`
}

// ============================================
// 📦 TYPES
// ============================================
interface AddressData {
  firstName: string
  lastName: string
  address: string
  address2: string
  postalCode: string
  city: string
  country: CountryCode
  phone: string
}

interface CheckoutFormData {
  email: string
  shippingAddress: AddressData
  notes: string
}

// ============================================
// 🏗️ COMPOSANT PRINCIPAL
// ============================================
export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('FR')
  const [shippingCost, setShippingCost] = useState(5.90)

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    shippingAddress: {
      firstName: '',
      lastName: '',
      address: '',
      address2: '',
      postalCode: '',
      city: '',
      country: 'FR',
      phone: '',
    },
    notes: '',
  })

  // Calcul du total dynamique
  const total = subtotal + shippingCost

  // Mise à jour de la livraison quand le pays change
  const handleCountryChange = (code: CountryCode) => {
    setSelectedCountry(code)
    const cost = calculateShipping(code, subtotal)
    setShippingCost(cost)
    setFormData((prev: CheckoutFormData) => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, country: code },
    }))
  }

  // Recalculer si le panier change
  useEffect(() => {
    const cost = calculateShipping(selectedCountry, subtotal)
    setShippingCost(cost)
  }, [selectedCountry, subtotal])

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Helmet>
          <title>Commander | E-Shop Horizon</title>
        </Helmet>
        <h1 className="font-display text-2xl font-bold text-anthracite mb-4">
          Votre panier est vide
        </h1>
        <button onClick={() => navigate('/produits')} className="btn-primary">
          Découvrir nos produits
        </button>
      </div>
    )
  }

  const handleAddressChange = (field: keyof AddressData, value: string) => {
    setFormData((prev: CheckoutFormData) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.email.includes('@')) throw new Error('Email invalide')
      if (!formData.shippingAddress.firstName) throw new Error('Prénom requis')
      if (!formData.shippingAddress.lastName) throw new Error('Nom requis')
      if (!formData.shippingAddress.address) throw new Error('Adresse requise')
      if (!formData.shippingAddress.postalCode) throw new Error('Code postal requis')
      if (!formData.shippingAddress.city) throw new Error('Ville requise')
      if (!formData.shippingAddress.phone) throw new Error('Téléphone requis')

      const orderData = {
        customerEmail: formData.email,
        customerName: `${formData.shippingAddress.firstName} ${formData.shippingAddress.lastName}`,
        customerPhone: formData.shippingAddress.phone,
        shippingAddress: {
          firstName: formData.shippingAddress.firstName,
          lastName: formData.shippingAddress.lastName,
          address: formData.shippingAddress.address,
          address2: formData.shippingAddress.address2 || '',
          postalCode: formData.shippingAddress.postalCode,
          city: formData.shippingAddress.city,
          country: formData.shippingAddress.country,
          phone: formData.shippingAddress.phone,
        },
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingCost: shippingCost,
        total: total,
        currency: CURRENCY,
      }

      const response = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const rawText = await response.text()
      let result: { success?: boolean; message?: string; error?: string; checkout_url?: string }
      try {
        result = rawText ? JSON.parse(rawText) : {}
      } catch {
        throw new Error(`Erreur serveur (${response.status}) — veuillez réessayer`)
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || 'Erreur lors de la création de la commande')
      }

      if (result.checkout_url) {
        trackInitiateCheckout({
          content_ids: items.map((i) => i.productId),
          num_items: items.reduce((s, i) => s + i.quantity, 0),
          value: total,
          currency: 'EUR',
        })
        clearCart()
        window.location.href = result.checkout_url
      } else {
        throw new Error('URL de paiement manquante')
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Progression livraison gratuite
  const country = getCountry(selectedCountry)
  const progress = Math.min((subtotal / country.freeShippingThreshold) * 100, 100)
  const remainingForFree = Math.max(country.freeShippingThreshold - subtotal, 0)

  return (
    <>
      <Helmet>
        <title>Finaliser ma commande | E-Shop Horizon</title>
        <meta name="description" content="Finalisez votre commande en toute sécurité. Livraison en Europe et Afrique." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Lock className="h-5 w-5 text-cta-green" />
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-anthracite">
            Finaliser ma commande
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-display text-lg font-semibold text-anthracite mb-4">
                Informations de contact
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((prev: CheckoutFormData) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Livraison */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-display text-lg font-semibold text-anthracite mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-cta-green" />
                Adresse de livraison
              </h2>

              {/* 🌍 SÉLECTEUR DE PAYS */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays de livraison *
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green bg-white text-base"
                >
                  <optgroup label="🇪🇺 Europe">
                    {COUNTRIES.filter((c) => c.region === 'Europe').map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} — Livraison {country.shipping}€
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🇹🇬 Afrique — Togo (Test)">
                    <option value="TG">🇹🇬 Togo — Livraison 15.90€</option>
                  </optgroup>
                  <optgroup label="🇲🇦 Afrique du Nord">
                    {COUNTRIES.filter((c) => c.region === 'Afrique' && ['MA','TN','DZ','EG','LY'].includes(c.code)).map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} — Livraison {country.shipping}€
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🇨🇮 Afrique de l'Ouest">
                    {COUNTRIES.filter((c) => c.region === 'Afrique' && ['CI','SN','GH','BJ','BF','ML','NE','NG'].includes(c.code)).map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} — Livraison {country.shipping}€
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🇨🇲 Afrique Centrale & Est">
                    {COUNTRIES.filter((c) => c.region === 'Afrique' && ['CM','GA','CG','CD','KE','ET','TZ','UG'].includes(c.code)).map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} — Livraison {country.shipping}€
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🇿🇦 Afrique Australe">
                    {COUNTRIES.filter((c) => c.region === 'Afrique' && ['ZA','ZW'].includes(c.code)).map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} — Livraison {country.shipping}€
                      </option>
                    ))}
                  </optgroup>
                </select>

                {/* Info livraison */}
                <div className="mt-3">
                  {shippingCost === 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">🎉 Livraison gratuite !</span>
                    </div>
                  ) : (
                    <div className="bg-cream border border-warm-beige rounded-lg p-3">
                      <p className="text-sm text-gray-600">
                        Livraison : <span className="font-bold text-cta-green">{formatPrice(shippingCost)}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getShippingMessage(selectedCountry, subtotal)}
                      </p>
                      {/* Barre de progression */}
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-cta-green h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {remainingForFree > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Plus que {formatPrice(remainingForFree)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress.firstName}
                    onChange={(e) => handleAddressChange('firstName', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress.lastName}
                    onChange={(e) => handleAddressChange('lastName', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress.address}
                    onChange={(e) => handleAddressChange('address', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                    placeholder="Rue, numéro..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complément d'adresse</label>
                  <input
                    type="text"
                    value={formData.shippingAddress.address2}
                    onChange={(e) => handleAddressChange('address2', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                    placeholder="Appartement, bâtiment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.shippingAddress.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-display text-lg font-semibold text-anthracite mb-4">
                Notes de commande (optionnel)
              </h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev: CheckoutFormData) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green resize-none"
                placeholder="Instructions de livraison, demandes particulières..."
                maxLength={500}
              />
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-display text-lg font-semibold text-anthracite mb-4">
                Récapitulatif
              </h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                      {item.name}{' '}
                      <span className="text-gray-400">x{item.quantity}</span>
                    </span>
                    <span className="font-medium text-anthracite">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Gratuite</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-anthracite pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-cta-green text-lg">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Tous les prix sont en {CURRENCY} ({CURRENCY_SYMBOL})
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Traitement...
                  </>
                ) : (
                  <>
                    Payer {formatPrice(total)}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400">
                <Lock className="h-3 w-3" />
                Paiement sécurisé via GeniusPay
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
