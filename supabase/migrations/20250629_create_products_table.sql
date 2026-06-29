-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('aircon', 'kit', 'accessory')),
  brand TEXT,
  btu_range INTEGER,
  images JSONB DEFAULT '[]'::jsonb,
  price_zar INTEGER NOT NULL CHECK (price_zar >= 0),
  sale_price_zar INTEGER CHECK (sale_price_zar >= 0),
  is_published BOOLEAN DEFAULT true,
  is_enquiry_only BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_sale BOOLEAN DEFAULT false,
  is_deal BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  specs JSONB DEFAULT '{}'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  stock_count INTEGER DEFAULT 0 CHECK (stock_count >= 0),
  is_sold_out BOOLEAN DEFAULT false,
  low_stock_threshold INTEGER DEFAULT 3 CHECK (low_stock_threshold >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_brand ON products(brand) WHERE brand IS NOT NULL;
CREATE INDEX idx_products_btu_range ON products(btu_range) WHERE btu_range IS NOT NULL;
CREATE INDEX idx_products_is_published ON products(is_published) WHERE is_published = true;
CREATE INDEX idx_products_is_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_is_deal ON products(is_deal) WHERE is_deal = true;
CREATE INDEX idx_products_stock_count ON products(stock_count) WHERE stock_count <= low_stock_threshold;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read only - admin writes use service role which bypasses RLS)
CREATE POLICY "Public read published products"
ON products FOR SELECT
USING (is_published = true);

-- Auto-update trigger for updated_at
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
