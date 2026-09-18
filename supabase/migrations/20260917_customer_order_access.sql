-- Customer order access: let authenticated users read their own orders.
--
-- orders has no user_id column (guest checkout); ownership is established by
-- matching the order's email against the JWT email claim. This covers past
-- guest orders placed with the same address as the account.
-- auth.jwt() is wrapped in (select ...) so Postgres evaluates it once per
-- query (initplan) instead of once per row.

create policy "Customers can read their own orders"
on public.orders
for select
to authenticated
using (
  lower(email) = lower((select auth.jwt() ->> 'email'))
  or lower(customer_email) = lower((select auth.jwt() ->> 'email'))
);

-- order_items follows the parent order's ownership.
grant select on public.order_items to authenticated;

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
        lower(o.email) = lower((select auth.jwt() ->> 'email'))
        or lower(o.customer_email) = lower((select auth.jwt() ->> 'email'))
      )
  )
);
