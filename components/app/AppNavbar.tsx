'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, FileText, Search, PenLine, Globe, Bookmark, Clock,
  Settings, LogOut, Menu, X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AttemptsCounter } from './AttemptsCounter'
import type { Subscription } from '@/lib/supabase/types'
import { useTranslations, useLocale } from 'next-intl'

const NAV_LINK_KEYS = [
  { href: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { href: '/cv-optimizer', key: 'cvOptimizer', icon: FileText },
  { href: '/job-analyzer', key: 'jobAnalyzer', icon: Search },
  { href: '/cover-letter', key: 'coverLetter', icon: PenLine },
  { href: '/jobs', key: 'jobSearch', icon: Globe },
  { href: '/saved-jobs', key: 'savedJobs', icon: Bookmark },
  { href: '/history', key: 'history', icon: Clock },
]

interface Props {
  subscription: Subscription | null
  loadingSubscription: boolean
}

export function AppNavbar({ subscription, loadingSubscription }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('nav')
  const locale = useLocale()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function toggleLocale() {
    const next = locale === 'en' ? 'fr' : 'en'
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: next }),
    })
    router.refresh()
  }

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-[#1B4FFF] flex items-center justify-center">
              <span className="text-white font-bold text-[13px]">M</span>
            </div>
            <span className="font-bold text-[15px] text-[#0F172A]">MatchMyJob</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {NAV_LINK_KEYS.map(({ href, key, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-[#EEF2FF] text-[#1B4FFF]'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(key as Parameters<typeof t>[0])}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <AttemptsCounter subscription={subscription} loading={loadingSubscription} />

            {/* Locale toggle */}
            <button
              onClick={toggleLocale}
              className="hidden md:flex items-center justify-center px-2 h-8 rounded-lg text-[12px] font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
              title="Switch language"
            >
              {locale === 'en' ? 'FR' : 'EN'}
            </button>

            <Link
              href="/settings"
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#EF4444] transition-colors"
              aria-label={t('signOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:bg-[#F8FAFC]"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-3 flex flex-col gap-1">
            {NAV_LINK_KEYS.map(({ href, key, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                    active
                      ? 'bg-[#EEF2FF] text-[#1B4FFF]'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(key as Parameters<typeof t>[0])}
                </Link>
              )
            })}
            <div className="border-t border-[#E2E8F0] mt-2 pt-2 flex flex-col gap-1">
              <button onClick={toggleLocale} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] text-[#64748B] hover:bg-[#F8FAFC]">
                🌐 {locale === 'en' ? 'Français' : 'English'}
              </button>
              <Link href="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] text-[#64748B] hover:bg-[#F8FAFC]">
                <Settings className="w-4 h-4" /> {t('settings')}
              </Link>
              <button onClick={handleSignOut} disabled={signingOut} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] text-[#EF4444] hover:bg-[#FEF2F2]">
                <LogOut className="w-4 h-4" /> {t('signOut')}
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
