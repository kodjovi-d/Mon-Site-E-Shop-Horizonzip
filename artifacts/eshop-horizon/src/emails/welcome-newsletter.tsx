// src/emails/welcome-newsletter.tsx
import React from 'react';

interface WelcomeNewsletterProps {
  subscriberEmail: string;
  shopUrl: string;
  promoCode: string;
}

export const WelcomeNewsletterEmail: React.FC<WelcomeNewsletterProps> = ({
  subscriberEmail,
  shopUrl,
  promoCode = 'BIENVENUE10',
}) => {
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', maxWidth: '600px', margin: '0 auto', color: '#2D2D2D' }}>
      <div style={{ backgroundColor: '#7D9B76', padding: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#FAFAF7', margin: 0 }}>🐾 Bienvenue dans la famille !</h1>
      </div>
      
      <div style={{ padding: '30px', backgroundColor: '#FAFAF7' }}>
        <h2 style={{ color: '#4A7C59' }}>Merci de votre inscription !</h2>
        
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
          Vous recevrez nos meilleures offres et conseils pour prendre soin de votre compagnon.
        </p>

        {/* Promo Code */}
        <div style={{ 
          backgroundColor: '#E8F5E9', 
          padding: '25px', 
          borderRadius: '8px',
          margin: '25px 0',
          textAlign: 'center',
          border: '2px dashed #4A7C59'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Votre code promo de bienvenue</p>
          <p style={{ 
            margin: '10px 0', 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#4A7C59',
            letterSpacing: '2px'
          }}>
            {promoCode}
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            -10% sur votre première commande
          </p>
        </div>

        {/* Best Products */}
        <h3 style={{ color: '#4A7C59', marginTop: '30px' }}>Nos best-sellers ⭐</h3>
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '15px', 
          borderRadius: '8px',
          border: '1px solid #E5E5E5'
        }}>
          <ul style={{ lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
            <li>Shampooing Sec Premium Chien</li>
            <li>Brosse Démêlante Pro</li>
            <li>Spray Désodorisant Naturel</li>
            <li>Lingettes Nettoyantes Bio</li>
          </ul>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <a 
            href={shopUrl}
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
            Découvrir nos produits
          </a>
        </div>
      </div>

      <div style={{ backgroundColor: '#2D2D2D', padding: '20px', textAlign: 'center', color: '#F5EDD7' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          E-Shop Horizon 🐾 L'hygiène premium pour votre compagnon
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
          <a href={`${shopUrl}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`} style={{ color: '#999' }}>
            Se désabonner
          </a>
        </p>
      </div>
    </div>
  );
};

export default WelcomeNewsletterEmail;
