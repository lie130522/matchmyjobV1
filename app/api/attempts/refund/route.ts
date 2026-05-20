import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let logId: string
  try {
    const body = await request.json()
    logId = body.log_id
    if (!logId) return NextResponse.json({ error: 'Missing log_id' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Vérifie que le log appartient bien à cet utilisateur et n'est pas déjà remboursé
  const { data: log, error: logError } = await supabase
    .from('usage_logs')
    .select('id, refunded')
    .eq('id', logId)
    .eq('user_id', user.id)
    .single()

  if (logError || !log) {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 })
  }

  if (log.refunded) {
    return NextResponse.json({ error: 'Already refunded' }, { status: 409 })
  }

  // Rembourse la tentative
  const { error: updateSubError } = await supabase.rpc('increment_attempts', {
    p_user_id: user.id,
  })

  if (updateSubError) {
    // Fallback sans RPC
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('attempts_remaining, attempts_total')
      .eq('user_id', user.id)
      .single()

    if (sub) {
      await supabase
        .from('subscriptions')
        .update({ attempts_remaining: Math.min(sub.attempts_remaining + 1, sub.attempts_total) })
        .eq('user_id', user.id)
    }
  }

  // Marque le log comme remboursé
  await supabase
    .from('usage_logs')
    .update({ refunded: true })
    .eq('id', logId)

  return NextResponse.json({ success: true })
}
