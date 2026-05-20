'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search, Link2, FileText, Loader2, AlertCircle, Zap,
  MapPin, Briefcase, DollarSign, Calendar, Clock, Globe2,
  ChevronRight, Flag, CheckCircle2, TrendingUp, GraduationCap,
  ShieldCheck, FileCheck, Users, Phone, Mail, Star,
  Building2, Hash, Wifi, WifiOff, UserCheck, Award,
  AlertTriangle, Lightbulb, Activity, BarChart3,
} from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { UpgradeModal } from '@/components/app/UpgradeModal'
import { useLocale } from 'next-intl'
import type { JobAnalysisResult } from '@/app/api/ai/job-analyzer/route'
import { JobAnalyzerSkeleton } from '@/components/ui/Skeleton'

type InputType = 'url' | 'text'
type Step = 'idle' | 'loading' | 'result' | 'error'
type TabId = 'overview' | 'requirements' | 'application' | 'analysis'

interface JobResult extends JobAnalysisResult { has_cv: boolean }

// ─── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function levelColor(level: string) {
  if (/junior|accessible/i.test(level)) return 'bg-[#E6FBF3] text-[#00C97A]'
  if (/mid|intermédiaire|moderate/i.test(level)) return 'bg-[#EEF2FF] text-[#1B4FFF]'
  if (/senior/i.test(level)) return 'bg-[#F5F3FF] text-[#7C3AED]'
  if (/executive|cadre/i.test(level)) return 'bg-[#FEF3C7] text-[#92400E]'
  return 'bg-[#F1F5F9] text-[#64748B]'
}

