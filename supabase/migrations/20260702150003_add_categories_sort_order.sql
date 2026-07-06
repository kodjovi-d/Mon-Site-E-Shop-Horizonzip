-- Add sort_order column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Initialize sort_order based on category name (alphabetical)
UPDATE categories SET sort_order = subq.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) - 1 as row_num
  FROM categories
) AS subq
WHERE categories.id = subq.id;