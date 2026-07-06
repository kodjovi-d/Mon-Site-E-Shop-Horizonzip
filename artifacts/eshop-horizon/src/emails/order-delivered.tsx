// src/emails/order-delivered.tsx
import React from 'react';

interface OrderDeliveredProps {
  orderNumber: string;
  customerName: string;
  reviewUrl: string;
}

export const OrderDeliveredEmail: React.FC<OrderDeliveredProps> = ({
  orderNumber,
  customerName,
  reviewUrl,
}) => {
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', maxWidth: '600px', margin: '0 auto', color: '#2D2D2D' }}>
      <div style={{ backgroundColor: '#4A7C59', padding: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#FAFAF7', margin: 0 }}>🎉 Commande livrée !</h1>
      </div>
      
      <div style={{ padding: '30px', backgroundColor: '#FAFAF7' }}>
        <h2 style={{ color: '#4A7C59' }}>Bonjour {customerName},</h2>
        
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
          Votre commande <strong>#{orderNumber}</strong> a été livrée. Nous espérons que vous et votre compagnon êtes satisfaits !
        </p>

        <div style={{ 
          backgroundColor: '#E8F5E9', 
          padding: '20px', 
          borderRadius: '8px',
          margin: '20px 0',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '18px' }}>Votre avis compte ! 🌟</p>
          <p style={{ margin: '10px 0', color: '#666' }}>
            Partagez votre expérience en 30 secondes
          </p>
          <a 
            href={reviewUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#C9A84C',
              color: '#fff',
              padding: '12px 25px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              marginTop: '10px'
            }}
          >
            Donner mon avis
          </a>
        </div>

        <div style={{ 
          backgroundColor: '#fff', 
          padding: '15px', 
          borderRadius: '8px',
          border: '1px solid #E5E5E5',
          marginTop: '20px'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            <strong>Besoin d'aide ?</strong> Notre SAV est là pour vous :{' '}
            <a href="mailto:eshophorizon6@gmail.com" style={{ color: '#4A7C59' }}>
              eshophorizon6@gmail.com
            </a>
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: '#2D2D2D', padding: '20px', textAlign: 'center', color: '#F5EDD7' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Merci de votre confiance ! 🐾
        </p>
      </div>
    </div>
  );
};

export default OrderDeliveredEmail;
