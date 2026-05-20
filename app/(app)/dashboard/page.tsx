import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Search, PenLine, Globe, ArrowRight, Zap, Bookmark, MapPin, Briefcase, ExternalLink } from 'lucide-react'
import { OnboardingChecklist } from '@/components/app/OnboardingChecklist'

interface SavedJobData {
  title: string
  company: string
  location?: string
  logo?: string
  apply_link?: string
}

const FEATURE_CARDS = [
  {
    href: '/cv-optimizer',
    icon: FileText,
    color: 'text-[#1B4FFF]',
    bg: 'bg-[#EEF2FF]',
    title: 'CV Optimizer',
    description: 'Upload your CV and a job offer to get an ATS score, missing keywords, and an optimized version.',
    cta: 'Optimize my CV',
  },
  {
    href: '/job-analyzer',
    icon: Search,
    color: 'text-[#00C97A]',
    bg: 'bg-[#E6FBF3]',
    title: 'Job Analyzer',
    description: 'Paste any job URL or text to extract required skills, match score against your CV, and spot red flags.',
    cta: 'Analyze a job',
  },
  {
    href: '/cover-letter',
    icon: PenLine,
    color: 'text-[#7C3AED]',
    bg: 'bg-[#F5F3FF]',
    title: 'Cover Letter',
    description: 'Generate a tailored cover letter automatically or get guided through a structured writing session.',
    cta: 'Write a letter',
  },
  {
    href: '/jobs',
    icon: Globe,
    color: 'text-[#EA580C]',
    bg: 'bg-[#FFF7ED]',
    title: 'Job Search',
    description: 'Browse aggregated listings from Indeed, LinkedIn, Glassdoor filtered by role, location, and salary.',
    cta: 'Search jobs',
  },
]

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-1">
          Welcome back, {firstName}
        </h1>
        <p className="text-[#64748B]">What would you like to work on today?</p>
      </div>

      {/* Onboarding checklist — shown until all steps done or dismissed */}
      <OnboardingChecklist
        hasProfileCv={!!profileCv}
        hasCvOptimized={usedFeatures.has('cv_optimizer')}
        hasJobAnalyzed={usedFeatures.has('job_analyzer')}
        hasCoverLetter={usedFeatures.has('cover_letter')}
      />

      {/* Attempts summary */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#1B4FFF]" fill="#1B4FFF" />
          </div>
          <div>
            <p className="text-[13px] text-[#64748B] font-medium">Attempts remaining</p>
            <p className="text-xl font-bold text-[#0F172A] font-mono">
              {remaining} <span className="text-[#94A3B8] text-sm font-normal">/ {total}</span>
            </p>
          </div>
        </div>
        {remaining === 0 ? (
          <Link href="/pricing" className="px-4 py-2 bg-[#1B4FFF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1240D6] transition-colors">
            Upgrade plan
          </Link>
        ) : (
          <p className="text-[13px] text-[#94A3B8]">
            Plan: <span className="capitalize font-medium text-[#64748B]">{subscription?.plan ?? 'free'}</span>
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

      {/* Saved Jobs */}
      {savedJobs && savedJobs.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#1B4FFF]" />
              <h2 className="font-semibold text-[#0F172A]">Saved jobs</h2>
            </div>
            <Link href="/saved-jobs" className="text-[13px] text-[#1B4FFF] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
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
