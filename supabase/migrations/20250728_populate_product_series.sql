-- Populate product_series for existing products
-- This extracts the model/series name from product names to enable variant grouping

-- First, ensure the column exists (in case migration wasn't applied)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'product_series'
    ) THEN
        ALTER TABLE products ADD COLUMN product_series TEXT;
    END IF;
END $$;

-- Clear existing product_series values for aircon products to re-calculate
UPDATE products
SET product_series = NULL
WHERE type = 'aircon' AND is_published = true;

-- For aircon products, extract the series name by removing model codes and suffixes
UPDATE products
SET product_series = 
  CASE 
    -- Remove model codes (e.g., FTXF25E, FFA50A9, FAA100B) and suffixes
    WHEN type = 'aircon' THEN
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(name, '\s*[A-Z]{2,4}\d+[A-Z]?\d?\s*$', '', 'i'),
                    '\s*\d+[,\s]*000\s*BTU', '', 'i'
                  ),
                  '\s*\d+[,\s]*000', '', 'i'
                ),
                '\s*Wall Split', '', 'i'
              ),
              '\s*Split Wall Unit', '', 'i'
            ),
            '\s*Inverter', '', 'i'
          ),
          '\s*Cooling Only', '', 'i'
        ),
        '\s*\([^)]*\)\s*$', '', 'i'
      )
    -- For other product types, use the name as-is
    ELSE name
  END
WHERE type = 'aircon' AND is_published = true;

-- Clean up any remaining special characters and extra spaces
UPDATE products
SET product_series = trim(regexp_replace(product_series, '\s+', ' '))
WHERE product_series IS NOT NULL
  AND product_series != name;

-- Add comment
COMMENT ON COLUMN products.product_series IS 'Product series/model name for grouping variants (e.g., "Samsung AR70 WindFree"). Products with the same series are displayed as one card with size selector.';
