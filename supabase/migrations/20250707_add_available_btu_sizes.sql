-- Add available_btu_sizes column to products table
-- This stores an array of BTU sizes that the product is available in
-- Example: [9000, 12000, 18000, 24000, 36000, 48000, 60000]

ALTER TABLE products
ADD COLUMN available_btu_sizes INTEGER[] DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.available_btu_sizes IS 'Array of BTU sizes this product model is available in (e.g., [9000, 12000, 18000])';
