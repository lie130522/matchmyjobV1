import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Zap, Calendar, CreditCard, User, Shield, FileText } from 'lucide-react'
import { CancelPlanButton } from './CancelPlanButton'
import { ProfileCvUpload } from './ProfileCvUpload'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: sub }, { data: profileCv }] = await Promise.all([
    supabase.from('users').select('full_name, email, country, language').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
    supabase.from('cvs').select('id, filename, format, created_at').eq('user_id', user.id).eq('is_profile', true).maybeSingle(),
  ])

  const renewalDate = sub?.renewal_date
    ? new Date(sub.renewal_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  const isPaid = sub?.plan && sub.plan !== 'free'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#0F172A] mb-8 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-[#0F172A] mb-8">Settings</h1>

      {/* Profile */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-[#64748B]" />
          <h2 className="font-semibold text-[#0F172A]">Profile</h2>
        </div>
        <div className="flex flex-col gap-3">
          <Row label="Name" value={profile?.full_name ?? '—'} />
          <Row label="Email" value={user.email ?? '—'} />
          <Row label="Country" value={profile?.country ?? '—'} />
          <Row label="Language" value={profile?.language === 'fr' ? 'Français' : 'English'} />
        </div>
      </section>

      {/* Subscription */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-[#1B4FFF]" />
          <h2 className="font-semibold text-[#0F172A]">Subscription</h2>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          <Row label="Current plan" value={
            <span className="capitalize font-semibold text-[#0F172A]">{sub?.plan ?? 'free'}</span>
          } />
          <Row label="Status" value={
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${sub?.status === 'active' ? 'bg-[#E6FBF3] text-[#00C97A]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
              {sub?.status ?? 'active'}
            </span>
          } />
          <Row label="Attempts remaining" value={
            <span className="font-mono font-semibold text-[#0F172A]">
              {sub?.attempts_remaining ?? 0} / {sub?.attempts_total ?? 0}
            </span>
          } />
          {renewalDate && (
            <Row label="Next renewal" value={
              <span className="flex items-center gap-1.5 text-[#64748B]">
                <Calendar className="w-3.5 h-3.5" /> {renewalDate}
              </span>
            } />
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1B4FFF] hover:bg-[#1240D6] text-white text-[13px] font-semibold rounded-lg transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            {isPaid ? 'Change plan' : 'Upgrade plan'}
          </Link>
          {isPaid && <CancelPlanButton />}
        </div>
      </section>

      {/* CV de profil */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-[#1B4FFF]" />
          <h2 className="font-semibold text-[#0F172A]">CV de profil</h2>
        </div>
        <p className="text-[13px] text-[#64748B] mb-4">
          Uploadez votre CV une fois ici — il sera automatiquement pré-chargé dans l&apos;Optimiseur de CV sans avoir à le ré-uploader à chaque fois.
        </p>
        <ProfileCvUpload existingCv={profileCv ? { filename: profileCv.filename, createdAt: profileCv.created_at } : null} />
      </section>

      {/* Security */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-[#64748B]" />
          <h2 className="font-semibold text-[#0F172A]">Security</h2>
        </div>
        <div className="flex flex-col gap-3">
          <Row label="Authentication" value={user.app_metadata?.provider === 'google' ? 'Google OAuth' : 'Email / Password'} />
          <Row label="Account created" value={new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
        </div>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[#F1F5F9] last:border-0">
      <span className="text-[13px] text-[#64748B] shrink-0">{label}</span>
      <span className="text-[13px] text-[#0F172A] text-right">{value}</span>
    </div>
  )
}
