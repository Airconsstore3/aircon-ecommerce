-- Add display_name field separate from SEO title
-- Allows clean, premium typography on product pages while preserving full SEO title
ALTER TABLE products
ADD COLUMN IF NOT EXISTS display_name TEXT;

COMMENT ON COLUMN products.display_name IS 'Short display name for product page title. Falls back to name if null. Example: "LG Art Cool Inverter 12 000 BTU" while name is "LG Art Cool Inverter 12 000 BTU Heatpump Midwall R410A"';
