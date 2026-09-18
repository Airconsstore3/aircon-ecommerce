-- ============================================================
-- COMBINED MIGRATION: Checkout + Payment + Security Hardening
-- Run this in the Supabase Dashboard SQL Editor.
-- This is idempotent — safe to run multiple times.
-- ============================================================

-- ─── 1. Installation Tiers ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.installation_tiers (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  min_btu INTEGER NOT NULL DEFAULT 0,
  max_btu INTEGER NOT NULL DEFAULT 999999,
  price_zar INTEGER NOT NULL DEFAULT 0,
  is_enquiry BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.installation_tiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS installation_tiers_select_public ON public.installation_tiers;
CREATE POLICY installation_tiers_select_public
  ON public.installation_tiers FOR SELECT TO public USING (true);

INSERT INTO public.installation_tiers (id, label, min_btu, max_btu, price_zar, is_enquiry, is_active, sort_order) VALUES
  ('9-12k', '9 000–12 000 BTU', 0, 12000, 1950, false, true, 1),
  ('18k', '18 000 BTU', 12001, 18000, 2350, false, true, 2),
  ('24k', '24 000 BTU', 18001, 24000, 2750, false, true, 3),
  ('32k+', '32 000+ BTU', 24001, 999999, 0, true, true, 4)
ON CONFLICT (id) DO NOTHING;

-- ─── 2. Payment Providers ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payment_providers_select_public ON public.payment_providers;
CREATE POLICY payment_providers_select_public
  ON public.payment_providers FOR SELECT TO public USING (is_enabled = true);

-- Seed: Manual EFT enabled by default, Payfast disabled until credentials are set
INSERT INTO public.payment_providers (code, name, description, is_enabled, sort_order, configuration) VALUES
  ('payfast', 'Payfast', 'Secure online payment via Payfast', false, 1, '{}'::jsonb),
  ('manual_eft', 'Manual EFT', 'Pay by bank transfer. Banking details provided after checkout.', true, 2, '{}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- ─── 3. Orders table upgrades ────────────────────────────────────────────────

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_city TEXT,
  ADD COLUMN IF NOT EXISTS delivery_province TEXT,
  ADD COLUMN IF NOT EXISTS installation_notes TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS subtotal_zar INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS installation_total_zar INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS kit_total_zar INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS maintenance_total_zar INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS warranty_total_zar INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_total_zar INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
  ADD COLUMN IF NOT EXISTS payment_provider TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS secure_token UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_secure_token ON public.orders(secure_token);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON public.orders(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON public.orders(payment_reference) WHERE payment_reference IS NOT NULL;

-- ─── 4. Order Items ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID,
  product_name_snapshot TEXT NOT NULL,
  product_slug TEXT,
  sku_snapshot TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  base_unit_price_zar INTEGER NOT NULL DEFAULT 0,
  has_installation BOOLEAN NOT NULL DEFAULT false,
  installation_tier_id TEXT,
  installation_price_zar INTEGER NOT NULL DEFAULT 0,
  kit_configuration JSONB DEFAULT '{}'::jsonb,
  kit_price_zar INTEGER NOT NULL DEFAULT 0,
  maintenance_plan_id TEXT,
  maintenance_price_zar INTEGER NOT NULL DEFAULT 0,
  warranty_option_id TEXT,
  warranty_price_zar INTEGER NOT NULL DEFAULT 0,
  line_total_zar INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS order_items_select_admin ON public.order_items;
-- Only apply admin policy if admins table exists, otherwise allow service role only
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins' AND table_schema = 'public') THEN
    CREATE POLICY order_items_select_admin
      ON public.order_items FOR SELECT TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = (SELECT auth.uid()))
      );
  END IF;
END $$;

-- ─── 5. Payments table ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider_code TEXT NOT NULL,
  provider_transaction_id TEXT,
  amount_zar INTEGER NOT NULL CHECK (amount_zar >= 0),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded')),
  payment_reference TEXT,
  provider_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_transaction_id ON public.payments(provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_payment_reference ON public.payments(payment_reference) WHERE payment_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payments_select_admin ON public.payments;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins' AND table_schema = 'public') THEN
    CREATE POLICY payments_select_admin
      ON public.payments FOR SELECT TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = (SELECT auth.uid()))
      );
  END IF;
END $$;

-- ─── 6. Banking details in settings ──────────────────────────────────────────

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_branch_code TEXT,
  ADD COLUMN IF NOT EXISTS bank_reference_prefix TEXT DEFAULT 'AIR';

-- ─── 7. Order number sequence + function ─────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq
  START 1 INCREMENT 1 NO CYCLE;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  next_val BIGINT;
  year_text TEXT;
BEGIN
  next_val := nextval('public.order_number_seq');
  year_text := EXTRACT(YEAR FROM now())::TEXT;
  RETURN 'AIR-' || year_text || '-' || lpad(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 8. Orders RLS policies ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can read orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Public can read own order by token" ON public.orders;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins' AND table_schema = 'public') THEN
    CREATE POLICY "Admins can read orders"
      ON public.orders FOR SELECT TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = (SELECT auth.uid()))
      );

    CREATE POLICY "Admins can update orders"
      ON public.orders FOR UPDATE TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = (SELECT auth.uid()))
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = (SELECT auth.uid()))
      );
  END IF;
END $$;

-- Allow public (anon) to read orders by secure_token
CREATE POLICY "Public can read own order by token"
  ON public.orders FOR SELECT TO anon
  USING (secure_token IS NOT NULL);

-- ─── 9. Security hardening ───────────────────────────────────────────────────

-- Unique partial index on idempotency_key (DB-level idempotency guarantee)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key_unique
  ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Auto-trigger to set order_number on insert if not provided
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS orders_set_order_number ON public.orders;
CREATE TRIGGER orders_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();

-- Updated_at trigger for payments
CREATE OR REPLACE FUNCTION public.set_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payments_updated_at ON public.payments;
CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_payments_updated_at();

-- ─── 10. Verify seed data ────────────────────────────────────────────────────

-- This SELECT at the end will show the seeded payment providers
SELECT code, name, is_enabled, sort_order FROM public.payment_providers ORDER BY sort_order;
