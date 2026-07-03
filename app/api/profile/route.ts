import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const { data } = await adminClient
        .from('profiles')
        .select('current_streak, is_guest, is_premium')
        .eq('id', userId)
        .single()

    return NextResponse.json({ profile: data })
}

export async function PATCH(req: NextRequest) {
    const body = await req.json()
    const { userId, ...updates } = body
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const { error } = await adminClient
        .from('profiles')
        .update(updates)
        .eq('id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
}
