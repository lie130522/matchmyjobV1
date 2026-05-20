import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emails/send'
import { cancellationEmail } from '@/lib/emails/templates'

export async function POST() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, language')
    .eq('id', user.id)
    .single()

  await supabase
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'cancelled',
      attempts_remaining: 0,
      attempts_total: 0,
      renewal_date: null,
      stripe_subscription_id: null,
    })
    .eq('user_id', user.id)

  const name = profile?.full_name?.split(' ')[0] ?? 'there'
  const lang = (profile?.language as 'en' | 'fr') ?? 'en'
  sendEmail({ to: user.email!, ...cancellationEmail({ name, lang }) }).catch(console.error)

  return NextResponse.json({ success: true })
}
