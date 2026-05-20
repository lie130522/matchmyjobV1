'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Zap, Loader2, ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('pricing')
  const tc = useTranslations('common')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const highlightedPlan = searchParams.get('plan')

  const PLANS = [
    {
      key: 'free',
      name: 'Free',
      price: 0,
      period: null,
      attemptsLabel: `4 ${t('attemptsLifetime')}`,
      features: [
        t('features.cvUploadsMax'),
        t('features.allFeatures'),
        t('features.basicSupport'),
      ],
      cta: t('currentPlan'),
      disabled: true,
      style: 'border-[#E2E8F0] bg-white',
      ctaStyle: 'border border-[#E2E8F0] text-[#94A3B8] cursor-default',
    },
    {
      key: 'starter',
      name: 'Starter',
      price: 2,
      period: t('perMonth'),
      attemptsLabel: `25 ${t('attemptsMonth')}`,
      features: [
        t('features.unlimitedCv'),
        t('features.allFeatures'),
        t('features.emailSupport'),
      ],
      cta: t('getPlan', { plan: 'Starter' }),
      disabled: false,
      style: 'border-[#1B4FFF] bg-white',
      ctaStyle: 'border border-[#1B4FFF] text-[#1B4FFF] hover:bg-[#EEF2FF]',
    },
    {
      key: 'pro',
      name: 'Pro',
      price: 5,
      period: t('perMonth'),
      attemptsLabel: `60 ${t('attemptsMonth')}`,
      features: [
        t('features.unlimitedCv'),
        t('features.allFeatures'),
        t('features.prioritySupport'),
      ],
      cta: t('getPlan', { plan: 'Pro' }),
      disabled: false,
      badge: t('mostPopular'),
      style: 'border-[#1B4FFF] bg-[#1B4FFF]',
      ctaStyle: 'bg-white text-[#1B4FFF] hover:bg-[#EEF2FF]',
      dark: true,
    },
    {
      key: 'expert',
      name: 'Expert',
      price: 10,
      period: t('perMonth'),
      attemptsLabel: `130 ${t('attemptsMonth')}`,
      features: [
        t('features.unlimitedCv'),
        t('features.allFeatures'),
        `${t('features.prioritySupport')} + ${t('features.apiAccess')}`,
      ],
      cta: t('getPlan', { plan: 'Expert' }),
      disabled: false,
      style: 'border-[#7C3AED] bg-white',
      ctaStyle: 'border border-[#7C3AED] text-[#7C3AED] hover:bg-[#F5F3FF]',
    },
  ]

  async function handleUpgrade(planKey: string) {
    setLoading(planKey)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) {
        setError(json.error ?? 'Could not start checkout.')
        return
      }
      router.push(json.url)
    } catch {
      setError(tc('networkError'))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#0F172A] mb-8 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> {tc('back')}
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">{t('title')}</h1>
        <p className="text-[#64748B] max-w-xl mx-auto">{t('subtitle')}</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#EF4444] text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isHighlighted = highlightedPlan === plan.key
          return (
            <div
              key={plan.key}
              className={`relative rounded-2xl border-2 p-6 flex flex-col transition-shadow ${plan.style} ${isHighlighted ? 'ring-2 ring-offset-2 ring-[#1B4FFF]' : ''} ${!plan.disabled ? 'hover:shadow-lg' : ''}`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#1B4FFF] text-white text-[11px] font-semibold px-3 py-0.5 rounded-full">
                  <Star className="w-2.5 h-2.5" fill="white" /> {plan.badge}
                </span>
              )}

              <div className="mb-4">
                <p className={`text-[12px] font-semibold uppercase tracking-widest mb-1 ${plan.dark ? 'text-white/70' : 'text-[#94A3B8]'}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className={`text-3xl font-bold ${plan.dark ? 'text-white' : 'text-[#0F172A]'}`}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className={`text-[13px] ${plan.dark ? 'text-white/60' : 'text-[#94A3B8]'}`}>{plan.period}</span>
                  )}
                </div>
                <div className={`flex items-center gap-1 text-[12px] font-medium ${plan.dark ? 'text-white/80' : 'text-[#64748B]'}`}>
                  <Zap className="w-3 h-3" fill="currentColor" /> {plan.attemptsLabel}
                </div>
              </div>

              <ul className="flex flex-col gap-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-[12px] ${plan.dark ? 'text-white/80' : 'text-[#64748B]'}`}>
                    <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${plan.dark ? 'text-white' : 'text-[#00C97A]'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !plan.disabled && handleUpgrade(plan.key)}
                disabled={plan.disabled || loading === plan.key}
                className={`w-full py-2.5 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 ${plan.ctaStyle} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading === plan.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {plan.cta}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-center text-[12px] text-[#94A3B8] mt-8">{t('footer')}</p>
    </div>
  )
}
