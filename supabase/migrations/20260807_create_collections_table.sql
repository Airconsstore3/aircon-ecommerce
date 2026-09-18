-- Create collections table (Medusa-style product collections)
-- Supports hierarchical collections via parent_id for breadcrumb navigation
-- Examples: "All Aircons" > "Residential", "All Aircons" > "Commercial" > "Ceiling Cassette"

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_parent_id ON collections(parent_id);
CREATE INDEX idx_collections_is_published ON collections(is_published) WHERE is_published = true;

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read only)
CREATE POLICY "Public read published collections"
ON collections FOR SELECT
USING (is_published = true);

-- Auto-update trigger for updated_at
CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Create junction table for product-collection many-to-many relationship
CREATE TABLE IF NOT EXISTS product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, collection_id)
);

-- Indexes
CREATE INDEX idx_product_collections_product_id ON product_collections(product_id);
CREATE INDEX idx_product_collections_collection_id ON product_collections(collection_id);

-- Enable RLS
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read only)
CREATE POLICY "Public read product_collections"
ON product_collections FOR SELECT
USING (true);

-- Comments
COMMENT ON TABLE collections IS 'Product collections for grouping and breadcrumb navigation. Supports hierarchy via parent_id.';
COMMENT ON TABLE product_collections IS 'Junction table linking products to collections (many-to-many).';
COMMENT ON COLUMN collections.parent_id IS 'Parent collection for hierarchy. NULL for top-level collections.';
COMMENT ON COLUMN collections.slug IS 'URL-friendly slug. Used in /collections/{slug} routes.';
