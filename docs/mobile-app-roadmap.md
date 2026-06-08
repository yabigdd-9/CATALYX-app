# Catalyx Labs Mobile App Roadmap

This project is set up to move from web app to installable PWA and then to native app-store builds.

## Architecture

- Next.js app: main Catalyx Labs interface and server routes
- Supabase backend: auth, database, storage, grow data
- Stripe subscriptions: web checkout, portal, webhooks
- PWA support: installable mobile web experience
- Capacitor wrapper: iOS and Android native shell
- App Store and Google Play: final distribution channels

## Current Mobile Strategy

The app uses Capacitor with a small `mobile-shell` fallback page. For real mobile builds, point the native shell at the deployed Next.js app:

```bash
CAPACITOR_SERVER_URL=https://your-production-domain.com npm run cap:sync
```

This keeps API routes, Stripe webhooks, Supabase auth redirects, and server-rendered pages working from one production deployment.

For immediate mobile use, ship the PWA/home-screen install first:

- iPhone: open the live site in Safari and use `Add to Home Screen`
- Android: open the live site in Chrome and use `Install app`
- User-facing install instructions now live at `/install`

## Local Commands

```bash
npm run build
npm run cap:sync
npm run cap:add:android
npm run cap:add:ios
npm run cap:open:android
npm run cap:open:ios
```

## Store Requirements Later

- Apple Developer account
- Google Play Developer account
- Production domain
- Privacy policy and terms URLs
- App screenshots
- App icons and splash assets
- Age/content rating
- Subscription/payment policy decision

## Payment Note

Stripe is correct for the web app. For iOS and Android, app-store rules may require Apple In-App Purchase or Google Play Billing for digital subscriptions. Decide this before store submission.
