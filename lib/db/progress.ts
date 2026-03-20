import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Supabase = SupabaseClient<Database>

// ── Read ─────────────────────────────────────────────────────

/** Get the full user_progress view row for a user. */
export async function getUserProgress(supabase: Supabase, userId: string) {
    const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) throw new Error(`getUserProgress: ${error.message}`)
    return data
}

/** Get all learned kana for a user (with type so UI can distinguish hiragana/katakana). */
export async function getLearnedKana(supabase: Supabase, userId: string) {
    const { data, error } = await supabase
        .from('user_learned_kana')
        .select('kana_id, learned_at, content_kana(type, character, romaji)')
        .eq('user_id', userId)

    if (error) throw new Error(`getLearnedKana: ${error.message}`)
    return data ?? []
}

/** Get IDs of all learned vocabulary for a user. */
export async function getLearnedVocabIds(supabase: Supabase, userId: string): Promise<number[]> {
    const { data, error } = await supabase
        .from('user_learned_vocabulary')
        .select('vocab_id')
        .eq('user_id', userId)

    if (error) throw new Error(`getLearnedVocabIds: ${error.message}`)
    return (data ?? []).map(r => r.vocab_id)
}

/** Get IDs of all learned kanji for a user. */
export async function getLearnedKanjiIds(supabase: Supabase, userId: string): Promise<number[]> {
    const { data, error } = await supabase
        .from('user_learned_kanji')
        .select('kanji_id')
        .eq('user_id', userId)

    if (error) throw new Error(`getLearnedKanjiIds: ${error.message}`)
    return (data ?? []).map(r => r.kanji_id)
}

// ── Write ────────────────────────────────────────────────────

/** Mark a kana character as learned (idempotent). */
export async function markKanaLearned(supabase: Supabase, userId: string, kanaId: number) {
    const { error } = await supabase
        .from('user_learned_kana')
        .upsert({ user_id: userId, kana_id: kanaId }, { onConflict: 'user_id,kana_id' })

    if (error) throw new Error(`markKanaLearned: ${error.message}`)
}

/** Mark a vocabulary item as learned (idempotent). */
export async function markVocabLearned(supabase: Supabase, userId: string, vocabId: number) {
    const { error } = await supabase
        .from('user_learned_vocabulary')
        .upsert({ user_id: userId, vocab_id: vocabId }, { onConflict: 'user_id,vocab_id' })

    if (error) throw new Error(`markVocabLearned: ${error.message}`)
}

/** Mark a kanji as learned (idempotent). */
export async function markKanjiLearned(supabase: Supabase, userId: string, kanjiId: number) {
    const { error } = await supabase
        .from('user_learned_kanji')
        .upsert({ user_id: userId, kanji_id: kanjiId }, { onConflict: 'user_id,kanji_id' })

    if (error) throw new Error(`markKanjiLearned: ${error.message}`)
}
