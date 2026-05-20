'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import {
  Globe, Search, MapPin, Briefcase, DollarSign, Wifi,
  Bookmark, BookmarkCheck, ExternalLink, Loader2, AlertCircle,
  SlidersHorizontal, ChevronRight, LocateFixed, X, Sparkles, Upload,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Job {
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
  is_saved: boolean
}

const POPULAR_SEARCHES = [
  { label: '💻 Software Engineer', query: 'Software Engineer' },
  { label: '🎨 UX Designer', query: 'UX Designer' },
  { label: '📊 Data Analyst', query: 'Data Analyst' },
  { label: '📣 Marketing Manager', query: 'Marketing Manager' },
  { label: '🧠 Product Manager', query: 'Product Manager' },
  { label: '💰 Financial Analyst', query: 'Financial Analyst' },
  { label: '🌐 Full Stack Developer', query: 'Full Stack Developer' },
  { label: '🤖 AI Engineer', query: 'AI Engineer' },
]

type GeoState = 'idle' | 'asking' | 'loading' | 'granted' | 'denied'

export default function JobsPage() {
  const t = useTranslations('jobs')

  const EMPLOYMENT_TYPES = [
    { value: '', label: t('allTypes') },
    { value: 'fulltime', label: t('fullTime') },
    { value: 'parttime', label: t('partTime') },
    { value: 'contractor', label: t('contract') },
    { value: 'intern', label: t('internship') },
  ]

  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [geoState, setGeoState] = useState<GeoState>('asking')
  const [detectedCity, setDetectedCity] = useState('')

  // Personalized suggestions
  const [suggestions, setSuggestions] = useState<Job[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)
  const [extractedTitle, setExtractedTitle] = useState('')
  const [hasProfileCv, setHasProfileCv] = useState(true)

  // Check if geolocation was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('mmj_geo_dismissed')
    if (dismissed) setGeoState('denied')
  }, [])

  // Load personalized suggestions on mount
  useEffect(() => {
    setSuggestionsLoading(true)
    fetch('/api/jobs/suggestions')
      .then(r => r.json())
      .then(data => {
        setHasProfileCv(data.hasProfileCv ?? false)
        setSuggestions(data.jobs ?? [])
        setExtractedTitle(data.extractedTitle ?? '')
      })
      .catch(() => {})
      .finally(() => setSuggestionsLoading(false))
  }, [])

  const handleSearch = useCallback(async (q?: string, loc?: string) => {
    const searchQuery = q ?? query
    const searchLocation = loc ?? location
    if (!searchQuery.trim()) return

    setLoading(true)
    setError('')
    setSearched(true)
    setQuery(searchQuery)

    const params = new URLSearchParams({ query: searchQuery })
    if (searchLocation) params.set('location', searchLocation)
    if (employmentType) params.set('employment_type', employmentType)
    if (remoteOnly) params.set('remote', 'true')

    try {
      const res = await fetch(`/api/jobs/search?${params}`)
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Search failed.'); setJobs([]); return }
      setJobs(json.jobs ?? [])
    } catch {
      setError(t('noResults'))
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [query, location, employmentType, remoteOnly, t])

  function requestGeolocation() {
    setGeoState('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const city = data.address?.city ?? data.address?.town ?? data.address?.county ?? ''
          const country = data.address?.country ?? ''
          const cityLabel = [city, country].filter(Boolean).join(', ')
          setDetectedCity(cityLabel)
          setLocation(cityLabel)
          setGeoState('granted')
        } catch {
          setGeoState('granted')
        }
      },
      () => {
        setGeoState('denied')
        localStorage.setItem('mmj_geo_dismissed', '1')
      },
      { timeout: 8000 }
    )
  }

  function dismissGeo() {
    setGeoState('denied')
    localStorage.setItem('mmj_geo_dismissed', '1')
  }

  async function toggleSave(job: Job) {
    setSavingIds(prev => new Set(prev).add(job.job_id))
    try {
      if (job.is_saved) {
        await fetch(`/api/jobs/save?job_id=${job.job_id}`, { method: 'DELETE' })
      } else {
        await fetch('/api/jobs/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_data: job }),
        })
      }
      setJobs(prev => prev.map(j => j.job_id === job.job_id ? { ...j, is_saved: !j.is_saved } : j))
      setSuggestions(prev => prev.map(j => j.job_id === job.job_id ? { ...j, is_saved: !j.is_saved } : j))
    } finally {
      setSavingIds(prev => { const next = new Set(prev); next.delete(job.job_id); return next })
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#EA580C]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">{t('title')}</h1>
        </div>
        <p className="text-[#64748B]">{t('subtitle')}</p>
      </div>

      {/* Geolocation banner */}
      {geoState === 'asking' && (
        <div className="flex items-center gap-3 bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl px-4 py-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-[#1B4FFF] flex items-center justify-center shrink-0">
            <LocateFixed className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#0F172A]">{t('allowLocation')}</p>
            <p className="text-[12px] text-[#64748B]">{t('allowLocationHint')}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={requestGeolocation}
              className="px-3 py-1.5 bg-[#1B4FFF] hover:bg-[#1240D6] text-white text-[12px] font-semibold rounded-lg transition-colors"
            >
              {t('allow')}
            </button>
            <button onClick={dismissGeo} className="text-[#94A3B8] hover:text-[#64748B] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {geoState === 'loading' && (
        <div className="flex items-center gap-3 bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl px-4 py-3 mb-5">
          <Loader2 className="w-4 h-4 text-[#1B4FFF] animate-spin shrink-0" />
          <p className="text-[13px] text-[#64748B]">{t('detectingLocation')}</p>
        </div>
      )}

      {geoState === 'granted' && detectedCity && (
        <div className="flex items-center gap-3 bg-[#E6FBF3] border border-[#00C97A]/30 rounded-xl px-4 py-3 mb-5">
          <MapPin className="w-4 h-4 text-[#00C97A] shrink-0" />
          <p className="text-[13px] text-[#0F172A]">
            {t('locationDetected')} <span className="font-semibold">{detectedCity}</span>
            <span className="text-[#64748B] ml-1">— {t('locationFiltered')}</span>
          </p>
          <button onClick={dismissGeo} className="ml-auto text-[#94A3B8] hover:text-[#64748B] transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-colors"
            />
          </div>
          <div className="flex-1 min-w-40 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder={t('locationPlaceholder')}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-[13px] font-medium transition-colors ${showFilters ? 'border-[#EA580C] bg-[#FFF7ED] text-[#EA580C]' : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> {t('filters')}
          </button>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-white font-semibold text-[14px] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {t('search')}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-[12px] font-medium text-[#64748B] mb-1.5">{t('employmentType')}</label>
              <div className="flex gap-1.5 flex-wrap">
                {EMPLOYMENT_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEmploymentType(value)}
                    className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-colors ${employmentType === value ? 'bg-[#FFF7ED] border-[#EA580C] text-[#EA580C]' : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-auto">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={e => setRemoteOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-[#EA580C]"
              />
              <span className="text-[13px] text-[#64748B] font-medium flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" /> {t('remoteOnly')}
              </span>
            </label>
          </div>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-[#FEF2F2] rounded-xl border border-[#FECACA] mb-6">
          <AlertCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
          <p className="text-[13px] text-[#EF4444]">{error}</p>
        </div>
      )}

      {/* Search loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-[#64748B]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[15px]">{t('searching')}</span>
        </div>
      )}

      {/* Search results */}
      {!loading && jobs.length > 0 && (
        <div className="flex flex-col gap-4 mb-8">
          <p className="text-[13px] text-[#94A3B8] font-medium">
            {jobs.length !== 1 ? t('resultsPlural', { count: jobs.length }) : t('results', { count: jobs.length })}
          </p>
          {jobs.map(job => (
            <JobCard
              key={job.job_id}
              job={job}
              saving={savingIds.has(job.job_id)}
              onSave={() => toggleSave(job)}
              t={t}
            />
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && searched && jobs.length === 0 && !error && (
        <div className="text-center py-16 text-[#94A3B8]">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-[15px]">{t('noResults')}</p>
        </div>
      )}

      {/* Empty state + personalized suggestions */}
      {!loading && !searched && (
        <>
          {/* Suggestions section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <h2 className="font-semibold text-[#0F172A]">{t('suggestedForYou')}</h2>
                {extractedTitle && (
                  <span className="text-[12px] text-[#94A3B8]">— {t('basedOnCv')}</span>
                )}
              </div>
            </div>

            {suggestionsLoading ? (
              <div className="flex items-center gap-3 py-10 justify-center text-[#94A3B8]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[14px]">{t('loadingSuggestions')}</span>
              </div>
            ) : !hasProfileCv ? (
              <div className="bg-white rounded-2xl border border-dashed border-[#C7D2FE] p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-[#1B4FFF]" />
                </div>
                <p className="text-[14px] font-semibold text-[#0F172A] mb-1">{t('uploadCvForSuggestions')}</p>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-[#1B4FFF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1240D6] transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" /> {t('uploadCvCta')}
                </Link>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 text-center text-[#94A3B8]">
                <p className="text-[14px]">{t('noResults')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {suggestions.map(job => (
                  <JobCard
                    key={job.job_id}
                    job={job}
                    saving={savingIds.has(job.job_id)}
                    onSave={() => toggleSave(job)}
                    t={t}
                    suggested
                  />
                ))}
              </div>
            )}
          </div>

          {/* Popular searches */}
          <div>
            <p className="text-[14px] font-semibold text-[#0F172A] mb-4">{t('popularSearches')}</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map(({ label, query: q }) => (
                <button
                  key={q}
                  onClick={() => handleSearch(q, location)}
                  className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-full text-[13px] font-medium text-[#0F172A] hover:border-[#EA580C] hover:bg-[#FFF7ED] hover:text-[#EA580C] transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
            {geoState === 'granted' && detectedCity && (
              <p className="text-[12px] text-[#94A3B8] mt-4">
                {t('nearYou')} <span className="font-medium">{detectedCity}</span>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function JobCard({
  job, saving, onSave, t, suggested = false,
}: {
  job: Job
  saving: boolean
  onSave: () => void
  t: ReturnType<typeof useTranslations<'jobs'>>
  suggested?: boolean
}) {
  const postedDate = job.posted_at
    ? new Date(job.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md hover:border-[#CBD5E1] transition-all">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center shrink-0 overflow-hidden">
          {job.logo ? (
            <img src={job.logo} alt={job.company} className="w-8 h-8 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ) : (
            <Briefcase className="w-5 h-5 text-[#CBD5E1]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-[#0F172A] text-[15px] leading-snug">{job.title}</h2>
                {suggested && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#F3EEFF] text-[#7C3AED] text-[10px] font-semibold">
                    <Sparkles className="w-2.5 h-2.5" /> Match
                  </span>
                )}
              </div>
              <p className="text-[#64748B] text-[13px] mt-0.5">{job.company}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {postedDate && <span className="text-[12px] text-[#94A3B8]">{postedDate}</span>}
              <button
                onClick={onSave}
                disabled={saving}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${job.is_saved ? 'bg-[#EEF2FF] border-[#1B4FFF] text-[#1B4FFF]' : 'border-[#E2E8F0] text-[#94A3B8] hover:border-[#1B4FFF] hover:text-[#1B4FFF]'}`}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : job.is_saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2.5">
            {job.location && <MetaChip icon={<MapPin className="w-3 h-3" />} label={job.location} />}
            {job.is_remote && <MetaChip icon={<Wifi className="w-3 h-3" />} label={t('remoteLabel')} color="text-[#00C97A] bg-[#E6FBF3] border-[#00C97A]/20" />}
            {job.employment_type && <MetaChip icon={<Briefcase className="w-3 h-3" />} label={job.employment_type} />}
            {job.salary && <MetaChip icon={<DollarSign className="w-3 h-3" />} label={job.salary} color="text-[#7C3AED] bg-[#F5F3FF] border-[#7C3AED]/20" />}
          </div>

          {job.description && (
            <p className="text-[13px] text-[#64748B] mt-3 line-clamp-2 leading-relaxed">{job.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#F1F5F9]">
            <a href={job.apply_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] hover:bg-[#c2410c] text-white text-[12px] font-semibold rounded-lg transition-colors">
              {t('apply')} <ExternalLink className="w-3 h-3" />
            </a>
            <a href={`/job-analyzer?prefill=${encodeURIComponent(`${job.title} at ${job.company}\n\n${job.description}`)}`}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#00C97A] text-[#00C97A] text-[12px] font-semibold rounded-lg hover:bg-[#E6FBF3] transition-colors">
              {t('analyze')} <ChevronRight className="w-3 h-3" />
            </a>
            <a href={`/cv-optimizer?job=${encodeURIComponent(`${job.title} at ${job.company}\n\n${job.description}`)}`}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] text-[#64748B] text-[12px] font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors">
              {t('optimizeCv')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaChip({ icon, label, color = 'text-[#64748B] bg-[#F8FAFC] border-[#E2E8F0]' }: {
  icon: React.ReactNode; label: string; color?: string
}) {
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${color}`}>
      {icon} {label}
    </span>
  )
}
