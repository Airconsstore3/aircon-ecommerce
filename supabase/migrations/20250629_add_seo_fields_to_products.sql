-- Add SEO fields to products table
ALTER TABLE products 
ADD COLUMN meta_title TEXT,
ADD COLUMN meta_description TEXT;

-- Add index for SEO fields if needed
CREATE INDEX idx_products_meta_title ON products(meta_title) WHERE meta_title IS NOT NULL;
