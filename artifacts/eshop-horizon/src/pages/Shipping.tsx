import { Helmet } from 'react-helmet-async'
import { Truck, Clock, MapPin, Package, AlertCircle } from 'lucide-react'
import { SITE_CONFIG } from '../lib/constants'
import { formatPrice } from '../lib/utils'

export default function Shipping() {
  return (
    <>
      <Helmet>
        <title>Expédition et Livraison | E-Shop Horizon</title>
        <meta name="description" content="Informations sur nos délais et frais de livraison." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-3xl font-bold text-anthracite mb-4 text-center">
          Expédition et livraison
        </h1>
        <p className="text-gray-500 text-center mb-10">
          Livraison rapide et sécurisée en France et en Europe.
        </p>

        <div className="space-y-8">
          {/* Free Shipping Banner */}
          <div className="bg-cta-green rounded-xl p-6 text-center text-white">
            <Truck className="h-10 w-10 mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold mb-1">
              Livraison gratuite dès {formatPrice(SITE_CONFIG.freeShippingThreshold)}
            </h2>
            <p className="text-white/80">
              Profitez de la livraison offerte sur toutes vos commandes supérieures à {formatPrice(SITE_CONFIG.freeShippingThreshold)}.
            </p>
          </div>

          {/* Delivery Times */}
          <div className="bg-white rounded-xl border border-warm-beige p-6">
            <h2 className="font-display text-xl font-semibold text-anthracite mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-sage" />
              Délais de livraison
            </h2>
            <div className="space-y-4">
              {[
                { zone: 'France métropolitaine', delay: '3-5 jours ouvrés', cost: formatPrice(SITE_CONFIG.shippingCost) },
                { zone: 'Belgique, Luxembourg', delay: '4-6 jours ouvrés', cost: formatPrice(SITE_CONFIG.shippingCost) },
                { zone: 'Suisse', delay: '5-8 jours ouvrés', cost: formatPrice(SITE_CONFIG.shippingCost + 2) },
                { zone: 'Reste de l\'Europe', delay: '5-10 jours ouvrés', cost: formatPrice(SITE_CONFIG.shippingCost + 3) },
              ].map((item) => (
                <div
                  key={item.zone}
                  className="flex items-center justify-between py-3 border-b border-warm-beige/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-sage" />
                    <span className="text-anthracite">{item.zone}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-anthracite block">{item.delay}</span>
                    <span className="text-xs text-gray-500">{item.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Process */}
          <div className="bg-white rounded-xl border border-warm-beige p-6">
            <h2 className="font-display text-xl font-semibold text-anthracite mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-sage" />
              Processus d'expédition
            </h2>
            <div className="space-y-4">
              {[
                { title: 'Préparation', desc: 'Votre commande est préparée sous 24-48h.' },
                { title: 'Expédition', desc: 'Vous recevez un email avec le numéro de suivi.' },
                { title: 'Livraison', desc: 'Le colis est livré à l\'adresse indiquée.' },
              ].map((step, index) => (
                <div key={step.title} className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-sage/10 text-sage rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-medium text-anthracite">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="flex items-start gap-3 bg-warm-beige/50 rounded-xl p-4">
            <AlertCircle className="h-5 w-5 text-soft-gold flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-anthracite mb-1">Information importante</h3>
              <p className="text-sm text-gray-600">
                Les délais de livraison sont donnés à titre indicatif. En période de forte
                affluence (fêtes, soldes), des retards peuvent survenir. Nous vous
                tiendrons informés par email de l'avancement de votre commande.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
