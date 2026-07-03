import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    const { userId, email, useWelcomeOffer } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Get or create Stripe customer
    const { data: profile } = await adminClient
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
        const customer = await stripe.customers.create({
            metadata: { userId },
            ...(email ? { email } : {}),
        })
        customerId = customer.id
        await adminClient.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId)
    }

    // Use welcome offer price/coupon if within 24h sale window
    const salePriceId = process.env.STRIPE_SALE_PRICE_ID
    const welcomeCouponId = process.env.STRIPE_WELCOME_COUPON_ID
    const priceId = (useWelcomeOffer && salePriceId) ? salePriceId : process.env.STRIPE_PRICE_ID!

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/?upgraded=1`,
        cancel_url: `${origin}/`,
        metadata: { userId },
    }

    if (useWelcomeOffer && welcomeCouponId && !salePriceId) {
        sessionParams.discounts = [{ coupon: welcomeCouponId }]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
}
