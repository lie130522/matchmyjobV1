'use client'

import { useState, useEffect } from 'react'
import { AppNavbar } from '@/components/app/AppNavbar'
import { BottomNav } from '@/components/app/BottomNav'
import { UpgradeModal } from '@/components/app/UpgradeModal'
import { useSubscription } from '@/hooks/useSubscription'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { subscription, loading } = useSubscription()
  const [modalDismissed, setModalDismissed] = useState(false)
  const [hasProfileCv, setHasProfileCv] = useState(false)

  useEffect(() => {
    fetch('/api/profile/cv')
      .then(r => r.json())
      .then(d => setHasProfileCv(!!d.cv?.cv_text))
      .catch(() => {})
  }, [])

  const showUpgrade = !loading && subscription !== null && subscription.attempts_remaining === 0

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar
        subscription={subscription}
        loadingSubscription={loading}
        hasProfileCv={hasProfileCv}
      />
      {/* pb-20 on mobile gives space for the fixed bottom nav; no padding on md+ */}
      <main className="pb-20 md:pb-0">{children}</main>
      <BottomNav />

      {showUpgrade && !modalDismissed && (
        <UpgradeModal onClose={() => setModalDismissed(true)} />
      )}
    </div>
  )
}
