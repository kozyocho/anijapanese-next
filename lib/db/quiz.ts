import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, QuizType, SrsContentType } from '@/types/database'

type Supabase = SupabaseClient<Database>

interface QuizQuestionResult {
    contentType: SrsContentType
    kanaId?: number
    vocabId?: number
    kanjiId?: number
    prompt: string
    correctAnswer: string
    userAnswer: string | null
    isCorrect: boolean
    isSkipped: boolean
}

interface CreateQuizSessionPayload {
    quizType: QuizType
    score: number
    totalQuestions: number
    maxStreak: number
    xpEarned: number
    durationSeconds?: number
    questions: QuizQuestionResult[]
}

/**
 * Persist a completed quiz session and all question results.
 * Returns the created session ID.
 */
export async function saveQuizSession(
    supabase: Supabase,
    userId: string,
    payload: CreateQuizSessionPayload
): Promise<number> {
    // 1. Insert session row
    const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
            user_id: userId,
            quiz_type: payload.quizType,
            score: payload.score,
            total_questions: payload.totalQuestions,
            max_streak: payload.maxStreak,
            xp_earned: payload.xpEarned,
            duration_seconds: payload.durationSeconds ?? null,
        })
        .select('id')
        .single()

    if (sessionError || !session) {
        throw new Error(`saveQuizSession: ${sessionError?.message}`)
    }

    // 2. Insert all question results
    if (payload.questions.length > 0) {
        const rows = payload.questions.map(q => ({
            session_id: session.id,
            content_type: q.contentType,
            kana_id: q.kanaId ?? null,
            vocab_id: q.vocabId ?? null,
            kanji_id: q.kanjiId ?? null,
            prompt: q.prompt,
            correct_answer: q.correctAnswer,
            user_answer: q.userAnswer,
            is_correct: q.isCorrect,
            is_skipped: q.isSkipped,
        }))

        const { error: qError } = await supabase.from('quiz_question_results').insert(rows)
        if (qError) throw new Error(`saveQuizSession (questions): ${qError.message}`)
    }

    return session.id
}

/**
 * Get quiz history for a user (most recent first).
 */
export async function getQuizHistory(
    supabase: Supabase,
    userId: string,
    limit = 20
) {
    const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit)

    if (error) throw new Error(`getQuizHistory: ${error.message}`)
    return data ?? []
}

/**
 * Get per-type accuracy stats.
 */
export async function getQuizStats(supabase: Supabase, userId: string) {
    const { data, error } = await supabase
        .from('quiz_sessions')
        .select('quiz_type, score, total_questions, accuracy_pct, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(100)

    if (error) throw new Error(`getQuizStats: ${error.message}`)
    return data ?? []
}
