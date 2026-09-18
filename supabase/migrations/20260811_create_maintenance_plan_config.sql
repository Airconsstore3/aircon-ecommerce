-- ============================================================
-- Maintenance Plan Configuration
-- Run this in the Supabase Dashboard SQL Editor
-- ============================================================

-- 1. Maintenance plans (frequencies)
CREATE TABLE IF NOT EXISTS maintenance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  frequency_months INTEGER NOT NULL,
  terms TEXT,
  requires_terms_acceptance BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Included services per plan
CREATE TABLE IF NOT EXISTS maintenance_plan_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES maintenance_plans(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Pricing rules: exact or from prices depending on unit attributes.
--    price_on_request takes precedence over numeric price.
--    min/max of 0 means "not applicable" for that dimension.
CREATE TABLE IF NOT EXISTS maintenance_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES maintenance_plans(id) ON DELETE CASCADE,
  min_btu INTEGER DEFAULT 0,
  max_btu INTEGER DEFAULT 0,
  unit_type TEXT,
  brand TEXT,
  model TEXT,
  purchase_source TEXT,           -- 'aircons_store', 'elsewhere', 'any'
  quantity_min INTEGER DEFAULT 1,
  quantity_max INTEGER DEFAULT 1,
  price NUMERIC(12,2),
  display_prefix TEXT DEFAULT 'R', -- 'From R', 'R', etc.
  price_on_request BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Eligibility rules
CREATE TABLE IF NOT EXISTS maintenance_eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES maintenance_plans(id) ON DELETE CASCADE,
  min_btu INTEGER DEFAULT 0,
  max_btu INTEGER DEFAULT 0,
  unit_type TEXT,
  brand TEXT,
  model TEXT,
  requires_purchase_from_aircons_store BOOLEAN DEFAULT FALSE,
  requires_serviceable_condition TEXT DEFAULT NULL,
  eligible BOOLEAN DEFAULT TRUE,
  message TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_plans_active ON maintenance_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_maintenance_plan_services_plan ON maintenance_plan_services(plan_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_pricing_rules_plan ON maintenance_pricing_rules(plan_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_pricing_rules_active ON maintenance_pricing_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_maintenance_eligibility_rules_plan ON maintenance_eligibility_rules(plan_id);

-- 5. Seed minimal fallback data
INSERT INTO maintenance_plans (id, name, description, short_description, frequency_months, terms, requires_terms_acceptance, is_active, sort_order)
VALUES
  (gen_random_uuid(), 'Every 3 months', 'Quarterly service visit to keep your unit running efficiently all year round.', 'Recommended for frequent servicing', 3, 'Regular maintenance extends unit life, cuts energy costs, and protects your warranty.', TRUE, TRUE, 10),
  (gen_random_uuid(), 'Every 6 months', 'Bi-annual maintenance to maintain warranty and peak performance.', 'Bi-annual servicing for regular maintenance', 6, 'Regular maintenance extends unit life, cuts energy costs, and protects your warranty.', TRUE, TRUE, 20),
  (gen_random_uuid(), 'Every 12 months', 'Annual maintenance plan to keep your unit in top condition.', 'Annual maintenance plan', 12, 'Regular maintenance extends unit life, cuts energy costs, and protects your warranty.', TRUE, TRUE, 30),
  (gen_random_uuid(), 'Every 2 months', 'More frequent servicing for high-usage environments.', 'More frequent servicing', 2, 'Regular maintenance extends unit life, cuts energy costs, and protects your warranty.', TRUE, TRUE, 40)
ON CONFLICT DO NOTHING;

-- 6. Seed fallback services
WITH plans AS (SELECT id, name FROM maintenance_plans)
INSERT INTO maintenance_plan_services (plan_id, service, sort_order)
SELECT id, 'Indoor unit clean', 10 FROM plans WHERE name = 'Every 6 months'
UNION ALL
SELECT id, 'Outdoor unit clean', 20 FROM plans WHERE name = 'Every 6 months'
UNION ALL
SELECT id, 'Electrical checks', 30 FROM plans WHERE name = 'Every 6 months'
UNION ALL
SELECT id, 'Performance checks', 40 FROM plans WHERE name = 'Every 6 months'
UNION ALL
SELECT id, 'Basic system inspection', 50 FROM plans WHERE name = 'Every 6 months'
UNION ALL
SELECT id, 'Filter cleaning and replacement check', 10 FROM plans WHERE name = 'Every 3 months'
UNION ALL
SELECT id, 'Coil and fin inspection', 20 FROM plans WHERE name = 'Every 3 months'
UNION ALL
SELECT id, 'Refrigerant pressure check', 30 FROM plans WHERE name = 'Every 3 months'
UNION ALL
SELECT id, 'Drain line flush', 40 FROM plans WHERE name = 'Every 3 months'
UNION ALL
SELECT id, 'Scheduled annual service', 10 FROM plans WHERE name = 'Every 12 months'
UNION ALL
SELECT id, 'Filter and coil cleaning', 20 FROM plans WHERE name = 'Every 12 months'
UNION ALL
SELECT id, 'System performance check', 30 FROM plans WHERE name = 'Every 12 months'
UNION ALL
SELECT id, 'Priority support', 40 FROM plans WHERE name = 'Every 12 months';
