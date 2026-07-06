import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { userId: clerkUserId } = await auth()
    const userId = clerkUserId ?? body.userId
    const { questionsAnswered, durationSeconds } = body
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Record daily activity
    await adminClient.from('daily_streaks').upsert({
        user_id: userId,
        date: today,
        questions_answered: questionsAnswered,
        duration_seconds: durationSeconds ?? 0,
    }, { onConflict: 'user_id,date' })

    // Update streak in profiles
    const { data: profile } = await adminClient
        .from('profiles')
        .select('current_streak, longest_streak, last_active_at')
        .eq('id', userId)
        .single()

    let newStreak = 1
    if (profile?.last_active_at === today) {
        newStreak = profile.current_streak || 1
    } else if (profile?.last_active_at === yesterday) {
        newStreak = (profile.current_streak || 0) + 1
    }

    const longestStreak = Math.max(newStreak, profile?.longest_streak || 0)

    await adminClient.from('profiles').update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_active_at: today,
    }).eq('id', userId)

    return NextResponse.json({ ok: true })
}
