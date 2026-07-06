-- ============================================
-- SEED PRODUITS — E-Shop Horizon PetCare
-- ============================================

-- Catégories
INSERT INTO categories (id, name, slug, description, image, sort_order, is_active) VALUES
  (gen_random_uuid(), 'Soins Griffes', 'soins-griffes', 'Limes, coupe-ongles et accessoires pour l''entretien des griffes de vos animaux', 'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781184367/cac59a15-63e3-40af-aa60-d23258d33165_trans_dfwofy.jpg', 1, true),
  (gen_random_uuid(), 'Brosses & Peignes', 'brosses-peignes', 'Brosses, peignes et rouleaux anti-poils pour chiens et chats', 'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781187091/08e48c84-5e01-4f9a-9d25-3934c7139f86_s4njws.jpg', 2, true),
  (gen_random_uuid(), 'Gants de Toilettage', 'gants-toilettage', 'Gants démêlants et anti-poils pour un toilettage facile', 'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781186422/6a6f1df7-8175-4c2e-89ce-0ab409a25a25.jpg_rlbq6d.webp', 3, true),
  (gen_random_uuid(), 'Lingettes & Hygiène', 'lingettes-hygiene', 'Lingettes hypoallergéniques pour le soin quotidien', 'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781191543/49d696f6-e746-4348-bedb-cb916d471f19_qvlobp.jpg', 4, true),
  (gen_random_uuid(), 'Accessoires Toilettage', 'accessoires-toilettage', 'Accessoires pratiques pour le toilettage de vos compagnons', 'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781188016/1118339712066_wzhc7v.jpg', 5, true);

-- ============================================
-- PRODUIT 1 : Lime à ongles électrique avec LED et écran LCD
-- ============================================
INSERT INTO products (
  id, name, slug, description, short_description, price, compare_price, stock,
  category_id, tags, images, main_image, weight, dimensions,
  cj_product_id, cj_variant_id, seo_title, seo_description, is_active
) VALUES (
  gen_random_uuid(),
  'Lime à ongles électrique avec LED et écran LCD',
  'lime-ongles-electrique-led-lcd',
  'Lime à ongles électrique professionnelle avec éclairage LED intégré et écran LCD pour un soin précis des griffes de votre animal. Moteur silencieux, 2 vitesses, rechargeable USB. Idéal pour chiens et chats de toutes tailles. L''écran LCD affiche la vitesse en temps réel pour un contrôle optimal. Lumière LED puissante pour voir clairement même dans les zones sombres.',
  'Lime électrique professionnelle LED + LCD pour griffes. 2 vitesses, rechargeable USB.',
  29.90,
  49.90,
  150,
  (SELECT id FROM categories WHERE slug = 'soins-griffes'),
  ARRAY['lime', 'ongles', 'electrique', 'led', 'lcd', 'griffes', 'chien', 'chat', 'toilettage'],
  ARRAY[
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781184367/cac59a15-63e3-40af-aa60-d23258d33165_trans_dfwofy.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781184362/ea730e25-576a-491d-89f8-70d67a01fa62_trans_qjvfoa.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781184361/8594efe4-64c5-4fd2-af12-bfffd0d9f492_trans_snub6e.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781184360/25ee89b0-79c5-495b-a970-c95ac46108eb_trans_nr3hga.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781184360/1894eaad-10f9-4b75-8954-5b0399d19802_trans_sqapq7.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781184359/0d0d9350-c2a2-4f06-9942-c23486a771f3_trans_vrvi1s.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781184359/e4136deb-4fa4-4930-8b7a-342c89012753_trans_flf37c.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781184356/6b9079cf-f461-4b72-8374-ca2e466ca7ad_trans_cyvzfy.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781184356/d7e550ae-8d61-40ab-b782-2e04c0cd6103_trans_jaqyqs.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781184355/54711009-0568-4f5c-9652-139b28898bb5_gincy5.jpg'
  ],
  'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781184367/cac59a15-63e3-40af-aa60-d23258d33165_trans_dfwofy.jpg',
  0.25,
  '{"length":18,"width":4,"height":3}',
  '2602270359421607600',
  NULL,
  'Lime à ongles électrique LED LCD | PetCare',
  'Lime électrique professionnelle avec éclairage LED et écran LCD pour le soin des griffes de chiens et chats. Rechargeable USB, 2 vitesses.',
  true
);

