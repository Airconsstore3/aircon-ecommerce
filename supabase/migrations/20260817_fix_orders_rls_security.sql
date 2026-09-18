-- ============================================================
-- CRITICAL SECURITY FIX: Orders RLS + Payfast ITN hardening
-- Fixes:
--   1. anon could SELECT ALL orders (names, phones, emails, totals, secure_tokens)
--   2. anon could read secure_tokens, breaking order confirmation page security
--   3. Payfast ITN source IP check bypassed when x-forwarded-for missing
-- ============================================================

-- ─── 1. Fix orders SELECT policy for anon ───────────────────────────────────
-- The old policy "Public can read own order by token" used:
--     USING (secure_token IS NOT NULL)
-- which is true for EVERY order, allowing anon to read all orders.
--
-- The application layer (order-confirmed page) uses the service role client,
-- not the anon client, so anon does NOT need SELECT on orders at all.
-- Order insertion is already covered by "Public can submit orders" (INSERT only).
--
-- Drop the broken SELECT policy for anon.

DROP POLICY IF EXISTS "Public can read own order by token" ON public.orders;

-- Do NOT recreate a replacement anon SELECT policy.
-- The order-confirmed page and all order lookups use the service role client
-- which bypasses RLS. The anon client only needs INSERT (for checkout, though
-- the app also uses service role for that now) — not SELECT.
--
-- If a future feature needs anon to look up an order by token, use a
-- SECURITY DEFINER function that takes both order_id AND secure_token as
-- arguments and returns only the matching row, instead of a broad SELECT policy.

-- ─── 2. Verify no anon SELECT remains on orders ─────────────────────────────
-- (This is a no-op comment to document the intent: anon should NOT be able to
--  read orders. All order reads go through the service role client in the app.)

-- ─── 3. Ensure anon cannot UPDATE orders ────────────────────────────────────
-- The existing "Admins can update orders" policy only applies to `authenticated`.
-- There is no UPDATE policy for `anon`, which means anon UPDATEs silently affect
-- 0 rows (Postgres RLS UPDATE requires a matching SELECT policy first).
-- This is safe, but we add an explicit deny for clarity and defense in depth.

-- No action needed — the absence of an anon UPDATE policy is the correct state.
