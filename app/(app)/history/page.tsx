'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { ArrowLeft, FileText, Search, PenLine, Clock, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'

type Feature = 'cv_optimizer' | 'job_analyzer' | 'cover_letter'

interface HistoryEntry {
  id: string
  feature: Feature
  title: string
  input_text: string | null
  result: Record<string, unknown>
  lang: string
  created_at: string
}

const FEATURE_META: Record<Feature, { label: string; icon: typeof FileText; color: string; bg: string; href: string }> = {
  cv_optimizer:  { label: 'CV Optimizer',   icon: FileText, color: 'text-[#1B4FFF]', bg: 'bg-[#EEF2FF]', href: '/cv-optimizer' },
  job_analyzer:  { label: 'Job Analyzer',   icon: Search,   color: 'text-[#00C97A]', bg: 'bg-[#E6FBF3]', href: '/job-analyzer' },
  cover_letter:  { label: 'Cover Letter',   icon: PenLine,  color: 'text-[#7C3AED]', bg: 'bg-[#F5F3FF]', href: '/cover-letter' },
}

export default function HistoryPage() {
  const locale = useLocale()
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(d => { setEntries(d.entries ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function toggle(id: string) {
    setExpanded(prev => prev === id ? null : id)
  }

  // Group entries by date
  const grouped = entries.reduce<Record<string, HistoryEntry[]>>((acc, e) => {
    const date = new Date(e.created_at).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
    if (!acc[date]) acc[date] = []
    acc[date].push(e)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#0F172A] mb-8 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Retour au tableau de bord
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
          <Clock className="w-5 h-5 text-[#64748B]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Historique</h1>
          <p className="text-[13px] text-[#64748B]">{entries.length} opération{entries.length !== 1 ? 's' : ''} sauvegardée{entries.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20 text-[#94A3B8]">
          <div className="w-5 h-5 border-2 border-[#E2E8F0] border-t-[#1B4FFF] rounded-full animate-spin" />
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-[#94A3B8]" />
          </div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Aucun historique</h2>
          <p className="text-[14px] text-[#64748B] max-w-xs mb-6">
            Vos analyses, optimisations de CV et lettres de motivation apparaîtront ici après chaque utilisation.
          </p>
          <Link href="/dashboard" className="px-5 py-2.5 bg-[#1B4FFF] text-white text-[14px] font-semibold rounded-xl hover:bg-[#1240D6] transition-colors">
            Commencer
          </Link>
        </div>
      )}

      {!loading && Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="mb-8">
          <p className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3 capitalize">{date}</p>
          <div className="flex flex-col gap-3">
            {items.map(entry => {
              const meta = FEATURE_META[entry.feature]
              const Icon = meta.icon
              const isOpen = expanded === entry.id
              const time = new Date(entry.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

              return (
                <div key={entry.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => toggle(entry.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-[#F8FAFC] transition-colors text-left"
                  >
                    <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[13px] text-[#0F172A] truncate">{entry.title}</p>
                      <p className="text-[12px] text-[#94A3B8]">{meta.label} · {time}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${entry.lang === 'fr' ? 'bg-[#EEF2FF] text-[#1B4FFF]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                        {entry.lang.toUpperCase()}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
                    </div>
                  </button>

                  {/* Expanded result */}
                  {isOpen && (
                    <div className="border-t border-[#F1F5F9] p-4">
                      <ResultView feature={entry.feature} result={entry.result} />
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={meta.href}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] text-[#64748B] text-[12px] font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Nouvelle analyse
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function ResultView({ feature, result }: { feature: Feature; result: Record<string, unknown> }) {
  if (feature === 'job_analyzer') {
    const skills = result.required_skills as string[] | undefined
    const flags = result.red_flags as string[] | undefined
    const matchScore = result.match_score as number | null | undefined
    const location = result.location as string | null | undefined
    const level = result.level as string | null | undefined
    const closingDate = result.closing_date as string | null | undefined

    return (
      <div className="flex flex-col gap-3 text-[13px]">
        {/* Job identity */}
        {result.job_title ? (
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <p>
              <span className="font-semibold text-[#0F172A]">{String(result.job_title)}</span>
              {result.company ? <span className="text-[#64748B]"> — {String(result.company)}</span> : null}
            </p>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {level && level !== 'Unknown' && level !== 'Inconnu' && (
                <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#1B4FFF] text-[11px] font-semibold rounded-full">{level}</span>
              )}
              {matchScore !== null && matchScore !== undefined && (
                <span className="px-2 py-0.5 bg-[#E6FBF3] text-[#00C97A] text-[11px] font-semibold rounded-full">
                  Match {matchScore}%
                </span>
              )}
            </div>
          </div>
        ) : null}
        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          {location ? <span className="text-[11px] text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{location}</span> : null}
          {closingDate ? <span className="text-[11px] text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">Closes {closingDate}</span> : null}
        </div>
        {/* Skills */}
        {skills?.length ? (
          <div>
            <p className="text-[12px] font-semibold text-[#64748B] mb-1.5">Compétences requises</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 10).map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-[#EEF2FF] text-[#1B4FFF] text-[11px] font-medium rounded-full">{s}</span>
              ))}
              {skills.length > 10 && <span className="text-[11px] text-[#94A3B8]">+{skills.length - 10}</span>}
            </div>
          </div>
        ) : null}
        {/* Red flags */}
        {flags?.length ? (
          <div>
            <p className="text-[12px] font-semibold text-[#64748B] mb-1">⚠️ Red flags</p>
            <ul className="list-disc pl-4 space-y-1 text-[#64748B]">
              {flags.slice(0, 3).map((f, i) => <li key={i}>{f}</li>)}
              {flags.length > 3 && <li className="text-[#94A3B8]">+{flags.length - 3} more</li>}
            </ul>
          </div>
        ) : null}
      </div>
    )
  }

  if (feature === 'cv_optimizer') {
    return (
      <div className="flex flex-col gap-3 text-[13px]">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-[11px] text-[#94A3B8]">Score initial</p>
            <p className="text-xl font-bold text-[#EF4444]">{result.score_before as number}</p>
          </div>
          <div className="text-[#94A3B8]">→</div>
          <div className="text-center">
            <p className="text-[11px] text-[#94A3B8]">Score optimisé</p>
            <p className="text-xl font-bold text-[#00C97A]">{result.score_after as number}</p>
          </div>
        </div>
        {result.summary ? <p className="text-[#64748B] italic">&ldquo;{String(result.summary)}&rdquo;</p> : null}
        {(result.missing_keywords as string[] | undefined)?.length ? (
          <div>
            <p className="text-[12px] font-semibold text-[#64748B] mb-1.5">Mots-clés ajoutés</p>
            <div className="flex flex-wrap gap-1.5">
              {(result.missing_keywords as string[]).slice(0, 8).map((k, i) => (
                <span key={i} className="px-2 py-0.5 bg-[#E6FBF3] text-[#00C97A] text-[11px] font-medium rounded-full">{k}</span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  if (feature === 'cover_letter') {
    const letter = result.letter as string | undefined
    return (
      <div className="text-[13px] text-[#64748B] leading-relaxed line-clamp-6 whitespace-pre-line">
        {letter ?? '—'}
      </div>
    )
  }

  return null
}
