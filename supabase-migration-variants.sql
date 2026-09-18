-- ============================================================
-- Parent-Child Variant System Migration
-- Run this in the Supabase Dashboard SQL Editor
-- ============================================================

-- 1. Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS parent_product_id UUID REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_parent_product BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_attributes JSONB DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_order INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. Add index for fast variant lookups
CREATE INDEX IF NOT EXISTS idx_products_parent_product_id ON products(parent_product_id);
CREATE INDEX IF NOT EXISTS idx_products_is_parent_product ON products(is_parent_product) WHERE is_parent_product = true;

-- 3. Verify columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('parent_product_id', 'is_parent_product', 'variant_attributes', 'variant_order', 'display_name')
ORDER BY column_name;
