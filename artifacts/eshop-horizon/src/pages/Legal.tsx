import { SEO } from '../seo/SEO'

export default function Legal() {
  return (
    <>
      <SEO
        title="Mentions Légales | E-Shop Horizon"
        description="Mentions légales du site E-Shop Horizon."
        canonical="/mentions-legales"
        noIndex
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-3xl font-bold text-anthracite mb-8">
          Mentions légales
        </h1>

        <div className="prose max-w-none space-y-8">
          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Éditeur du site
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Le site E-Shop Horizon est édité par E-Shop Horizon, boutique en ligne
              spécialisée dans l'hygiène et la propreté pour animaux de compagnie.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              <strong>Email :</strong> eshophorizon6@gmail.com
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Hébergement
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Le site est hébergé par Netlify, Inc.
              <br />
              2325 3rd Street, Suite 296
              <br />
              San Francisco, CA 94107, USA
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Propriété intellectuelle
            </h2>
            <p className="text-gray-600 leading-relaxed">
              L'ensemble du contenu de ce site (textes, images, logos) est la propriété
              exclusive d'E-Shop Horizon. Toute reproduction, représentation ou
              utilisation, totale ou partielle, sans autorisation préalable est interdite.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Contact
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question relative au site, vous pouvez nous contacter à l'adresse
              suivante : eshophorizon6@gmail.com
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
