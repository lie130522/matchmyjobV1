import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emails/send'
import {
  renewalReminderEmail,
  subscriptionExpiredEmail,
} from '@/lib/emails/templates'

// Prevent Next.js from trying to statically analyze this route at build time
export const dynamic = 'force-dynamic'

// Called daily by Vercel Cron (see vercel.json)
// Authorization via secret header to prevent unauthorized calls
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()

  // ── J-3 reminder ────────────────────────────────────────────
  const reminderDate = new Date(now)
  reminderDate.setDate(reminderDate.getDate() + 3)
  const reminderDateStr = reminderDate.toISOString().split('T')[0]

  const { data: toRemind } = await supabase
    .from('subscriptions')
    .select('user_id, plan, renewal_date, renewal_confirmed')
    .eq('status', 'active')
    .neq('plan', 'free')
    .eq('renewal_confirmed', false)
    .gte('renewal_date', `${reminderDateStr}T00:00:00`)
    .lt('renewal_date', `${reminderDateStr}T23:59:59`)

  const reminderResults = await Promise.allSettled(
    (toRemind ?? []).map(async (sub) => {
      const { data: user } = await supabase
        .from('users')
        .select('email, full_name, language')
        .eq('id', sub.user_id)
        .single()

      if (!user?.email) return

      const name = user.full_name?.split(' ')[0] ?? 'there'
      const lang = (user.language as 'en' | 'fr') ?? 'en'
      const renewalFormatted = new Date(sub.renewal_date!).toLocaleDateString(
        lang === 'fr' ? 'fr-FR' : 'en-US',
        { day: 'numeric', month: 'long', year: 'numeric' }
      )

      const email = renewalReminderEmail({ name, plan: sub.plan, renewalDate: renewalFormatted, lang })
      await sendEmail({ to: user.email, ...email })
    })
  )

  // ── Expire overdue subscriptions ────────────────────────────
  const { data: toExpire } = await supabase
    .from('subscriptions')
    .select('user_id, plan')
    .eq('status', 'active')
    .neq('plan', 'free')
    .lt('renewal_date', now.toISOString())

  const expireResults = await Promise.allSettled(
    (toExpire ?? []).map(async (sub) => {
      // Downgrade to free
      await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'expired',
          attempts_remaining: 0,
          attempts_total: 0,
          renewal_date: null,
        })
        .eq('user_id', sub.user_id)

      const { data: user } = await supabase
        .from('users')
        .select('email, full_name, language')
        .eq('id', sub.user_id)
        .single()

      if (!user?.email) return

      const name = user.full_name?.split(' ')[0] ?? 'there'
      const lang = (user.language as 'en' | 'fr') ?? 'en'
      const email = subscriptionExpiredEmail({ name, plan: sub.plan, lang })
      await sendEmail({ to: user.email, ...email })
    })
  )

  return NextResponse.json({
    reminders_sent: reminderResults.filter(r => r.status === 'fulfilled').length,
    expired: expireResults.filter(r => r.status === 'fulfilled').length,
    timestamp: now.toISOString(),
  })
}
