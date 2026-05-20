'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Search, PenLine, MoreHorizontal, Globe, Bookmark, Clock, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

const PRIMARY_TABS = [
  { href: '/dashboard',    icon: LayoutDashboard, key: 'dashboard' },
  { href: '/cv-optimizer', icon: FileText,         key: 'cvOptimizer' },
  { href: '/job-analyzer', icon: Search,           key: 'jobAnalyzer' },
  { href: '/cover-letter', icon: PenLine,          key: 'coverLetter' },
]

const MORE_LINKS = [
  { href: '/jobs',       icon: Globe,    key: 'jobSearch' },
  { href: '/saved-jobs', icon: Bookmark, key: 'savedJobs' },
  { href: '/history',    icon: Clock,    key: 'history' },
  { href: '/settings',   icon: Settings, key: 'settings' },
]

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const [moreOpen, setMoreOpen] = useState(false)

  const isMoreActive = MORE_LINKS.some(l => pathname === l.href || pathname.startsWith(l.href + '/'))

  return (
    <>
      {/* More drawer overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More drawer */}
      {moreOpen && (
        <div className="fixed bottom-16 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] rounded-t-2xl shadow-xl md:hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9]">
            <span className="text-[13px] font-semibold text-[#0F172A]">More</span>
            <button onClick={() => setMoreOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {MORE_LINKS.map(({ href, icon: Icon, key }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-[#EEF2FF] text-[#1B4FFF]'
                      : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {t(key as Parameters<typeof t>[0])}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] md:hidden">
        <div className="grid grid-cols-5 h-16">
          {PRIMARY_TABS.map(({ href, icon: Icon, key }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px] ${
                  active ? 'text-[#1B4FFF]' : 'text-[#94A3B8]'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-[9px] font-semibold truncate max-w-[56px] ${active ? 'text-[#1B4FFF]' : 'text-[#94A3B8]'}`}>
                  {t(key as Parameters<typeof t>[0])}
                </span>
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px] ${
              isMoreActive ? 'text-[#1B4FFF]' : 'text-[#94A3B8]'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className={`text-[9px] font-semibold ${isMoreActive ? 'text-[#1B4FFF]' : 'text-[#94A3B8]'}`}>
              More
            </span>
          </button>
        </div>
        {/* iOS safe area */}
        <div className="h-safe-bottom bg-white" />
      </nav>
    </>
  )
}
