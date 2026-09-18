-- Add product variant support
-- This allows products to have multiple BTU sizes as variants under one product family

-- Add product_series field to group products by model/series (e.g., "Samsung AR70 WindFree")
ALTER TABLE products
ADD COLUMN product_series TEXT;

-- Add parent_product_id to link variants to a base product
ALTER TABLE products
ADD COLUMN parent_product_id UUID REFERENCES products(id) ON DELETE CASCADE;

-- Add is_base_product flag to identify base products (families)
ALTER TABLE products
ADD COLUMN is_base_product BOOLEAN DEFAULT false;

-- Add variant_name to distinguish variants (e.g., "9000 BTU", "12000 BTU")
ALTER TABLE products
ADD COLUMN variant_name TEXT;

-- Add index for product_series lookups
CREATE INDEX idx_products_product_series ON products(product_series) WHERE product_series IS NOT NULL;

-- Add index for parent_product_id lookups
CREATE INDEX idx_products_parent_product_id ON products(parent_product_id) WHERE parent_product_id IS NOT NULL;

-- Add index for base products
CREATE INDEX idx_products_is_base_product ON products(is_base_product) WHERE is_base_product = true;

-- Add comments
COMMENT ON COLUMN products.product_series IS 'Product series/model name for grouping variants (e.g., "Samsung AR70 WindFree"). Products with the same series are displayed as one card with size selector.';
COMMENT ON COLUMN products.parent_product_id IS 'Links variant products to their base product family. NULL for base products themselves.';
COMMENT ON COLUMN products.is_base_product IS 'True if this is a base product (family) that has variants. False for individual variants.';
COMMENT ON COLUMN products.variant_name IS 'Human-readable name for the variant (e.g., "9000 BTU", "12000 BTU"). Used in size selectors.';

-- Update RLS policy to allow reading variants
CREATE POLICY "Public read product variants"
ON products FOR SELECT
USING (is_published = true);
