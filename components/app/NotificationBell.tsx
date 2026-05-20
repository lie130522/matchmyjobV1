'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Upload, Zap, ArrowUpRight, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Subscription } from '@/lib/supabase/types'

interface Props {
  subscription: Subscription | null
  hasProfileCv: boolean
}

interface Notification {
  id: string
  type: 'cv' | 'attempts' | 'info'
  icon: React.ReactNode
  title: string
  description: string
  cta?: { label: string; href: string }
  read: boolean
}

const STORAGE_KEY = 'mmj_notif_read'

function getReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch { /* ignore */ }
}

export function NotificationBell({ subscription, hasProfileCv }: Props) {
  const t = useTranslations('notifications')
  const [open, setOpen] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    setReadIds(getReadIds())
  }, [])

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const remaining = subscription?.attempts_remaining ?? 0

  // Build notification list
  const notifications: Notification[] = []

  if (!hasProfileCv) {
    notifications.push({
      id: 'no-cv',
      type: 'cv',
      icon: <Upload className="w-4 h-4 text-[#1B4FFF]" />,
      title: t('uploadCv'),
      description: t('uploadCvDesc'),
      cta: { label: t('uploadNow'), href: '/settings' },
      read: false,
    })
  }

  if (remaining === 0) {
    notifications.push({
      id: 'no-attempts',
      type: 'attempts',
      icon: <Zap className="w-4 h-4 text-[#EF4444]" />,
      title: t('attemptsOut'),
      description: t('attemptsOutDesc'),
      cta: { label: t('upgrade'), href: '/pricing' },
      read: false,
    })
  } else if (remaining <= 3) {
    notifications.push({
      id: 'low-attempts',
      type: 'attempts',
      icon: <Zap className="w-4 h-4 text-[#F97316]" />,
      title: t('attemptsLow', { n: remaining }),
      description: t('attemptsLowDesc'),
      cta: { label: t('upgrade'), href: '/pricing' },
      read: false,
    })
  }

  // Apply read state
  const withReadState = notifications.map(n => ({ ...n, read: readIds.has(n.id) }))
  const unreadCount = withReadState.filter(n => !n.read).length

  function markAllRead() {
    const ids = new Set([...readIds, ...notifications.map(n => n.id)])
    setReadIds(ids)
    saveReadIds(ids)
  }

  function markRead(id: string) {
    const ids = new Set([...readIds, id])
    setReadIds(ids)
    saveReadIds(ids)
  }

  if (!mounted) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
        aria-label={t('title')}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9]">
            <span className="text-[13px] font-semibold text-[#0F172A]">{t('title')}</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-[#1B4FFF] hover:underline font-medium"
                >
                  {t('markAllRead')}
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-[#94A3B8] hover:text-[#64748B]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="max-h-80 overflow-y-auto">
            {withReadState.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-[#E6FBF3] flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-[#00C97A]" />
                </div>
                <p className="text-[13px] font-semibold text-[#0F172A]">{t('empty')}</p>
                <p className="text-[12px] text-[#94A3B8] mt-0.5">{t('emptyDesc')}</p>
              </div>
            ) : (
              withReadState.map(notif => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[#F8FAFC] last:border-b-0 ${notif.read ? 'opacity-60' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    notif.type === 'cv' ? 'bg-[#EEF2FF]' :
                    notif.type === 'attempts' && remaining === 0 ? 'bg-[#FEF2F2]' : 'bg-[#FFF7ED]'
                  }`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#0F172A] leading-snug">{notif.title}</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">{notif.description}</p>
                    {notif.cta && (
                      <Link
                        href={notif.cta.href}
                        onClick={() => { markRead(notif.id); setOpen(false) }}
                        className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-[#1B4FFF] hover:underline"
                      >
                        {notif.cta.label} <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-[#1B4FFF] mt-1.5 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
