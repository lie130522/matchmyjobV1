import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emails/send'
import { welcomeEmail } from '@/lib/emails/templates'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/settings?tab=security&reset=true`)
      }

      // Send welcome email only for brand-new users (created within last 60s)
      const user = data.user
      if (user) {
        const createdAt = new Date(user.created_at).getTime()
        const isNew = Date.now() - createdAt < 60_000

        if (isNew) {
          const { data: profile } = await supabase
            .from('users')
            .select('full_name, language')
            .eq('id', user.id)
            .single()

          const name = profile?.full_name?.split(' ')[0] ?? 'there'
          const lang = (profile?.language as 'en' | 'fr') ?? 'en'
          const email = welcomeEmail({ name, lang })

          // Fire and forget — don't block the redirect
          sendEmail({ to: user.email!, ...email }).catch(console.error)
        }
      }

      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
