'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Subscription } from '@/lib/supabase/types'

interface UseSubscriptionReturn {
  subscription: Subscription | null
  loading: boolean
  consumeAttempt: (feature: string) => Promise<{ success: boolean; log_id?: string; error?: string; code?: string }>
  refundAttempt: (logId: string) => Promise<void>
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setSubscription(data)
      setLoading(false)

      // Realtime updates so the counter stays in sync across tabs
      // Unique name prevents StrictMode double-mount conflicts
      const channelName = `sub-${user.id}-${Date.now()}`
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setSubscription(payload.new as Subscription)
        })
        .subscribe()
    }

    init()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [])

  const consumeAttempt = useCallback(async (feature: string) => {
    const res = await fetch('/api/attempts/consume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature }),
    })
    const json = await res.json()

    if (res.ok) {
      setSubscription(prev => prev ? { ...prev, attempts_remaining: json.attempts_remaining } : prev)
      return { success: true, log_id: json.log_id }
    }

    return { success: false, error: json.error, code: json.code }
  }, [])

  const refundAttempt = useCallback(async (logId: string) => {
    const res = await fetch('/api/attempts/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log_id: logId }),
    })
    if (res.ok) {
      const json = await res.json()
      if (json.success) {
        setSubscription(prev => prev ? { ...prev, attempts_remaining: prev.attempts_remaining + 1 } : prev)
      }
    }
  }, [])

  return { subscription, loading, consumeAttempt, refundAttempt }
}
