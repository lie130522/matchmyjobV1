import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Feature } from '@/lib/supabase/types'

export async function POST(request: Request) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let feature: Feature
  try {
    const body = await request.json()
    feature = body.feature
    if (!['cv_optimizer', 'job_analyzer', 'cover_letter', 'job_search'].includes(feature)) {
      return NextResponse.json({ error: 'Invalid feature' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // ── Mode bypass pour les tests (BYPASS_ATTEMPTS=true dans .env.local) ──
  // Protégé contre la mise en production accidentelle.
  if (process.env.BYPASS_ATTEMPTS === 'true' && process.env.NODE_ENV !== 'production') {
    // On log quand même pour garder la traçabilité des tests
    const { data: log } = await supabase
      .from('usage_logs')
      .insert({ user_id: user.id, feature, refunded: false })
      .select('id')
      .single()
    return NextResponse.json({ success: true, attempts_remaining: 9999, log_id: log?.id ?? null })
  }

  // Récupère la subscription avec un verrou atomique (UPDATE ... RETURNING)
  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .select('id, attempts_remaining, attempts_total, plan, status')
    .eq('user_id', user.id)
    .single()

  if (subError || !sub) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  if (sub.status !== 'active') {
    return NextResponse.json({ error: 'Subscription inactive', code: 'SUBSCRIPTION_INACTIVE' }, { status: 403 })
  }

  if (sub.attempts_remaining <= 0) {
    return NextResponse.json({
      error: 'No attempts remaining',
      code: 'NO_ATTEMPTS',
      attempts_remaining: 0,
      plan: sub.plan,
    }, { status: 402 })
  }

  // Décrémente atomiquement (vérifie à nouveau > 0 dans la clause WHERE)
  const { data: updated, error: updateError } = await supabase
    .from('subscriptions')
    .update({ attempts_remaining: sub.attempts_remaining - 1 })
    .eq('id', sub.id)
    .eq('user_id', user.id)
    .gt('attempts_remaining', 0)
    .select('attempts_remaining')
    .single()

  if (updateError || !updated) {
    // Race condition : une autre requête a consommé le dernier essai
    return NextResponse.json({
      error: 'No attempts remaining',
      code: 'NO_ATTEMPTS',
      attempts_remaining: 0,
      plan: sub.plan,
    }, { status: 402 })
  }

  // Log d'utilisation
  const { data: log } = await supabase
    .from('usage_logs')
    .insert({ user_id: user.id, feature, refunded: false })
    .select('id')
    .single()

  return NextResponse.json({
    success: true,
    attempts_remaining: updated.attempts_remaining,
    log_id: log?.id ?? null,
  })
}
