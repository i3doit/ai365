
-- 1. 创建 api 模式
create schema if not exists api;

-- 2. 创建红包口令主表（仅在不存在时创建，不清空历史数据）
create table if not exists api.red_packets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  creator_name text not null default '艾兜兜儿',
  creator_avatar text default 'https://dkfile.net/uploads/avatars/avatar_1037_2b899c87.jpeg',
  remaining_copies integer default 3,
  total_copies integer default 3,
  client_id text, -- 重要：用于标识用户，解决互助闭环
  status text default 'active',
  view_count integer default 0
);

-- 3. 创建助力记录表（互助闭环核心，仅在不存在时创建）
create table if not exists api.copy_records (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  red_packet_id uuid references api.red_packets(id) on delete cascade,
  copier_name text not null,
  copier_avatar text,
  copier_client_id text not null,
  creator_client_id text,
  creator_name text,
  creator_avatar text,
  is_self boolean default false
);

-- 4. 增量字段升级（旧表上按需补充新字段，避免丢数据）
alter table api.copy_records add column if not exists creator_client_id text;
alter table api.copy_records add column if not exists creator_name text;
alter table api.copy_records add column if not exists creator_avatar text;
alter table api.copy_records add column if not exists is_self boolean default false;

-- 5. 配置权限（确保匿名用户可读写）
grant usage on schema api to anon, authenticated;
grant all on all tables in schema api to anon, authenticated;
grant all on all sequences in schema api to anon, authenticated;

-- 6. 创建反馈系统表（公共模块）
create table if not exists api.feedbacks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  contact text, -- 联系方式（选填）
  client_id text, -- 用户标识
  page_url text, -- 来源页面
  module_name text -- 模块名称（如：红包口令）
);
grant all on api.feedbacks to anon, authenticated;

-- 7. 强制刷新缓存（在执行完上述建表语句后运行）
NOTIFY pgrst, 'reload schema';
