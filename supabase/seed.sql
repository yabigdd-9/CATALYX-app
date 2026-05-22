insert into products (id, name, purpose, colour_theme, accent) values
('ax-pro','A-X PRO','Base nutrient A','Acid / Lime Green','#c8f500'),
('bx-pro','B-X PRO','Base nutrient B','Deep Green','#1f8f4d'),
('micro-x','MICRO-X','Trace + micros','Electric Blue','#2ea8ff'),
('root-x','ROOT-X','Root stimulator','Cyan / Teal','#16d6c8'),
('vital-x','VITAL-X','Vitamins + stress support','Purple / Violet','#9a5cff'),
('pk-x','PK-X','Bloom booster','Orange','#ff8a1f'),
('ripen-x','RIPEN-X','Late flower finisher','Red','#ff3b45'),
('trace-x','TRACE-X','Trace mineral support','Yellow / Gold','#ffd23f'),
('iron-x','IRON-X','Iron supplement','Gunmetal / Silver','#a8b3bd'),
('flush-x','FLUSH-X','Flush solution','Aqua / Bright Blue','#33d9ff')
on conflict (id) do update set name = excluded.name, purpose = excluded.purpose, colour_theme = excluded.colour_theme, accent = excluded.accent;

insert into feed_chart (mode, medium, stage, product_id, beginner_ml_l, standard_ml_l, professional_ml_l, adaptive_rules) values
('standard','coco','seedling','root-x',0.5,0.8,1.2,'{"safe_if_stressed": true}'),
('standard','coco','seedling','vital-x',0.3,0.6,1.0,'{"safe_if_stressed": true}'),
('standard','coco','vegetative','ax-pro',1.2,1.8,2.4,'{"pair_with": "bx-pro"}'),
('standard','coco','vegetative','bx-pro',1.2,1.8,2.4,'{"pair_with": "ax-pro"}'),
('standard','coco','vegetative','micro-x',0.2,0.4,0.7,'{"avoid_with": "trace-x"}'),
('standard','coco','vegetative','root-x',0.5,0.8,1.2,'{"transplant_support": true}'),
('standard','coco','early-flower','pk-x',0.3,0.5,0.9,'{"introduce_gradually": true}'),
('standard','coco','early-flower','trace-x',0.15,0.3,0.5,'{"trace_support": true}'),
('standard','coco','mid-flower','pk-x',0.3,0.5,0.9,'{"monitor_runoff_ec": true}'),
('standard','coco','mid-flower','vital-x',0.3,0.6,1.0,'{"stress_support": true}'),
('standard','coco','late-flower','ripen-x',0.4,0.7,1.1,'{"reduce_nitrogen_pressure": true}'),
('standard','coco','late-flower','trace-x',0.15,0.3,0.5,'{"trace_support": true}'),
('standard','coco','flush','flush-x',0.5,0.8,1.2,'{"track_runoff_decline": true}');

insert into protocols (name, audience, products_used, growth_stage, expected_benefit, beginner_version, professional_version, warnings) values
('Starter Protocol','Seedlings and transplants',array['ROOT-X','VITAL-X'],'Seedling','Faster establishment and lower transplant stress','Low dose, stable pH','Tighter monitoring and faster transition','Avoid high EC in seedlings'),
('Performance Protocol','Dialed-in standard runs',array['A-X PRO','B-X PRO','MICRO-X','PK-X'],'Vegetative to Mid Flower','Balanced momentum with controlled bloom support','Use standard chart','Use adaptive EC tuning','Monitor runoff trend'),
('Recovery Protocol','Stressed plants or root-zone instability',array['VITAL-X','IRON-X','FLUSH-X'],'Any corrective window','Stabilise pH, runoff, and plant response','Simplify feeds','Diagnose trend by logs','Do not stack aggressive additives')
on conflict do nothing;

insert into university_lessons (title, body, pro_only, sort_order) values
('Nutrient fundamentals','Base nutrition first, additive pressure second.',false,1),
('pH basics','pH controls nutrient availability and can mimic deficiencies when unstable.',false,2),
('EC / ppm explained','EC indicates feed strength and trend direction.',false,3),
('How to read runoff','Runoff reveals root-zone accumulation and drift.',true,4),
('Professional feed tuning','Adjust by trend, not single readings.',true,5)
on conflict do nothing;

