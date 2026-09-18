-- Harden customer order access: trim() both sides of the email match so a
-- stray space in a stored email can't hide a customer's own orders.
-- Recreates the two policies from 20260917_customer_order_access.sql.

drop policy "Customers can read their own orders" on public.orders;

create policy "Customers can read their own orders"
on public.orders
for select
to authenticated
using (
  lower(trim(email)) = lower(trim((select auth.jwt() ->> 'email')))
  or lower(trim(customer_email)) = lower(trim((select auth.jwt() ->> 'email')))
);

drop policy "Customers can read their own order items" on public.order_items;

create policy "Customers can read their own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (
        lower(trim(o.email)) = lower(trim((select auth.jwt() ->> 'email')))
        or lower(trim(o.customer_email)) = lower(trim((select auth.jwt() ->> 'email')))
      )
  )
);
