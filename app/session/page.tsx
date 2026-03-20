'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { WordCard } from '@/components/WordCard'
import { ChoiceGrid } from '@/components/ChoiceGrid'
import { FeedbackOverlay } from '@/components/FeedbackOverlay'
import { useGuest } from '@/lib/GuestProvider'
import { createClient } from '@/lib/supabase/client'

const SRS_INTERVALS = [1, 3, 7, 14] // days for level 1-4

interface SessionItem {
    content_id: number
    japanese: string
    reading: string
    english: string
    category: string
    anime_tag: string | null
    isReview: boolean
    srsLevel: number
}

export default function SessionPage() {
    const { guestId, refreshProfile } = useGuest()
    const router = useRouter()

    const [items, setItems] = useState<SessionItem[]>([])
    const [distractors, setDistractors] = useState<Record<number, string[]>>({})
    const [index, setIndex] = useState(0)
    const [feedback, setFeedback] = useState<{ isCorrect: boolean } | null>(null)
    const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 })
    const [done, setDone] = useState(false)
    const [loading, setLoading] = useState(true)
    // Shuffled choices — computed only when the current item changes, NOT on re-render
    const [shuffledChoices, setShuffledChoices] = useState<string[]>([])

    useEffect(() => {
        if (!guestId) return
        fetch(`/api/session?userId=${guestId}&new=10`)
            .then(r => r.json())
            .then(({ items, distractors }) => {
                if (!items?.length) { router.push('/'); return }
                setItems(items)
                setDistractors(distractors ?? {})
                setLoading(false)
            })
    }, [guestId, router])

    const currentItem = items[index]

    // Shuffle choices exactly once per item (when content_id changes)
    useEffect(() => {
        if (!currentItem) return
        const pool = [...(distractors[currentItem.content_id] ?? []), currentItem.english]
        // Fisher-Yates shuffle
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]]
        }
        setShuffledChoices(pool)
    }, [currentItem?.content_id]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleAnswer = useCallback(async (isCorrect: boolean) => {
        setFeedback({ isCorrect })
        if (!guestId || !currentItem) return

        const supabase = createClient()
        const now = new Date()

        if (isCorrect) {
            // Advance SRS level (max 4)
            const newLevel = Math.min((currentItem.srsLevel || 0) + 1, 4)
            const daysToAdd = SRS_INTERVALS[newLevel - 1]
            const nextReview = new Date(now)
            nextReview.setDate(nextReview.getDate() + daysToAdd)

            await supabase.from('user_srs_progress').upsert({
                user_id: guestId,
                content_id: currentItem.content_id,
                level: newLevel,
                next_review_at: nextReview.toISOString(),
                last_reviewed_at: now.toISOString(),
                review_count: 1,
            }, { onConflict: 'user_id,content_id' })

            // Mark as learned if first time correct
            if (!currentItem.isReview) {
                await supabase.from('user_learned_contents').upsert({
                    user_id: guestId,
                    content_id: currentItem.content_id,
                }, { onConflict: 'user_id,content_id' })
            }

            // Add XP atomically using server-side function
            const xpAmount = currentItem.isReview ? 5 : 10
            try {
                await supabase.rpc('increment_xp' as never, {
                    p_user_id: guestId, p_amount: xpAmount,
                } as never)
            } catch {
                // Fallback: read-modify-write
                const { data: prof } = await supabase.from('profiles').select('xp').eq('id', guestId).single()
                if (prof) await supabase.from('profiles').update({ xp: (prof.xp || 0) + xpAmount }).eq('id', guestId)
            }
        } else {
            // Reset SRS level
            const nextReview = new Date(now)
            nextReview.setDate(nextReview.getDate() + 1)

            await supabase.from('user_srs_progress').upsert({
                user_id: guestId,
                content_id: currentItem.content_id,
                level: 1,
                next_review_at: nextReview.toISOString(),
                last_reviewed_at: now.toISOString(),
                wrong_count: 1,
            }, { onConflict: 'user_id,content_id' })
        }

        setResults(r => ({
            correct: r.correct + (isCorrect ? 1 : 0),
            total: r.total + 1,
        }))
    }, [guestId, currentItem])

    const handleNext = useCallback(async () => {
        setFeedback(null)
        if (index + 1 >= items.length) {
            // Record streak
            if (guestId) {
                const supabase = createClient()
                const today = new Date().toISOString().split('T')[0]
                await supabase.from('daily_streaks').upsert({
                    user_id: guestId,
                    date: today,
                    questions_answered: results.total + 1,
                    xp_earned: (results.correct + (feedback?.isCorrect ? 1 : 0)) * 10,
                }, { onConflict: 'user_id,date' })
                await refreshProfile()
            }
            setDone(true)
        } else {
            setIndex(i => i + 1)
        }
    }, [index, items.length, guestId, results, feedback, refreshProfile])

    if (loading) {
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>Building your session...</div>
            </div>
        )
    }

    if (done) {
        const acc = Math.round((results.correct / results.total) * 100)
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
                        {acc >= 80 ? '🏆' : acc >= 50 ? '📈' : '💪'}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
                        Session Complete!
                    </div>
                    <div style={{ color: '#94a3b8', marginBottom: '24px' }}>
                        {results.correct}/{results.total} correct · {acc}% accuracy
                    </div>
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px',
                    }}>
                        <div style={{
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: '14px', padding: '16px',
                        }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{results.correct}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Correct</div>
                        </div>
                        <div style={{
                            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                            borderRadius: '14px', padding: '16px',
                        }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa' }}>{results.correct * 10}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>XP Earned</div>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        style={{
                            width: '100%', padding: '16px',
                            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                            border: 'none', borderRadius: '14px',
                            color: 'white', fontFamily: 'inherit',
                            fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                        }}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    if (!currentItem) return null



    return (
        <div style={{ minHeight: '100dvh', padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
            {/* Progress bar */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '8px',
                }}>
                    <button
                        onClick={() => router.push('/')}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                        ✕
                    </button>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                        {index + 1} / {items.length}
                    </div>
                    <div style={{ width: '24px' }} />
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px' }}>
                    <div style={{
                        height: '100%', borderRadius: '99px',
                        background: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
                        width: `${((index) / items.length) * 100}%`,
                        transition: 'width 0.3s ease',
                    }} />
                </div>
            </div>

            {/* Word card */}
            <div style={{ marginBottom: '24px' }}>
                <WordCard
                    word={currentItem.japanese}
                    reading={currentItem.reading}
                    category={currentItem.category}
                    isReview={currentItem.isReview}
                />
            </div>

            {/* Question */}
            <div style={{ textAlign: 'center', marginBottom: '16px', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                What does this mean in English?
            </div>

            {/* Choices */}
            <ChoiceGrid
                key={currentItem.content_id}
                choices={shuffledChoices}
                correctAnswer={currentItem.english}
                onAnswer={handleAnswer}
            />

            {/* Feedback overlay */}
            {feedback && (
                <FeedbackOverlay
                    isCorrect={feedback.isCorrect}
                    word={currentItem.japanese}
                    correctAnswer={currentItem.english}
                    onNext={handleNext}
                />
            )}
        </div>
    )
}
