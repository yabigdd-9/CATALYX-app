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

create table if not exists product_orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  customer_email text,
  product_ids text,
  order_lines jsonb not null default '[]'::jsonb,
  amount_total numeric,
  subtotal_cents int default 0,
  shipping_cents int default 0,
  automatic_tax_cents int default 0,
  store_credit_applied_cents int default 0,
  refunded_amount_cents int default 0,
  adjusted_amount_cents int default 0,
  reward_credit_status text default 'none',
  reward_checkout_state jsonb not null default '{}'::jsonb,
  currency text,
  status text,
  created_at timestamptz default now()
);

create table if not exists cx_reward_wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references users(id) on delete cascade,
  balance_cx int not null default 0,
  tier text not null default 'free',
  store_credit_balance_cents int not null default 0,
  pending_store_credit_cents int not null default 0,
  lifetime_store_credit_earned_cents int not null default 0,
  lifetime_store_credit_redeemed_cents int not null default 0,
  legacy_rewards_imported_at timestamptz,
  last_synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cx_reward_redemptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  reward_id text not null,
  reward_title text,
  reward_kind text not null default 'store_credit',
  redemption_key text unique,
  cx_cost int not null default 0,
  credit_cents int not null default 0,
  tier_at_issue text not null default 'free',
  status text not null default 'issued',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  product_order_id uuid references product_orders(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cx_reward_ledger (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  wallet_id uuid references cx_reward_wallets(id) on delete set null,
  redemption_id uuid references cx_reward_redemptions(id) on delete set null,
  product_order_id uuid references product_orders(id) on delete set null,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  event_type text not null,
  source text not null,
  status text not null default 'posted',
  points_delta int not null default 0,
  store_credit_delta_cents int not null default 0,
  currency text not null default 'nzd',
  title text,
  detail text,
  metadata jsonb not null default '{}'::jsonb,
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

create table if not exists plants (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  tent_id uuid references grow_tents(id) on delete set null,
  name text,
  strain_name text,
  current_stage text,
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
  low_stock_warning boolean default false,
  reorder_threshold_days int default 10,
  last_used_at timestamptz default now()
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
  dli numeric,
  note text
);

create table if not exists grow_exports (
  id uuid primary key default uuid_generate_v4(),
  grow_id uuid references grows(id) on delete cascade,
  export_type text,
  file_url text,
  status text default 'queued',
  created_at timestamptz default now()
);

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
