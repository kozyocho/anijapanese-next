import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const getCustomerId = (obj: Stripe.Subscription | Stripe.Checkout.Session): string | null => {
    const c = obj.customer
    return typeof c === 'string' ? c : (c as Stripe.Customer | null)?.id ?? null
}

// Determine plan_type from subscription interval
function planTypeFromSubscription(sub: Stripe.Subscription): 'monthly' | 'annual' {
    const interval = sub.items.data[0]?.price?.recurring?.interval
    return interval === 'year' ? 'annual' : 'monthly'
}

export async function POST(req: NextRequest) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session
            const userId = session.metadata?.userId
            const planType = (session.metadata?.planType ?? 'lifetime') as 'monthly' | 'annual' | 'lifetime'
            const customerId = getCustomerId(session)

            if (userId) {
                await adminClient.from('profiles')
                    .update({
                        is_premium: true,
                        plan_type: planType,
                        subscription_status: session.mode === 'subscription' ? 'active' : 'lifetime',
                        ...(customerId ? { stripe_customer_id: customerId } : {}),
                    })
                    .eq('id', userId)
            }
            break
        }

        case 'customer.subscription.updated': {
            const sub = event.data.object as Stripe.Subscription
            const customerId = getCustomerId(sub)
            const active = sub.status === 'active' || sub.status === 'trialing'
            const planType = planTypeFromSubscription(sub)

            if (customerId) {
                await adminClient.from('profiles')
                    .update({
                        is_premium: active,
                        plan_type: active ? planType : 'free',
                        subscription_status: sub.status,
                    })
                    .eq('stripe_customer_id', customerId)
            }
            break
        }

        case 'customer.subscription.deleted': {
            const sub = event.data.object as Stripe.Subscription
            const customerId = getCustomerId(sub)

            if (customerId) {
                // Only downgrade non-lifetime users (lifetime buyers have no subscription)
                await adminClient.from('profiles')
                    .update({
                        is_premium: false,
                        plan_type: 'free',
                        subscription_status: 'canceled',
                    })
                    .eq('stripe_customer_id', customerId)
                    .neq('plan_type', 'lifetime')
            }
            break
        }
    }

    return NextResponse.json({ received: true })
}
