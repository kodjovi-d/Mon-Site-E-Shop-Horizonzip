import { Helmet } from 'react-helmet-async'
import { RotateCcw, Clock, Mail, Package, CheckCircle } from 'lucide-react'
import { SITE_CONFIG } from '../lib/constants'

export default function Returns() {
  return (
    <>
      <Helmet>
        <title>Retours et Remboursements | E-Shop Horizon</title>
        <meta name="description" content="Notre politique de retours et remboursements." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-3xl font-bold text-anthracite mb-4 text-center">
          Retours et remboursements
        </h1>
        <p className="text-gray-500 text-center mb-10">
          Votre satisfaction est notre priorité. Retournez vos produits facilement.
        </p>

        <div className="space-y-8">
          {/* Steps */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Clock, title: '14 jours', desc: 'Délai de retour' },
              { icon: Package, title: 'Produit intact', desc: 'Dans son emballage d\'origine' },
              { icon: CheckCircle, title: 'Remboursement', desc: 'Sous 14 jours après réception' },
            ].map((step) => (
              <div
                key={step.title}
                className="bg-white rounded-xl border border-warm-beige p-6 text-center"
              >
                <step.icon className="h-8 w-8 text-cta-green mx-auto mb-3" />
                <h3 className="font-display font-semibold text-anthracite mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Process */}
          <div className="bg-white rounded-xl border border-warm-beige p-6">
            <h2 className="font-display text-xl font-semibold text-anthracite mb-4">
              Comment retourner un produit ?
            </h2>
            <ol className="space-y-4">
              {[
                'Contactez-nous par email à ' + SITE_CONFIG.email + ' en indiquant votre numéro de commande.',
                'Emballez le produit dans son emballage d\'origine, non utilisé et en parfait état.',
                'Envoyez le colis à l\'adresse qui vous sera communiquée par notre service client.',
                'Le remboursement sera effectué sous 14 jours après réception et vérification du produit.',
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-cta-green text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-gray-600 pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Conditions */}
          <div className="bg-warm-beige/50 rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold text-anthracite mb-4 flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Conditions de retour
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-cta-green mt-1">✓</span>
                Le produit doit être non utilisé et dans son emballage d'origine.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cta-green mt-1">✓</span>
                La demande de retour doit être faite dans les 14 jours suivant la réception.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cta-green mt-1">✓</span>
                Les frais de retour sont à la charge du client sauf en cas de produit défectueux.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cta-green mt-1">✓</span>
                Les produits personnalisés ou hygiéniques ne sont pas éligibles au retour pour des raisons de santé.
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Une question sur les retours ?
            </p>
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="inline-flex items-center gap-2 text-cta-green font-medium hover:underline"
            >
              <Mail className="h-4 w-4" />
              {SITE_CONFIG.email}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
