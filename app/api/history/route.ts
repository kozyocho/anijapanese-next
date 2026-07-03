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

    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    const since = ninetyDaysAgo.toISOString().split('T')[0]

    const [streaksRes, learnedRes, profileRes, totalWordsRes] = await Promise.all([
        adminClient
            .from('daily_streaks')
            .select('date, questions_answered, duration_seconds')
            .eq('user_id', userId)
            .gte('date', since)
            .order('date', { ascending: true }),
        adminClient
            .from('user_learned_contents')
            .select('learned_at')
            .eq('user_id', userId)
            .gte('learned_at', ninetyDaysAgo.toISOString()),
        adminClient
            .from('profiles')
            .select('current_streak, longest_streak')
            .eq('id', userId)
            .single(),
        adminClient
            .from('user_learned_contents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId),
    ])

    // Words learned per day
    const learnedByDate: Record<string, number> = {}
    for (const item of learnedRes.data ?? []) {
        const date = item.learned_at.split('T')[0]
        learnedByDate[date] = (learnedByDate[date] || 0) + 1
    }

    // Merge streaks + learned
    const activityMap: Record<string, { questions: number; duration_seconds: number; words_learned: number }> = {}
    for (const s of streaksRes.data ?? []) {
        activityMap[s.date] = {
            questions: s.questions_answered,
            duration_seconds: s.duration_seconds ?? 0,
            words_learned: learnedByDate[s.date] || 0,
        }
    }
    for (const [date, count] of Object.entries(learnedByDate)) {
        if (!activityMap[date]) {
            activityMap[date] = { questions: 0, duration_seconds: 0, words_learned: count }
        } else {
            activityMap[date].words_learned = count
        }
    }

    const days = Object.entries(activityMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))

    const totalDuration = days.reduce((sum, d) => sum + d.duration_seconds, 0)

    return NextResponse.json({
        days,
        totals: {
            total_words_learned: totalWordsRes.count ?? 0,
            current_streak: profileRes.data?.current_streak ?? 0,
            longest_streak: profileRes.data?.longest_streak ?? 0,
            total_duration_seconds: totalDuration,
        },
    })
}
