import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const getCustomerId = (obj: Stripe.Subscription | Stripe.Checkout.Session): string | null => {
        const c = obj.customer
        return typeof c === 'string' ? c : (c as Stripe.Customer | null)?.id ?? null
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session
            const customerId = getCustomerId(session)
            if (customerId) {
                await adminClient.from('profiles')
                    .update({ is_premium: true, subscription_status: 'active' })
                    .eq('stripe_customer_id', customerId)
            }
            break
        }
        case 'customer.subscription.updated': {
            const sub = event.data.object as Stripe.Subscription
            const customerId = getCustomerId(sub)
            const active = sub.status === 'active' || sub.status === 'trialing'
            if (customerId) {
                await adminClient.from('profiles')
                    .update({ is_premium: active, subscription_status: sub.status })
                    .eq('stripe_customer_id', customerId)
            }
            break
        }
        case 'customer.subscription.deleted': {
            const sub = event.data.object as Stripe.Subscription
            const customerId = getCustomerId(sub)
            if (customerId) {
                await adminClient.from('profiles')
                    .update({ is_premium: false, subscription_status: 'canceled' })
                    .eq('stripe_customer_id', customerId)
            }
            break
        }
    }

    return NextResponse.json({ received: true })
}