insert into lab_notes (title, body, sort_order) values
('Formulation philosophy','Build predictable base nutrition before adding performance pressure.',1),
('Why consistency matters','Stable logs make each recommendation more confident.',2),
('Why runoff trends matter','Runoff shows what the root zone is becoming, not only what entered the pot.',3)
on conflict do nothing;

insert into feature_flags (feature_key, plan_required, enabled) values
('basic_grow_tracker','free',true),
('basic_feed_calculator','free',true),
('full_catalyx_intelligence','professional',true),
('weekly_grow_reviews','professional',true),
('predictive_warnings','professional',true),
('advanced_analytics','professional',true),
('inventory_tracking','professional',true),
('export_grow_report','professional',true),
('recovery_mode','professional',true)
on conflict (feature_key) do update set plan_required = excluded.plan_required, enabled = excluded.enabled;

-- Core user and grow seeds for local/prod test data
insert into users (id, auth_user_id, email, full_name, grow_style, experience_level, grow_goals, subscription_status)
values
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','test@grow.os','Test Grower','coco','standard','Quality first','free')
on conflict (email) do update set full_name = excluded.full_name, grow_style = excluded.grow_style, experience_level = excluded.experience_level, grow_goals = excluded.grow_goals, subscription_status = excluded.subscription_status;

insert into user_plan (user_id, plan, feature_access, updated_at)
values
('00000000-0000-0000-0000-000000000001','free','{"intelligence": false, "weekly_reviews": false, "predictive_warnings": false}', now())
on conflict (user_id) do update set plan = excluded.plan, feature_access = excluded.feature_access, updated_at = excluded.updated_at;

insert into grows (id, user_id, name, strain_name, start_date, current_stage, medium, light_schedule, grow_goal, feeding_style, environment_notes, health_status, notes)
values
('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000001','Catalyx Test Grow','Blue Dream','2026-05-01','vegetative','coco','18/6','High quality','Standard feed','Stable environment and strong root tone.','Healthy canopy','Mock grow for testing')
on conflict (id) do update set user_id = excluded.user_id, name = excluded.name, strain_name = excluded.strain_name, start_date = excluded.start_date, current_stage = excluded.current_stage, medium = excluded.medium, light_schedule = excluded.light_schedule, grow_goal = excluded.grow_goal, feeding_style = excluded.feeding_style, environment_notes = excluded.environment_notes, health_status = excluded.health_status, notes = excluded.notes;

insert into reminders (id, user_id, grow_id, type, due_at, title, body, completed_at)
values
('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','basic',now() + interval '2 days','Check root-zone moisture','Inspect root-zone moisture and runoff EC.','')
on conflict (id) do update set user_id = excluded.user_id, grow_id = excluded.grow_id, type = excluded.type, due_at = excluded.due_at, title = excluded.title, body = excluded.body, completed_at = excluded.completed_at;

insert into subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end)
values
('00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000001','cust_test_123','sub_test_123','free','inactive',now() + interval '30 days')
on conflict (stripe_subscription_id) do update set user_id = excluded.user_id, stripe_customer_id = excluded.stripe_customer_id, plan = excluded.plan, status = excluded.status, current_period_end = excluded.current_period_end;

insert into product_inventory (id, user_id, product_id, bottle_size_ml, amount_remaining_ml, usage_per_feed_ml, estimated_days_left, estimated_reorder_date, low_stock_warning)
values
('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000001','ax-pro',1000,800,20,40,now()::date + interval '40 days', false)
on conflict (id) do update set user_id = excluded.user_id, product_id = excluded.product_id, bottle_size_ml = excluded.bottle_size_ml, amount_remaining_ml = excluded.amount_remaining_ml, usage_per_feed_ml = excluded.usage_per_feed_ml, estimated_days_left = excluded.estimated_days_left, estimated_reorder_date = excluded.estimated_reorder_date, low_stock_warning = excluded.low_stock_warning;

