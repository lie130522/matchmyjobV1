'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Globe, Search, MapPin, Briefcase, DollarSign, Wifi,
  Bookmark, BookmarkCheck, ExternalLink, Loader2, AlertCircle,
  SlidersHorizontal, ChevronRight, LocateFixed, X,
} from 'lucide-react'

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

const EMPLOYMENT_TYPES = [
  { value: '', label: 'All types' },
  { value: 'fulltime', label: 'Full-time' },
  { value: 'parttime', label: 'Part-time' },
  { value: 'contractor', label: 'Contract' },
  { value: 'intern', label: 'Internship' },
]

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

  // Check if geolocation was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('mmj_geo_dismissed')
    if (dismissed) setGeoState('denied')
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
      setError('Network error. Please try again.')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [query, location, employmentType, remoteOnly])

  function requestGeolocation() {
    setGeoState('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Reverse geocode via free API (no key required)
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
          <h1 className="text-2xl font-bold text-[#0F172A]">Job Search</h1>
        </div>
        <p className="text-[#64748B]">
          Browse aggregated listings from Indeed, LinkedIn, Glassdoor and more. Saving is free — analyzing costs 1 attempt.
        </p>
      </div>

      {/* Geolocation banner */}
      {geoState === 'asking' && (
        <div className="flex items-center gap-3 bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl px-4 py-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-[#1B4FFF] flex items-center justify-center shrink-0">
            <LocateFixed className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#0F172A]">See jobs near you</p>
            <p className="text-[12px] text-[#64748B]">Allow location access to automatically filter listings by your city.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={requestGeolocation}
              className="px-3 py-1.5 bg-[#1B4FFF] hover:bg-[#1240D6] text-white text-[12px] font-semibold rounded-lg transition-colors"
            >
              Allow
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
          <p className="text-[13px] text-[#64748B]">Detecting your location…</p>
        </div>
      )}

      {geoState === 'granted' && detectedCity && (
        <div className="flex items-center gap-3 bg-[#E6FBF3] border border-[#00C97A]/30 rounded-xl px-4 py-3 mb-5">
          <MapPin className="w-4 h-4 text-[#00C97A] shrink-0" />
          <p className="text-[13px] text-[#0F172A]">
            Location detected: <span className="font-semibold">{detectedCity}</span>
            <span className="text-[#64748B] ml-1">— search results will be filtered to your area.</span>
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
              placeholder="Job title, keywords…"
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-colors"
            />
          </div>
          <div className="flex-1 min-w-40 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City, country…"
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-[13px] font-medium transition-colors ${showFilters ? 'border-[#EA580C] bg-[#FFF7ED] text-[#EA580C]' : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-white font-semibold text-[14px] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-[12px] font-medium text-[#64748B] mb-1.5">Employment type</label>
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
                <Wifi className="w-3.5 h-3.5" /> Remote only
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-[#64748B]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[15px]">Searching job listings…</span>
        </div>
      )}

      {/* Empty state with popular searches */}
      {!loading && !searched && (
        <div className="flex flex-col items-center py-8">
          <p className="text-[14px] font-semibold text-[#0F172A] mb-4">Popular searches</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
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
              Results will be filtered near <span className="font-medium">{detectedCity}</span>
            </p>
          )}
        </div>
      )}

      {/* No results */}
      {!loading && searched && jobs.length === 0 && !error && (
        <div className="text-center py-20 text-[#94A3B8]">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-[15px]">No jobs found. Try different keywords or location.</p>
        </div>
      )}

      {/* Results */}
      {!loading && jobs.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-[#94A3B8]">{jobs.length} result{jobs.length !== 1 ? 's' : ''}</p>
          {jobs.map(job => (
            <JobCard
              key={job.job_id}
              job={job}
              saving={savingIds.has(job.job_id)}
              onSave={() => toggleSave(job)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function JobCard({ job, saving, onSave }: {
  job: Job; saving: boolean; onSave: () => void
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
              <h2 className="font-semibold text-[#0F172A] text-[15px] leading-snug">{job.title}</h2>
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
            {job.is_remote && <MetaChip icon={<Wifi className="w-3 h-3" />} label="Remote" color="text-[#00C97A] bg-[#E6FBF3] border-[#00C97A]/20" />}
            {job.employment_type && <MetaChip icon={<Briefcase className="w-3 h-3" />} label={job.employment_type} />}
            {job.salary && <MetaChip icon={<DollarSign className="w-3 h-3" />} label={job.salary} color="text-[#7C3AED] bg-[#F5F3FF] border-[#7C3AED]/20" />}
          </div>

          {job.description && (
            <p className="text-[13px] text-[#64748B] mt-3 line-clamp-2 leading-relaxed">{job.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#F1F5F9]">
            <a href={job.apply_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] hover:bg-[#c2410c] text-white text-[12px] font-semibold rounded-lg transition-colors">
              Apply <ExternalLink className="w-3 h-3" />
            </a>
            <a href={`/job-analyzer?prefill=${encodeURIComponent(`${job.title} at ${job.company}\n\n${job.description}`)}`}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#00C97A] text-[#00C97A] text-[12px] font-semibold rounded-lg hover:bg-[#E6FBF3] transition-colors">
              Analyze <ChevronRight className="w-3 h-3" />
            </a>
            <a href={`/cv-optimizer?job=${encodeURIComponent(`${job.title} at ${job.company}\n\n${job.description}`)}`}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] text-[#64748B] text-[12px] font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors">
              Optimize CV for this job
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
