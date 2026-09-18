-- Installation Kit Configuration System
-- Replaces the hardcoded INSTALLATION_KITS constant with database-driven options
-- Supports: kits, pipe materials, pipe sizes, pipe lengths, brackets, insulation, protective cages
-- With compatibility rules between kits and options

-- ─── Base installation kits ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS installation_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price INTEGER NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Pipe materials (Copper, Aluminium) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipe_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_offset INTEGER NOT NULL DEFAULT 0 CHECK (price_offset >= 0),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Pipe sizes (linked to material) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipe_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES pipe_materials(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  price_offset INTEGER NOT NULL DEFAULT 0 CHECK (price_offset >= 0),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Pipe lengths (linked to kit) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipe_lengths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID NOT NULL REFERENCES installation_kits(id) ON DELETE CASCADE,
  length_m INTEGER NOT NULL CHECK (length_m > 0),
  price_offset INTEGER NOT NULL DEFAULT 0 CHECK (price_offset >= 0),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Bracket options ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bracket_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Insulation options ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insulation_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_offset INTEGER NOT NULL DEFAULT 0 CHECK (price_offset >= 0),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Protective cage options ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS protective_cage_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_custom BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Compatibility tables ────────────────────────────────────────────────────

-- Which pipe materials are compatible with which kits
CREATE TABLE IF NOT EXISTS installation_kit_material_compat (
  kit_id UUID NOT NULL REFERENCES installation_kits(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES pipe_materials(id) ON DELETE CASCADE,
  PRIMARY KEY (kit_id, material_id)
);

-- Which brackets are compatible with which kits
CREATE TABLE IF NOT EXISTS installation_kit_bracket_compat (
  kit_id UUID NOT NULL REFERENCES installation_kits(id) ON DELETE CASCADE,
  bracket_id UUID NOT NULL REFERENCES bracket_options(id) ON DELETE CASCADE,
  PRIMARY KEY (kit_id, bracket_id)
);

-- Which insulation options are compatible with which kits
CREATE TABLE IF NOT EXISTS installation_kit_insulation_compat (
  kit_id UUID NOT NULL REFERENCES installation_kits(id) ON DELETE CASCADE,
  insulation_id UUID NOT NULL REFERENCES insulation_options(id) ON DELETE CASCADE,
  PRIMARY KEY (kit_id, insulation_id)
);

-- Which cages are compatible with which kits
CREATE TABLE IF NOT EXISTS installation_kit_cage_compat (
  kit_id UUID NOT NULL REFERENCES installation_kits(id) ON DELETE CASCADE,
  cage_id UUID NOT NULL REFERENCES protective_cage_options(id) ON DELETE CASCADE,
  PRIMARY KEY (kit_id, cage_id)
);

-- ─── Enable RLS (public read, admin write via service role) ──────────────────
ALTER TABLE installation_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipe_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipe_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipe_lengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE bracket_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE insulation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE protective_cage_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_kit_material_compat ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_kit_bracket_compat ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_kit_insulation_compat ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_kit_cage_compat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read installation_kits" ON installation_kits FOR SELECT USING (true);
CREATE POLICY "Public read pipe_materials" ON pipe_materials FOR SELECT USING (true);
CREATE POLICY "Public read pipe_sizes" ON pipe_sizes FOR SELECT USING (true);
CREATE POLICY "Public read pipe_lengths" ON pipe_lengths FOR SELECT USING (true);
CREATE POLICY "Public read bracket_options" ON bracket_options FOR SELECT USING (true);
CREATE POLICY "Public read insulation_options" ON insulation_options FOR SELECT USING (true);
CREATE POLICY "Public read protective_cage_options" ON protective_cage_options FOR SELECT USING (true);
CREATE POLICY "Public read kit_material_compat" ON installation_kit_material_compat FOR SELECT USING (true);
CREATE POLICY "Public read kit_bracket_compat" ON installation_kit_bracket_compat FOR SELECT USING (true);
CREATE POLICY "Public read kit_insulation_compat" ON installation_kit_insulation_compat FOR SELECT USING (true);
CREATE POLICY "Public read kit_cage_compat" ON installation_kit_cage_compat FOR SELECT USING (true);

-- ─── Seed data ───────────────────────────────────────────────────────────────

-- Installation kits
INSERT INTO installation_kits (name, description, base_price, sort_order) VALUES
  ('Installation kit 6m & 10m', 'Extended kit with 6m and 10m piping options plus mounting accessories.', 950, 0),
  ('Installation kit 10m & 25m', 'Full long-reach kit with 10m and 25m piping options plus mounting accessories.', 1850, 1);

-- Pipe materials
INSERT INTO pipe_materials (name, price_offset, sort_order) VALUES
  ('Copper', 0, 0),
  ('Aluminium', 0, 1);

-- Pipe sizes for Copper
INSERT INTO pipe_sizes (material_id, label, price_offset, sort_order) VALUES
  ((SELECT id FROM pipe_materials WHERE name = 'Copper'), '1/4" + 3/8"', 0, 0),
  ((SELECT id FROM pipe_materials WHERE name = 'Copper'), '1/4" + 1/2"', 50, 1),
  ((SELECT id FROM pipe_materials WHERE name = 'Copper'), '1/4" + 5/8"', 100, 2),
  ((SELECT id FROM pipe_materials WHERE name = 'Copper'), '3/8" + 5/8"', 150, 3);

-- Pipe sizes for Aluminium
INSERT INTO pipe_sizes (material_id, label, price_offset, sort_order) VALUES
  ((SELECT id FROM pipe_materials WHERE name = 'Aluminium'), '1/4" + 3/8"', 0, 0),
  ((SELECT id FROM pipe_materials WHERE name = 'Aluminium'), '1/4" + 1/2"', 50, 1),
  ((SELECT id FROM pipe_materials WHERE name = 'Aluminium'), '1/4" + 5/8"', 100, 2);

-- Pipe lengths for kit 6m & 10m
INSERT INTO pipe_lengths (kit_id, length_m, price_offset, sort_order) VALUES
  ((SELECT id FROM installation_kits WHERE name = 'Installation kit 6m & 10m'), 6, 0, 0),
  ((SELECT id FROM installation_kits WHERE name = 'Installation kit 6m & 10m'), 10, 200, 1);

-- Pipe lengths for kit 10m & 25m
INSERT INTO pipe_lengths (kit_id, length_m, price_offset, sort_order) VALUES
  ((SELECT id FROM installation_kits WHERE name = 'Installation kit 10m & 25m'), 10, 0, 0),
  ((SELECT id FROM installation_kits WHERE name = 'Installation kit 10m & 25m'), 15, 300, 1),
  ((SELECT id FROM installation_kits WHERE name = 'Installation kit 10m & 25m'), 20, 600, 2),
  ((SELECT id FROM installation_kits WHERE name = 'Installation kit 10m & 25m'), 25, 900, 3);

-- Bracket options
INSERT INTO bracket_options (name, price, sort_order) VALUES
  ('Galvanised Steel', 450, 0),
  ('Aluminium', 650, 1);

-- Insulation options
INSERT INTO insulation_options (name, price_offset, sort_order) VALUES
  ('Black Armaflex', 0, 0),
  ('White Armaflex', 0, 1);

-- Protective cage options
INSERT INTO protective_cage_options (name, price, is_custom, sort_order) VALUES
  ('Standard cage', 850, false, 0),
  ('Heavy-duty cage', 1450, false, 1),
  ('Custom cage', 0, true, 2);

-- ─── Compatibility data ──────────────────────────────────────────────────────

-- Both kits support both pipe materials
INSERT INTO installation_kit_material_compat (kit_id, material_id)
SELECT k.id, m.id FROM installation_kits k CROSS JOIN pipe_materials m;

-- Both kits support both brackets
INSERT INTO installation_kit_bracket_compat (kit_id, bracket_id)
SELECT k.id, b.id FROM installation_kits k CROSS JOIN bracket_options b;

-- Both kits support both insulation options
INSERT INTO installation_kit_insulation_compat (kit_id, insulation_id)
SELECT k.id, i.id FROM installation_kits k CROSS JOIN insulation_options i;

-- Both kits support all cage options
INSERT INTO installation_kit_cage_compat (kit_id, cage_id)
SELECT k.id, c.id FROM installation_kits k CROSS JOIN protective_cage_options c;

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pipe_sizes_material_id ON pipe_sizes(material_id);
CREATE INDEX IF NOT EXISTS idx_pipe_lengths_kit_id ON pipe_lengths(kit_id);
CREATE INDEX IF NOT EXISTS idx_installation_kits_active ON installation_kits(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pipe_materials_active ON pipe_materials(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bracket_options_active ON bracket_options(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_insulation_options_active ON insulation_options(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_protective_cage_options_active ON protective_cage_options(is_active) WHERE is_active = true;
