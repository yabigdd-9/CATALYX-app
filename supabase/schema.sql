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

create table if not exists plants (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  name text,
  strain_name text,
  health_status text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists daily_checkins (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  checked_at timestamptz default now(),
  leaf_colour text,
  droop_level int,
  growth_speed text,
  stress_level int,
  environment_stability int,
  pest_concern text,
  overall_plant_feel text,
  photo_url text
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

create table if not exists photos (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  url text not null,
  stage text,
  tag text,
  notes text,
  captured_at timestamptz default now()
);

create table if not exists products (
  id text primary key,
  name text not null,
  purpose text,
  colour_theme text,
  accent text,
  education jsonb default '{}'::jsonb,
  created_at timestamptz default now()
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

create table if not exists feed_chart (
  id uuid primary key default uuid_generate_v4(),
  mode text not null,
  medium text not null,
  stage text not null,
  product_id text references products(id),
  beginner_ml_l numeric,
  standard_ml_l numeric,
  professional_ml_l numeric,
  adaptive_rules jsonb default '{}'::jsonb
);

create table if not exists protocols (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  audience text,
  products_used text[],
  growth_stage text,
  expected_benefit text,
  beginner_version text,
  professional_version text,
  warnings text
);

create table if not exists recipes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  products_used text[],
  stage text,
  guidance text,
  warnings text
);

create table if not exists tips (
  id uuid primary key default uuid_generate_v4(),
  product_id text references products(id),
  title text,
  body text,
  pro_only boolean default false
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

create table if not exists university_lessons (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text,
  pro_only boolean default false,
  sort_order int default 0
);

create table if not exists lab_notes (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text,
  sort_order int default 0
);

create table if not exists grow_scores (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  score_type text,
  value int,
  breakdown jsonb default '{}'::jsonb,
  calculated_at timestamptz default now()
);

create table if not exists weekly_reviews (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  week_start date,
  grow_score int,
  strengths text[],
  issues text[],
  changes_from_last_week text[],
  recommendations text[],
  product_usage_summary jsonb default '{}'::jsonb,
  photo_progress_summary text,
  upcoming_stage_changes text
);

create table if not exists recommendations (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  title text,
  action text,
  why text,
  confidence text,
  created_at timestamptz default now()
);

create table if not exists warnings (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  warning_type text,
  severity text,
  message text,
  why text,
  resolved_at timestamptz
);

create table if not exists feature_flags (
  id uuid primary key default uuid_generate_v4(),
  feature_key text unique not null,
  plan_required text default 'free',
  enabled boolean default true
);

create table if not exists admin_announcements (
  id uuid primary key default uuid_generate_v4(),
  title text,
  body text,
  published boolean default false,
  created_at timestamptz default now()
);

create table if not exists environment_logs (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  logged_at timestamptz default now(),
  temperature numeric,
  humidity numeric,
  vpd numeric,
  water_temperature numeric,
  reservoir_temperature numeric,
  runoff_amount numeric,
  light_intensity numeric,
  ppfd numeric,
  dli numeric
);

create table if not exists grow_exports (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  export_type text,
  file_url text,
  status text default 'queued',
  created_at timestamptz default now()
);

