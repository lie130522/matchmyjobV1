'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X, FileText, Search, PenLine, User } from 'lucide-react'

interface Step {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  href: string
  cta: string
  done: boolean
}

interface Props {
  hasProfileCv: boolean
  hasCvOptimized: boolean
  hasJobAnalyzed: boolean
  hasCoverLetter: boolean
}

const DISMISS_KEY = 'mmj_onboarding_dismissed'

export function OnboardingChecklist({ hasProfileCv, hasCvOptimized, hasJobAnalyzed, hasCoverLetter }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1')
    }
  }, [])

  const steps: Step[] = [
    {
      id: 'account',
      icon: <User className="w-4 h-4" />,
      title: 'Create your account',
      description: 'You\'re in. Welcome to MatchMyJob!',
      href: '/dashboard',
      cta: '',
      done: true,
    },
    {
      id: 'profile_cv',
      icon: <FileText className="w-4 h-4" />,
      title: 'Upload your profile CV',
      description: 'Save your CV once — it auto-loads in all AI tools.',
      href: '/settings',
      cta: 'Go to Settings →',
      done: hasProfileCv,
    },
    {
      id: 'job_analyzer',
      icon: <Search className="w-4 h-4" />,
      title: 'Analyze your first job offer',
      description: 'Paste any job URL or description to get skills, match score, and red flags.',
      href: '/job-analyzer',
      cta: 'Analyze a job →',
      done: hasJobAnalyzed,
    },
    {
      id: 'cv_optimizer',
      icon: <FileText className="w-4 h-4" />,
      title: 'Optimize your first CV',
      description: 'Get an ATS score and a keyword-optimized version of your CV.',
      href: '/cv-optimizer',
      cta: 'Optimize my CV →',
      done: hasCvOptimized,
    },
    {
      id: 'cover_letter',
      icon: <PenLine className="w-4 h-4" />,
      title: 'Write your first cover letter',
      description: 'Auto-generate a tailored cover letter in seconds.',
      href: '/cover-letter',
      cta: 'Write a letter →',
      done: hasCoverLetter,
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const totalCount = steps.length
  const allDone = completedCount === totalCount
  const progress = Math.round((completedCount / totalCount) * 100)

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  // Don't render until mounted (to avoid SSR mismatch with localStorage)
  if (!mounted || dismissed || allDone) return null

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] mb-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[14px] font-semibold text-[#0F172A]">Get started with MatchMyJob</p>
              <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#1B4FFF] text-[11px] font-bold rounded-full">
                {completedCount}/{totalCount}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-40 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1B4FFF] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#64748B] transition-colors"
            aria-label={collapsed ? 'Expand checklist' : 'Collapse checklist'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#EF4444] transition-colors"
            aria-label="Dismiss checklist"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="border-t border-[#F1F5F9] divide-y divide-[#F1F5F9]">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${
                step.done ? 'opacity-60' : 'hover:bg-[#FAFBFF]'
              }`}
            >
              <div className={`shrink-0 mt-0.5 ${step.done ? 'text-[#00C97A]' : 'text-[#CBD5E1]'}`}>
                {step.done ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-semibold ${step.done ? 'line-through text-[#94A3B8]' : 'text-[#0F172A]'}`}>
                  {step.title}
                </p>
                {!step.done && (
                  <p className="text-[12px] text-[#64748B] mt-0.5">{step.description}</p>
                )}
              </div>
              {!step.done && step.cta && (
                <Link
                  href={step.href}
                  className="shrink-0 text-[12px] font-semibold text-[#1B4FFF] hover:underline whitespace-nowrap"
                >
                  {step.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
