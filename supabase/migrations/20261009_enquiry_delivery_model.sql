-- Enquiry-model delivery + order status update
-- Run AFTER 20260925_audit_hardening.sql in the Supabase SQL Editor.
--
-- Changes:
--  1. orders.delivery_tier — three-tier delivery model:
--       cape_town_free  : delivery city is Cape Town → free
--       quote_on_type   : order contains enquiry-only items → fee quoted manually
--       quoted          : anywhere else → fee quoted per order after confirmation
--  2. orders.status CHECK gains 'confirmed' — set once availability is verified.
--     Banking details on /order-confirmed are gated on this status.
--  3. Payfast is removed from the codebase — disable the provider row.
--  4. /deals removed from the codebase — deactivate all deal rows.

alter table public.orders
  add column if not exists delivery_tier text
    check (delivery_tier in ('cape_town_free', 'quoted', 'quote_on_type'))
    default 'quoted';

comment on column public.orders.delivery_tier is
  'Delivery fee tier: cape_town_free | quoted | quote_on_type. Fees are quoted manually — never hardcoded.';

-- Widen the status check constraint to include 'confirmed'
do $$
declare
  chk text;
begin
  select con.conname into chk
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where rel.relname = 'orders' and nsp.nspname = 'public' and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%submitted%';

  if chk is not null then
    execute format('alter table public.orders drop constraint %I', chk);
    alter table public.orders add constraint orders_status_check
      check (status in ('submitted','confirmed','sent_whatsapp','email_sent','completed','cancelled'));
  end if;
end $$;

-- Disable Payfast (integration removed from codebase)
update public.payment_providers set is_enabled = false where code = 'payfast';

-- Deals feature removed — deactivate all rows so nothing renders stale data
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'deals') then
    update public.deals set is_active = false where is_active = true;
  end if;
end $$;
