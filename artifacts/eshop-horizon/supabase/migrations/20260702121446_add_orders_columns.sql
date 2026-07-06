-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal_anumeric NUMERIC;
