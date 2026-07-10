import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_PATCH_FIELDS = ['jlpt_level', 'jlpt_label', 'minutes_per_day', 'goals', 'onboarding_completed_at'] as const
type AllowedField = typeof ALLOWED_PATCH_FIELDS[number]

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const { userId: clerkUserId } = await auth()
    const userId = clerkUserId ?? searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const { data } = await adminClient
        .from('profiles')
        .select('current_streak, is_guest, is_premium, plan_type, jlpt_level, minutes_per_day, onboarding_completed_at')
        .eq('id', userId)
        .single()

    return NextResponse.json({ profile: data })
}

export async function PATCH(req: NextRequest) {
    const body = await req.json()
    const { userId: clerkUserId } = await auth()
    const userId = clerkUserId ?? body.userId
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const updates: Partial<Record<AllowedField, unknown>> = {}
    for (const field of ALLOWED_PATCH_FIELDS) {
        if (field in body) updates[field] = body[field]
    }
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { error } = await adminClient
        .from('profiles')
        .update(updates)
        .eq('id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
}
