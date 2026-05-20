import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

// Stripe requires raw body for signature verification
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      // Payment confirmed → activate plan
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status !== 'paid') break

        const { user_id, plan, attempts } = session.metadata ?? {}
        if (!user_id || !plan || !attempts) break

        const renewalDate = new Date()
        renewalDate.setDate(renewalDate.getDate() + 30)

        await supabase
          .from('subscriptions')
          .update({
            plan,
            status: 'active',
            attempts_total: parseInt(attempts),
            attempts_remaining: parseInt(attempts),
            renewal_date: renewalDate.toISOString(),
            renewal_confirmed: false,
            stripe_customer_id: session.customer as string ?? null,
          })
          .eq('user_id', user_id)

        console.log(`✅ Plan ${plan} activated for user ${user_id}`)
        break
      }

      // Payment failed → notify but keep plan active until renewal_date
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent
        console.warn(`❌ Payment failed for customer ${intent.customer}`)
        break
      }

      // Subscription deleted (if ever used) → downgrade to free
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (sub) {
          await supabase
            .from('subscriptions')
            .update({
              plan: 'free',
              status: 'cancelled',
              attempts_remaining: 0,
              attempts_total: 0,
              renewal_date: null,
            })
            .eq('user_id', sub.user_id)
        }
        break
      }

      default:
        // Ignore unhandled events
        break
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
