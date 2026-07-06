import { Helmet } from 'react-helmet-async'

export default function Cookies() {
  return (
    <>
      <Helmet>
        <title>Politique des Cookies | E-Shop Horizon</title>
        <meta name="description" content="Notre politique d'utilisation des cookies." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-3xl font-bold text-anthracite mb-8">
          Politique des cookies
        </h1>

        <div className="prose max-w-none space-y-8">
          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Qu'est-ce qu'un cookie ?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Un cookie est un petit fichier texte stocké sur votre appareil lors de votre
              visite sur notre site. Il nous permet de reconnaître votre appareil et de
              mémoriser certaines informations pour faciliter votre navigation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Cookies utilisés
            </h2>
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-warm-beige p-4">
                <h3 className="font-medium text-anthracite mb-2">
                  Cookies essentiels
                </h3>
                <p className="text-sm text-gray-600">
                  Ces cookies sont nécessaires au fonctionnement du site (panier,
                  authentification, sécurité). Ils ne peuvent pas être désactivés.
                </p>
              </div>
              <div className="bg-white rounded-lg border border-warm-beige p-4">
                <h3 className="font-medium text-anthracite mb-2">
                  Cookies de préférences
                </h3>
                <p className="text-sm text-gray-600">
                  Ces cookies mémorisent vos choix (langue, devise) pour personnaliser
                  votre expérience.
                </p>
              </div>
              <div className="bg-white rounded-lg border border-warm-beige p-4">
                <h3 className="font-medium text-anthracite mb-2">
                  Cookies analytiques
                </h3>
                <p className="text-sm text-gray-600">
                  Ces cookies nous aident à comprendre comment vous utilisez notre site
                  pour l'améliorer. Ils sont anonymisés.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Gestion des cookies
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Vous pouvez gérer vos préférences de cookies à tout moment dans les
              paramètres de votre navigateur. Notez que la désactivation des cookies
              essentiels peut affecter le fonctionnement du site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Durée de conservation
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Les cookies sont conservés pour une durée maximale de 13 mois. Passé ce
              délai, votre consentement sera à nouveau demandé.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
