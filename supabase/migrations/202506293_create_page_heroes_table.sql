-- Create page_heroes table for hero/content management
CREATE TABLE page_heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL UNIQUE,
  heading TEXT NOT NULL,
  subheading TEXT,
  image_url TEXT,
  button_label TEXT,
  button_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_page_heroes_page_key ON page_heroes(page_key);
CREATE INDEX idx_page_heroes_is_active ON page_heroes(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE page_heroes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read only - admin writes use service role which bypasses RLS)
CREATE POLICY "Public read active page heroes"
ON page_heroes FOR SELECT
USING (is_active = true);

-- Auto-update trigger for updated_at
CREATE TRIGGER page_heroes_updated_at
  BEFORE UPDATE ON page_heroes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
