'use client'

import { Zap } from 'lucide-react'
import type { Subscription } from '@/lib/supabase/types'

interface Props {
  subscription: Subscription | null
  loading: boolean
}

export function AttemptsCounter({ subscription, loading }: Props) {
  if (loading) {
    return <div className="h-7 w-24 rounded-full bg-[#E2E8F0] animate-pulse" />
  }

  if (!subscription) return null

  const remaining = subscription.attempts_remaining
  const total = subscription.attempts_total
  const isEmpty = remaining === 0
  const isLow = remaining > 0 && remaining <= 3

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium border transition-colors ${
        isEmpty
          ? 'bg-[#FEF2F2] border-[#FECACA] text-[#EF4444]'
          : isLow
          ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]'
          : 'bg-[#EEF2FF] border-[#C7D2FE] text-[#1B4FFF]'
      }`}
    >
      <Zap className="w-3.5 h-3.5" fill="currentColor" />
      <span className="font-mono">{remaining}</span>
      <span className="text-current/60">/ {total}</span>
    </div>
  )
}
