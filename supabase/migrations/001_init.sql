-- 001_init.sql — Minimal schema for Catalyx Phase 1 core tables
-- Run in Supabase SQL editor or via migrations tooling.

create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique,
  email text unique not null,
  full_name text,
  grow_style text check (grow_style in ('hydro','coco','soil')),
  experience_level text check (experience_level in ('beginner','standard','professional')),
  grow_goals text,
  subscription_status text default 'free',
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan text check (plan in ('free','professional_monthly','professional_yearly')) default 'free',
  status text default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table if not exists user_plan (
  user_id uuid primary key references users(id) on delete cascade,
  plan text default 'free',
  feature_access jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists grows (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  strain_name text,
  start_date date,
  current_stage text not null,
  medium text not null,
  light_schedule text,
  grow_goal text,
  feeding_style text,
  environment_notes text,
  health_status text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists feed_logs (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  fed_at timestamptz default now(),
  water_litres numeric,
  product_amounts jsonb not null default '{}'::jsonb,
  ec numeric,
  ppm numeric,
  ph numeric,
  runoff_ph numeric,
  runoff_ec numeric,
  runoff_amount numeric,
  notes text,
  plant_response text,
  photo_url text,
  journal_entry_id uuid
);

create table if not exists reminders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  grow_id uuid references grows(id) on delete cascade,
  type text,
  due_at timestamptz,
  title text,
  body text,
  completed_at timestamptz
);

create table if not exists product_inventory (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  product_id text references products(id),
  bottle_size_ml numeric,
  amount_remaining_ml numeric,
  usage_per_feed_ml numeric,
  estimated_days_left int,
  estimated_reorder_date date,
  low_stock_warning boolean default false
);

-- Indexes for common queries
create index if not exists idx_grows_user_id on grows(user_id);
create index if not exists idx_feed_logs_grow_id on feed_logs(grow_id);
create index if not exists idx_reminders_user_id on reminders(user_id);
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);
create index if not exists idx_product_inventory_user_id on product_inventory(user_id);