-- ============================================
-- PRODUIT 2 : Rouleaux Anti-Poils Réutilisables
-- ============================================
INSERT INTO products (
  id, name, slug, description, short_description, price, compare_price, stock,
  category_id, tags, images, main_image, weight, dimensions,
  cj_product_id, cj_variant_id, seo_title, seo_description, is_active
) VALUES (
  gen_random_uuid(),
  'Rouleaux Anti-Poils Réutilisables (Lot de 2)',
  'rouleaux-anti-poils-reutilisables-lot-2',
  'Lot de 2 rouleaux anti-poils réutilisables et lavables pour éliminer efficacement les poils de chiens et chats sur tous les textiles. Fonctionne sans recharge adhésive — rincez simplement à l''eau pour réutiliser. Parfait pour canapés, vêtements, rideaux, sièges auto et tapis. Design ergonomique avec poignée confortable. Économique et écologique.',
  '2 rouleaux anti-poils lavables et réutilisables. Élimine les poils sans recharge adhésive.',
  19.90,
  34.90,
  200,
  (SELECT id FROM categories WHERE slug = 'brosses-peignes'),
  ARRAY['rouleau', 'anti-poils', 'reutilisable', 'lavable', 'chat', 'chien', 'textile', 'canape', 'vetements'],
  ARRAY[
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781187091/08e48c84-5e01-4f9a-9d25-3934c7139f86_s4njws.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781187091/b4683fc3-34db-49f6-aa54-2ce2c1de8a8e_dyutpj.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781187090/1f7cf8d1-90d1-4f8d-9625-8f051d3f82ff_p3s7ij.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781187089/0fb9cc65-7cbf-4f1c-a2e6-702e7881d013_fec53s.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781187089/83c0a3cd-72b8-42dd-989b-0cac8df2ab73_wfwpwn.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781187089/5eae15c4-a893-4b8e-8215-21eeaa1c8de6_voypgp.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781187088/dad2f160-fa64-4206-8346-a927d6ede88e_sri2xk.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781187088/61d872f8-b078-43e5-baec-0bd074f899f6_tmc9dq.jpg'
  ],
  'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781187091/08e48c84-5e01-4f9a-9d25-3934c7139f86_s4njws.jpg',
  0.35,
  '{"length":20,"width":6,"height":6}',
  '1883057149578993665',
  NULL,
  'Rouleaux Anti-Poils Réutilisables Lot 2 | PetCare',
  'Lot de 2 rouleaux anti-poils lavables pour chiens et chats. Élimine les poils sur textiles sans recharge adhésive. Écologique et économique.',
  true
);

-- ============================================
-- PRODUIT 3 : Gants Démêlants Anti-Poils
-- ============================================
INSERT INTO products (
  id, name, slug, description, short_description, price, compare_price, stock,
  category_id, tags, images, main_image, weight, dimensions,
  cj_product_id, cj_variant_id, seo_title, seo_description, is_active
) VALUES (
  gen_random_uuid(),
  'Gants Démêlants Anti-Poils (Paire)',
  'gants-demelants-anti-poils-paire',
  'Paire de gants de toilettage avec picots en silicone souple pour démêler, masser et éliminer les poils morts en un seul geste. Utilisables à sec ou sous la douche. Les picots en caoutchouc de qualité alimentaire capturent les poils sans irriter la peau sensible de votre animal. Gants universels taille unique avec ajustement élastique. Parfait pour le bain et le brossage quotidien.',
  'Paire de gants démêlants avec picots silicone. Capture les poils morts, massage relaxant.',
  14.90,
  24.90,
  180,
  (SELECT id FROM categories WHERE slug = 'gants-toilettage'),
  ARRAY['gants', 'demelants', 'anti-poils', 'silicone', 'toilettage', 'bain', 'chien', 'chat', 'massage'],
  ARRAY[
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781186422/6a6f1df7-8175-4c2e-89ce-0ab409a25a25.jpg_rlbq6d.webp',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781186420/36e416d8-7a2a-45cf-80c5-05c08c642469.jpg_s8ac2q.webp',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781186419/db830b34-86f1-4c5f-9b6d-55560e6b78f2.jpg_wikxuv.webp',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781186418/03cd7374-6790-424c-90cb-db1b24c7e85b.jpg_muxfkm.webp',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781186418/28d28e36-4036-4bb0-98cc-57eddb082d61.jpg_hgxdd7.webp',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781186418/dfa9d66b-a922-4421-b5a6-66123c47b85f.jpg_ckfedr.webp'
  ],
  'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781186422/6a6f1df7-8175-4c2e-89ce-0ab409a25a25.jpg_rlbq6d.webp',
  0.15,
  '{"length":25,"width":18,"height":2}',
  '2508220213331629100',
  NULL,
  'Gants Démêlants Anti-Poils Silicone | PetCare',
  'Paire de gants de toilettage avec picots silicone pour démêler et éliminer les poils morts. Utilisable à sec ou sous la douche. Massage relaxant.',
  true
);

