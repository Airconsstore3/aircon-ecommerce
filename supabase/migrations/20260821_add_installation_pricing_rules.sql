-- Add installation pricing rules that account for product, BTU and selected options.
-- The frontend never computes prices; it resolves the best matching active rule
-- from the configuration fetched from Supabase.

CREATE TABLE installation_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES installation_kits(id) ON DELETE SET NULL,
  material_id UUID REFERENCES pipe_materials(id) ON DELETE SET NULL,
  pipe_size_id UUID REFERENCES pipe_sizes(id) ON DELETE SET NULL,
  pipe_length_id UUID REFERENCES pipe_lengths(id) ON DELETE SET NULL,
  bracket_id UUID REFERENCES bracket_options(id) ON DELETE SET NULL,
  insulation_id UUID REFERENCES insulation_options(id) ON DELETE SET NULL,
  cage_id UUID REFERENCES protective_cage_options(id) ON DELETE SET NULL,
  product_id UUID,
  btu_min INTEGER,
  btu_max INTEGER,
  unit_type TEXT,
  brand TEXT,
  additional_price NUMERIC NOT NULL DEFAULT 0,
  price_on_request BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_installation_pricing_rules_lookup
  ON installation_pricing_rules (
    kit_id,
    material_id,
    pipe_size_id,
    pipe_length_id,
    bracket_id,
    insulation_id,
    cage_id,
    is_active
  );

-- Enable RLS so the table follows the same security model as the rest of the schema.
ALTER TABLE installation_pricing_rules ENABLE ROW LEVEL SECURITY;

-- Allow public reads.
CREATE POLICY installation_pricing_rules_select_public
  ON installation_pricing_rules
  FOR SELECT
  TO public
  USING (true);

-- Example seed: a default catch-all adjustment of 0 for active kits.
-- Populate per-combination/BTU adjustments as business requirements are defined.
INSERT INTO installation_pricing_rules (
  kit_id,
  material_id,
  pipe_size_id,
  pipe_length_id,
  bracket_id,
  insulation_id,
  cage_id,
  btu_min,
  btu_max,
  additional_price,
  price_on_request,
  is_active,
  sort_order
)
SELECT
  k.id AS kit_id,
  NULL::UUID,
  NULL::UUID,
  NULL::UUID,
  NULL::UUID,
  NULL::UUID,
  NULL::UUID,
  0,
  999999,
  0,
  false,
  true,
  0
FROM installation_kits k
WHERE k.is_active = true;
