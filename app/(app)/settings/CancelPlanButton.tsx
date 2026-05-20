'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function CancelPlanButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleCancel() {
    if (!confirm) { setConfirm(true); return }
    setLoading(true)
    await fetch('/api/stripe/cancel', { method: 'POST' })
    router.refresh()
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-[#EF4444]">Are you sure?</span>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#EF4444] hover:bg-[#dc2626] text-white text-[12px] font-semibold rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Yes, cancel
        </button>
        <button onClick={() => setConfirm(false)} className="text-[12px] text-[#64748B] hover:underline">
          Keep plan
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleCancel}
      className="px-4 py-2 border border-[#E2E8F0] text-[#EF4444] text-[13px] font-medium rounded-lg hover:bg-[#FEF2F2] hover:border-[#FECACA] transition-colors"
    >
      Cancel plan
    </button>
  )
}
