import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { auth } from '@clerk/nextjs/server'

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

const FREE_DAILY_NEW_LIMIT = 5

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const { userId: clerkUserId } = await auth()
    const userId = clerkUserId ?? searchParams.get('userId')

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Fetch profile: premium status, JLPT level, study time
    const { data: profileRow } = await adminClient
        .from('profiles')
        .select('is_premium, jlpt_level, minutes_per_day')
        .eq('id', userId)
        .single()

    const isPremium = profileRow?.is_premium ?? false
    // jlpt_level: 5=N5(easiest)→1=N1(hardest). Default N5 for new users.
    const userJlptLevel = profileRow?.jlpt_level ?? 5
    // Word count based on daily study time
    const minutesPerDay = profileRow?.minutes_per_day ?? 10
    const maxNewByTime = minutesPerDay <= 5 ? 5
        : minutesPerDay <= 10 ? 10
        : minutesPerDay <= 20 ? 15
        : 20

    // Count new words learned today (for free-tier limit)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count: todayNewCount } = await adminClient
        .from('user_learned_contents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('learned_at', todayStart.toISOString())

    const dailyNewUsed = todayNewCount ?? 0
    const dailyNewRemaining = isPremium ? 999 : Math.max(0, FREE_DAILY_NEW_LIMIT - dailyNewUsed)

    const requestedNew = parseInt(searchParams.get('new') ?? String(maxNewByTime))
    const newCount = Math.min(requestedNew, isPremium ? maxNewByTime : Math.min(dailyNewRemaining, maxNewByTime))

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

        // Fetch new vocab: filter by user's JLPT level, ordered by frequency
        // jlpt_level >= userJlptLevel means: show words at user's level and easier
        // (5=N5/easiest, 1=N1/hardest — higher number = easier)
        const { data: allVocab } = await adminClient
            .from('content_vocabulary_details')
            .select('content_id, japanese, reading, english, category, anime_tag, frequency_score, jlpt_level')
            .gte('jlpt_level', userJlptLevel)
            .order('frequency_score', { ascending: false })
            .limit(slotsNeeded + excludeIds.length + 10)

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
    // Prefer same-category words (harder, more educational), fall back to global pool
    const { data: distPool } = await adminClient
        .from('content_vocabulary_details')
        .select('content_id, english, category')
        .not('content_id', 'in', `(${Array.from(usedIds).join(',')})`)
        .limit(300)

    const pool = distPool ?? []
    const distractors: Record<number, string[]> = {}

    for (const item of items) {
        const sameCategory = pool.filter(v => v.category === item.category && v.english !== item.english)
        const others = pool.filter(v => v.category !== item.category && v.english !== item.english)
        const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5)

        const picked: string[] = []
        for (const v of [...shuffle(sameCategory), ...shuffle(others)]) {
            if (picked.length >= 3) break
            if (!picked.includes(v.english)) picked.push(v.english)
        }
        distractors[item.content_id] = picked
    }

    // Shuffle session order (reviews interleaved with new words)
    const shuffled = items.sort(() => Math.random() - 0.5)

    return NextResponse.json({
        items: shuffled,
        distractors,
        isPremium,
        dailyNewUsed,
        dailyNewLimit: isPremium ? null : FREE_DAILY_NEW_LIMIT,
    })
}
