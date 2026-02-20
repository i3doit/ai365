-- Update Red Packet table and create copy records table
alter table api.red_packets add column if not exists total_copies integer default 3;
alter table api.red_packets add column if not exists client_id text; -- Used to identify creator without login

-- Create copy records table
create table if not exists api.copy_records (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  red_packet_id uuid references api.red_packets(id) on delete cascade,
  copier_name text not null,
  copier_avatar text,
  copier_client_id text not null -- Used to identify the copier
);

-- Grant permissions
grant all on api.copy_records to anon, authenticated;
