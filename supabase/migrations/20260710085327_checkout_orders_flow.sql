create extension if not exists pg_cron with schema extensions;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

grant select on public.admins to authenticated;

create policy "Admins can read their own admin membership"
on public.admins
for select
to authenticated
using ((select auth.uid()) = user_id);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  notes text,
  items jsonb not null default '[]'::jsonb,
  total_zar integer not null check (total_zar >= 0),
  channel text not null check (channel in ('whatsapp', 'email', 'both')),
  status text not null default 'submitted' check (status in ('submitted', 'sent_whatsapp', 'email_sent', 'completed', 'cancelled')),
  consent_accepted boolean not null default false,
  whatsapp_url text,
  expires_at timestamptz not null default (now() + interval '48 hours'),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_expires_at on public.orders(expires_at);

alter table public.orders enable row level security;

grant insert on public.orders to anon;
grant select, update on public.orders to authenticated;

create policy "Public can submit orders"
on public.orders
for insert
to anon
with check (consent_accepted = true);

create policy "Admins can read orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.admins a
    where a.user_id = (select auth.uid())
  )
);

create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (
  exists (
    select 1
    from public.admins a
    where a.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.admins a
    where a.user_id = (select auth.uid())
  )
);

create trigger orders_updated_at
  before update on public.orders
  for each row
  execute function set_updated_at();

select cron.schedule(
  'orders-pii-retention-90-days',
  '25 2 * * *',
  $$
    update public.orders
    set
      name = 'Anonymized',
      phone = 'anonymized',
      email = null,
      notes = null,
      items = '[]'::jsonb,
      whatsapp_url = null,
      status = 'cancelled'
    where status = 'submitted'
      and created_at < now() - interval '90 days';
  $$
)
where not exists (
  select 1
  from cron.job
  where jobname = 'orders-pii-retention-90-days'
);
