export type SubscriptionPlanKey = 'free' | 'professional_monthly' | 'professional_yearly'

export type SubscriptionPlan = {
  key: SubscriptionPlanKey
  name: string
  shortName: string
  price: string
  billingCadence: string
  stripePlan?: 'monthly' | 'yearly'
  positioning: string
  limits: string[]
  features: string[]
  bestFor: string
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    key: 'free',
    name: 'Free Plan',
    shortName: 'Free',
    price: '$0',
    billingCadence: 'No card required',
    positioning: 'Essential tracking and safe feeding basics.',
    limits: [
      'Basic grow tracker',
      'Basic feed reminders',
      'Basic product info',
      'Limited photo uploads',
      'Basic feed calculator',
    ],
    features: [
      'Grow dashboard',
      'Feed logging',
      'Catalyx AI Copilot (basic)',
      'Product catalogue preview',
      'Manual reminders',
    ],
    bestFor: 'Trying the app and keeping simple grow records.',
  },
  {
    key: 'professional_monthly',
    name: 'Catalyx Pro Monthly',
    shortName: 'Catalyx Pro',
    price: '$19.99',
    billingCadence: 'per month',
    stripePlan: 'monthly',
    positioning: 'Premium grow assistant — charts, guides, analytics, and exports.',
    limits: [
      'Advanced feed charts',
      'Full product education guides',
      'EC / pH / runoff analytics',
      'Plant photo timeline',
      'Inventory and usage tracking',
      'Export grow journal as PDF',
    ],
    features: [
      'Stage-based recommendations',
      'Deficiency and troubleshooting guides',
      'Custom reminders',
      'Weekly Grow Review',
      'Recovery Playbooks',
      'Outcome forecasting',
      'What-to-do-next after each feed',
    ],
    bestFor: 'Active growers who want a guided decision partner every week.',
  },
  {
    key: 'professional_yearly',
    name: 'Catalyx Pro Yearly',
    shortName: 'Pro Yearly',
    price: '$199',
    billingCadence: 'per year',
    stripePlan: 'yearly',
    positioning: 'Same Catalyx Pro access with discounted yearly pricing.',
    limits: [
      'Everything in Catalyx Pro Monthly',
      'Discounted yearly pricing',
      'Full analytics archive',
      'Compare My Grow history',
      'Professional report builder',
    ],
    features: [
      'Advanced grow tips',
      'Product-specific Pro guides',
      'Root-Zone Risk Radar',
      'Dose Change Simulator',
      'Priority feature access',
      'Full Catalyx University depth',
    ],
    bestFor: 'Committed growers running Catalyx as their cultivation OS.',
  },
]

export const proFeatureMatrix = [
  ['Grow tracker', 'Basic', 'Full timeline and stage intelligence'],
  ['Feed reminders', 'Basic calendar', 'Custom reminder templates'],
  ['Product info', 'Catalogue preview', 'Full Pro product guides per bottle'],
  ['Photo uploads', 'Limited timeline', 'Plant photo timeline by stage'],
  ['Feed calculator', 'Basic ml/L', 'Adaptive by stage, medium, runoff, stress'],
  ['Feed charts', 'Preview only', 'Full adaptive charts'],
  ['EC / pH / runoff', 'Basic warnings', 'Trend analytics and salt-load alerts'],
  ['After-feed advice', 'Generic safety note', 'What to do next with confidence'],
  ['Inventory', 'Add to shelf', 'Usage, days left, reorder timing'],
  ['University', 'Core lessons', 'Diagnostics, deficiency, flower steering'],
  ['Weekly review', 'Preview', 'Full Monday grow report'],
  ['Export journal', 'Not included', 'PDF grow report'],
] as const

export function getSubscriptionPlan(key: SubscriptionPlanKey = 'free') {
  return subscriptionPlans.find((plan) => plan.key === key) ?? subscriptionPlans[0]
}

export function isProfessionalPlan(key: SubscriptionPlanKey) {
  return key === 'professional_monthly' || key === 'professional_yearly'
}
