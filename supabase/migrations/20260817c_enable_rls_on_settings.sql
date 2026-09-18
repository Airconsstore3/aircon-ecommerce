-- Enable RLS on settings table
-- The settings table contains banking details and business config.
-- All reads go through the service role client in server-side code.
-- Anon does NOT need SELECT access to settings.

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Drop the existing public read policy
DROP POLICY IF EXISTS "allow_public_read_settings" ON public.settings;

-- No SELECT policy for anon — all settings reads use service role client.
-- Only authenticated (admin) users can read settings.
CREATE POLICY "Admins can read settings"
  ON public.settings
  FOR SELECT
  TO authenticated
  USING (true);
