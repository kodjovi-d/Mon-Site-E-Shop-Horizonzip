import { SEO } from '../seo/SEO'

export default function Privacy() {
  return (
    <>
      <SEO
        title="Politique de Confidentialité | E-Shop Horizon"
        description="Notre politique de confidentialité et de protection des données."
        canonical="/confidentialite"
        noIndex
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-3xl font-bold text-anthracite mb-8">
          Politique de confidentialité
        </h1>

        <div className="prose max-w-none space-y-8">
          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Collecte des données
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Nous collectons uniquement les données nécessaires au traitement de vos
              commandes : nom, adresse, email, téléphone. Ces données sont stockées de
              manière sécurisée sur nos serveurs hébergés en Europe.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Utilisation des données
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Vos données sont utilisées uniquement pour :
            </p>
            <ul className="list-disc list-inside text-gray-600 leading-relaxed mt-2 space-y-1">
              <li>Le traitement et la livraison de vos commandes</li>
              <li>La communication relative à vos achats</li>
              <li>L'envoi de la newsletter (si vous y avez consenti)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Protection des données
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles pour
              protéger vos données contre tout accès non autorisé, perte ou altération.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Vos droits
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification,
              de suppression et de portabilité de vos données. Pour exercer ces droits,
              contactez-nous à : eshophorizon6@gmail.com
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Cookies
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Notre site utilise des cookies essentiels au fonctionnement du site et à
              la sécurité de vos transactions. Vous pouvez gérer vos préférences dans
              les paramètres de votre navigateur.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
