# Catalyx Labs Implementation Plan

## Architecture

- `lib/catalyx.ts` is the single source of truth for official products, stage logic, dose rules, protocols, lessons, mock grow data, reminders, and recommendation rules.
- `lib/auth.ts` and `components/AuthProvider.tsx` provide Supabase Auth when env vars are present and mock local auth when keys are missing.
- Phase 1 app routes focus on the daily grow loop: authenticate, review dashboard, manage grows, calculate feed, log feed, understand products, and manage reminders.
- Supabase schema is already planned for the full ecosystem in `supabase/schema.sql`, even though Phase 1 uses local/mock persistence for fast usability.
- Stripe, Professional features, University, inventory, export, and admin pages remain scaffolded for later phases, but navigation now prioritises the Phase 1 core.

## Build Priority

### Phase 1 — Core App

- Authentication
- Dashboard
- Product system
- Grow tracker
- Feed calculator
- Feed logging
- Basic product catalogue
- Basic reminders

### Phase 2 — Professional Features

- Subscription system
- Locked Professional Mode
- Catalyx Intelligence Engine
- Mistake prevention
- Smart recommendations
- Weekly Grow Review
- Adaptive feed charts
- Advanced analytics

### Phase 3 — Brand Ecosystem

- Catalyx University
- Lab Notes
- Protocols and recipes
- Product education
- My Shelf inventory
- Export grow report
- Website/store pages

### Phase 4 — Polish

- Mobile PWA polish
- Animations
- Loading states
- Empty states
- Error handling
- Admin panel polish
- Final design pass

