
-- Switch to the 'api' schema
create schema if not exists api;

-- Create table for Red Packet Codes in 'api' schema (if not exists)
create table if not exists api.red_packets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  creator_name text not null default '艾兜兜儿',
  creator_avatar text default 'https://dkfile.net/uploads/avatars/avatar_1037_2b899c87.jpeg',
  remaining_copies integer default 3,
  status text default 'active',
  view_count integer default 0
);

-- Create page views table in 'api' schema
create table if not exists api.page_views (
  id uuid default gen_random_uuid() primary key,
  page_path text not null,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for Meme History in 'api' schema
create table if not exists api.memes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  config jsonb not null,
  title text,
  is_vip boolean default false
);

-- Grant usage on schema and tables to anon and authenticated roles (typical Supabase setup for exposed schemas)
grant usage on schema api to anon, authenticated;
grant all on all tables in schema api to anon, authenticated;
grant all on all sequences in schema api to anon, authenticated;
