import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Supabase = SupabaseClient<Database>

/**
 * Record today's study activity (upsert).
 * Also updates profile.current_streak / longest_streak / last_active_at.
 */
export async function recordDailyActivity(
    supabase: Supabase,
    userId: string,
    questionsAnswered: number,
    xpEarned: number
) {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Upsert today's streak row
    const { error } = await supabase
        .from('daily_streaks')
        .upsert(
            {
                user_id: userId,
                date: today,
                questions_answered: questionsAnswered,
                xp_earned: xpEarned,
            },
            {
                onConflict: 'user_id,date',
                ignoreDuplicates: false,
            }
        )

    if (error) throw new Error(`recordDailyActivity: ${error.message}`)

    // Update profile streak
    await updateStreakOnProfile(supabase, userId, today)
}

async function updateStreakOnProfile(supabase: Supabase, userId: string, today: string) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, last_active_at')
        .eq('id', userId)
        .single()

    if (!profile) return

    const lastActive = profile.last_active_at
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let newStreak: number
    if (lastActive === today) {
        // Already recorded today
        return
    } else if (lastActive === yesterdayStr) {
        // Consecutive day
        newStreak = profile.current_streak + 1
    } else {
        // Streak broken
        newStreak = 1
    }

    await supabase
        .from('profiles')
        .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, profile.longest_streak),
            last_active_at: today,
        })
        .eq('id', userId)
}

/**
 * Get the user's streak history (last 30 days).
 */
export async function getStreakHistory(supabase: Supabase, userId: string) {
    const { data, error } = await supabase
        .from('daily_streaks')
        .select('date, questions_answered, xp_earned')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30)

    if (error) throw new Error(`getStreakHistory: ${error.message}`)
    return data ?? []
}
