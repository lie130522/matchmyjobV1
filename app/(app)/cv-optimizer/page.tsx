'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Upload, FileText, X, AlertCircle, CheckCircle,
  Download, ChevronDown, ChevronUp, Zap, TrendingUp
} from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { UpgradeModal } from '@/components/app/UpgradeModal'
import { useLocale } from 'next-intl'
import { useCountUp } from '@/hooks/useCountUp'
import { CvOptimizerSkeleton } from '@/components/ui/Skeleton'

type Step = 'idle' | 'loading' | 'result' | 'error'

interface ATSResult {
  score_before: number
  score_after: number
  ats_issues: string[]
  missing_keywords: string[]
  present_keywords: string[]
  optimized_cv: string
  summary: string
}

export default function CvOptimizerPage() {
  const searchParams = useSearchParams()
  const locale = useLocale()
  const { subscription, consumeAttempt } = useSubscription()
  const [file, setFile] = useState<File | null>(null)
  const [profileCv, setProfileCv] = useState<{ filename: string; cv_text: string } | null>(null)
  const [useProfileCv, setUseProfileCv] = useState(false)
  const [jobOffer, setJobOffer] = useState('')

  // Charger le CV de profil au montage
  useEffect(() => {
    fetch('/api/profile/cv')
      .then(r => r.json())
      .then(d => {
        if (d.cv) {
          setProfileCv({ filename: d.cv.filename, cv_text: d.cv.cv_text })
          setUseProfileCv(true)
        }
      })
      .catch(() => {})
  }, [])

  // Pre-fill job offer from ?job= param (e.g., "Optimize CV for this job" from job cards)
  useEffect(() => {
    const job = searchParams.get('job')
    if (job) setJobOffer(decodeURIComponent(job))
  }, [searchParams])
  const [step, setStep] = useState<Step>('idle')
  const [result, setResult] = useState<ATSResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [dragging, setDragging] = useState(false)
  const [showOptimized, setShowOptimized] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(f.type)) {
      setErrorMsg('Only PDF and DOCX files are supported.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrorMsg('File must be under 10 MB.')
      return
    }
    setFile(f)
    setErrorMsg('')
    setResult(null)
    setStep('idle')
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const hasSource = useProfileCv ? !!profileCv : !!file
    if (!hasSource || !jobOffer.trim()) return

    if ((subscription?.attempts_remaining ?? 0) <= 0) {
      setShowUpgrade(true)
      return
    }

    setStep('loading')
    setErrorMsg('')

    // Consume 1 attempt first
    const consumed = await consumeAttempt('cv_optimizer')
    if (!consumed.success) {
      if (consumed.code === 'NO_ATTEMPTS') {
        setShowUpgrade(true)
        setStep('idle')
      } else {
        setErrorMsg(consumed.error ?? 'Failed to consume attempt.')
        setStep('error')
      }
      return
    }

    // Call AI API — utilise le CV de profil (texte) ou le fichier uploadé
    const form = new FormData()
    if (useProfileCv && profileCv) {
      // Créer un Blob texte pour simuler le fichier CV depuis le profil
      const blob = new Blob([profileCv.cv_text], { type: 'text/plain' })
      form.append('cv', blob, profileCv.filename)
      form.append('is_text_cv', 'true')
    } else {
      form.append('cv', file!)
    }
    form.append('job_offer', jobOffer)
    form.append('lang', locale)
    if (consumed.log_id) form.append('log_id', consumed.log_id)

    try {
      const res = await fetch('/api/ai/cv-optimizer', { method: 'POST', body: form })
      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error ?? 'An error occurred.')
        setStep('error')
        return
      }

      setResult(json)
      setStep('result')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStep('error')
    }
  }

  function downloadOptimized() {
    if (!result) return
    const blob = new Blob([result.optimized_cv], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `optimized_cv_${file?.name ?? 'cv'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setFile(null)
    setJobOffer('')
    setStep('idle')
    setResult(null)
    setErrorMsg('')
    setShowOptimized(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#1B4FFF]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">CV Optimizer</h1>
        </div>
        <p className="text-[#64748B]">
          Upload your CV and paste a job offer to get an ATS score, missing keywords, and an optimized version.{' '}
          <span className="inline-flex items-center gap-1 text-[#1B4FFF] font-medium text-[13px]">
            <Zap className="w-3 h-3" fill="currentColor" /> 1 attempt
          </span>
        </p>
      </div>

      {step !== 'result' && step !== 'loading' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* File upload */}
          <div>
            <label className="block text-[13px] font-semibold text-[#0F172A] mb-2">Your CV</label>

            {/* Profile CV card (auto-loaded from settings) */}
            {useProfileCv && profileCv && !file && (
              <div className="flex items-center gap-3 p-4 bg-[#EEF2FF] border border-[#1B4FFF]/30 rounded-xl">
                <FileText className="w-5 h-5 text-[#1B4FFF] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#0F172A] truncate">{profileCv.filename}</p>
                  <p className="text-[12px] text-[#64748B]">Profile CV · auto-loaded from Settings</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[12px] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] px-2 py-1 rounded-lg hover:bg-[#F8FAFC] transition-colors shrink-0"
                >
                  Replace
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) { setUseProfileCv(false); handleFile(f) } }}
                />
              </div>
            )}

            {/* Manually uploaded file card */}
            {file && (
              <div className="flex items-center gap-3 p-4 bg-[#EEF2FF] border border-[#1B4FFF]/30 rounded-xl">
                <FileText className="w-5 h-5 text-[#1B4FFF] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#0F172A] truncate">{file.name}</p>
                  <p className="text-[12px] text-[#64748B]">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button type="button" onClick={() => { setFile(null); if (profileCv) setUseProfileCv(true) }} className="text-[#94A3B8] hover:text-[#EF4444] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Drop zone — shown only when no file and no profile CV */}
            {!file && !(useProfileCv && profileCv) && (
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                  dragging ? 'border-[#1B4FFF] bg-[#EEF2FF]' : 'border-[#E2E8F0] hover:border-[#1B4FFF]/50 hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[#1B4FFF]" />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-medium text-[#0F172A]">Drop your CV here or click to browse</p>
                  <p className="text-[13px] text-[#94A3B8] mt-0.5">PDF or DOCX · Max 10 MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
              </div>
            )}
          </div>

          {/* Job offer */}
          <div>
            <label className="block text-[13px] font-semibold text-[#0F172A] mb-2">Job offer</label>
            <textarea
              value={jobOffer}
              onChange={(e) => setJobOffer(e.target.value)}
              placeholder="Paste the full job description here (title, requirements, responsibilities…)"
              rows={8}
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/20 focus:border-[#1B4FFF] transition-colors resize-none"
            />
            <p className="text-[12px] text-[#94A3B8] mt-1">{jobOffer.length} characters</p>
          </div>

          {/* Error */}
          {(errorMsg || step === 'error') && (
            <div className="flex items-start gap-2 p-3 bg-[#FEF2F2] rounded-xl border border-[#FECACA]">
              <AlertCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[#EF4444]">{errorMsg || 'An error occurred. Please try again.'}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!(file || (useProfileCv && profileCv)) || !jobOffer.trim()}
            className="flex items-center justify-center gap-2 py-3 bg-[#1B4FFF] hover:bg-[#1240D6] text-white font-semibold text-[15px] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
                <><Zap className="w-4 h-4" fill="white" /> {locale === 'fr' ? 'Optimiser mon CV — 1 tentative' : 'Optimize my CV — 1 attempt'}</>
          </button>
        </form>
      )}

      {/* Skeleton while AI processes */}
      {step === 'loading' && <CvOptimizerSkeleton />}

      {/* Result panels */}
      {step === 'result' && result && (
        <div className="flex flex-col gap-6">
          {/* Score banner */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div>
                <p className="text-[13px] font-medium text-[#64748B] mb-3">ATS Score</p>
                <div className="flex items-center gap-4">
                  <ScoreBadge score={result.score_before} label="Before" color="text-[#EF4444]" bg="bg-[#FEF2F2]" delay={0} />
                  <TrendingUp className="w-5 h-5 text-[#00C97A]" />
                  <ScoreBadge score={result.score_after} label="After" color="text-[#00C97A]" bg="bg-[#E6FBF3]" delay={300} />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadOptimized}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00C97A] hover:bg-[#00b36c] text-white text-[13px] font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" /> Download optimized CV
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] text-[13px] font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  New analysis
                </button>
              </div>
            </div>

            {result.summary && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-[#E6FBF3] rounded-lg border border-[#00C97A]/30">
                <CheckCircle className="w-4 h-4 text-[#00C97A] mt-0.5 shrink-0" />
                <p className="text-[13px] text-[#0F172A]">{result.summary}</p>
              </div>
            )}
          </div>

          {/* ATS Issues */}
          {result.ats_issues.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h2 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#EF4444]" /> ATS Issues detected
              </h2>
              <ul className="flex flex-col gap-2">
                {result.ats_issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#64748B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mt-1.5 shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.missing_keywords.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <h2 className="font-semibold text-[#0F172A] mb-3 text-[14px]">Missing keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#FEF2F2] text-[#EF4444] text-[12px] font-medium rounded-full border border-[#FECACA]">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.present_keywords.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <h2 className="font-semibold text-[#0F172A] mb-3 text-[14px]">Keywords already present</h2>
                <div className="flex flex-wrap gap-2">
                  {result.present_keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#E6FBF3] text-[#00C97A] text-[12px] font-medium rounded-full border border-[#00C97A]/30">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Optimized CV toggle */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <button
              onClick={() => setShowOptimized(!showOptimized)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#F8FAFC] transition-colors"
            >
              <span className="font-semibold text-[#0F172A]">View optimized CV text</span>
              {showOptimized ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
            </button>
            {showOptimized && (
              <div className="px-6 pb-6 border-t border-[#E2E8F0]">
                <pre className="mt-4 text-[12px] text-[#0F172A] whitespace-pre-wrap leading-relaxed font-mono bg-[#F8FAFC] rounded-xl p-4 overflow-auto max-h-96">
                  {result.optimized_cv}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreBadge({ score, label, color, bg, delay = 0 }: {
  score: number; label: string; color: string; bg: string; delay?: number
}) {
  const animated = useCountUp(score, 1200, 0)
  return (
    <div className={`flex flex-col items-center px-5 py-3 rounded-xl ${bg}`} style={{ transitionDelay: `${delay}ms` }}>
      <span className={`text-3xl font-bold font-mono ${color}`}>{animated}</span>
      <span className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wide mt-0.5">{label}</span>
    </div>
  )
}
