-- Migration: Add missing columns detected during audit (2026-07-06)

-- products: missing sku, is_featured, badge, weight_unit, cj_stock_status
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'kg';
ALTER TABLE products ADD COLUMN IF NOT EXISTS cj_stock_status TEXT DEFAULT 'unknown'
  CHECK (cj_stock_status IN ('unknown', 'empty', 'low', 'medium', 'high'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS cj_stock_checked_at TIMESTAMPTZ;

-- orders: missing idempotency_key
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- order_items: missing sku
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS sku TEXT DEFAULT '';

-- Index pour idempotency
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Index pour cj_stock_status
CREATE INDEX IF NOT EXISTS idx_products_cj_stock ON products(cj_stock_status);
