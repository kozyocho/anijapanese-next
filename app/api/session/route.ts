import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const SRS_INTERVALS_DAYS = [1, 3, 7, 14] // level 1→4

interface VocabDetail {
    content_id: number
    japanese: string
    reading: string
    english: string
    category: string
    anime_tag: string | null
    frequency_score: number
}

interface SrsRow {
    content_id: number
    level: number
}

interface SessionItem {
    content_id: number
    japanese: string
    reading: string
    english: string
    category: string
    anime_tag: string | null
    frequency_score: number
    isReview: boolean
    srsLevel: number
}

const adminClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const newCount = Math.min(parseInt(searchParams.get('new') ?? '5'), 10)

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const items: SessionItem[] = []
    const usedIds = new Set<number>()

    // ── 1. Due SRS reviews (up to 10) ─────────────────────────────
    const { data: dueRows } = await adminClient
        .from('user_srs_progress')
        .select('content_id, level')
        .eq('user_id', userId)
        .lte('next_review_at', new Date().toISOString())
        .order('next_review_at', { ascending: true })
        .limit(10)

    const dueSrs: SrsRow[] = dueRows ?? []

    if (dueSrs.length > 0) {
        const ids = dueSrs.map(r => r.content_id)
        const { data: dueVocab } = await adminClient
            .from('content_vocabulary_details')
            .select('content_id, japanese, reading, english, category, anime_tag, frequency_score')
            .in('content_id', ids)

        const vocabMap = new Map<number, VocabDetail>()
        for (const v of dueVocab ?? []) vocabMap.set(v.content_id, v as VocabDetail)

        for (const srs of dueSrs) {
            const detail = vocabMap.get(srs.content_id)
            if (!detail) continue
            items.push({ ...detail, isReview: true, srsLevel: srs.level })
            usedIds.add(srs.content_id)
        }
    }

    // ── 2. New words (not in user_learned_contents) ───────────────
    const slotsNeeded = newCount
    if (slotsNeeded > 0) {
        // Get list of already-learned content IDs
        const { data: learnedRows } = await adminClient
            .from('user_learned_contents')
            .select('content_id')
            .eq('user_id', userId)

        const learnedIds = new Set<number>((learnedRows ?? []).map(r => r.content_id))

        // Combine exclude list
        const excludeIds = [...learnedIds, ...Array.from(usedIds)]

        // Fetch new vocab ordered by frequency_score
        let query = adminClient
            .from('content_vocabulary_details')
            .select('content_id, japanese, reading, english, category, anime_tag, frequency_score')
            .order('frequency_score', { ascending: false })
            .limit(slotsNeeded + excludeIds.length + 10) // overfetch then filter

        const { data: allVocab } = await query

        let added = 0
        for (const v of allVocab ?? []) {
            if (added >= slotsNeeded) break
            if (excludeIds.includes(v.content_id)) continue

            // Verify this content is active
            items.push({ ...(v as VocabDetail), isReview: false, srsLevel: 0 })
            usedIds.add(v.content_id)
            added++
        }
    }

    if (items.length === 0) {
        return NextResponse.json({ items: [], distractors: {} })
    }

    // ── 3. Distractors: 3 wrong english answers per item ──────────
    const { data: distPool } = await adminClient
        .from('content_vocabulary_details')
        .select('content_id, english')
        .not('content_id', 'in', `(${Array.from(usedIds).join(',')})`)
        .limit(300)

    const englishPool = (distPool ?? []).map(v => v.english)
    const distractors: Record<number, string[]> = {}

    for (const item of items) {
        const pool = englishPool.filter(e => e !== item.english)
        const shuffled = pool.sort(() => Math.random() - 0.5)
        distractors[item.content_id] = shuffled.slice(0, 3)
    }

    // Shuffle session order (reviews interleaved with new words)
    const shuffled = items.sort(() => Math.random() - 0.5)

    return NextResponse.json({ items: shuffled, distractors })
}
