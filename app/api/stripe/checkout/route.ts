import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANS, type PaidPlan } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let plan: PaidPlan
  try {
    const body = await request.json()
    if (!['starter', 'pro', 'expert'].includes(body.plan)) throw new Error('Invalid plan')
    plan = body.plan as PaidPlan
  } catch {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const planConfig = PLANS[plan]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  // Retrieve or create Stripe customer
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = sub?.stripe_customer_id ?? undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from('subscriptions')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', user.id)
  }

  // Create one-time checkout session (no auto-renewal)
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: planConfig.price * 100,
        product_data: {
          name: `MatchMyJob ${planConfig.name}`,
          description: planConfig.description,
        },
      },
      quantity: 1,
    }],
    metadata: {
      user_id: user.id,
      plan,
      attempts: String(planConfig.attempts),
    },
    success_url: `${appUrl}/dashboard?upgrade=success&plan=${plan}`,
    cancel_url: `${appUrl}/pricing`,
  })

  return NextResponse.json({ url: session.url })
}
