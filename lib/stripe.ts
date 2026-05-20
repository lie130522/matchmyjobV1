import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const PLANS = {
  starter: { name: 'Starter', price: 2, attempts: 25, description: '25 AI attempts per month' },
  pro:     { name: 'Pro',     price: 5, attempts: 60, description: '60 AI attempts per month' },
  expert:  { name: 'Expert',  price: 10, attempts: 130, description: '130 AI attempts per month' },
} as const

export type PaidPlan = keyof typeof PLANS
