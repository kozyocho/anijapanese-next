import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

/**
 * Fetch the current user's profile.
 */
export async function getProfile(
    supabase: SupabaseClient<Database>,
    userId: string
): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('getProfile error:', error.message)
        return null
    }
    return data
}

/**
 * Save onboarding results to the profile.
 */
export async function saveOnboardingProfile(
    supabase: SupabaseClient<Database>,
    userId: string,
    payload: {
        jlpt_level: number
        jlpt_label: string
        goals: string[]
        minutes_per_day: number
        learning_plan: Record<string, unknown>
    }
) {
    const { error } = await supabase
        .from('profiles')
        .update({
            ...payload,
            onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', userId)

    if (error) throw new Error(`saveOnboardingProfile: ${error.message}`)
}

/**
 * Add XP to a user's profile and log it in xp_ledger.
 */
export async function addXP(
    supabase: SupabaseClient<Database>,
    userId: string,
    amount: number,
    reason: Database['public']['Enums']['xp_reason'],
    refId?: number
) {
    // Increment XP on profile
    const { error: profileError } = await supabase.rpc('increment_xp' as never, {
        uid: userId,
        amount,
    })
    if (profileError) {
        // Fallback: manual increment
        const { data: profile } = await supabase
            .from('profiles')
            .select('xp')
            .eq('id', userId)
            .single()
        if (profile) {
            await supabase
                .from('profiles')
                .update({ xp: profile.xp + amount })
                .eq('id', userId)
        }
    }

    // Log to xp_ledger
    await supabase.from('xp_ledger').insert({
        user_id: userId,
        amount,
        reason,
        ref_id: refId ?? null,
    })
}

/**
 * Update generic profile fields.
 */
export async function updateProfile(
    supabase: SupabaseClient<Database>,
    userId: string,
    update: ProfileUpdate
) {
    const { error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', userId)

    if (error) throw new Error(`updateProfile: ${error.message}`)
}
