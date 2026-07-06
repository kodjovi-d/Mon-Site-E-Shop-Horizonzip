// src/emails/cart-abandoned.tsx
import React from 'react';

interface CartItem {
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

interface CartAbandonedProps {
  customerName: string;
  items: CartItem[];
  cartTotal: number;
  checkoutUrl: string;
  discountCode?: string;
}

export const CartAbandonedEmail: React.FC<CartAbandonedProps> = ({
  customerName,
  items,
  cartTotal,
  checkoutUrl,
  discountCode = 'BIENVENUE10',
}) => {
  const formatPrice = (price: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', maxWidth: '600px', margin: '0 auto', color: '#2D2D2D' }}>
      <div style={{ backgroundColor: '#7D9B76', padding: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#FAFAF7', margin: 0 }}>👋 Vous avez oublié quelque chose ?</h1>
      </div>
      
      <div style={{ padding: '30px', backgroundColor: '#FAFAF7' }}>
        <h2 style={{ color: '#4A7C59' }}>Bonjour {customerName},</h2>
        
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
          Vous avez laissé des articles dans votre panier. Ils vous attendent !
        </p>

        {/* Items */}
        <div style={{ margin: '20px 0' }}>
          {items.map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center',
              padding: '15px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              marginBottom: '10px',
              border: '1px solid #E5E5E5'
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{item.name}</p>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                  {formatPrice(item.price)} x {item.quantity}
                </p>
              </div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#4A7C59' }}>
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ 
          textAlign: 'right',
          padding: '15px 0',
          borderTop: '2px solid #7D9B76'
        }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            Total : {formatPrice(cartTotal)}
          </p>
        </div>

        {/* Urgency */}
        <div style={{ 
          backgroundColor: '#FFF3E0', 
          padding: '15px', 
          borderRadius: '8px',
          margin: '20px 0',
          textAlign: 'center',
          borderLeft: '4px solid #C9A84C'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#C9A84C' }}>
            ⏰ Offre spéciale : -10% avec le code {discountCode}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            Valable 24h seulement
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <a 
            href={checkoutUrl}
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
            Finaliser ma commande
          </a>
        </div>
      </div>

      <div style={{ backgroundColor: '#2D2D2D', padding: '20px', textAlign: 'center', color: '#F5EDD7' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
          E-Shop Horizon - Si vous avez déjà passé commande, ignorez cet email.
        </p>
      </div>
    </div>
  );
};

export default CartAbandonedEmail;
