-- Activer RLS sur toutes les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_abandoned ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRODUCTS
-- ============================================
CREATE POLICY "Products public read" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Products admin write" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- ORDERS
-- ============================================
CREATE POLICY "Orders owner read" ON orders
  FOR SELECT USING (
    customer_email = auth.jwt()->>'email' OR
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Only allow INSERT with status = 'pending' (prevent status manipulation)
CREATE POLICY "Orders insert pending only" ON orders
  FOR INSERT WITH CHECK (status = 'pending' AND payment_status = 'pending');

CREATE POLICY "Orders admin all" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- ORDER_ITEMS
-- ============================================
CREATE POLICY "Order items owner read" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.customer_email = auth.jwt()->>'email' OR EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
    )
  );

-- Only allow INSERT for pending orders (matched via order_id)
CREATE POLICY "Order items insert pending only" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.status = 'pending'
    )
  );

CREATE POLICY "Order items admin all" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE POLICY "Customers owner" ON customers
  FOR ALL USING (
    email = auth.jwt()->>'email' OR
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- CATEGORIES
-- ============================================
CREATE POLICY "Categories public read" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Categories admin write" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- NEWSLETTER_SUBSCRIBERS
-- ============================================
CREATE POLICY "Newsletter public insert" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Newsletter admin read" ON newsletter_subscribers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Newsletter admin delete" ON newsletter_subscribers
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- CART_ABANDONED
-- ============================================
CREATE POLICY "Cart abandoned admin" ON cart_abandoned
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
