import { Helmet } from 'react-helmet-async'

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Conditions Générales de Vente | E-Shop Horizon</title>
        <meta name="description" content="Les conditions générales de vente d'E-Shop Horizon." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-3xl font-bold text-anthracite mb-8">
          Conditions générales de vente
        </h1>

        <div className="prose max-w-none space-y-8">
          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Préambule
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Les présentes conditions générales de vente régissent les relations entre
              E-Shop Horizon et ses clients pour les achats réalisés sur le site
              eshophorizon.netlify.app.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Produits et prix
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Les produits proposés sont des articles d'hygiène et de propreté pour
              animaux de compagnie. Les prix sont indiqués en euros TTC. E-Shop Horizon
              se réserve le droit de modifier ses prix à tout moment, mais les produits
              sont facturés au prix en vigueur au moment de la commande.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Commande
            </h2>
            <p className="text-gray-600 leading-relaxed">
              La commande est validée après paiement. Un email de confirmation est envoyé
              à l'adresse indiquée par le client. E-Shop Horizon se réserve le droit de
              refuser toute commande pour des motifs légitimes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Paiement
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Le paiement s'effectue via la plateforme sécurisée GeniusPay. Les données
              bancaires ne transitent jamais par nos serveurs.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Livraison
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Les délais de livraison sont donnés à titre indicatif. E-Shop Horizon ne
              saurait être tenu responsable des retards imputables au transporteur. La
              livraison est gratuite à partir de 49 EUR d'achat.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Droit de rétractation
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Conformément à la législation en vigueur, vous disposez d'un délai de 14
              jours à compter de la réception pour exercer votre droit de rétractation.
              Les frais de retour sont à la charge du client.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-anthracite mb-3">
              Garantie
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Les produits bénéficient de la garantie légale de conformité et de la
              garantie des vices cachés. En cas de produit défectueux, contactez-nous à
              eshophorizon6@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
