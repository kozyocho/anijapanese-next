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
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const quizIdNum = Number(body.quizId)
    if (!Number.isInteger(quizIdNum) || quizIdNum <= 0) {
        return NextResponse.json({ error: 'Invalid quizId' }, { status: 400 })
    }
    const isCorrect = body.correct === true

    // Verify quiz exists
    const { data: quiz } = await adminClient
        .from('content_scene_quizzes')
        .select('id')
        .eq('id', quizIdNum)
        .single()
    if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })

    const { data: existing } = await adminClient
        .from('user_scene_results')
        .select('correct_count, wrong_count')
        .eq('user_id', userId)
        .eq('quiz_id', quizIdNum)
        .single()

    const { error } = await adminClient
        .from('user_scene_results')
        .upsert({
            user_id: userId,
            quiz_id: quizIdNum,
            correct_count: (existing?.correct_count ?? 0) + (isCorrect ? 1 : 0),
            wrong_count: (existing?.wrong_count ?? 0) + (isCorrect ? 0 : 1),
            last_answered_at: new Date().toISOString(),
        })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
}
