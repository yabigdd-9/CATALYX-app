import { authIsConfigured } from '@/lib/auth'
import { verifyRlsHardening } from '@/lib/rls-verify'
import { getStripeLaunchProfile, getStripeSiteUrlKind, stripeConfig, stripeLaunchChecks } from '@/lib/stripe'

export type LaunchCheck = {
  area: string
  label: string
  ok: boolean
  status: 'ready' | 'setup' | 'stripe' | 'manual'
  action: string
}

function statusWhen(ok: boolean, pending: LaunchCheck['status']): LaunchCheck['status'] {
  return ok ? 'ready' : pending
}

export async function getLaunchChecks(): Promise<LaunchCheck[]> {
  const rlsReady = await verifyRlsHardening()
  const siteUrl = stripeConfig.siteUrl
  const productionUrlReady = getStripeSiteUrlKind(siteUrl) === 'production'
  const adminAccessReady = Boolean(process.env.CATALYX_ADMIN_EMAILS || process.env.SUPABASE_ADMIN_USER_ID)
  const aiReady = Boolean(process.env.OPENAI_API_KEY)
  const webPushReady = Boolean(process.env.WEB_PUSH_PUBLIC_KEY && process.env.WEB_PUSH_PRIVATE_KEY)
  const indexesReady = process.env.SUPABASE_INDEXES_APPLIED === 'true'
  const leakedPasswordProtectionReady = process.env.SUPABASE_LEAKED_PASSWORD_PROTECTION_ENABLED === 'true'
  const stripeLaunch = getStripeLaunchProfile()

  return [
    {
      area: 'Deployment',
      label: 'Production site URL',
      ok: productionUrlReady,
      status: statusWhen(productionUrlReady, 'setup'),
      action: productionUrlReady
        ? `Production site URL is set to ${siteUrl}.`
        : 'Set NEXT_PUBLIC_SITE_URL to the deployed HTTPS domain before testing auth, Stripe redirects, PWA install, and emails.',
    },
    {
      area: 'Supabase',
      label: 'Client auth keys configured',
      ok: authIsConfigured,
      status: statusWhen(authIsConfigured, 'setup'),
      action: 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    },
    {
      area: 'Supabase',
      label: 'Service role configured',
      ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      status: statusWhen(Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), 'setup'),
      action: 'Set SUPABASE_SERVICE_ROLE_KEY for webhooks/admin server operations only.',
    },
    {
      area: 'Admin',
      label: 'Admin allowlist configured',
      ok: adminAccessReady,
      status: statusWhen(adminAccessReady, 'setup'),
      action: 'Set CATALYX_ADMIN_EMAILS to your admin email, or assign app_metadata.role = admin in Supabase Auth.',
    },
    {
      area: 'Auth',
      label: 'Leaked-password protection enabled',
      ok: leakedPasswordProtectionReady,
      status: statusWhen(leakedPasswordProtectionReady, 'manual'),
      action: leakedPasswordProtectionReady
        ? 'Supabase leaked-password protection is marked as enabled.'
        : 'Enable leaked-password protection in Supabase Auth password security, then set SUPABASE_LEAKED_PASSWORD_PROTECTION_ENABLED=true.',
    },
    {
      area: 'Supabase',
      label: 'RLS hardening ready',
      ok: rlsReady,
      status: statusWhen(rlsReady, 'setup'),
      action: rlsReady
        ? 'RLS verified (anon blocked from users, catalogue readable). Re-run Supabase security advisors after schema changes.'
        : 'Run supabase/rls-policies.sql in the Supabase SQL Editor (after schema + seed). Set SUPABASE_RLS_APPLIED=true to skip remote check.',
    },
    {
      area: 'Supabase',
      label: 'Performance indexes applied',
      ok: indexesReady,
      status: statusWhen(indexesReady, 'setup'),
      action: indexesReady
        ? 'Foreign-key indexes are marked as applied. Re-run Supabase performance advisors after production data starts accumulating.'
        : 'Run supabase/indexes.sql in the Supabase SQL Editor after schema + RLS, then set SUPABASE_INDEXES_APPLIED=true.',
    },
    {
      area: 'PWA',
      label: 'Manifest and service worker present',
      ok: true,
      status: 'ready',
      action: 'Run iOS/Android install QA on the deployed production URL.',
    },
    {
      area: 'PWA',
      label: 'Server push keys',
      ok: webPushReady,
      status: statusWhen(webPushReady, 'setup'),
      action: webPushReady
        ? 'Web Push keys are configured for future server-scheduled notifications.'
        : 'Local/PWA notifications work. Add WEB_PUSH_PUBLIC_KEY and WEB_PUSH_PRIVATE_KEY before implementing server cron push.',
    },
    ...stripeLaunchChecks.map(([label, ok, action]) => ({
      area: 'Stripe',
      label,
      ok,
      status: statusWhen(ok, 'stripe'),
      action,
    })),
    {
      area: 'Stripe',
      label: 'Production handoff state',
      ok: stripeLaunch.productionReady,
      status: statusWhen(stripeLaunch.productionReady, 'stripe'),
      action: stripeLaunch.productionReady
        ? stripeLaunch.summary
        : stripeLaunch.blockers.length
          ? `Remaining production blockers: ${stripeLaunch.blockers.map((blocker) => blocker.label).join('; ')}.`
          : stripeLaunch.summary,
    },
    {
      area: 'Stripe',
      label: 'Webhook persistence',
      ok: stripeLaunch.webhookPersistenceReady,
      status: statusWhen(stripeLaunch.webhookPersistenceReady, 'stripe'),
      action: stripeLaunch.webhookPersistenceReady
        ? 'Stripe webhook writes can persist because both STRIPE_WEBHOOK_SECRET and SUPABASE_SERVICE_ROLE_KEY are configured.'
        : 'Set STRIPE_WEBHOOK_SECRET and SUPABASE_SERVICE_ROLE_KEY so checkout confirmations can persist subscription and product-order writes.',
    },
    {
      area: 'Stripe',
      label: 'Product-order persistence',
      ok: stripeLaunch.productOrderPersistenceReady,
      status: statusWhen(stripeLaunch.productOrderPersistenceReady, 'stripe'),
      action: stripeLaunch.productOrderPersistenceReady
        ? 'Paid /cart checkouts can upsert product_orders rows with order_lines and payment metadata.'
        : 'Finish the Stripe env and Supabase service-role wiring before relying on live product checkout and order fulfillment.',
    },
    {
      area: 'Stripe',
      label: 'Product checkout live flip',
      ok: stripeLaunch.productionReady,
      status: statusWhen(stripeLaunch.productionReady, 'stripe'),
      action: stripeLaunch.productionReady
        ? 'One-time product checkout is configured for live Stripe. Verify a real order from /cart and confirm /api/stripe/checkout-status returns persisted true with the saved order_lines summary.'
        : 'Product checkout still depends on the remaining Stripe production blockers. Clear them in /stripe-setup before live order testing.',
    },
    {
      area: 'AI',
      label: 'Live AI configured',
      ok: aiReady,
      status: statusWhen(aiReady, 'setup'),
      action: aiReady
        ? 'OPENAI_API_KEY is configured; Copilot can use live AI with rule fallback.'
        : 'AI remains available through the rule engine. Set OPENAI_API_KEY for live model responses.',
    },
    {
      area: 'Exports',
      label: 'Branded PDF routes',
      ok: true,
      status: 'ready',
      action: 'Open /api/export/grow-report and /api/export/timeline-report to verify downloads in the deployed browser.',
    },
    {
      area: 'QA',
      label: 'Mobile return-flow coverage',
      ok: false,
      status: 'manual',
      action: 'Playwright covers the cancel and success return flow in tests/stripe-cart-return.spec.ts, but the deployed mobile browser still needs a live /cart return QA pass.',
    },
    {
      area: 'QA',
      label: 'Route/form/mobile QA',
      ok: false,
      status: 'manual',
      action: 'Run the manual QA checklist in docs/launch-checklist.md before opening live traffic.',
    },
  ]
}
