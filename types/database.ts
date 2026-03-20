export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type ContentTypeEnum = 'kana' | 'kanji' | 'vocabulary' | 'grammar'
export type QuizType = 'hiragana' | 'katakana' | 'vocabulary' | 'kanji' | 'mixed' | 'daily' | 'review'
export type XpReason = 'kana_learned' | 'vocab_learned' | 'kanji_learned' | 'quiz_completed' | 'daily_bonus' | 'streak_bonus' | 'srs_mastered'

export interface Database {
    public: {
        Tables: {
            // ── Profiles ───────────────────────────────────────────
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    avatar_url: string | null
                    jlpt_level: number
                    jlpt_label: string
                    goals: string[]
                    minutes_per_day: number
                    onboarding_completed_at: string | null
                    xp: number
                    current_streak: number
                    longest_streak: number
                    last_active_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username?: string | null
                    avatar_url?: string | null
                    jlpt_level?: number
                    jlpt_label?: string
                    goals?: string[]
                    minutes_per_day?: number
                    onboarding_completed_at?: string | null
                    xp?: number
                    current_streak?: number
                    longest_streak?: number
                    last_active_at?: string | null
                }
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>
            }

            // ── Unified content ────────────────────────────────────
            contents: {
                Row: {
                    id: number
                    type: ContentTypeEnum
                    jlpt_level: number | null
                    difficulty: number | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['contents']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['contents']['Insert']>
            }

            // ── Detail subtables ───────────────────────────────────
            content_kana_details: {
                Row: {
                    content_id: number
                    kana_type: 'hiragana' | 'katakana'
                    character: string
                    romaji: string
                    examples: Json
                }
                Insert: Database['public']['Tables']['content_kana_details']['Row']
                Update: Partial<Database['public']['Tables']['content_kana_details']['Insert']>
            }

            content_vocabulary_details: {
                Row: {
                    content_id: number
                    japanese: string
                    reading: string
                    english: string
                    category: string
                    tags: string[]
                    embedding: number[] | null
                }
                Insert: Omit<Database['public']['Tables']['content_vocabulary_details']['Row'], 'tags'>
                & { tags?: string[] }
                Update: Partial<Database['public']['Tables']['content_vocabulary_details']['Insert']>
            }

            content_kanji_details: {
                Row: {
                    content_id: number
                    character: string
                    meaning: string
                    on_reading: string | null
                    kun_reading: string | null
                    stroke_count: number | null
                    examples: Json
                    embedding: number[] | null
                }
                Insert: Omit<Database['public']['Tables']['content_kanji_details']['Row'], 'examples'>
                & { examples?: Json }
                Update: Partial<Database['public']['Tables']['content_kanji_details']['Insert']>
            }

            content_grammar_details: {
                Row: {
                    content_id: number
                    pattern: string
                    explanation: string
                    example_jp: string | null
                    example_en: string | null
                }
                Insert: Database['public']['Tables']['content_grammar_details']['Row']
                Update: Partial<Database['public']['Tables']['content_grammar_details']['Insert']>
            }

            // ── User progress ──────────────────────────────────────
            user_learned_contents: {
                Row: { user_id: string; content_id: number; learned_at: string }
                Insert: Omit<Database['public']['Tables']['user_learned_contents']['Row'], 'learned_at'>
                Update: never
            }

            user_srs_progress: {
                Row: {
                    user_id: string
                    content_id: number
                    level: number
                    wrong_count: number
                    next_review_at: string
                    last_reviewed_at: string | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['user_srs_progress']['Row'], 'created_at'>
                Update: Pick<Database['public']['Tables']['user_srs_progress']['Row'],
                    'level' | 'wrong_count' | 'next_review_at' | 'last_reviewed_at'>
            }

            // ── Quiz ──────────────────────────────────────────────
            quiz_sessions: {
                Row: {
                    id: number
                    user_id: string
                    quiz_type: QuizType
                    score: number
                    total_questions: number
                    accuracy_pct: number | null
                    max_streak: number
                    xp_earned: number
                    duration_seconds: number | null
                    completed_at: string
                }
                Insert: Omit<Database['public']['Tables']['quiz_sessions']['Row'], 'id' | 'accuracy_pct' | 'completed_at'>
                Update: never
            }

            quiz_question_results: {
                Row: {
                    id: number
                    session_id: number
                    content_id: number          // ← unified content_id
                    prompt: string
                    correct_answer: string
                    user_answer: string | null
                    is_correct: boolean
                    is_skipped: boolean
                    answered_at: string
                }
                Insert: Omit<Database['public']['Tables']['quiz_question_results']['Row'], 'id' | 'answered_at'>
                Update: never
            }

            // ── Learning plans ────────────────────────────────────
            user_learning_plans: {
                Row: {
                    id: number
                    user_id: string
                    goal: string | null
                    minutes_per_day: number
                    is_active: boolean
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['user_learning_plans']['Row'], 'id' | 'created_at'>
                Update: Pick<Database['public']['Tables']['user_learning_plans']['Row'],
                    'goal' | 'minutes_per_day' | 'is_active'>
            }

            user_learning_plan_items: {
                Row: {
                    plan_id: number
                    content_type: ContentTypeEnum
                    target_count: number
                    order_index: number
                }
                Insert: Database['public']['Tables']['user_learning_plan_items']['Row']
                Update: Partial<Database['public']['Tables']['user_learning_plan_items']['Insert']>
            }

            // ── Streaks & XP ──────────────────────────────────────
            daily_streaks: {
                Row: { id: number; user_id: string; date: string; questions_answered: number; xp_earned: number }
                Insert: Omit<Database['public']['Tables']['daily_streaks']['Row'], 'id'>
                Update: Pick<Database['public']['Tables']['daily_streaks']['Row'], 'questions_answered' | 'xp_earned'>
            }

            xp_ledger: {
                Row: { id: number; user_id: string; amount: number; reason: XpReason; ref_id: number | null; created_at: string }
                Insert: Omit<Database['public']['Tables']['xp_ledger']['Row'], 'id' | 'created_at'>
                Update: never
            }
        }

        Views: {
            user_progress: {
                Row: {
                    id: string
                    xp: number
                    jlpt_label: string
                    jlpt_level: number
                    current_streak: number
                    longest_streak: number
                    minutes_per_day: number
                    hiragana_learned: number
                    hiragana_total: number
                    katakana_learned: number
                    katakana_total: number
                    vocab_learned: number
                    vocab_total: number
                    kanji_learned: number
                    kanji_total: number
                    srs_due: number
                    srs_total: number
                }
            }
        }

        Functions: {
            search_similar_vocab: {
                Args: { query_embedding: number[]; match_count?: number; max_jlpt_level?: number }
                Returns: { content_id: number; japanese: string; english: string; reading: string; category: string; similarity: number }[]
            }
            get_similar_answers: {
                Args: { target_content_id: number; num_distractors?: number }
                Returns: { english: string }[]
            }
        }

        Enums: {
            content_type_enum: ContentTypeEnum
            quiz_type: QuizType
            xp_reason: XpReason
        }
    }
}

// ── Convenient joined types ─────────────────────────────────

/** contents row joined with its kana detail */
export type ContentKanaRow =
    Database['public']['Tables']['contents']['Row'] & {
        content_kana_details: Database['public']['Tables']['content_kana_details']['Row']
    }

/** contents row joined with its vocabulary detail */
export type ContentVocabRow =
    Database['public']['Tables']['contents']['Row'] & {
        content_vocabulary_details: Database['public']['Tables']['content_vocabulary_details']['Row']
    }

/** contents row joined with its kanji detail */
export type ContentKanjiRow =
    Database['public']['Tables']['contents']['Row'] & {
        content_kanji_details: Database['public']['Tables']['content_kanji_details']['Row']
    }
