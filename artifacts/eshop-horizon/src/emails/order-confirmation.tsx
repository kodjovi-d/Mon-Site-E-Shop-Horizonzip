// src/emails/order-confirmation.tsx
import React from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  image?: string;
}

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  total: number;
  orderUrl: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationProps> = ({
  orderNumber,
  customerName,
  items,
  shippingAddress,
  total,
  orderUrl,
}) => {
  const formatPrice = (price: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', maxWidth: '600px', margin: '0 auto', color: '#2D2D2D' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#7D9B76', padding: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#FAFAF7', margin: 0, fontSize: '24px' }}>
          🐾 E-Shop Horizon
        </h1>
        <p style={{ color: '#F5EDD7', margin: '10px 0 0 0' }}>
          L'hygiène premium pour votre compagnon
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '30px', backgroundColor: '#FAFAF7' }}>
        <h2 style={{ color: '#4A7C59', marginBottom: '20px' }}>
          Merci pour votre commande, {customerName} !
        </h2>

        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
          Nous avons bien reçu votre commande. Voici le récapitulatif :
        </p>

        {/* Order Number */}
        <div style={{ 
          backgroundColor: '#F5EDD7', 
          padding: '15px', 
          borderRadius: '8px',
          margin: '20px 0',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Numéro de commande</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#4A7C59' }}>
            #{orderNumber}
          </p>
        </div>

        {/* Items */}
        <h3 style={{ color: '#4A7C59', borderBottom: '2px solid #7D9B76', paddingBottom: '10px' }}>
          Articles commandés
        </h3>
        
        {items.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '15px 0',
            borderBottom: '1px solid #E5E5E5'
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{item.name}</p>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                Qté: {item.quantity}
              </p>
            </div>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#4A7C59' }}>
              {formatPrice(item.unit_price * item.quantity)}
            </p>
          </div>
        ))}

        {/* Total */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          padding: '20px 0',
          borderTop: '2px solid #7D9B76',
          marginTop: '10px'
        }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Total</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#4A7C59' }}>
            {formatPrice(total)}
          </p>
        </div>

        {/* Shipping Address */}
        <h3 style={{ color: '#4A7C59', marginTop: '30px' }}>Adresse de livraison</h3>
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '15px', 
          borderRadius: '8px',
          border: '1px solid #E5E5E5'
        }}>
          <p style={{ margin: 0 }}>{shippingAddress.name}</p>
          <p style={{ margin: '5px 0 0 0' }}>{shippingAddress.address}</p>
          <p style={{ margin: '5px 0 0 0' }}>
            {shippingAddress.postalCode} {shippingAddress.city}
          </p>
          <p style={{ margin: '5px 0 0 0' }}>{shippingAddress.country}</p>
        </div>

        {/* Next Steps */}
        <div style={{ 
          backgroundColor: '#E8F5E9', 
          padding: '20px', 
          borderRadius: '8px',
          marginTop: '30px',
          borderLeft: '4px solid #4A7C59'
        }}>
          <p style={{ margin: 0, fontSize: '16px' }}>
            <strong>Prochaines étapes :</strong>
          </p>
          <p style={{ margin: '10px 0 0 0', lineHeight: '1.6' }}>
            Vous recevrez un email dès que votre commande sera expédiée avec votre numéro de suivi.
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <a 
            href={orderUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#4A7C59',
              color: '#fff',
              padding: '15px 30px',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Suivre ma commande
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        backgroundColor: '#2D2D2D', 
        padding: '20px', 
        textAlign: 'center',
        color: '#F5EDD7'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Des questions ? Contactez-nous à{' '}
          <a href="mailto:eshophorizon6@gmail.com" style={{ color: '#C9A84C' }}>
            eshophorizon6@gmail.com
          </a>
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
          E-Shop Horizon - L'hygiène premium pour votre compagnon
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmationEmail;
