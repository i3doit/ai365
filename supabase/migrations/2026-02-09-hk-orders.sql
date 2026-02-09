create table if not exists api.profiles (
  id uuid primary key,
  email text not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table api.profiles enable row level security;

create table if not exists api.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references api.profiles(id) on delete restrict,
  total_price numeric null,
  shipping_fee numeric null,
  status text not null default '待核价',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table api.orders enable row level security;

create table if not exists api.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid not null references api.orders(id) on delete cascade,
  product_name text not null,
  quantity integer not null default 1,
  img_url text,
  price_at_time numeric null
);

alter table api.order_items enable row level security;

create table if not exists api.price_references (
  product_keyword text primary key,
  mall_price numeric null,
  shop_price numeric null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table api.price_references enable row level security;

create or replace function api.ensure_profile()
returns trigger
language plpgsql
as $$
begin
  insert into api.profiles (id, email, created_at)
  values (new.id, new.email, timezone('utc'::text, now()))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure api.ensure_profile();

drop policy if exists "profiles user access" on api.profiles;
create policy "profiles user access" on api.profiles
  for all
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles admin access" on api.profiles;
create policy "profiles admin access" on api.profiles
  for all
  using (auth.uid()::text = '00000000-0000-0000-0000-000000000000')
  with check (auth.uid()::text = '00000000-0000-0000-0000-000000000000');

drop policy if exists "orders user access" on api.orders;
create policy "orders user access" on api.orders
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "orders admin access" on api.orders;
create policy "orders admin access" on api.orders
  for all
  using (auth.uid()::text = '00000000-0000-0000-0000-000000000000')
  with check (auth.uid()::text = '00000000-0000-0000-0000-000000000000');

drop policy if exists "order_items user access" on api.order_items;
create policy "order_items user access" on api.order_items
  for all
  using (exists (select 1 from api.orders o where o.id = order_id and o.user_id = auth.uid()))
  with check (exists (select 1 from api.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "order_items admin access" on api.order_items;
create policy "order_items admin access" on api.order_items
  for all
  using (auth.uid()::text = '00000000-0000-0000-0000-000000000000')
  with check (auth.uid()::text = '00000000-0000-0000-0000-000000000000');

drop policy if exists "price_references read" on api.price_references;
create policy "price_references read" on api.price_references
  for select
  to authenticated
  using (true);

drop policy if exists "price_references admin write" on api.price_references;
create policy "price_references admin write" on api.price_references
  for all
  using (auth.uid()::text = '00000000-0000-0000-0000-000000000000')
  with check (auth.uid()::text = '00000000-0000-0000-0000-000000000000');
