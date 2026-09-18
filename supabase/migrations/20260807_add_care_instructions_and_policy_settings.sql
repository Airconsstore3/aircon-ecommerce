-- Add care_instructions to products table
-- Stores product care/maintenance instructions as text or JSONB (array of bullet points)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS care_instructions JSONB DEFAULT NULL;

COMMENT ON COLUMN products.care_instructions IS 'Product care instructions. Can be an array of strings (bullet points) or a single text string. Displayed in the Care tab on the product page.';

-- Add shipping and return policy fields to settings table
-- These are global CMS/site settings used across all product pages
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS shipping_summary TEXT,
ADD COLUMN IF NOT EXISTS shipping_policy_url TEXT,
ADD COLUMN IF NOT EXISTS return_policy_summary TEXT,
ADD COLUMN IF NOT EXISTS return_policy_url TEXT;

COMMENT ON COLUMN public.settings.shipping_summary IS 'Short shipping info shown in the Shipping tab on product pages. Example: Free delivery is available in selected areas. Professional installation can be scheduled during checkout. Delivery time: 2-5 business days.';
COMMENT ON COLUMN public.settings.shipping_policy_url IS 'URL to the full shipping policy page. Example: /shipping-policy';
COMMENT ON COLUMN public.settings.return_policy_summary IS 'Short return policy shown in the Return Policy tab on product pages.';
COMMENT ON COLUMN public.settings.return_policy_url IS 'URL to the full return policy page. Example: /returns-policy';
