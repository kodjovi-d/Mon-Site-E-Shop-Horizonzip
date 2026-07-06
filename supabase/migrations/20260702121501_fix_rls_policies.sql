-- Drop old policies and recreate with secure versions
DROP POLICY IF EXISTS "Orders owner insert" ON orders;
DROP POLICY IF EXISTS "Orders insert pending only" ON orders;
DROP POLICY IF EXISTS "Order items insert" ON order_items;
DROP POLICY IF EXISTS "Order items insert pending only" ON order_items;

-- Orders: Only allow INSERT with status = 'pending' and payment_status = 'pending'
CREATE POLICY "Orders insert pending only" ON orders
  FOR INSERT WITH CHECK (status = 'pending' AND payment_status = 'pending');

-- Order items: Only allow INSERT for pending orders
CREATE POLICY "Order items insert pending only" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.status = 'pending'
    )
  );
