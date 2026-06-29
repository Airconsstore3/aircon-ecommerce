-- Create deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  original_price_zar INTEGER NOT NULL CHECK (original_price_zar >= 0),
  sale_price_zar INTEGER NOT NULL CHECK (sale_price_zar >= 0),
  ends_at TIMESTAMPTZ NOT NULL,
  deal_type TEXT NOT NULL CHECK (deal_type IN ('residential', 'commercial', 'bundle', 'clearance')),
  stock_remaining INTEGER DEFAULT 0 CHECK (stock_remaining >= 0),
  is_hero BOOLEAN DEFAULT false,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  images JSONB DEFAULT '[]'::jsonb,
  includes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_deals_slug ON deals(slug);
CREATE INDEX idx_deals_product_id ON deals(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_deals_deal_type ON deals(deal_type);
CREATE INDEX idx_deals_ends_at ON deals(ends_at);
CREATE INDEX idx_deals_is_hero ON deals(is_hero) WHERE is_hero = true;

-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read only - admin writes use service role which bypasses RLS)
CREATE POLICY "Public read active deals"
ON deals FOR SELECT
USING (ends_at > NOW());

-- Auto-update trigger for updated_at
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
