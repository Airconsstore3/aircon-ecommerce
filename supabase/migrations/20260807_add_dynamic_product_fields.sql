-- Add dynamic product fields for full customization
-- This migration adds fields to support dynamic pricing, installation options, 
-- maintenance plans, warranty options, and product features

-- Add JSONB columns for dynamic customization options
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS installation_pricing JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS installation_kits JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS maintenance_plans JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS warranty_options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS protection_plan_price INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS room_coverage TEXT,
ADD COLUMN IF NOT EXISTS product_features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS installation_terms TEXT,
ADD COLUMN IF NOT EXISTS shipping_info TEXT,
ADD COLUMN IF NOT EXISTS returns_info TEXT,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Add indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating) WHERE rating > 0;
CREATE INDEX IF NOT EXISTS idx_products_review_count ON products(review_count) WHERE review_count > 0;

-- Add comment to document the new fields
COMMENT ON COLUMN products.installation_pricing IS 'Dynamic pricing rules for installation based on BTU ranges. Example: {"9000": 1950, "12000": 2350, "18000": 2750}';
COMMENT ON COLUMN products.installation_kits IS 'Array of installation kit options with pricing. Example: [{"id": "pipe-6-10", "name": "Installation kit 6m & 10m", "price": 950, "features": [...]}]';
COMMENT ON COLUMN products.maintenance_plans IS 'Array of maintenance plan options. Example: [{"id": "3months", "name": "Every 3 months", "price": 1500, "features": [...]}]';
COMMENT ON COLUMN products.warranty_options IS 'Array of warranty/extended protection options. Example: [{"id": "extended", "name": "Extended Warranty", "price": 1690, "duration": "2 years"}]';
COMMENT ON COLUMN products.protection_plan_price IS 'Price for the default protection plan';
COMMENT ON COLUMN products.room_coverage IS 'Text description of room coverage. Example: "Covers rooms up to 30 m²"';
COMMENT ON COLUMN products.product_features IS 'Array of product features with optional icons. Example: [{"name": "Inverter", "icon": "icon-inverter.svg"}, {"name": "WiFi", "icon": "icon-wifi.svg"}]';
COMMENT ON COLUMN products.installation_terms IS 'Full terms and conditions for installation';
COMMENT ON COLUMN products.shipping_info IS 'Shipping information and policies';
COMMENT ON COLUMN products.returns_info IS 'Returns and warranty information';
COMMENT ON COLUMN products.rating IS 'Product rating out of 5';
COMMENT ON COLUMN products.review_count IS 'Total number of reviews';
