import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SRS_INTERVALS = [1, 3, 7, 14]

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    const { userId, contentId, isCorrect, isReview, srsLevel } = await req.json()
    if (!userId || !contentId) {
        return NextResponse.json({ error: 'userId and contentId required' }, { status: 400 })
    }

    const now = new Date()

    if (isCorrect) {
        const newLevel = Math.min((srsLevel || 0) + 1, 4)
        const nextReview = new Date(now)
        nextReview.setDate(nextReview.getDate() + SRS_INTERVALS[newLevel - 1])

        await adminClient.from('user_srs_progress').upsert({
            user_id: userId,
            content_id: contentId,
            level: newLevel,
            next_review_at: nextReview.toISOString(),
            last_reviewed_at: now.toISOString(),
        }, { onConflict: 'user_id,content_id' })

        if (!isReview) {
            await adminClient.from('user_learned_contents').upsert({
                user_id: userId,
                content_id: contentId,
            }, { onConflict: 'user_id,content_id' })
        }
    } else {
        const nextReview = new Date(now)
        nextReview.setDate(nextReview.getDate() + 1)

        await adminClient.from('user_srs_progress').upsert({
            user_id: userId,
            content_id: contentId,
            level: 1,
            next_review_at: nextReview.toISOString(),
            last_reviewed_at: now.toISOString(),
        }, { onConflict: 'user_id,content_id' })
    }

    return NextResponse.json({ ok: true })
}
