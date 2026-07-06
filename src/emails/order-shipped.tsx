// src/emails/order-shipped.tsx
import React from 'react';

interface OrderShippedProps {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: string;
}

export const OrderShippedEmail: React.FC<OrderShippedProps> = ({
  orderNumber,
  customerName,
  trackingNumber,
  trackingUrl,
  estimatedDelivery,
}) => {
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', maxWidth: '600px', margin: '0 auto', color: '#2D2D2D' }}>
      <div style={{ backgroundColor: '#C9A84C', padding: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#FAFAF7', margin: 0 }}>📦 Commande expédiée !</h1>
      </div>
      
      <div style={{ padding: '30px', backgroundColor: '#FAFAF7' }}>
        <h2 style={{ color: '#4A7C59' }}>Bonjour {customerName},</h2>
        
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
          Excellente nouvelle ! Votre commande <strong>#{orderNumber}</strong> vient d'être expédiée.
        </p>

        <div style={{ 
          backgroundColor: '#FFF8E1', 
          padding: '20px', 
          borderRadius: '8px',
          margin: '20px 0',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Numéro de suivi</p>
          <p style={{ margin: '10px 0', fontSize: '22px', fontWeight: 'bold', color: '#C9A84C' }}>
            {trackingNumber}
          </p>
          <a 
            href={trackingUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#4A7C59',
              color: '#fff',
              padding: '12px 25px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold'
            }}
          >
            Suivre mon colis
          </a>
        </div>

        <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
          Livraison estimée : <strong>{estimatedDelivery}</strong>
        </p>
      </div>

      <div style={{ backgroundColor: '#2D2D2D', padding: '20px', textAlign: 'center', color: '#F5EDD7' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Des questions ?{' '}
          <a href="mailto:eshophorizon6@gmail.com" style={{ color: '#C9A84C' }}>
            eshophorizon6@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default OrderShippedEmail;
