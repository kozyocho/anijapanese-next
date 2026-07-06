import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const SRS_INTERVALS = [1, 3, 7, 14]

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { userId: clerkUserId } = await auth()
    const userId = clerkUserId ?? body.userId
    const { contentId, isCorrect, isReview } = body
    if (!userId || !contentId) {
        return NextResponse.json({ error: 'userId and contentId required' }, { status: 400 })
    }

    // Validate contentId is a positive integer
    const contentIdNum = Number(contentId)
    if (!Number.isInteger(contentIdNum) || contentIdNum <= 0) {
        return NextResponse.json({ error: 'Invalid contentId' }, { status: 400 })
    }

    // Verify contentId exists in the vocabulary table
    const { data: vocabRow } = await adminClient
        .from('content_vocabulary_details')
        .select('content_id')
        .eq('content_id', contentIdNum)
        .single()
    if (!vocabRow) {
        return NextResponse.json({ error: 'Invalid contentId' }, { status: 400 })
    }

    // Read current SRS level from DB — never trust client-provided value
    const { data: existingSrs } = await adminClient
        .from('user_srs_progress')
        .select('level')
        .eq('user_id', userId)
        .eq('content_id', contentIdNum)
        .single()
    const currentLevel = existingSrs?.level ?? 0

    const now = new Date()

    if (isCorrect) {
        const newLevel = Math.min(currentLevel + 1, 4)
        const nextReview = new Date(now)
        nextReview.setDate(nextReview.getDate() + SRS_INTERVALS[newLevel - 1])

        await adminClient.from('user_srs_progress').upsert({
            user_id: userId,
            content_id: contentIdNum,
            level: newLevel,
            next_review_at: nextReview.toISOString(),
            last_reviewed_at: now.toISOString(),
        }, { onConflict: 'user_id,content_id' })

        if (!isReview) {
            await adminClient.from('user_learned_contents').upsert({
                user_id: userId,
                content_id: contentIdNum,
            }, { onConflict: 'user_id,content_id' })
        }
    } else {
        const nextReview = new Date(now)
        nextReview.setDate(nextReview.getDate() + 1)

        await adminClient.from('user_srs_progress').upsert({
            user_id: userId,
            content_id: contentIdNum,
            level: 1,
            next_review_at: nextReview.toISOString(),
            last_reviewed_at: now.toISOString(),
        }, { onConflict: 'user_id,content_id' })
    }

    return NextResponse.json({ ok: true })
}
