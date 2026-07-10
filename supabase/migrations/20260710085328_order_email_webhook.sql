create or replace function notify_order_email()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_extension_post(
    url := 'https://mrufsvbnxysgpjpnpuhb.supabase.co/functions/v1/order-email',
    headers := jsonb_build_object('x-webhook-secret', '78bb4e3f3d295eef30add42f9092f0118b8466f7ccfb84e585e45a9769ad50f8'),
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
