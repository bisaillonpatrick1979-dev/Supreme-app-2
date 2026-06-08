import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Stripe webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const invoiceId = pi.metadata?.invoice_id
      if (invoiceId) {
        await supabase
          .from('invoices')
          .update({
            status: 'Paid',
            paid_at: new Date().toISOString(),
            stripe_payment_intent: pi.id,
          })
          .eq('id', invoiceId)
      }
      break
    }

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const invoiceId = session.metadata?.invoice_id
      if (invoiceId && session.payment_status === 'paid') {
        await supabase
          .from('invoices')
          .update({
            status: 'Paid',
            paid_at: new Date().toISOString(),
          })
          .eq('id', invoiceId)
      }
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
