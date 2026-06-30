-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid primary key default gen_random_uuid(),
  store_name text,
  contact_email text,
  contact_phone text,
  whatsapp_number text,
  free_shipping_threshold_zar numeric,
  announcement_text text,
  announcement_active boolean default false,
  updated_at timestamptz default now()
);

-- Insert default settings row
insert into public.settings (store_name) values ('Aircons Store')
  on conflict do nothing;

-- Auto-update trigger for updated_at
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
