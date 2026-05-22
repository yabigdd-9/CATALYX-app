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
    positioning: 'Tracking and basic product guidance.',
    limits: [
      'Basic grow tracker',
      'Basic feed calculator',
      'Limited photo and journal workflow',
      'Manual reminders',
    ],
    features: [
      'Product education',
      'Grow dashboard',
      'Feed logging',
      'Basic reminders',
    ],
    bestFor: 'Trying the app and keeping simple grow records.',
  },
  {
    key: 'professional_monthly',
    name: 'Catalyx Professional Monthly',
    shortName: 'Professional',
    price: '$19',
    billingCadence: 'per month',
    stripePlan: 'monthly',
    positioning: 'Full optimisation without annual commitment.',
    limits: [
      'Adaptive feed charts',
      'Catalyx Intelligence Engine',
      'Predictive warnings',
      'Weekly grow reviews',
    ],
    features: [
      'Runoff trend interpretation',
      'Recovery Mode',
      'Advanced analytics',
      'Inventory tracking',
      'Catalyx University',
      'Mistake prevention prompts',
    ],
    bestFor: 'Active growers who want guided decisions every week.',
  },
  {
    key: 'professional_yearly',
    name: 'Catalyx Professional Yearly',
    shortName: 'Professional Yearly',
    price: '$190',
    billingCadence: 'per year',
    stripePlan: 'yearly',
    positioning: 'Same Pro access with two months saved.',
    limits: [
      'Everything in monthly',
      'Annual discount',
      'Priority feature access',
      'Export-ready grow history',
    ],
    features: [
      'Compare My Grow',
      'Outcome forecasting',
      'Professional grow reports',
      'Advanced review history',
      'Priority release access',
      'Full analytics archive',
    ],
    bestFor: 'Committed growers running Catalyx as their cultivation OS.',
  },
]

export const proFeatureMatrix = [
  ['Grow dashboard', 'Included', 'Included'],
  ['Feed calculator', 'Basic', 'Adaptive by stage, medium, runoff, and stress'],
  ['Feed charts', 'Static guidance', 'Full adaptive logic'],
  ['Recommendations', 'General prompts', 'Evidence-based next action'],
  ['Warnings', 'Manual review', 'Predictive mistake prevention'],
  ['Weekly reviews', 'Not included', 'Included'],
  ['Exports', 'Limited', 'Professional reports'],
  ['Inventory', 'Basic shelf', 'Usage and low-stock planning'],
] as const

export function getSubscriptionPlan(key: SubscriptionPlanKey = 'free') {
  return subscriptionPlans.find((plan) => plan.key === key) ?? subscriptionPlans[0]
}

export function isProfessionalPlan(key: SubscriptionPlanKey) {
  return key === 'professional_monthly' || key === 'professional_yearly'
}
