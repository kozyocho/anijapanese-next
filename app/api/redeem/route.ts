import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    const { userId, code } = await req.json()
    if (!userId || !code) {
        return NextResponse.json({ error: 'userId and code are required' }, { status: 400 })
    }

    // Check if user is already premium
    const { data: profile } = await adminClient
        .from('profiles')
        .select('is_premium')
        .eq('id', userId)
        .single()

    if (profile?.is_premium) {
        return NextResponse.json({ error: 'Already premium' }, { status: 400 })
    }

    // Look up promo code
    const { data: promo } = await adminClient
        .from('promo_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .single()

    if (!promo) {
        return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 })
    }
    if (promo.used_count >= promo.max_uses) {
        return NextResponse.json({ error: 'Promo code has reached its usage limit' }, { status: 410 })
    }
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Promo code has expired' }, { status: 410 })
    }

    // Atomically increment used_count
    const { error: incError } = await adminClient
        .from('promo_codes')
        .update({ used_count: promo.used_count + 1 })
        .eq('code', promo.code)
        .eq('used_count', promo.used_count) // optimistic lock

    if (incError) {
        return NextResponse.json({ error: 'Could not redeem code, please try again' }, { status: 409 })
    }

    // Grant premium
    await adminClient
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', userId)

    return NextResponse.json({ ok: true })
}
