'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const COUNTRIES = [
  'Democratic Republic of Congo', 'France', 'Belgium', 'Canada', 'Switzerland',
  'Senegal', 'Côte d\'Ivoire', 'Morocco', 'Algeria', 'Tunisia',
  'United States', 'United Kingdom', 'Germany', 'Other',
]

export default function SignupPage() {
  const supabase = createClient()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: '',
    language: 'en' as 'en' | 'fr',
    gdprConsent: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'linkedin' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!form.gdprConsent) {
      setError('You must accept the privacy policy to create an account.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    setError(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: `${form.firstName} ${form.lastName}`.trim(),
          country: form.country,
          language: form.language,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    setSuccess(true)
  }

  async function handleOAuth(provider: 'google' | 'linkedin_oidc') {
    const key = provider === 'google' ? 'google' : 'linkedin'
    setOauthLoading(key)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-[#E6FBF3] flex items-center justify-center mx-auto mb-6">
          <span className="text-[#00C97A] text-3xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Check your email</h1>
        <p className="text-[#64748B] mb-6">
          We sent a confirmation link to{' '}
          <strong className="text-[#0F172A]">{form.email}</strong>.<br />
          Click the link to activate your account and get your 4 free attempts.
        </p>
        <p className="text-[13px] text-[#94A3B8]">
          Didn&apos;t receive it?{' '}
          <button
            className="text-[#1B4FFF] hover:underline"
            onClick={() => setSuccess(false)}
          >
            Try again
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Create your account</h1>
          <p className="text-[14px] text-[#64748B]">
            Start with 4 free AI attempts — no credit card required.
          </p>
        </div>

        {/* OAuth buttons */}
        <div className="flex flex-col gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={!!oauthLoading || loading}
            className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[14px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('linkedin_oidc')}
            disabled={!!oauthLoading || loading}
            className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[14px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
          >
            {oauthLoading === 'linkedin' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LinkedInIcon />
            )}
            Continue with LinkedIn
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-[12px] text-[#94A3B8] font-medium">or with email</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
                First name
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={e => update('firstName', e.target.value)}
                placeholder="John"
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/20 focus:border-[#1B4FFF] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
                Last name
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={e => update('lastName', e.target.value)}
                placeholder="Doe"
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/20 focus:border-[#1B4FFF] transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="john@example.com"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/20 focus:border-[#1B4FFF] transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3 py-2.5 pr-10 border border-[#E2E8F0] rounded-lg text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/20 focus:border-[#1B4FFF] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
              Country
            </label>
            <select
              required
              value={form.country}
              onChange={e => update('country', e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/20 focus:border-[#1B4FFF] transition-colors bg-white"
            >
              <option value="">Select your country</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
              Preferred language
            </label>
            <div className="flex gap-2">
              {(['en', 'fr'] as const).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => update('language', lang)}
                  className={`flex-1 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                    form.language === lang
                      ? 'bg-[#EEF2FF] border-[#1B4FFF] text-[#1B4FFF]'
                      : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {lang === 'en' ? '🇬🇧 English' : '🇫🇷 Français'}
                </button>
              ))}
            </div>
          </div>

          {/* GDPR consent */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={form.gdprConsent}
              onChange={e => update('gdprConsent', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#E2E8F0] text-[#1B4FFF] accent-[#1B4FFF] shrink-0"
            />
            <span className="text-[13px] text-[#64748B] leading-relaxed">
              I agree to the{' '}
              <Link href="/privacy" className="text-[#1B4FFF] hover:underline">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/legal" className="text-[#1B4FFF] hover:underline">
                Terms of Service
              </Link>
              . I consent to the processing of my data for the purposes described.{' '}
              <span className="text-[#EF4444]">*</span>
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-[#FEF2F2] rounded-lg border border-[#FECACA]">
              <AlertCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[#EF4444]">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !!oauthLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B4FFF] hover:bg-[#1240D6] active:bg-[#0f34b3] active:scale-[0.98] text-white font-semibold text-[15px] rounded-lg transition-all disabled:opacity-60 mt-1"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Creating account…' : 'Create account — it\'s free'}
          </button>
        </form>
      </div>

      {/* Sign in link */}
      <p className="text-center text-[14px] text-[#64748B] mt-5">
        Already have an account?{' '}
        <Link href="/login" className="text-[#1B4FFF] font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="3" fill="#0A66C2"/>
      <path d="M4.5 7h2v7h-2V7Zm1-1.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5ZM7.5 7h2v1c.3-.5.9-1.1 2-1.1C13.1 6.9 14 8 14 10v4h-2v-3.5c0-1-.2-2-1.2-2-1.1 0-1.3 1-1.3 2V14h-2V7Z" fill="white"/>
    </svg>
  )
}
