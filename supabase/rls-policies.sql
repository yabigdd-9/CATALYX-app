-- Catalyx Labs production RLS (idempotent — safe to re-run in SQL Editor).
-- Requires schema.sql + seed.sql applied first.
-- Service-role routes (Stripe webhooks, /api/admin/*) bypass RLS via SUPABASE_SERVICE_ROLE_KEY.

-- Ownership helper indexes (speed up policy subqueries)
create index if not exists idx_users_auth_user_id on users(auth_user_id);

-- Enable RLS on all public tables
alter table users enable row level security;
alter table subscriptions enable row level security;
alter table product_orders enable row level security;
alter table cx_reward_wallets enable row level security;
alter table cx_reward_redemptions enable row level security;
alter table cx_reward_ledger enable row level security;
alter table user_plan enable row level security;
alter table grows enable row level security;
alter table grow_rooms enable row level security;
alter table grow_tents enable row level security;
alter table plants enable row level security;
alter table daily_checkins enable row level security;
alter table feed_logs enable row level security;
alter table photos enable row level security;
alter table journal_entries enable row level security;
alter table products enable row level security;
alter table product_inventory enable row level security;
alter table feed_chart enable row level security;
alter table protocols enable row level security;
alter table recipes enable row level security;
alter table tips enable row level security;
alter table reminders enable row level security;
alter table university_lessons enable row level security;
alter table lab_notes enable row level security;
alter table grow_scores enable row level security;
alter table weekly_reviews enable row level security;
alter table recommendations enable row level security;
alter table warnings enable row level security;
alter table feature_flags enable row level security;
alter table admin_announcements enable row level security;
alter table environment_logs enable row level security;
alter table grow_exports enable row level security;
alter table customer_profiles enable row level security;
alter table support_tickets enable row level security;
alter table support_ticket_messages enable row level security;
alter table customer_documents enable row level security;
alter table portal_notifications enable row level security;
alter table portal_events enable row level security;

-- Data API: expose only the intended tables to anon/authenticated roles.
-- Service-role routes (webhooks/admin) retain full access server-side.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

-- Keep the public schema reachable through Supabase Data API/PostgREST.
-- Without this, clients fail with PGRST106: "Invalid schema: public".
alter role authenticator set pgrst.db_schemas = 'public, api, graphql_public';

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

grant select on products, feed_chart, protocols, recipes, tips, university_lessons, lab_notes, feature_flags, admin_announcements to anon;
grant select on products, feed_chart, protocols, recipes, tips, university_lessons, lab_notes, feature_flags, admin_announcements to authenticated;

grant select, insert, update on users to authenticated;
grant select on subscriptions, product_orders, cx_reward_wallets, cx_reward_redemptions, cx_reward_ledger, user_plan to authenticated;
grant select, insert, update, delete on grows, grow_rooms, grow_tents, plants, daily_checkins, feed_logs, photos, journal_entries, product_inventory, reminders, grow_scores, weekly_reviews, recommendations, warnings, environment_logs, grow_exports to authenticated;
grant select, insert, update on customer_profiles, support_tickets to authenticated;
grant select, insert on support_ticket_messages to authenticated;
grant select, update on portal_notifications to authenticated;
grant select, insert on portal_events to authenticated;
grant select on customer_documents to authenticated;

-- users
drop policy if exists "users own row select" on users;
drop policy if exists "users own row insert" on users;
drop policy if exists "users own row update" on users;
create policy "users own row select" on users for select to authenticated using ((select auth.uid()) = auth_user_id);
create policy "users own row insert" on users for insert to authenticated with check ((select auth.uid()) = auth_user_id);
create policy "users own row update" on users for update to authenticated using ((select auth.uid()) = auth_user_id) with check ((select auth.uid()) = auth_user_id);

-- subscriptions / user_plan (read-only for clients; webhooks write via service role)
drop policy if exists "subscriptions own select" on subscriptions;
drop policy if exists "product_orders own select" on product_orders;
drop policy if exists "reward wallets own select" on cx_reward_wallets;
drop policy if exists "reward redemptions own select" on cx_reward_redemptions;
drop policy if exists "reward ledger own select" on cx_reward_ledger;
drop policy if exists "user_plan own select" on user_plan;
create policy "subscriptions own select" on subscriptions for select to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "product_orders own select" on product_orders for select to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "reward wallets own select" on cx_reward_wallets for select to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "reward redemptions own select" on cx_reward_redemptions for select to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "reward ledger own select" on cx_reward_ledger for select to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "user_plan own select" on user_plan for select to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid())));

-- grows
drop policy if exists "grows own select" on grows;
drop policy if exists "grows own insert" on grows;
drop policy if exists "grows own update" on grows;
drop policy if exists "grows own delete" on grows;
create policy "grows own select" on grows for select to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "grows own insert" on grows for insert to authenticated with check (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "grows own update" on grows for update to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid()))) with check (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "grows own delete" on grows for delete to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid())));

-- rooms / tents
drop policy if exists "grow rooms own all" on grow_rooms;
drop policy if exists "grow tents own all" on grow_tents;
create policy "grow rooms own all" on grow_rooms for all to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid()))) with check (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "grow tents own all" on grow_tents for all to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid()))) with check (user_id in (select id from users where auth_user_id = (select auth.uid())));

-- plants
drop policy if exists "plants by grow owner select" on plants;
drop policy if exists "plants by grow owner insert" on plants;
drop policy if exists "plants by grow owner update" on plants;
drop policy if exists "plants by grow owner delete" on plants;
create policy "plants by grow owner select" on plants for select to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));
create policy "plants by grow owner insert" on plants for insert to authenticated with check (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));
create policy "plants by grow owner update" on plants for update to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid()))) with check (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));
create policy "plants by grow owner delete" on plants for delete to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));

-- grow-scoped child tables
drop policy if exists "daily_checkins by grow owner all" on daily_checkins;
drop policy if exists "feed_logs by grow owner all" on feed_logs;
drop policy if exists "photos by grow owner all" on photos;
drop policy if exists "journal_entries by grow owner all" on journal_entries;
drop policy if exists "grow_scores by grow owner all" on grow_scores;
drop policy if exists "weekly_reviews by grow owner all" on weekly_reviews;
drop policy if exists "recommendations by grow owner all" on recommendations;
drop policy if exists "warnings by grow owner all" on warnings;
drop policy if exists "environment_logs by grow owner all" on environment_logs;
drop policy if exists "grow_exports by grow owner all" on grow_exports;
create policy "daily_checkins by grow owner all" on daily_checkins for all to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid()))) with check (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));
create policy "feed_logs by grow owner all" on feed_logs for all to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid()))) with check (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));
create policy "photos by grow owner all" on photos for all to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid()))) with check (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));
create policy "journal_entries by grow owner all" on journal_entries for all to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid()))) with check (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));
create policy "grow_scores by grow owner all" on grow_scores for all to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid()))) with check (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));
create policy "weekly_reviews by grow owner all" on weekly_reviews for all to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid()))) with check (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));
create policy "recommendations by grow owner all" on recommendations for all to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid()))) with check (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));
create policy "warnings by grow owner all" on warnings for all to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid()))) with check (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));
create policy "environment_logs by grow owner all" on environment_logs for all to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid()))) with check (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));
create policy "grow_exports by grow owner all" on grow_exports for all to authenticated using (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid()))) with check (grow_id in (select grows.id from grows join users on users.id = grows.user_id where users.auth_user_id = (select auth.uid())));

-- user-scoped tables
drop policy if exists "reminders own all" on reminders;
drop policy if exists "product_inventory own all" on product_inventory;
create policy "reminders own all" on reminders for all to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid()))) with check (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "product_inventory own all" on product_inventory for all to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid()))) with check (user_id in (select id from users where auth_user_id = (select auth.uid())));

-- customer portal
drop policy if exists "customer profiles own all" on customer_profiles;
drop policy if exists "support tickets own all" on support_tickets;
drop policy if exists "support ticket messages own select" on support_ticket_messages;
drop policy if exists "support ticket messages own insert" on support_ticket_messages;
drop policy if exists "customer documents own select" on customer_documents;
drop policy if exists "portal notifications own all" on portal_notifications;
drop policy if exists "portal events own insert" on portal_events;
drop policy if exists "portal events own select" on portal_events;
drop policy if exists "customer profiles own select" on customer_profiles;
drop policy if exists "customer profiles own insert" on customer_profiles;
drop policy if exists "customer profiles own update" on customer_profiles;
drop policy if exists "support tickets own select" on support_tickets;
drop policy if exists "support tickets own insert" on support_tickets;
drop policy if exists "support tickets own update" on support_tickets;
drop policy if exists "portal notifications own select" on portal_notifications;
drop policy if exists "portal notifications own update" on portal_notifications;
create policy "customer profiles own select" on customer_profiles for select to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "customer profiles own insert" on customer_profiles for insert to authenticated with check (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "customer profiles own update" on customer_profiles for update to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid()))) with check (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "support tickets own select" on support_tickets for select to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "support tickets own insert" on support_tickets for insert to authenticated with check (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "support tickets own update" on support_tickets for update to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid()))) with check (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "support ticket messages own select" on support_ticket_messages for select to authenticated using (ticket_id in (select support_tickets.id from support_tickets join users on users.id = support_tickets.user_id where users.auth_user_id = (select auth.uid())) and internal = false);
create policy "support ticket messages own insert" on support_ticket_messages for insert to authenticated with check (ticket_id in (select support_tickets.id from support_tickets join users on users.id = support_tickets.user_id where users.auth_user_id = (select auth.uid())) and user_id in (select id from users where auth_user_id = (select auth.uid())) and author_role = 'customer' and internal = false);
create policy "customer documents own select" on customer_documents for select to authenticated using (published = true and (user_id in (select id from users where auth_user_id = (select auth.uid())) or user_id is null));
create policy "portal notifications own select" on portal_notifications for select to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "portal notifications own update" on portal_notifications for update to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid()))) with check (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "portal events own insert" on portal_events for insert to authenticated with check (user_id in (select id from users where auth_user_id = (select auth.uid())));
create policy "portal events own select" on portal_events for select to authenticated using (user_id in (select id from users where auth_user_id = (select auth.uid())));

-- public catalogue / education (anon read for marketing + signed-out browsing)
drop policy if exists "public products read" on products;
drop policy if exists "public feed_chart read" on feed_chart;
drop policy if exists "public protocols read" on protocols;
drop policy if exists "public recipes read" on recipes;
drop policy if exists "public tips read" on tips;
drop policy if exists "public tips read anon" on tips;
drop policy if exists "authenticated tips read" on tips;
drop policy if exists "public university read" on university_lessons;
drop policy if exists "public university read anon" on university_lessons;
drop policy if exists "authenticated university read" on university_lessons;
drop policy if exists "public lab notes read" on lab_notes;
drop policy if exists "public feature flags read" on feature_flags;
drop policy if exists "published announcements read" on admin_announcements;
create policy "public products read" on products for select to anon, authenticated using (true);
create policy "public feed_chart read" on feed_chart for select to anon, authenticated using (true);
create policy "public protocols read" on protocols for select to anon, authenticated using (true);
create policy "public recipes read" on recipes for select to anon, authenticated using (true);
create policy "public tips read anon" on tips for select to anon using (pro_only = false);
create policy "authenticated tips read" on tips for select to authenticated using (true);
create policy "public university read anon" on university_lessons for select to anon using (pro_only = false);
create policy "authenticated university read" on university_lessons for select to authenticated using (true);
create policy "public lab notes read" on lab_notes for select to anon, authenticated using (true);
create policy "public feature flags read" on feature_flags for select to anon, authenticated using (true);
create policy "published announcements read" on admin_announcements for select to anon, authenticated using (published = true);

-- Storage bucket for grow photos. Keep it public for simple CDN-backed timeline rendering.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('grow-photos', 'grow-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "grow photo objects own insert" on storage.objects;
drop policy if exists "grow photo objects own update" on storage.objects;
drop policy if exists "grow photo objects own delete" on storage.objects;
drop policy if exists "grow photo objects public read" on storage.objects;
create policy "grow photo objects public read" on storage.objects for select to anon, authenticated using (bucket_id = 'grow-photos');
create policy "grow photo objects own insert" on storage.objects for insert to authenticated with check (bucket_id = 'grow-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "grow photo objects own update" on storage.objects for update to authenticated using (bucket_id = 'grow-photos' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'grow-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "grow photo objects own delete" on storage.objects for delete to authenticated using (bucket_id = 'grow-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('customer-documents', 'customer-documents', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "customer document objects own read" on storage.objects;
drop policy if exists "customer document objects own insert" on storage.objects;
drop policy if exists "customer document objects own update" on storage.objects;
drop policy if exists "customer document objects own delete" on storage.objects;
create policy "customer document objects own read" on storage.objects for select to authenticated using (bucket_id = 'customer-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "customer document objects own insert" on storage.objects for insert to authenticated with check (bucket_id = 'customer-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "customer document objects own update" on storage.objects for update to authenticated using (bucket_id = 'customer-documents' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'customer-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "customer document objects own delete" on storage.objects for delete to authenticated using (bucket_id = 'customer-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- After applying: re-run Supabase security advisors in the dashboard.
