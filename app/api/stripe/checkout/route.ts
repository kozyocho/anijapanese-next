import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type PlanType = 'monthly' | 'annual' | 'lifetime'

const PLAN_CONFIG: Record<PlanType, {
    priceIdEnv: string
    mode: Stripe.Checkout.SessionCreateParams['mode']
}> = {
    monthly: { priceIdEnv: 'STRIPE_MONTHLY_PRICE_ID', mode: 'subscription' },
    annual:  { priceIdEnv: 'STRIPE_ANNUAL_PRICE_ID',  mode: 'subscription' },
    lifetime: { priceIdEnv: 'STRIPE_LIFETIME_PRICE_ID', mode: 'payment' },
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = clerkUserId

    const { email, planType, useWelcomeOffer } = body as {
        email?: string
        planType: PlanType
        useWelcomeOffer?: boolean
    }

    if (!planType || !(planType in PLAN_CONFIG)) {
        return NextResponse.json({ error: 'Invalid planType' }, { status: 400 })
    }

    const { priceIdEnv, mode } = PLAN_CONFIG[planType]

    // For lifetime: use sale price if welcome offer is active
    const lifetimeSalePriceId = process.env.STRIPE_LIFETIME_SALE_PRICE_ID
    const priceId = (planType === 'lifetime' && useWelcomeOffer && lifetimeSalePriceId)
        ? lifetimeSalePriceId
        : process.env[priceIdEnv]

    if (!priceId) {
        return NextResponse.json({ error: `Price not configured for plan: ${planType}` }, { status: 500 })
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

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

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        mode,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/`,
        metadata: { userId, planType },
    }

    // For subscription plans, allow proration and trial if needed
    if (mode === 'subscription') {
        sessionParams.subscription_data = { metadata: { userId, planType } }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
}
