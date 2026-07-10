create or replace function notify_order_email()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_extension_post(
    url := 'https://[PROJECT-REF].supabase.co/functions/v1/order-email',
    headers := jsonb_build_object('x-webhook-secret', '[ORDER_WEBHOOK_SECRET]'),
    body := jsonb_build_object('type', 'INSERT', 'table', 'orders', 'record', to_jsonb(new))
  );
  return new;
end;
$$;

drop trigger if exists on_order_insert_notify_email on public.orders;
create trigger on_order_insert_notify_email
  after insert on public.orders
  for each row
  execute function notify_order_email();
