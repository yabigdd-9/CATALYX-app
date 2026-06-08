-- Catalyx Labs production patch SQL.
-- Apply after supabase/schema.sql on existing projects.

alter table environment_logs
  add column if not exists note text;

create table if not exists grow_rooms (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  environment_type text,
  location text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists grow_tents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  room_id uuid references grow_rooms(id) on delete set null,
  name text not null,
  size text,
  light_model text,
  airflow text,
  notes text,
  created_at timestamptz default now()
);

alter table plants
  add column if not exists tent_id uuid references grow_tents(id) on delete set null,
  add column if not exists current_stage text;

create table if not exists journal_entries (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  entry_type text not null,
  title text not null,
  body text not null,
  approved boolean default false,
  source text default 'manual',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists product_orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  customer_email text,
  product_ids text,
  order_lines jsonb not null default '[]'::jsonb,
  amount_total numeric,
  currency text,
  status text,
  created_at timestamptz default now()
);

alter table product_orders
  add column if not exists order_lines jsonb not null default '[]'::jsonb;

alter table cx_reward_wallets
  add column if not exists legacy_rewards_imported_at timestamptz;

create table if not exists customer_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer','pro_customer','stockist','support_admin','admin')),
  company_name text,
  phone text,
  preferred_contact_method text not null default 'email' check (preferred_contact_method in ('email','phone','sms')),
  support_status text not null default 'standard',
  notification_preferences jsonb not null default '{"billing": true, "orders": true, "support": true, "rewards": true, "grow_os": true, "security": true}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  product_order_id uuid references product_orders(id) on delete set null,
  subject text not null,
  category text not null default 'general' check (category in ('general','billing','order','technical','grow_support','access','feature_request')),
  status text not null default 'open' check (status in ('open','waiting_on_customer','in_review','resolved','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  last_message_preview text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists support_ticket_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references support_tickets(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  author_role text not null default 'customer' check (author_role in ('customer','support_admin','admin')),
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  internal boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists customer_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  document_type text not null default 'guide' check (document_type in ('invoice','feed_chart','label_pdf','guide','account_file','stockist_file')),
  description text,
  public_url text,
  storage_bucket text,
  storage_path text,
  is_private boolean not null default true,
  published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists portal_notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  notification_type text not null default 'support' check (notification_type in ('order','billing','support','reward','grow_os','security')),
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists portal_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  event_type text not null,
  source text not null default 'portal',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_support_tickets_user_updated on support_tickets(user_id, updated_at desc);
create index if not exists idx_support_ticket_messages_ticket_created on support_ticket_messages(ticket_id, created_at);
create index if not exists idx_customer_documents_user_type on customer_documents(user_id, document_type);
create index if not exists idx_portal_notifications_user_created on portal_notifications(user_id, created_at desc);
create index if not exists idx_portal_events_user_created on portal_events(user_id, created_at desc);
create index if not exists idx_product_orders_user_status on product_orders(user_id, status);
create index if not exists idx_cx_reward_ledger_user_id on cx_reward_ledger(user_id);
create index if not exists idx_cx_reward_ledger_user_source on cx_reward_ledger(user_id, source);
create index if not exists idx_cx_reward_redemptions_user_id on cx_reward_redemptions(user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('grow-photos', 'grow-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('customer-documents', 'customer-documents', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
