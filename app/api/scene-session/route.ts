import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SESSION_SIZE = 10

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const { userId: clerkUserId } = await auth()
    const userId = clerkUserId ?? searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const { data: profileRow } = await adminClient
        .from('profiles')
        .select('is_premium, jlpt_level')
        .eq('id', userId)
        .single()

    if (!profileRow?.is_premium) {
        return NextResponse.json({ premiumRequired: true, items: [] })
    }

    // Map JLPT level → difficulty (5=N5 easiest → 1=N1 hardest)
    const jlpt = profileRow.jlpt_level ?? 5
    const difficulty = jlpt >= 4 ? 'beginner' : jlpt === 3 ? 'intermediate' : 'advanced'

    const { data: quizzes } = await adminClient
        .from('content_scene_quizzes')
        .select('id, scene_en, question_type, prompt_jp, correct_phrase, correct_reading, correct_meaning, distractors, difficulty')
        .eq('difficulty', difficulty)

    if (!quizzes || quizzes.length === 0) {
        return NextResponse.json({ items: [] })
    }

    const { data: results } = await adminClient
        .from('user_scene_results')
        .select('quiz_id, correct_count, wrong_count')
        .eq('user_id', userId)

    const resultMap = new Map<number, { correct_count: number; wrong_count: number }>()
    for (const r of results ?? []) resultMap.set(r.quiz_id, r)

    // Prioritize: unseen first (-100), then most-wrong (correct - wrong ascending)
    const scored = quizzes.map(q => {
        const r = resultMap.get(q.id)
        const score = r ? r.correct_count - r.wrong_count : -100
        return { q, score, tiebreak: Math.random() }
    })
    scored.sort((a, b) => a.score - b.score || a.tiebreak - b.tiebreak)

    const items = scored.slice(0, SESSION_SIZE).map(({ q }) => q)

    return NextResponse.json({ items, difficulty })
}
