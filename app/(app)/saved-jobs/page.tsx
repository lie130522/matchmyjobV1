import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Bookmark, ArrowLeft, Briefcase, MapPin, Wifi, DollarSign,
  ExternalLink, ChevronRight, Globe,
} from 'lucide-react'
import { SavedJobActions } from './SavedJobActions'

interface SavedJobRow {
  id: string
  job_data: {
    job_id: string
    title: string
    company: string
    logo: string | null
    location: string | null
    is_remote: boolean
    employment_type: string | null
    salary: string | null
    apply_link: string
    description: string
    posted_at: string | null
  }
  created_at: string
}

export default async function SavedJobsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: savedJobs } = await supabase
    .from('saved_jobs')
    .select('id, job_data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const jobs = (savedJobs ?? []) as SavedJobRow[]
  const t = await getTranslations('savedJobs')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#0F172A] mb-8 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> {t('back')}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-[#1B4FFF]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">{t('title')}</h1>
            <p className="text-[13px] text-[#64748B]">
              {jobs.length !== 1
                ? `${jobs.length} jobs`
                : `${jobs.length} job`}
            </p>
          </div>
        </div>
        <Link
          href="/jobs"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1B4FFF] hover:bg-[#1240D6] text-white text-[13px] font-semibold rounded-lg transition-colors"
        >
          <Globe className="w-3.5 h-3.5" /> {t('browseCta')}
        </Link>
      </div>

      {/* Empty state */}
      {jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-4">
            <Bookmark className="w-7 h-7 text-[#1B4FFF]" />
          </div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">{t('title')}</h2>
          <p className="text-[14px] text-[#64748B] max-w-xs mb-6">{t('empty')}</p>
          <Link
            href="/jobs"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1B4FFF] hover:bg-[#1240D6] text-white text-[14px] font-semibold rounded-xl transition-colors"
          >
            {t('browseCta')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Job list */}
      {jobs.length > 0 && (
        <div className="flex flex-col gap-4">
          {jobs.map(({ id, job_data: job, created_at }) => {
            const savedDate = new Date(created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })

            return (
              <div
                key={id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md hover:border-[#CBD5E1] transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="w-11 h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center shrink-0 overflow-hidden">
                    {job.logo ? (
                      <img
                        src={job.logo}
                        alt={job.company}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <Briefcase className="w-5 h-5 text-[#CBD5E1]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title + actions */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h2 className="font-semibold text-[#0F172A] text-[15px] leading-snug">
                          {job.title}
                        </h2>
                        <p className="text-[#64748B] text-[13px] mt-0.5">{job.company}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[12px] text-[#94A3B8]">{t('savedOn')} {savedDate}</span>
                        {/* Client component for unsave button */}
                        <SavedJobActions savedJobId={id} jobId={job.job_id} />
                      </div>
                    </div>

                    {/* Meta chips */}
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {job.location && (
                        <MetaChip icon={<MapPin className="w-3 h-3" />} label={job.location} />
                      )}
                      {job.is_remote && (
                        <MetaChip
                          icon={<Wifi className="w-3 h-3" />}
                          label="Remote"
                          color="text-[#00C97A] bg-[#E6FBF3] border-[#00C97A]/20"
                        />
                      )}
                      {job.employment_type && (
                        <MetaChip icon={<Briefcase className="w-3 h-3" />} label={job.employment_type} />
                      )}
                      {job.salary && (
                        <MetaChip
                          icon={<DollarSign className="w-3 h-3" />}
                          label={job.salary}
                          color="text-[#7C3AED] bg-[#F5F3FF] border-[#7C3AED]/20"
                        />
                      )}
                    </div>

                    {/* Description excerpt */}
                    {job.description && (
                      <p className="text-[13px] text-[#64748B] mt-3 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#F1F5F9]">
                      <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] hover:bg-[#c2410c] text-white text-[12px] font-semibold rounded-lg transition-colors"
                      >
                        {t('apply')} <ExternalLink className="w-3 h-3" />
                      </a>
                      <Link
                        href={`/job-analyzer?prefill=${encodeURIComponent(
                          `${job.title} at ${job.company}\n\n${job.description}`
                        )}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#00C97A] text-[#00C97A] text-[12px] font-semibold rounded-lg hover:bg-[#E6FBF3] transition-colors"
                      >
                        {t('analyze')} <ChevronRight className="w-3 h-3" />
                      </Link>
                      <Link
                        href={`/cv-optimizer?job=${encodeURIComponent(
                          `${job.title} at ${job.company}\n\n${job.description}`
                        )}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] text-[#64748B] text-[12px] font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors"
                      >
                        {t('optimizeCv')}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MetaChip({
  icon,
  label,
  color = 'text-[#64748B] bg-[#F8FAFC] border-[#E2E8F0]',
}: {
  icon: React.ReactNode
  label: string
  color?: string
}) {
  return (
    <span
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${color}`}
    >
      {icon} {label}
    </span>
  )
}
