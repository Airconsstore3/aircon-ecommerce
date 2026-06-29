-- Create promotions table
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'bundle')),
  value INTEGER NOT NULL CHECK (value >= 0),
  applies_to TEXT NOT NULL CHECK (applies_to IN ('all', 'category', 'product')),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  min_order_zar INTEGER CHECK (min_order_zar >= 0),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER CHECK (max_uses > 0),
  current_uses INTEGER DEFAULT 0 CHECK (current_uses >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_promotions_code ON promotions(code) WHERE code IS NOT NULL;
CREATE INDEX idx_promotions_category_id ON promotions(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_promotions_product_id ON promotions(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_promotions_is_active ON promotions(is_active) WHERE is_active = true;
CREATE INDEX idx_promotions_dates ON promotions(starts_at, expires_at) WHERE is_active = true;

-- Enable RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read only - admin writes use service role which bypasses RLS)
CREATE POLICY "Public read active promotions"
ON promotions FOR SELECT
USING (is_active = true AND (starts_at IS NULL OR starts_at <= NOW()) AND (expires_at IS NULL OR expires_at > NOW()));

-- Auto-update trigger for updated_at
CREATE TRIGGER promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
