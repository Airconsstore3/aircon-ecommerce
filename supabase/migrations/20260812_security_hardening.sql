-- ============================================================
-- Security Hardening Migration
-- Adds: Unique constraint on idempotency_key
-- Adds: Payfast ITN source IP validation function
-- Adds: Order number generation trigger
-- ============================================================

-- ─── Unique constraint on idempotency_key ───────────────────────────────────
-- This ensures that even under race conditions, only one order can be
-- created per idempotency key. The application checks first, but this
-- is the database-level guarantee.

-- Partial unique index (only for non-null keys)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key_unique
  ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ─── Trigger: auto-generate order_number on insert ──────────────────────────
-- Ensures every order gets a sequential order number even if the
-- application forgets to set one.

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

-- ─── Updated_at trigger for payments ────────────────────────────────────────
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

-- ─── Payfast ITN: validate source IP ────────────────────────────────────────
-- Payfast ITN requests come from a known set of IPs. This function
-- can be used by the application to validate the source.

CREATE OR REPLACE FUNCTION public.validate_payfast_ip(ip TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Payfast sandbox and live IPs
  -- See: https://developers.payfast.co.za/documentation/#itn
  -- Live: 41.74.179.228, 41.74.179.229, 41.74.179.230
  -- Sandbox: 41.74.179.231
  RETURN ip IN (
    '41.74.179.228',
    '41.74.179.229',
    '41.74.179.230',
    '41.74.179.231',
    '127.0.0.1'  -- Allow localhost for development/testing
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;
