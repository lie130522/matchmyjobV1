'use client'

import { Check, Zap, X } from 'lucide-react'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Starter',
    price: '$2',
    period: '/mo',
    attempts: '25 attempts/month',
    features: ['Unlimited CV storage', 'All 4 AI features', 'Email support'],
    href: '/pricing?plan=starter',
    accent: 'border-[#1B4FFF] text-[#1B4FFF]',
    cta: 'bg-white border border-[#1B4FFF] text-[#1B4FFF] hover:bg-[#EEF2FF]',
  },
  {
    name: 'Pro',
    price: '$5',
    period: '/mo',
    attempts: '60 attempts/month',
    features: ['Unlimited CV storage', 'All 4 AI features', 'Priority support'],
    href: '/pricing?plan=pro',
    accent: 'border-[#1B4FFF] bg-[#1B4FFF] text-white',
    cta: 'bg-[#1B4FFF] text-white hover:bg-[#1240D6]',
    badge: 'Most popular',
  },
  {
    name: 'Expert',
    price: '$10',
    period: '/mo',
    attempts: '130 attempts/month',
    features: ['Unlimited CV storage', 'All 4 AI features', 'Priority + API access'],
    href: '/pricing?plan=expert',
    accent: 'border-[#7C3AED] text-[#7C3AED]',
    cta: 'bg-white border border-[#7C3AED] text-[#7C3AED] hover:bg-[#F5F3FF]',
  },
]

interface Props {
  onClose?: () => void
}

export function UpgradeModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-[#0F172A] px-8 py-6 text-center">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-[#1B4FFF]" fill="#1B4FFF" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">You&apos;re out of attempts</h2>
          <p className="text-[#94A3B8] text-[15px]">
            Upgrade to keep optimizing your job search with AI.
          </p>
        </div>

        {/* Plans */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border-2 p-5 flex flex-col ${plan.accent}`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B4FFF] text-white text-[11px] font-semibold px-3 py-0.5 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="mb-3">
                <p className={`text-[13px] font-semibold uppercase tracking-wide mb-0.5 ${plan.name === 'Pro' ? 'text-white/70' : 'opacity-60'}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className={`text-[13px] ${plan.name === 'Pro' ? 'text-white/60' : 'opacity-50'}`}>{plan.period}</span>
                </div>
                <p className={`text-[12px] mt-0.5 font-medium ${plan.name === 'Pro' ? 'text-white/80' : 'opacity-70'}`}>
                  {plan.attempts}
                </p>
              </div>

              <ul className="flex flex-col gap-1.5 mb-4 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-[12px]">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className={plan.name === 'Pro' ? 'text-white/80' : 'opacity-70'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center py-2 rounded-lg text-[13px] font-semibold transition-colors ${plan.cta}`}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-[12px] text-[#94A3B8] pb-5 px-6">
          No auto-renewal without confirmation. Cancel anytime from Settings.
        </p>
      </div>
    </div>
  )
}
