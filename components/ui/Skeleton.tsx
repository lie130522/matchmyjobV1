import type { CSSProperties } from 'react'

/**
 * Skeleton loading placeholders — CSS-only shimmer animation.
 */

export function Skeleton({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`bg-gradient-to-r from-[#F1F5F9] via-[#E8EDF4] to-[#F1F5F9] rounded-lg ${className}`}
      style={{ animation: 'shimmer 1.6s infinite linear', backgroundSize: '400% 100%', ...style }}
    />
  )
}

/**
 * Skeleton for the CV Optimizer result panel.
 */
export function CvOptimizerSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      {/* Score row */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-9 w-12 mx-auto" />
          </div>
          <Skeleton className="h-4 w-6" />
          <div className="text-center">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-9 w-12 mx-auto" />
          </div>
        </div>
        <Skeleton className="h-3 w-64 mt-4" />
      </div>
      {/* Issues */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex flex-col gap-2">
          {[80, 65, 90, 55].map((w, i) => <Skeleton key={i} className={`h-3 w-[${w}%]`} />)}
        </div>
      </div>
      {/* Keywords */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <Skeleton className="h-4 w-40 mb-4" />
        <div className="flex flex-wrap gap-2">
          {[60, 80, 50, 70, 55, 90, 45, 75].map((w, i) => (
            <Skeleton key={i} className="h-6 rounded-full" style={{ width: `${w}px` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for the Job Analyzer result panel.
 */
export function JobAnalyzerSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      {/* Verdict block */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex gap-4">
        <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <div className="flex gap-1.5">
            {[64, 80, 56, 72].map((w, i) => (
              <Skeleton key={i} className="h-5 rounded-full" style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
      </div>
      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#E2E8F0] pb-2">
        {[72, 96, 88, 72].map((w, i) => <Skeleton key={i} className="h-4" style={{ width: `${w}px` }} />)}
      </div>
      {/* Content cards */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <Skeleton className="h-4 w-24 mb-4" />
        <div className="flex flex-wrap gap-2">
          {[80, 64, 96, 72, 56, 88, 48, 76].map((w, i) => (
            <Skeleton key={i} className="h-7 rounded-full" style={{ width: `${w}px` }} />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex flex-col gap-2">
          {[75, 90, 60, 85].map((w, i) => <Skeleton key={i} className="h-3" style={{ width: `${w}%` }} />)}
        </div>
      </div>
    </div>
  )
}
