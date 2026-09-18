-- Extended warranty configuration.
-- All warranty plans, periods, pricing, eligibility and terms are fetched from Supabase.

CREATE TABLE warranty_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  period_months INTEGER NOT NULL,
  description TEXT,
  short_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE warranty_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID REFERENCES warranty_options(id) ON DELETE CASCADE,
  product_id UUID,
  btu_min INTEGER,
  btu_max INTEGER,
  brand TEXT,
  unit_type TEXT,
  category TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  additional_price NUMERIC NOT NULL DEFAULT 0,
  price_on_request BOOLEAN NOT NULL DEFAULT false,
  requires_confirmation BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_warranty_pricing_rules_lookup
  ON warranty_pricing_rules (option_id, is_active);

CREATE TABLE warranty_terms (
  option_id UUID PRIMARY KEY REFERENCES warranty_options(id) ON DELETE CASCADE,
  terms TEXT
);

-- Public read access
ALTER TABLE warranty_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY warranty_options_select_public
  ON warranty_options FOR SELECT TO public USING (true);

CREATE POLICY warranty_pricing_rules_select_public
  ON warranty_pricing_rules FOR SELECT TO public USING (true);

CREATE POLICY warranty_terms_select_public
  ON warranty_terms FOR SELECT TO public USING (true);

-- Seed example warranty periods.
-- Populate real prices/eligibility through warranty_pricing_rules as business rules are defined.
INSERT INTO warranty_options (name, period_months, description, short_description, is_active, sort_order) VALUES
  ('6 Months', 6, 'Extended manufacturer cover', '6 months extra cover', true, 1),
  ('1 Year', 12, 'Extended manufacturer cover', '1 year extra cover', true, 2),
  ('2 Years', 24, 'Extended manufacturer cover', '2 years extra cover', true, 3),
  ('5 Years', 60, 'Extended manufacturer cover', '5 years extra cover', true, 4);

-- Seed generic formal Extended Warranty Terms & Conditions for all active options.
INSERT INTO warranty_terms (option_id, terms)
SELECT id,
$WARRANTY_TERMS$1. Extended Warranty

The Extended Warranty provides additional cover for the eligible air-conditioning unit for the selected warranty period, subject to these terms and the applicable manufacturer's warranty conditions.

2. Eligibility

The warranty applies only to eligible products and configurations confirmed by Aircons Store and/or the applicable manufacturer.

Where required, Aircons Store may inspect the unit before confirming eligibility.

Customers who purchased their air-conditioning unit elsewhere may request an Extended Warranty, subject to assessment and approval.

3. Warranty Period

The customer may select an available warranty period:

6 months
1 year
2 years
5 years

The applicable period will be confirmed on the customer's order/invoice.

4. Existing Manufacturer Warranty

The Extended Warranty does not remove, replace or limit any rights or warranty that already applies to the product.

The applicable manufacturer warranty remains subject to the manufacturer's terms and conditions.

5. Maintenance Requirements

Where the selected Extended Warranty requires scheduled maintenance, the customer must comply with the specified maintenance requirements.

The required maintenance frequency and conditions will be communicated with the applicable warranty plan.

6. What Is Covered

Coverage is limited to the components, failures and services specified for the selected warranty plan.

The exact coverage applicable to the customer's unit will be confirmed with the warranty documentation.

7. Exclusions

The Extended Warranty does not cover matters excluded under the applicable manufacturer or warranty terms, including applicable exclusions relating to misuse, abuse, unauthorised modification, improper installation or other excluded circumstances.

8. Warranty Claims

Customers must contact Aircons Store to initiate a warranty claim.

The unit may be inspected to determine whether the reported fault falls within the applicable warranty coverage.

9. Customer-Owned / Third-Party Units

Aircons Store may provide Extended Warranty options for eligible units purchased from other suppliers.

Such units are subject to assessment and approval before coverage is confirmed.

10. Statutory Rights

Nothing in these terms is intended to exclude or limit any rights that cannot lawfully be excluded or limited under applicable South African consumer-protection legislation.

The Consumer Protection Act provides statutory protections in addition to express warranties.$WARRANTY_TERMS$
FROM warranty_options;