-- ============================================
-- PRODUIT 4 : Lingettes hypoallergéniques
-- ============================================
INSERT INTO products (
  id, name, slug, description, short_description, price, compare_price, stock,
  category_id, tags, images, main_image, weight, dimensions,
  cj_product_id, cj_variant_id, seo_title, seo_description, is_active
) VALUES (
  gen_random_uuid(),
  'Lingettes Hypoallergéniques Nettoyantes (Lot de 100)',
  'lingettes-hypoallergeniques-nettoyantes-lot-100',
  'Lot de 100 lingettes hypoallergéniques spécialement formulées pour le nettoyage quotidien des yeux, oreilles, pattes et pelage de votre animal. Formule douce sans alcool, sans parfum agressif et pH équilibré. Enrichies en aloe vera et camomille pour apaiser la peau sensible. Emballage refermable pour préserver l''humidité. Idéal pour chiots, chatons et animaux à peau sensible.',
  '100 lingettes hypoallergéniques pour le nettoyage quotidien. Aloe vera & camomille, sans alcool.',
  12.90,
  19.90,
  300,
  (SELECT id FROM categories WHERE slug = 'lingettes-hygiene'),
  ARRAY['lingettes', 'hypoallergeniques', 'nettoyantes', 'yeux', 'oreilles', 'pattes', 'chien', 'chat', 'sensible'],
  ARRAY[
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781191543/49d696f6-e746-4348-bedb-cb916d471f19_qvlobp.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781191543/8c24b5c0-adb1-40e7-8bc8-4dd878bda2de_svxeid.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781191543/812d39cc-156b-4517-85c9-0e528dcaa50d_qwrjih.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781191543/d8370b2f-af0d-44d8-a128-e8a85c9d0848_fine_yxwjj0.jpg'
  ],
  'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781191543/49d696f6-e746-4348-bedb-cb916d471f19_qvlobp.jpg',
  0.4,
  '{"length":15,"width":12,"height":8}',
  '2602270359421607600',
  NULL,
  'Lingettes Hypoallergéniques Nettoyantes Lot 100 | PetCare',
  '100 lingettes hypoallergéniques pour chiens et chats. Nettoyage yeux, oreilles, pattes. Formule douce aloe vera & camomille, sans alcool.',
  true
);

-- ============================================
-- PRODUIT 5 : Peigne Démêlant Auto-Nettoyant
-- ============================================
INSERT INTO products (
  id, name, slug, description, short_description, price, compare_price, stock,
  category_id, tags, images, main_image, weight, dimensions,
  cj_product_id, cj_variant_id, seo_title, seo_description, is_active
) VALUES (
  gen_random_uuid(),
  'Peigne Démêlant Auto-Nettoyant pour Chat',
  'peigne-demelant-auto-nettoyant-chat',
  'Peigne démêlant professionnel avec bouton d''éjection automatique des poils pour un nettoyage en un clic. Dents en acier inoxydable avec embouts arrondis pour ne pas blesser la peau sensible des chats. Poignée ergonomique antidérapante. Élimine les nœuds, les poils morts et réduit les boules de poils de 95%. Convient à tous types de poils : courts, longs, épais ou fins.',
  'Peigne démêlant auto-nettoyant avec éjection des poils en un clic. Dents inox arrondies, anti-boules de poils.',
  22.90,
  39.90,
  120,
  (SELECT id FROM categories WHERE slug = 'accessoires-toilettage'),
  ARRAY['peigne', 'demelant', 'chat', 'auto-nettoyant', 'poils', 'toilettage', 'inox', 'boules-poils', 'noeuds'],
  ARRAY[
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781188016/1118339712066_wzhc7v.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781188016/526445483700_ojgzjd.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781188016/1623552270971_vi2myj.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781188016/6037056180945_qkgoh4.png',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781188017/2130915936694_oivoxp.png',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781188017/193156821848_bkuj6r.png',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781188017/551edc8a-956f-4416-84b3-d7ec87b7d1f7_gc2eai.jpg',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781188017/412241290793_xbpwke.png',
    'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781188017/34cb7925-9937-47b3-b9aa-b79427ccff13_nqj4w9.jpg'
  ],
  'https://res.cloudinary.com/ddqxycipj/image/upload/f_auto,q_auto/v1781188016/1118339712066_wzhc7v.jpg',
  0.18,
  '{"length":17,"width":7,"height":4}',
  '5F657E1E-8CCC-4580-942F-BE285CCD40C5',
  NULL,
  'Peigne Démêlant Auto-Nettoyant Chat | PetCare',
  'Peigne démêlant professionnel avec éjection automatique des poils. Dents inox arrondies, réduit les boules de poils de 95%. Tous types de poils.',
  true
);
