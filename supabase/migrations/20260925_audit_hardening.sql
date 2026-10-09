-- ============================================================
-- Audit hardening migration (2026-09-25)
--
-- 1. Revoke the stale direct-write path on orders. Production had
--    "public_can_submit_orders" (TO anon, authenticated) + a table-level
--    INSERT grant to anon — anyone could POST fabricated orders via
--    PostgREST, bypassing rate limiting, Turnstile, and server-side pricing
--    (and firing the order-email trigger). Checkout uses the service role,
--    which bypasses RLS — no app path needs this grant.
-- 2. Re-assert that the insecure orders SELECT policies stay dropped.
-- 3. Revoke PUBLIC EXECUTE on the SECURITY DEFINER order-number function
--    (Postgres grants EXECUTE to PUBLIC by default → callable over RPC).
-- 4. Settings RLS: the old policy granted SELECT to ANY authenticated user
--    (USING true → banking details readable by every account). Restricted to
--    public.admins members when that table exists; otherwise removed
--    entirely (service-role reads are unaffected either way).
-- ============================================================

-- ─── 1. Orders: no direct public writes ─────────────────────────────────────
DROP POLICY IF EXISTS "Public can submit orders" ON public.orders;
DROP POLICY IF EXISTS public_can_submit_orders ON public.orders;
REVOKE INSERT ON public.orders FROM anon, authenticated;

-- ─── 2. Orders: never re-open insecure reads ────────────────────────────────
-- The order-confirmed page validates (order UUID + secure_token) server-side
-- via the service role. Anon must not SELECT orders at all.
DROP POLICY IF EXISTS "Public can read own order by token" ON public.orders;
DROP POLICY IF EXISTS "allow_select_own_recent_order" ON public.orders;

-- ─── 3. generate_order_number: service role only ────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'generate_order_number' AND n.nspname = 'public'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon, authenticated, public;
  END IF;
END $$;

-- ─── 4. Settings: drop permissive read; admin-only if admins table exists ───
DROP POLICY IF EXISTS "Admins can read settings" ON public.settings;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'admins' AND table_schema = 'public'
  ) THEN
    CREATE POLICY "Admins can read settings"
      ON public.settings
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admins a
          WHERE a.user_id = (SELECT auth.uid())
        )
      );
  END IF;
END $$;

-- ─── Verify ────────────────────────────────────────────────────────────────
SELECT pol.polname, pol.polroles::regrole[] AS roles,
       pg_get_expr(pol.polqual, pol.polrelid) AS using_expr
FROM pg_policy pol
JOIN pg_class cls ON cls.oid = pol.polrelid
WHERE cls.relname IN ('orders', 'settings')
ORDER BY cls.relname, pol.polname;