function difficultyConfig(d: string) {
  if (/easy|accessible/i.test(d)) return { color: 'text-[#00C97A]', bg: 'bg-[#E6FBF3]', bar: 'bg-[#00C97A]', pct: 25 }
  if (/moderate|modéré/i.test(d)) return { color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]', bar: 'bg-[#F59E0B]', pct: 50 }
  if (/very|très/i.test(d)) return { color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]', bar: 'bg-[#EF4444]', pct: 100 }
  if (/competitive|compétitif/i.test(d)) return { color: 'text-[#F97316]', bg: 'bg-[#FFF7ED]', bar: 'bg-[#F97316]', pct: 75 }
  return { color: 'text-[#64748B]', bg: 'bg-[#F1F5F9]', bar: 'bg-[#94A3B8]', pct: 50 }
}

function scoreConfig(s: number) {
  if (s >= 75) return { color: '#00C97A', label: 'Strong match' }
  if (s >= 50) return { color: '#F59E0B', label: 'Partial match' }
  return { color: '#EF4444', label: 'Low match' }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Tag({ children, variant = 'blue' }: { children: React.ReactNode; variant?: 'blue' | 'green' | 'gray' | 'red' | 'violet' }) {
  const cls = {
    blue: 'bg-[#EEF2FF] text-[#1B4FFF]',
    green: 'bg-[#E6FBF3] text-[#00C97A]',
    gray: 'bg-[#F1F5F9] text-[#64748B]',
    red: 'bg-[#FEF2F2] text-[#EF4444]',
    violet: 'bg-[#F5F3FF] text-[#7C3AED]',
  }[variant]
  return <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${cls}`}>{children}</span>
}

function Section({ title, icon, children, borderColor = 'border-[#E2E8F0]' }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; borderColor?: string
}) {
  return (
    <div className={`bg-white rounded-2xl border ${borderColor} p-5`}>
      <h3 className="font-semibold text-[#0F172A] text-[14px] flex items-center gap-2 mb-4">
        {icon}{title}
      </h3>
      {children}
    </div>
  )
}

function BulletList({ items, color = '#64748B', bullet = '#1B4FFF' }: { items: string[]; color?: string; bullet?: string }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[13px]" style={{ color }}>
          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: bullet }} />
          {item}
        </li>
      ))}
    </ul>
  )
}

function MetaBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[12px] text-[#64748B] font-medium">
      <span className="text-[#94A3B8]">{icon}</span>
      {label}
    </div>
  )
}

function MatchScoreGauge({ score }: { score: number }) {
  const { color, label } = scoreConfig(score)
  const radius = 44
  const circ = 2 * Math.PI * radius
  const offset = circ - (score / 100) * circ
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="60" y="55" textAnchor="middle" fontSize="24" fontWeight="700" fill={color}>{score}</text>
        <text x="60" y="73" textAnchor="middle" fontSize="11" fill="#94A3B8">/ 100</text>
      </svg>
      <span className="text-[12px] font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; labelFr: string }[] = [
  { id: 'overview', label: 'Overview', labelFr: 'Aperçu' },
  { id: 'requirements', label: 'Requirements', labelFr: 'Exigences' },
  { id: 'application', label: 'Application', labelFr: 'Candidature' },
  { id: 'analysis', label: 'Analysis', labelFr: 'Analyse' },
]

// ─── Tab: Overview ─────────────────────────────────────────────────────────────

function OverviewTab({ r, onReset, jobContent, locale }: {
  r: JobResult; onReset: () => void; jobContent: string; locale: string
}) {
  const days = daysUntil(r.closing_date)
  const diff = r.difficulty_level ? difficultyConfig(r.difficulty_level) : null

  return (
    <div className="flex flex-col gap-5">
      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {r.announcement_number && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-[#94A3B8]">
                  <Hash className="w-3 h-3" />{r.announcement_number}
                </span>
              )}
              {r.is_supervisory && (
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full">
                  <UserCheck className="w-3 h-3" /> Supervisory
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] leading-tight">{r.job_title}</h2>
            {r.company && (
              <p className="text-[14px] text-[#64748B] font-medium mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />{r.company}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {r.level && r.level !== 'Unknown' && r.level !== 'Inconnu' && (
              <span className={`px-3 py-1 rounded-full text-[12px] font-semibold ${levelColor(r.level)}`}>
                {r.level}
              </span>
            )}
            {days !== null && (
              <span className={`flex items-center gap-1 text-[12px] font-semibold px-3 py-1 rounded-full ${
                days <= 3 ? 'bg-[#FEF2F2] text-[#EF4444]' : days <= 7 ? 'bg-[#FFF7ED] text-[#F97316]' : 'bg-[#F1F5F9] text-[#64748B]'
              }`}>
                <Calendar className="w-3 h-3" />
                {days > 0 ? `${days}d left` : days === 0 ? 'Closes today' : 'Closed'}
              </span>
            )}
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {r.location && <MetaBadge icon={<MapPin className="w-3 h-3" />} label={r.location} />}
          {r.contract_type && <MetaBadge icon={<Briefcase className="w-3 h-3" />} label={r.contract_type} />}
          {r.work_schedule && <MetaBadge icon={<Clock className="w-3 h-3" />} label={r.work_schedule} />}
          {r.salary && <MetaBadge icon={<DollarSign className="w-3 h-3" />} label={r.salary} />}
          {r.telework && (
            <MetaBadge
              icon={r.telework === 'No' || r.telework === 'Non' ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              label={`Telework: ${r.telework}`}
            />
          )}
          {r.timezone && <MetaBadge icon={<Globe2 className="w-3 h-3" />} label={r.timezone} />}
          {r.appointment_type && <MetaBadge icon={<Award className="w-3 h-3" />} label={r.appointment_type} />}
          {r.closing_date && <MetaBadge icon={<Calendar className="w-3 h-3" />} label={`Closes ${r.closing_date}`} />}
        </div>

        {/* Actions */}
        <div className="mt-5 pt-4 border-t border-[#F1F5F9] flex gap-2 flex-wrap">
          <button onClick={onReset} className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] text-[13px] font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors">
            {locale === 'fr' ? 'Nouvelle analyse' : 'New analysis'}
          </button>
          <a
            href={`/cv-optimizer?job=${encodeURIComponent(jobContent)}`}
            className="px-4 py-2 bg-[#1B4FFF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1240D6] transition-colors flex items-center gap-1.5"
          >
            {locale === 'fr' ? 'Optimiser mon CV' : 'Optimize my CV'} <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Difficulty + quick match */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {diff && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <h3 className="text-[13px] font-semibold text-[#64748B] mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> {locale === 'fr' ? 'Difficulté estimée' : 'Estimated difficulty'}
            </h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${diff.bg} mb-3`}>
              <span className={`text-[14px] font-bold ${diff.color}`}>{r.difficulty_level}</span>
            </div>
            <div className="w-full bg-[#F1F5F9] rounded-full h-2">
              <div className={`h-2 rounded-full ${diff.bar}`} style={{ width: `${diff.pct}%` }} />
            </div>
          </div>
        )}
        {r.match_score !== null && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex flex-col items-center">
            <h3 className="text-[13px] font-semibold text-[#64748B] mb-3 w-full flex items-center gap-2">
              <Activity className="w-4 h-4" /> {locale === 'fr' ? 'Adéquation CV' : 'CV Match Score'}
            </h3>
            <MatchScoreGauge score={r.match_score} />
          </div>
        )}
        {!r.has_cv && (
          <div className="sm:col-span-2 flex items-center gap-3 p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl">
            <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
            <p className="text-[13px] text-[#92400E]">
              {locale === 'fr'
                ? <>Uploadez votre CV dans les <a href="/settings" className="font-semibold underline">Paramètres</a> pour obtenir votre score d&apos;adéquation personnalisé.</>
                : <>Upload your CV in <a href="/settings" className="font-semibold underline">Settings</a> to get a personal match score for this job.</>}
            </p>
          </div>
        )}
      </div>

      {/* Critical requirements */}
      {r.critical_requirements.length > 0 && (
        <Section title={locale === 'fr' ? 'Exigences critiques — disqualifiantes si absentes' : 'Critical requirements — disqualifying if missing'} icon={<AlertTriangle className="w-4 h-4 text-[#EF4444]" />} borderColor="border-[#FECACA]">
          <div className="flex flex-col gap-2">
            {r.critical_requirements.map((req, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 bg-[#FEF2F2] rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444] mt-0.5 shrink-0" />
                <span className="text-[13px] text-[#0F172A] font-medium">{req}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Key responsibilities */}
      {r.key_responsibilities.length > 0 && (
        <Section title={locale === 'fr' ? 'Responsabilités clés' : 'Key responsibilities'} icon={<Briefcase className="w-4 h-4 text-[#7C3AED]" />}>
          <BulletList items={r.key_responsibilities} bullet="#7C3AED" />
        </Section>
      )}
    </div>
  )
}

// ─── Tab: Requirements ─────────────────────────────────────────────────────────

function RequirementsTab({ r, locale }: { r: JobResult; locale: string }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Experience */}
      {(r.years_experience_required !== null || r.experience_details.length > 0) && (
        <Section title={locale === 'fr' ? 'Expérience requise' : 'Required experience'} icon={<Briefcase className="w-4 h-4 text-[#1B4FFF]" />}>
          {r.years_experience_required !== null && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-bold font-mono text-[#1B4FFF]">{r.years_experience_required}</span>
              <span className="text-[14px] text-[#64748B]">{locale === 'fr' ? 'ans minimum' : 'years minimum'}</span>
            </div>
          )}
          {r.experience_details.length > 0 && <BulletList items={r.experience_details} bullet="#1B4FFF" />}
        </Section>
      )}

      {/* Education */}
      {(r.education_required || r.education_fields.length > 0) && (
        <Section title={locale === 'fr' ? 'Formation requise' : 'Education requirements'} icon={<GraduationCap className="w-4 h-4 text-[#7C3AED]" />}>
          {r.education_required && (
            <div className="flex items-center gap-2 p-3 bg-[#F5F3FF] rounded-xl mb-3">
              <GraduationCap className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <span className="text-[13px] font-semibold text-[#7C3AED]">{r.education_required}</span>
            </div>
          )}
          {r.education_fields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {r.education_fields.map((f, i) => <Tag key={i} variant="violet">{f}</Tag>)}
            </div>
          )}
        </Section>
      )}

      {/* Languages */}
      {r.languages.length > 0 && (
        <Section title={locale === 'fr' ? 'Langues' : 'Languages'} icon={<Globe2 className="w-4 h-4 text-[#00C97A]" />}>
          <div className="flex flex-col gap-2">
            {r.languages.map((lang, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#0F172A]">{lang.language}</span>
                  <span className="text-[12px] text-[#64748B]">— {lang.capabilities}</span>
                </div>
                <Tag variant={/fluent/i.test(lang.level) ? 'green' : 'gray'}>{lang.level}</Tag>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Required skills */}
      {r.required_skills.length > 0 && (
        <Section title={locale === 'fr' ? 'Compétences requises' : 'Required skills'} icon={<TrendingUp className="w-4 h-4 text-[#1B4FFF]" />}>
          <div className="flex flex-wrap gap-2">
            {r.required_skills.map((s, i) => <Tag key={i} variant="blue">{s}</Tag>)}
          </div>
        </Section>
      )}

      {/* Nice to have */}
      {r.nice_to_have_skills.length > 0 && (
        <Section title={locale === 'fr' ? 'Compétences appréciées' : 'Nice to have'} icon={<CheckCircle2 className="w-4 h-4 text-[#00C97A]" />}>
          <div className="flex flex-wrap gap-2">
            {r.nice_to_have_skills.map((s, i) => <Tag key={i} variant="green">{s}</Tag>)}
          </div>
        </Section>
      )}

      {/* Working conditions */}
      {(r.working_conditions.length > 0 || r.physical_requirements.length > 0) && (
        <Section title={locale === 'fr' ? 'Conditions de travail' : 'Working conditions'} icon={<Activity className="w-4 h-4 text-[#F59E0B]" />}>
          {r.working_conditions.length > 0 && (
            <div className="mb-3">
              <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                {locale === 'fr' ? 'Environnement' : 'Environment'}
              </p>
              <div className="flex flex-wrap gap-2">
                {r.working_conditions.map((c, i) => <Tag key={i} variant="gray">{c}</Tag>)}
              </div>
            </div>
          )}
          {r.physical_requirements.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                {locale === 'fr' ? 'Exigences physiques' : 'Physical requirements'}
              </p>
              <BulletList items={r.physical_requirements} bullet="#F59E0B" />
            </div>
          )}
        </Section>
      )}
    </div>
  )
}

// ─── Tab: Application ──────────────────────────────────────────────────────────

function ApplicationTab({ r, locale }: { r: JobResult; locale: string }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Security */}
      {(r.security_clearance || r.background_investigation || r.medical_exam) && (
        <Section title={locale === 'fr' ? 'Sécurité & habilitations' : 'Security & clearance'} icon={<ShieldCheck className="w-4 h-4 text-[#EF4444]" />} borderColor="border-[#FECACA]">
          <div className="flex flex-col gap-2">
            {r.security_clearance && (
              <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] rounded-xl">
                <ShieldCheck className="w-4 h-4 text-[#EF4444] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#EF4444] font-semibold uppercase tracking-wider">
                    {locale === 'fr' ? 'Habilitation requise' : 'Security clearance required'}
                  </p>
                  <p className="text-[13px] font-semibold text-[#0F172A]">{r.security_clearance}</p>
                </div>
              </div>
            )}
            {r.background_investigation && (
              <div className="flex items-center gap-2 text-[13px] text-[#64748B] p-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                {locale === 'fr' ? 'Enquête de fond (background investigation) requise' : 'Background investigation required'}
              </div>
            )}
            {r.medical_exam && (
              <div className="flex items-center gap-2 text-[13px] text-[#64748B] p-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                {locale === 'fr' ? 'Examen médical pré-emploi requis' : 'Pre-employment medical exam required'}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Required documents */}
      {r.required_documents.length > 0 && (
        <Section title={locale === 'fr' ? 'Documents à fournir' : 'Required documents'} icon={<FileCheck className="w-4 h-4 text-[#1B4FFF]" />}>
          <div className="flex flex-col gap-2">
            {r.required_documents.map((doc, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-[#1B4FFF] shrink-0" />
                  <span className="text-[13px] text-[#0F172A] font-medium">{doc.name}</span>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  doc.required_for === 'All Applicants' || doc.required_for === 'Tous les candidats'
                    ? 'bg-[#EEF2FF] text-[#1B4FFF]'
                    : 'bg-[#F1F5F9] text-[#64748B]'
                }`}>
                  {doc.required_for}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Application steps */}
      {r.application_steps.length > 0 && (
        <Section title={locale === 'fr' ? 'Étapes de candidature' : 'Application steps'} icon={<CheckCircle2 className="w-4 h-4 text-[#00C97A]" />}>
          <div className="flex flex-col gap-2">
            {r.application_steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#1B4FFF] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[13px] text-[#64748B]">{step}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Evaluation methods */}
      {r.evaluation_methods.length > 0 && (
        <Section title={locale === 'fr' ? 'Méthodes d\'évaluation' : 'Evaluation methods'} icon={<Star className="w-4 h-4 text-[#F59E0B]" />}>
          <BulletList items={r.evaluation_methods} bullet="#F59E0B" />
        </Section>
      )}

      {/* Timing */}
      {(r.closing_date || r.start_timeline) && (
        <Section title={locale === 'fr' ? 'Calendrier' : 'Timeline'} icon={<Calendar className="w-4 h-4 text-[#7C3AED]" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {r.closing_date && (
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                  {locale === 'fr' ? 'Date limite' : 'Closing date'}
                </p>
                <p className="text-[14px] font-bold text-[#0F172A]">{r.closing_date}</p>
                {daysUntil(r.closing_date) !== null && (
                  <p className="text-[12px] text-[#64748B] mt-0.5">{daysUntil(r.closing_date)} {locale === 'fr' ? 'jours restants' : 'days remaining'}</p>
                )}
              </div>
            )}
            {r.start_timeline && (
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                  {locale === 'fr' ? 'Prise de poste' : 'Start timeline'}
                </p>
                <p className="text-[14px] font-bold text-[#0F172A]">{r.start_timeline}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Hiring preference */}
      {r.hiring_preference.length > 0 && (
        <Section title={locale === 'fr' ? 'Ordre de priorité des candidatures' : 'Hiring preference order'} icon={<Users className="w-4 h-4 text-[#64748B]" />}>
          <div className="flex flex-col gap-2">
            {r.hiring_preference.map((pref, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="w-5 h-5 rounded-full bg-[#E2E8F0] text-[#64748B] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-[13px] text-[#64748B]">{pref}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Contact */}
      {r.contact && (r.contact.phone || r.contact.email) && (
        <Section title={locale === 'fr' ? 'Contact RH' : 'HR Contact'} icon={<Phone className="w-4 h-4 text-[#00C97A]" />}>
          <div className="flex flex-col gap-2">
            {r.contact.phone && (
              <a href={`tel:${r.contact.phone}`} className="flex items-center gap-2 text-[13px] text-[#0F172A] hover:text-[#1B4FFF] transition-colors">
                <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />{r.contact.phone}
              </a>
            )}
            {r.contact.email && (
              <a href={`mailto:${r.contact.email}`} className="flex items-center gap-2 text-[13px] text-[#0F172A] hover:text-[#1B4FFF] transition-colors">
                <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />{r.contact.email}
              </a>
            )}
          </div>
        </Section>
      )}
    </div>
  )
}

// ─── Tab: Analysis ─────────────────────────────────────────────────────────────

function AnalysisTab({ r, locale }: { r: JobResult; locale: string }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Match score large */}
      {r.match_score !== null && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h3 className="text-[14px] font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1B4FFF]" />
            {locale === 'fr' ? 'Score d\'adéquation avec votre CV' : 'CV match score'}
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <MatchScoreGauge score={r.match_score} />
            <div className="flex-1">
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                {locale === 'fr'
                  ? `Ce score reflète la correspondance entre votre profil CV et les exigences du poste (compétences, expérience, formation, langues).`
                  : `This score reflects how well your CV profile matches this job's requirements (skills, experience, education, languages).`}
              </p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
                  <span className="w-2 h-2 rounded-full bg-[#00C97A]" /> 75–100: {locale === 'fr' ? 'Fort match' : 'Strong match'}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> 50–74: {locale === 'fr' ? 'Match partiel' : 'Partial match'}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> 0–49: {locale === 'fr' ? 'Faible match' : 'Low match'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application tips */}
      {r.application_tips.length > 0 && (
        <Section title={locale === 'fr' ? 'Conseils stratégiques' : 'Strategic tips'} icon={<Lightbulb className="w-4 h-4 text-[#F59E0B]" />}>
          <div className="flex flex-col gap-3">
            {r.application_tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[#FFFBEB] rounded-xl border border-[#FDE68A]">
                <Lightbulb className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                <span className="text-[13px] text-[#92400E]">{tip}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Red flags */}
      {r.red_flags.length > 0 && (
        <Section title={locale === 'fr' ? 'Signaux d\'alerte' : 'Red flags'} icon={<Flag className="w-4 h-4 text-[#EF4444]" />} borderColor="border-[#FECACA]">
          <BulletList items={r.red_flags} color="#EF4444" bullet="#EF4444" />
        </Section>
      )}

      {/* Benefits */}
      {r.benefits.length > 0 && (
        <Section title={locale === 'fr' ? 'Avantages & bénéfices' : 'Benefits & perks'} icon={<Star className="w-4 h-4 text-[#00C97A]" />}>
          <div className="flex flex-wrap gap-2">
            {r.benefits.map((b, i) => <Tag key={i} variant="green">{b}</Tag>)}
          </div>
        </Section>
      )}

      {/* Promotion potential */}
      {r.promotion_potential && (
        <div className="flex items-center gap-3 p-4 bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl">
          <Award className="w-4 h-4 text-[#1B4FFF] shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-[#1B4FFF] uppercase tracking-wider">
              {locale === 'fr' ? 'Potentiel de promotion' : 'Promotion potential'}
            </p>
            <p className="text-[14px] font-bold text-[#0F172A]">{r.promotion_potential}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Verdict block ─────────────────────────────────────────────────────────────

function VerdictBlock({ r, locale }: { r: JobResult; locale: string }) {
  const days = daysUntil(r.closing_date)
  const missingTop = r.nice_to_have_skills.length > 0
    ? r.nice_to_have_skills.slice(0, 4)
    : r.required_skills.slice(0, 4)

  const matchScore = r.match_score
  const diff = difficultyConfig(r.difficulty_level ?? '')

  const deadlineLabel = days === null ? null
    : days > 0 ? `${days}d`
    : days === 0 ? (locale === 'fr' ? 'Auj.' : 'Today')
    : (locale === 'fr' ? 'Expiré' : 'Expired')

  const deadlineColor = days === null ? 'text-[#94A3B8]'
    : days <= 3 ? 'text-[#EF4444]'
    : days <= 7 ? 'text-[#F97316]'
    : 'text-[#64748B]'

  // Encode job content for CV optimizer prefill
  const optimizeHref = `/cv-optimizer`

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
      {/* Match score */}
      {matchScore !== null && (
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl"
            style={{
              background: matchScore >= 75 ? '#E6FBF3' : matchScore >= 50 ? '#FEF3C7' : '#FEF2F2',
              color: matchScore >= 75 ? '#00C97A' : matchScore >= 50 ? '#D97706' : '#EF4444',
            }}
          >
            {matchScore}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              {locale === 'fr' ? 'Adéquation' : 'Match score'}
            </p>
            <p className="text-[13px] font-semibold" style={{
              color: matchScore >= 75 ? '#00C97A' : matchScore >= 50 ? '#D97706' : '#EF4444',
            }}>
              {matchScore >= 75
                ? (locale === 'fr' ? 'Excellent' : 'Strong match')
                : matchScore >= 50
                ? (locale === 'fr' ? 'Partiel' : 'Partial match')
                : (locale === 'fr' ? 'Faible' : 'Low match')}
            </p>
          </div>
        </div>
      )}

      {/* Divider on sm+ */}
      {matchScore !== null && <div className="hidden sm:block w-px h-10 bg-[#E2E8F0] shrink-0" />}

      {/* Key info */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Difficulty + deadline row */}
        <div className="flex items-center gap-3 flex-wrap">
          {r.difficulty_level && (
            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${diff.bg} ${diff.color}`}>
              {r.difficulty_level}
            </span>
          )}
          {deadlineLabel && (
            <span className={`flex items-center gap-1 text-[12px] font-semibold ${deadlineColor}`}>
              <Calendar className="w-3 h-3" />
              {locale === 'fr' ? 'Ferme dans' : 'Closes in'} {deadlineLabel}
            </span>
          )}
        </div>

        {/* Top skills missing / nice-to-have */}
        {missingTop.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-[#94A3B8] font-medium shrink-0">
              {locale === 'fr' ? 'Compétences clés :' : 'Key skills:'}
            </span>
            {missingTop.map((s, i) => (
              <span key={i} className="px-2 py-0.5 bg-[#EEF2FF] text-[#1B4FFF] text-[11px] font-medium rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <a
        href={optimizeHref}
        className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#1B4FFF] hover:bg-[#1240D6] text-white text-[13px] font-semibold rounded-xl transition-colors whitespace-nowrap"
      >
        <FileText className="w-3.5 h-3.5" />
        {locale === 'fr' ? 'Optimiser mon CV' : 'Optimize my CV'}
      </a>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function JobAnalyzerPage() {
  const searchParams = useSearchParams()
  const locale = useLocale()
  const { subscription, consumeAttempt } = useSubscription()
  const [inputType, setInputType] = useState<InputType>('text')
  const [content, setContent] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [result, setResult] = useState<JobResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  useEffect(() => {
    const prefill = searchParams.get('prefill')
    if (prefill) { setContent(decodeURIComponent(prefill)); setInputType('text') }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    if ((subscription?.attempts_remaining ?? 0) <= 0) { setShowUpgrade(true); return }

    setStep('loading')
    setErrorMsg('')

    const consumed = await consumeAttempt('job_analyzer')
    if (!consumed.success) {
      if (consumed.code === 'NO_ATTEMPTS') { setShowUpgrade(true); setStep('idle') }
      else { setErrorMsg(consumed.error ?? 'Failed to consume attempt.'); setStep('error') }
      return
    }

    try {
      const res = await fetch('/api/ai/job-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_type: inputType, content, log_id: consumed.log_id, lang: locale }),
      })
      const json = await res.json()
      if (!res.ok) { setErrorMsg(json.error ?? 'An error occurred.'); setStep('error'); return }
      setResult(json)
      setStep('result')
      setActiveTab('overview')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStep('error')
    }
  }

  function reset() { setContent(''); setStep('idle'); setResult(null); setErrorMsg('') }

  const tabs = locale === 'fr'
    ? TABS.map(t => ({ ...t, displayLabel: t.labelFr }))
    : TABS.map(t => ({ ...t, displayLabel: t.label }))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#E6FBF3] flex items-center justify-center">
            <Search className="w-5 h-5 text-[#00C97A]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            {locale === 'fr' ? 'Analyseur d\'offres' : 'Job Analyzer'}
          </h1>
        </div>
        <p className="text-[#64748B]">
          {locale === 'fr'
            ? 'Collez une URL ou une description pour obtenir un tableau de bord complet : compétences, exigences, documents, sécurité, adéquation.'
            : 'Paste a URL or job description to get a full intelligence dashboard: skills, requirements, documents, security, match score.'}{' '}
          <span className="inline-flex items-center gap-1 text-[#1B4FFF] font-medium text-[13px]">
            <Zap className="w-3 h-3" fill="currentColor" /> 1 {locale === 'fr' ? 'tentative' : 'attempt'}
          </span>
        </p>
      </div>

      {/* Input form */}
      {step !== 'result' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#0F172A] mb-2">
              {locale === 'fr' ? 'Méthode de saisie' : 'Input method'}
            </label>
            <div className="flex gap-2">
              {([['url', Link2, 'Job URL', 'URL'], ['text', FileText, 'Paste text', 'Coller le texte']] as const).map(([type, Icon, labelEn, labelFr]) => (
                <button
                  key={type} type="button"
                  onClick={() => { setInputType(type); setContent('') }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                    inputType === type ? 'bg-[#EEF2FF] border-[#1B4FFF] text-[#1B4FFF]' : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {locale === 'fr' ? labelFr : labelEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            {inputType === 'url' ? (
              <div>
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-2">
                  {locale === 'fr' ? 'URL de l\'offre' : 'Job posting URL'}
                </label>
                <input
                  type="url" value={content} onChange={e => setContent(e.target.value)}
                  placeholder="https://www.linkedin.com/jobs/view/…"
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/20 focus:border-[#1B4FFF] transition-colors"
                />
                <p className="text-[12px] text-[#94A3B8] mt-1.5">
                  {locale === 'fr' ? 'Si l\'URL est bloquée, passez en mode « Coller le texte ».' : 'If the URL is blocked, switch to "Paste text" and copy the description manually.'}
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-2">
                  {locale === 'fr' ? 'Description du poste' : 'Job description'}
                </label>
                <textarea
                  value={content} onChange={e => setContent(e.target.value)}
                  placeholder={locale === 'fr' ? 'Collez la description complète du poste ici…' : 'Paste the full job description here…'}
                  rows={10}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/20 focus:border-[#1B4FFF] transition-colors resize-none"
                />
                <p className="text-[12px] text-[#94A3B8] mt-1">{content.length} {locale === 'fr' ? 'caractères' : 'characters'}</p>
              </div>
            )}
          </div>

          {(errorMsg || step === 'error') && (
            <div className="flex items-start gap-2 p-3 bg-[#FEF2F2] rounded-xl border border-[#FECACA]">
              <AlertCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[#EF4444]">{errorMsg || (locale === 'fr' ? 'Une erreur est survenue.' : 'An error occurred. Please try again.')}</p>
            </div>
          )}

          <button
            type="submit" disabled={!content.trim() || step === 'loading'}
            className="flex items-center justify-center gap-2 py-3 bg-[#00C97A] hover:bg-[#00b36c] text-white font-semibold text-[15px] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 'loading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {locale === 'fr' ? 'Analyse en cours…' : 'Analyzing job offer…'}</>
            ) : (
              <><Zap className="w-4 h-4" fill="white" /> {locale === 'fr' ? 'Analyser cette offre — 1 tentative' : 'Analyze this job — 1 attempt'}</>
            )}
          </button>
        </form>
      )}

      {/* Skeleton while loading */}
      {step === 'loading' && <JobAnalyzerSkeleton />}

      {/* Results with tabs */}
      {step === 'result' && result && (
        <div className="animate-fade-in">
          {/* ── Verdict block ── */}
          <VerdictBlock r={result} locale={locale} />

          {/* Tab nav */}
          <div className="flex border-b border-[#E2E8F0] mb-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#1B4FFF] text-[#1B4FFF]'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#E2E8F0]'
                }`}
              >
                {tab.displayLabel}
                {/* Badge counts */}
                {tab.id === 'application' && result.required_documents.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-[#EEF2FF] text-[#1B4FFF] text-[10px] font-bold rounded-full">
                    {result.required_documents.length}
                  </span>
                )}
                {tab.id === 'analysis' && result.red_flags.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-[#FEF2F2] text-[#EF4444] text-[10px] font-bold rounded-full">
                    {result.red_flags.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content — key forces remount to replay entry animation */}
          <div key={activeTab} className="animate-fade-in">
            {activeTab === 'overview' && <OverviewTab r={result} onReset={reset} jobContent={content} locale={locale} />}
            {activeTab === 'requirements' && <RequirementsTab r={result} locale={locale} />}
            {activeTab === 'application' && <ApplicationTab r={result} locale={locale} />}
            {activeTab === 'analysis' && <AnalysisTab r={result} locale={locale} />}
          </div>
        </div>
      )}
    </div>
  )
}
