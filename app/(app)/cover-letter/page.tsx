'use client'

import { useState, useEffect } from 'react'
import { PenLine, Zap, Loader2, AlertCircle, Download, Copy, Check, Wand2, MessageSquare, FileText, X } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { UpgradeModal } from '@/components/app/UpgradeModal'
import { useLocale } from 'next-intl'

type Mode = 'auto' | 'guided'
type Step = 'mode' | 'form' | 'questions' | 'loading' | 'result' | 'error'

const GUIDED_QUESTIONS = [
  { key: 'achievement', label: 'Your top relevant achievement', placeholder: 'e.g. Led a team that reduced deployment time by 60%…' },
  { key: 'motivation', label: 'Why this role / company?', placeholder: 'e.g. I admire how this company approaches open-source…' },
  { key: 'experience', label: 'Most relevant experience for this job', placeholder: 'e.g. 3 years building React applications at scale…' },
  { key: 'extra', label: 'Anything else to highlight (optional)', placeholder: 'e.g. I relocated to Paris last year and am fully available…' },
]

export default function CoverLetterPage() {
  const locale = useLocale()
  const { subscription, consumeAttempt } = useSubscription()
  const [mode, setMode] = useState<Mode>('auto')
  const [step, setStep] = useState<Step>('mode')
  const [jobOffer, setJobOffer] = useState('')
  const [cvText, setCvText] = useState('')
  const [profileCvName, setProfileCvName] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [letter, setLetter] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Auto-load profile CV on mount
  useEffect(() => {
    fetch('/api/profile/cv')
      .then(r => r.json())
      .then(d => {
        if (d.cv?.cv_text) {
          setCvText(d.cv.cv_text)
          setProfileCvName(d.cv.filename ?? 'Profile CV')
        }
      })
      .catch(() => {})
  }, [])

  async function handleGenerate() {
    if ((subscription?.attempts_remaining ?? 0) <= 0) {
      setShowUpgrade(true)
      return
    }

    setStep('loading')
    setErrorMsg('')

    const consumed = await consumeAttempt('cover_letter')
    if (!consumed.success) {
      if (consumed.code === 'NO_ATTEMPTS') { setShowUpgrade(true); setStep('form'); return }
      setErrorMsg(consumed.error ?? 'Failed to consume attempt.')
      setStep('error')
      return
    }

    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          job_offer: jobOffer,
          cv_text: cvText || undefined,
          answers: mode === 'guided' ? answers : undefined,
          log_id: consumed.log_id,
          lang: locale,
        }),
      })
      const json = await res.json()

      if (!res.ok) { setErrorMsg(json.error ?? 'An error occurred.'); setStep('error'); return }

      setLetter(json.letter)
      setStep('result')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStep('error')
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([letter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cover_letter.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setStep('mode')
    setJobOffer('')
    // Preserve profile CV text on reset so user doesn't have to re-load it
    setAnswers({})
    setLetter('')
    setErrorMsg('')
  }

  // ── Mode selection ───────────────────────────────────────────
  if (step === 'mode') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
        <PageHeader />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <ModeCard
            icon={<Wand2 className="w-6 h-6 text-[#7C3AED]" />}
            bg="bg-[#F5F3FF]"
            title="Auto mode"
            description="Claude reads your CV and the job offer and writes a complete, tailored cover letter for you."
            cta="Generate automatically"
            ctaColor="bg-[#7C3AED] hover:bg-[#6d28d9]"
            onClick={() => { setMode('auto'); setStep('form') }}
          />
          <ModeCard
            icon={<MessageSquare className="w-6 h-6 text-[#1B4FFF]" />}
            bg="bg-[#EEF2FF]"
            title="Guided mode"
            description="Answer 4 quick questions about your experience. Claude uses your words to craft a more personal letter."
            cta="Answer questions first"
            ctaColor="bg-[#1B4FFF] hover:bg-[#1240D6]"
            onClick={() => { setMode('guided'); setStep('form') }}
          />
        </div>
      </div>
    )
  }

  // ── Auto form ────────────────────────────────────────────────
  if (step === 'form' && mode === 'auto') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
        <PageHeader />
        <div className="flex flex-col gap-5 mt-8">
          <div>
            <label className="block text-[13px] font-semibold text-[#0F172A] mb-2">Job offer <span className="text-[#EF4444]">*</span></label>
            <textarea
              value={jobOffer}
              onChange={e => setJobOffer(e.target.value)}
              placeholder="Paste the job description here…"
              rows={8}
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-colors resize-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[13px] font-semibold text-[#0F172A]">Your CV text <span className="text-[#94A3B8] font-normal">(optional but recommended)</span></label>
              {profileCvName && cvText && (
                <span className="flex items-center gap-1 text-[11px] text-[#00C97A] font-medium">
                  <FileText className="w-3 h-3" /> {profileCvName}
                </span>
              )}
            </div>
            {!cvText && <p className="text-[12px] text-[#94A3B8] mb-2">Paste the text content of your CV so Claude can personalize the letter.</p>}
            <div className="relative">
              <textarea
                value={cvText}
                onChange={e => { setCvText(e.target.value); if (!e.target.value) setProfileCvName(null) }}
                placeholder="Paste your CV text here…"
                rows={5}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-colors resize-none"
              />
              {cvText && (
                <button
                  onClick={() => { setCvText(''); setProfileCvName(null) }}
                  className="absolute top-2 right-2 p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
                  title="Clear CV text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <ErrorBox msg={errorMsg} />
          <div className="flex gap-2">
            <button onClick={() => setStep('mode')} className="px-4 py-2.5 border border-[#E2E8F0] text-[#64748B] text-[13px] font-medium rounded-xl hover:bg-[#F8FAFC] transition-colors">
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={!jobOffer.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-semibold text-[15px] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" fill="white" /> Generate cover letter — 1 attempt
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Guided form ──────────────────────────────────────────────
  if (step === 'form' && mode === 'guided') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
        <PageHeader />
        <div className="flex flex-col gap-5 mt-8">
          <div>
            <label className="block text-[13px] font-semibold text-[#0F172A] mb-2">Job offer <span className="text-[#EF4444]">*</span></label>
            <textarea
              value={jobOffer}
              onChange={e => setJobOffer(e.target.value)}
              placeholder="Paste the job description here…"
              rows={5}
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/20 focus:border-[#1B4FFF] transition-colors resize-none"
            />
          </div>

          <div className="border-t border-[#E2E8F0] pt-5">
            <p className="text-[13px] font-semibold text-[#0F172A] mb-4">Your answers — used to personalize the letter</p>
            <div className="flex flex-col gap-4">
              {GUIDED_QUESTIONS.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
                    {label}
                    {key !== 'extra' && <span className="text-[#EF4444] ml-0.5">*</span>}
                  </label>
                  <textarea
                    value={answers[key] ?? ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    rows={2}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/20 focus:border-[#1B4FFF] transition-colors resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <ErrorBox msg={errorMsg} />
          <div className="flex gap-2">
            <button onClick={() => setStep('mode')} className="px-4 py-2.5 border border-[#E2E8F0] text-[#64748B] text-[13px] font-medium rounded-xl hover:bg-[#F8FAFC] transition-colors">
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={!jobOffer.trim() || !answers.achievement?.trim() || !answers.motivation?.trim() || !answers.experience?.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1B4FFF] hover:bg-[#1240D6] text-white font-semibold text-[15px] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" fill="white" /> Generate cover letter — 1 attempt
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Loading ──────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center justify-center min-h-64 gap-4">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        <p className="text-[#64748B] text-[15px]">Writing your cover letter…</p>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageHeader />
        <div className="mt-8 flex items-start gap-2 p-4 bg-[#FEF2F2] rounded-xl border border-[#FECACA]">
          <AlertCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
          <p className="text-[13px] text-[#EF4444]">{errorMsg}</p>
        </div>
        <button onClick={reset} className="mt-4 px-4 py-2 border border-[#E2E8F0] text-[#64748B] text-[13px] rounded-lg hover:bg-[#F8FAFC] transition-colors">
          Start over
        </button>
      </div>
    )
  }

  // ── Result ───────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <PageHeader />

      <div className="mt-8 bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <span className="text-[13px] font-medium text-[#64748B]">
            {mode === 'auto' ? 'Auto-generated' : 'Guided'} cover letter · {letter.split(/\s+/).length} words
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[12px] font-medium text-[#64748B] hover:bg-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00C97A]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6d28d9] text-white rounded-lg text-[12px] font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        </div>

        {/* Letter content */}
        <div className="px-8 py-6">
          <p className="text-[15px] text-[#0F172A] leading-relaxed whitespace-pre-wrap">{letter}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={reset} className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] text-[13px] font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors">
          Write another
        </button>
        <button
          onClick={() => { setStep('form'); setLetter('') }}
          className="px-4 py-2 border border-[#7C3AED] text-[#7C3AED] text-[13px] font-medium rounded-lg hover:bg-[#F5F3FF] transition-colors"
        >
          Regenerate
        </button>
      </div>
    </div>
  )
}

function PageHeader() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center">
          <PenLine className="w-5 h-5 text-[#7C3AED]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Cover Letter</h1>
      </div>
      <p className="text-[#64748B]">
        Generate a tailored cover letter automatically or get guided through a structured writing session.{' '}
        <span className="inline-flex items-center gap-1 text-[#1B4FFF] font-medium text-[13px]">
          <Zap className="w-3 h-3" fill="currentColor" /> 1 attempt
        </span>
      </p>
    </div>
  )
}

function ModeCard({ icon, bg, title, description, cta, ctaColor, onClick }: {
  icon: React.ReactNode; bg: string; title: string; description: string
  cta: string; ctaColor: string; onClick: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col gap-4 hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>{icon}</div>
      <div>
        <h2 className="font-semibold text-[#0F172A] mb-1">{title}</h2>
        <p className="text-[13px] text-[#64748B] leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onClick}
        className={`mt-auto flex items-center justify-center gap-2 py-2.5 text-white text-[13px] font-semibold rounded-xl transition-colors ${ctaColor}`}
      >
        {cta}
      </button>
    </div>
  )
}

function ErrorBox({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div className="flex items-start gap-2 p-3 bg-[#FEF2F2] rounded-xl border border-[#FECACA]">
      <AlertCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
      <p className="text-[13px] text-[#EF4444]">{msg}</p>
    </div>
  )
}
