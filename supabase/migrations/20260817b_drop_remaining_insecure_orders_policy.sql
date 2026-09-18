-- ============================================================
-- CRITICAL SECURITY FIX: Drop remaining insecure orders SELECT policy
-- The previous migration (20260817) dropped "Public can read own order by token"
-- but another policy "allow_select_own_recent_order" still allows anon to read
-- ANY order created in the last 5 minutes, including secure_tokens and PII.
-- ============================================================

DROP POLICY IF EXISTS "allow_select_own_recent_order" ON public.orders;

-- Verify: no SELECT policies remain for anon on orders.
-- All order reads go through the service role client in the application layer.
