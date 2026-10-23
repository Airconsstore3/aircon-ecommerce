-- ============================================================
-- APPLY: 20260925_audit_hardening.sql — production runbook
-- Target: Supabase project mrufsvbnxysgpjpnpuhb, SQL Editor
-- Confirmed pending: pg_policies shows "public_can_submit_orders"
-- (INSERT, anon+authenticated) still present on public.orders.
--
-- WHAT THIS DOES
--   1. Drops the public INSERT policy + revokes INSERT grants on orders
--      (checkout writes via service role — unaffected by RLS/grants).
--   2. Re-drops the two historically-insecure SELECT policies.
--   3. Recreates admin SELECT/UPDATE policies on orders ONLY IF MISSING
--      (your pg_policies output showed them absent — verified needed).
--   4. Revokes PUBLIC EXECUTE on generate_order_number().
--   5. Restricts settings SELECT to admins members.
--
-- Safe to run multiple times (all statements idempotent).
-- ============================================================

BEGIN;

-- ─── 1. Orders: close the public write path ──────────────────────────────────
DROP POLICY IF EXISTS "Public can submit orders" ON public.orders;
DROP POLICY IF EXISTS public_can_submit_orders ON public.orders;
REVOKE INSERT ON public.orders FROM anon, authenticated;

-- ─── 2. Orders: insecure SELECT policies stay dead ───────────────────────────
DROP POLICY IF EXISTS "Public can read own order by token" ON public.orders;
DROP POLICY IF EXISTS "allow_select_own_recent_order" ON public.orders;

-- ─── 3. Orders: ensure admin read/write policies exist ───────────────────────
-- (Observed absent in prod on 2026-10-09 — admins currently cannot list orders
-- via RLS at all, which will break any future /admin UI.)
DROP POLICY IF EXISTS "Admins can read orders" ON public.orders;
CREATE POLICY "Admins can read orders"
  ON public.orders FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = (SELECT auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = (SELECT auth.uid()))
  );

-- ─── 4. generate_order_number: service role only ─────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'generate_order_number' AND n.nspname = 'public'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.generate_order_number()
      FROM anon, authenticated, public;
  END IF;
END $$;

-- ─── 5. Settings: admin-only read ────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read settings" ON public.settings;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'admins' AND table_schema = 'public'
  ) THEN
    CREATE POLICY "Admins can read settings"
      ON public.settings FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admins a
          WHERE a.user_id = (SELECT auth.uid())
        )
      );
  END IF;
END $$;

COMMIT;

-- ============================================================
-- VERIFY (run after the above — in the same editor is fine)
-- ============================================================

-- A) Policy list — expected rows on public.orders:
--   "Customers can read their own orders"  SELECT  {authenticated}
--   "Admins can read orders"               SELECT  {authenticated}
--   "Admins can update orders"             UPDATE  {authenticated}
--   (NO "public_can_submit_orders", NO anon SELECT policies)
SELECT polname, polcmd::text AS cmd, polroles::regrole[] AS roles,
       pg_get_expr(polqual, polrelid) AS using_expr,
       pg_get_expr(polwithcheck, polrelid) AS check_expr
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'orders'
ORDER BY polname;

-- B) Table grants — orders must NOT show INSERT for anon/authenticated.
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY grantee, privilege_type;
--   Expected for anon: (nothing, or SELECT-revoked — no rows at all is fine)
--   Expected for authenticated: SELECT, UPDATE only (no INSERT).

-- C) Functional proof — run as anon via Data API or by setting role:
--   SET ROLE anon; INSERT INTO public.orders (name, phone, channel)
--     VALUES ('x','x','email');  --> expect: permission denied / RLS violation
--   SET ROLE anon; SELECT * FROM public.orders; --> expect: permission denied
--   RESET ROLE;

-- ============================================================
-- ROLLBACK (only if something breaks — REOPENS the holes)
-- ============================================================
-- BEGIN;
-- GRANT INSERT ON public.orders TO anon, authenticated;
-- CREATE POLICY public_can_submit_orders
--   ON public.orders FOR INSERT TO anon, authenticated
--   WITH CHECK (consent_accepted = true);
-- -- settings back to any-authenticated read:
-- DROP POLICY IF EXISTS "Admins can read settings" ON public.settings;
-- CREATE POLICY "Admins can read settings"
--   ON public.settings FOR SELECT TO authenticated USING (true);
-- COMMIT;
-- NOTE: rollback restores the exact state attackers could abuse. Prefer
-- fixing forward over running this.
