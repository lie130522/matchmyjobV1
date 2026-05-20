import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FileText, Search, PenLine, Globe, ArrowRight, Zap,
  Bookmark, MapPin, Briefcase, ExternalLink, Upload, TrendingUp,
} from 'lucide-react'
import { OnboardingChecklist } from '@/components/app/OnboardingChecklist'

interface SavedJobData {
  title: string
  company: string
  location?: string
  logo?: string
  apply_link?: string
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const t = await getTranslations('dashboard')
  const tc = await getTranslations('dashboard.contextual')

  const [
    { data: profile },
    { data: subscription },
    { data: savedJobs },
    { data: profileCv },
    { data: usageLogs },
  ] = await Promise.all([
    supabase.from('users').select('full_name').eq('id', user.id).single(),
    supabase.from('subscriptions').select('attempts_remaining, attempts_total, plan').eq('user_id', user.id).single(),
    supabase.from('saved_jobs').select('id, job_data, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4),
    supabase.from('cvs').select('id').eq('user_id', user.id).eq('is_profile', true).maybeSingle(),
    supabase.from('usage_logs').select('feature').eq('user_id', user.id).eq('refunded', false).in('feature', ['cv_optimizer', 'job_analyzer', 'cover_letter']),
  ])

  const usedFeatures = new Set((usageLogs ?? []).map(l => l.feature))
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const remaining = subscription?.attempts_remaining ?? 0
  const total = subscription?.attempts_total ?? 0
  const hasProfileCv = !!profileCv

  const FEATURE_CARDS = [
    {
      href: '/cv-optimizer',
      icon: FileText,
      color: 'text-[#1B4FFF]',
      bg: 'bg-[#EEF2FF]',
      title: t('features.cvOptimizer.title'),
      description: t('features.cvOptimizer.description'),
      cta: t('features.cvOptimizer.cta'),
    },
    {
      href: '/job-analyzer',
      icon: Search,
      color: 'text-[#00C97A]',
      bg: 'bg-[#E6FBF3]',
      title: t('features.jobAnalyzer.title'),
      description: t('features.jobAnalyzer.description'),
      cta: t('features.jobAnalyzer.cta'),
    },
    {
      href: '/cover-letter',
      icon: PenLine,
      color: 'text-[#7C3AED]',
      bg: 'bg-[#F5F3FF]',
      title: t('features.coverLetter.title'),
      description: t('features.coverLetter.description'),
      cta: t('features.coverLetter.cta'),
    },
    {
      href: '/jobs',
      icon: Globe,
      color: 'text-[#EA580C]',
      bg: 'bg-[#FFF7ED]',
      title: t('features.jobSearch.title'),
      description: t('features.jobSearch.description'),
      cta: t('features.jobSearch.cta'),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-1">
          {t('welcome', { name: firstName })}
        </h1>
        <p className="text-[#64748B]">{t('subtitle')}</p>
      </div>

      {/* Onboarding checklist */}
      <OnboardingChecklist
        hasProfileCv={hasProfileCv}
        hasCvOptimized={usedFeatures.has('cv_optimizer')}
        hasJobAnalyzed={usedFeatures.has('job_analyzer')}
        hasCoverLetter={usedFeatures.has('cover_letter')}
      />

      {/* Contextual suggestion banners */}
      <div className="flex flex-col gap-3 mb-6">
        {/* No profile CV */}
        {!hasProfileCv && (
          <div className="flex items-center gap-4 bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-[#1B4FFF] flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#0F172A]">{tc('noProfileCv')}</p>
              <p className="text-[13px] text-[#64748B] mt-0.5">{tc('noProfileCvDesc')}</p>
            </div>
            <Link
              href="/settings"
              className="shrink-0 px-4 py-2 bg-[#1B4FFF] hover:bg-[#1240D6] text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              {tc('uploadNow')}
            </Link>
          </div>
        )}

        {/* Low attempts warning */}
        {remaining > 0 && remaining <= 3 && (
          <div className="flex items-center gap-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-[#F97316] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#0F172A]">{tc('attemptsLow')}</p>
              <p className="text-[13px] text-[#64748B] mt-0.5">
                {remaining === 1
                  ? tc('attemptsLowDesc', { n: remaining })
                  : tc('attemptsLowDescPlural', { n: remaining })
                }
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              {tc('upgradeNow')}
            </Link>
          </div>
        )}
      </div>

      {/* Attempts summary */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#1B4FFF]" fill="#1B4FFF" />
          </div>
          <div>
            <p className="text-[13px] text-[#64748B] font-medium">{t('attemptsRemaining')}</p>
            <p className="text-xl font-bold text-[#0F172A] font-mono">
              {remaining} <span className="text-[#94A3B8] text-sm font-normal">/ {total}</span>
            </p>
          </div>
        </div>
        {remaining === 0 ? (
          <Link href="/pricing" className="px-4 py-2 bg-[#1B4FFF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1240D6] transition-colors">
            {t('upgrade')}
          </Link>
        ) : (
          <p className="text-[13px] text-[#94A3B8]">
            {t('plan')}: <span className="capitalize font-medium text-[#64748B]">{subscription?.plan ?? 'free'}</span>
          </p>
        )}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURE_CARDS.map(({ href, icon: Icon, color, bg, title, description, cta }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col gap-4 hover:shadow-md hover:border-[#C7D2FE] transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-[#0F172A] mb-1.5">{title}</h2>
              <p className="text-[13px] text-[#64748B] leading-relaxed">{description}</p>
            </div>
            <div className={`flex items-center gap-1 text-[13px] font-medium ${color} group-hover:gap-2 transition-all`}>
              {cta} <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Jobs for you section CTA */}
      <div className="mt-8 bg-gradient-to-r from-[#0F172A] to-[#1B4FFF]/80 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-white">{t('suggestedJobs')}</p>
            <p className="text-[13px] text-white/70 mt-0.5">{t('suggestedJobsSubtitle')}</p>
          </div>
        </div>
        <Link
          href="/jobs"
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white text-[#0F172A] text-[13px] font-semibold rounded-lg hover:bg-[#F8FAFC] transition-colors"
        >
          {t('viewAllJobs')} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Saved Jobs */}
      {savedJobs && savedJobs.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#1B4FFF]" />
              <h2 className="font-semibold text-[#0F172A]">{t('savedJobsTitle')}</h2>
            </div>
            <Link href="/saved-jobs" className="text-[13px] text-[#1B4FFF] hover:underline flex items-center gap-1">
              {t('viewAllJobs')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedJobs.map((saved) => {
              const job = saved.job_data as SavedJobData
              return (
                <div key={saved.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-start gap-3 hover:shadow-sm hover:border-[#CBD5E1] transition-all">
                  <div className="w-9 h-9 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center shrink-0 overflow-hidden">
                    {job.logo ? (
                      <img src={job.logo} alt={job.company} className="w-6 h-6 object-contain" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-[#CBD5E1]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-[#0F172A] truncate">{job.title}</p>
                    <p className="text-[12px] text-[#64748B] truncate">{job.company}</p>
                    {job.location && (
                      <p className="flex items-center gap-1 text-[11px] text-[#94A3B8] mt-1">
                        <MapPin className="w-3 h-3" /> {job.location}
                      </p>
                    )}
                  </div>
                  <a
                    href={job.apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 w-7 h-7 flex items-center justify-center text-[#94A3B8] hover:text-[#1B4FFF] transition-colors"
                    title="Apply"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
