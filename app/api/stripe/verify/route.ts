import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Called right after the Stripe success redirect. Verifies the checkout
// session directly with Stripe and activates premium immediately, instead
// of waiting for the webhook (which still runs as a backup — idempotent).
export async function POST(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { sessionId } = await req.json()
    if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
        return NextResponse.json({ error: 'Invalid sessionId' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // The session must belong to the authenticated user
    if (session.metadata?.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (session.payment_status !== 'paid') {
        return NextResponse.json({ premium: false })
    }

    const planType = (session.metadata?.planType ?? 'lifetime') as 'monthly' | 'annual' | 'lifetime'

    const { error } = await adminClient.from('profiles')
        .update({
            is_premium: true,
            plan_type: planType,
            subscription_status: session.mode === 'subscription' ? 'active' : 'lifetime',
        })
        .eq('id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ premium: true })
}
