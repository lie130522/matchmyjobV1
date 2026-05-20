'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'linkedin' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError('Invalid email or password. Please try again.')
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email address first, then click "Forgot password".')
      return
    }
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
    })
    setLoading(false)
    setResetSent(true)
  }

  async function handleOAuth(provider: 'google' | 'linkedin_oidc') {
    const key = provider === 'google' ? 'google' : 'linkedin'
    setOauthLoading(key)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?redirectTo=${redirectTo}`,
      },
    })
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Welcome back</h1>
          <p className="text-[14px] text-[#64748B]">
            Log in to continue your job search.
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

        {/* Reset sent notice */}
        {resetSent && (
          <div className="mb-4 p-3 bg-[#E6FBF3] rounded-lg border border-[#00C97A]/30">
            <p className="text-[13px] text-[#00A362]">
              Password reset link sent to <strong>{email}</strong>. Check your inbox.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null) }}
              placeholder="john@example.com"
              autoComplete="email"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/20 focus:border-[#1B4FFF] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] font-medium text-[#0F172A]">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[12px] text-[#1B4FFF] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                placeholder="••••••••"
                autoComplete="current-password"
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

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-[#FEF2F2] rounded-lg border border-[#FECACA]">
              <AlertCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[#EF4444]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!oauthLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B4FFF] hover:bg-[#1240D6] active:bg-[#0f34b3] active:scale-[0.98] text-white font-semibold text-[15px] rounded-lg transition-all disabled:opacity-60 mt-1"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>

      <p className="text-center text-[14px] text-[#64748B] mt-5">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#1B4FFF] font-medium hover:underline">
          Sign up free
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
