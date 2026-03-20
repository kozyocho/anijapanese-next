import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, SrsContentType } from '@/types/database'

type Supabase = SupabaseClient<Database>
type SrsItem = Database['public']['Tables']['srs_items']['Row']

// SRS interval schedule (days per wrong_count level)
const SRS_INTERVALS_DAYS = [1, 3, 7, 14, 30]

function nextReviewDate(wrongCount: number): string {
    const days = SRS_INTERVALS_DAYS[Math.min(wrongCount - 1, SRS_INTERVALS_DAYS.length - 1)]
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString()
}

// ── Read ─────────────────────────────────────────────────────

/** Get all SRS items due now (next_review_at <= now). */
export async function getDueItems(supabase: Supabase, userId: string) {
    const { data, error } = await supabase
        .from('srs_items')
        .select(`
      *,
      content_kana(character, romaji, type),
      content_vocabulary(japanese, english, reading),
      content_kanji(character, meaning, on_reading)
    `)
        .eq('user_id', userId)
        .lte('next_review_at', new Date().toISOString())
        .order('next_review_at', { ascending: true })

    if (error) throw new Error(`getDueItems: ${error.message}`)
    return data ?? []
}

/** Get all SRS items for a user (for SRS badge count, etc.). */
export async function getAllSRSItems(supabase: Supabase, userId: string) {
    const { data, error } = await supabase
        .from('srs_items')
        .select('id, next_review_at, wrong_count, content_type')
        .eq('user_id', userId)

    if (error) throw new Error(`getAllSRSItems: ${error.message}`)
    return data ?? []
}

// ── Write ────────────────────────────────────────────────────

/**
 * Record a wrong answer — add/update SRS item.
 * Called when user answers incorrectly in a quiz.
 */
export async function recordWrongAnswer(
    supabase: Supabase,
    userId: string,
    contentType: SrsContentType,
    contentId: number
) {
    const idField = contentType === 'kana' ? 'kana_id' : contentType === 'vocabulary' ? 'vocab_id' : 'kanji_id'

    // Check if item already exists
    const { data: existing } = await supabase
        .from('srs_items')
        .select('id, wrong_count')
        .eq('user_id', userId)
        .eq(idField, contentId)
        .maybeSingle()

    if (existing) {
        // Increase difficulty
        const newWrongCount = existing.wrong_count + 1
        await supabase
            .from('srs_items')
            .update({
                wrong_count: newWrongCount,
                next_review_at: nextReviewDate(1), // reset to shortest interval on re-failure
                last_reviewed_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
    } else {
        // Create new SRS item
        await supabase.from('srs_items').insert({
            user_id: userId,
            content_type: contentType,
            [idField]: contentId,
            wrong_count: 1,
            next_review_at: nextReviewDate(1),
        })
    }
}

/**
 * Record a correct answer in SRS review mode.
 * Advances the review interval; removes item if mastered (wrong_count = 0 after 5 correct).
 */
export async function recordCorrectReview(
    supabase: Supabase,
    userId: string,
    srsItemId: number,
    currentWrongCount: number
) {
    const newWrongCount = Math.max(0, currentWrongCount - 1)

    if (newWrongCount === 0) {
        // Mastered — remove from SRS queue
        await supabase.from('srs_items').delete().eq('id', srsItemId)
    } else {
        await supabase
            .from('srs_items')
            .update({
                wrong_count: newWrongCount,
                next_review_at: nextReviewDate(SRS_INTERVALS_DAYS.length - newWrongCount),
                last_reviewed_at: new Date().toISOString(),
            })
            .eq('id', srsItemId)
    }
}
