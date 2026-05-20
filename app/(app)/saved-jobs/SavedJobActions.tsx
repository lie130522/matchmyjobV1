'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookmarkX, Loader2 } from 'lucide-react'

interface Props {
  savedJobId: string
  jobId: string
}

export function SavedJobActions({ jobId }: Props) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  async function handleUnsave() {
    setRemoving(true)
    try {
      await fetch(`/api/jobs/save?job_id=${encodeURIComponent(jobId)}`, {
        method: 'DELETE',
      })
      router.refresh()
    } catch {
      setRemoving(false)
    }
  }

  return (
    <button
      onClick={handleUnsave}
      disabled={removing}
      title="Remove from saved"
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#94A3B8] hover:border-[#FECACA] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
    >
      {removing ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <BookmarkX className="w-3.5 h-3.5" />
      )}
    </button>
  )
}
