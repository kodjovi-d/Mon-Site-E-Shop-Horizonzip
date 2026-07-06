// src/emails/payment-received.tsx
import React from 'react';

interface PaymentReceivedProps {
  orderNumber: string;
  customerName: string;
  total: number;
  paymentMethod: string;
}

export const PaymentReceivedEmail: React.FC<PaymentReceivedProps> = ({
  orderNumber,
  customerName,
  total,
  paymentMethod,
}) => {
  const formatPrice = (price: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', maxWidth: '600px', margin: '0 auto', color: '#2D2D2D' }}>
      <div style={{ backgroundColor: '#4A7C59', padding: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#FAFAF7', margin: 0 }}>✅ Paiement confirmé</h1>
      </div>
      
      <div style={{ padding: '30px', backgroundColor: '#FAFAF7' }}>
        <h2 style={{ color: '#4A7C59' }}>Bonjour {customerName},</h2>
        
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
          Votre paiement de <strong>{formatPrice(total)}</strong> pour la commande{' '}
          <strong>#{orderNumber}</strong> a été accepté.
        </p>

        <div style={{ 
          backgroundColor: '#E8F5E9', 
          padding: '20px', 
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <p style={{ margin: 0 }}><strong>Méthode :</strong> {paymentMethod}</p>
          <p style={{ margin: '10px 0 0 0' }}><strong>Statut :</strong> Payée ✅</p>
        </div>

        <h3 style={{ color: '#4A7C59', marginTop: '30px' }}>Prochaines étapes :</h3>
        <ol style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Préparation de votre colis (1-2 jours ouvrés)</li>
          <li>Expédition avec numéro de suivi</li>
          <li>Livraison estimée : 3-5 jours ouvrés</li>
        </ol>

        <p style={{ marginTop: '30px', color: '#666' }}>
          Vous recevrez un email dès l'expédition de votre commande.
        </p>
      </div>

      <div style={{ backgroundColor: '#2D2D2D', padding: '20px', textAlign: 'center', color: '#F5EDD7' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          <a href="mailto:eshophorizon6@gmail.com" style={{ color: '#C9A84C' }}>
            eshophorizon6@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentReceivedEmail;
