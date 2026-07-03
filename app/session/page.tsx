'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { WordCard } from '@/components/WordCard'
import { ChoiceGrid } from '@/components/ChoiceGrid'
import { FeedbackOverlay } from '@/components/FeedbackOverlay'
import { useGuest } from '@/lib/GuestProvider'

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
    const [sessionStart] = useState<number>(() => Date.now())
    // Shuffled choices — computed only when the current item changes, NOT on re-render
    const [shuffledChoices, setShuffledChoices] = useState<string[]>([])

    // Paywall gate — non-premium users redirected to home
    useEffect(() => {
        if (!guestId) return
        fetch(`/api/profile?userId=${guestId}`)
            .then(r => r.json())
            .then(({ profile }) => {
                if (!profile?.is_premium) router.replace('/')
            })
    }, [guestId, router])

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

    useEffect(() => {
        if (feedback) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        }
    }, [feedback])

    const handleAnswer = useCallback(async (isCorrect: boolean) => {
        setFeedback({ isCorrect })
        if (!guestId || !currentItem) return

        await fetch('/api/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: guestId,
                contentId: currentItem.content_id,
                isCorrect,
                isReview: currentItem.isReview,
                srsLevel: currentItem.srsLevel,
            }),
        })

        setResults(r => ({
            correct: r.correct + (isCorrect ? 1 : 0),
            total: r.total + 1,
        }))
    }, [guestId, currentItem])

    const handleNext = useCallback(async () => {
        setFeedback(null)
        if (index + 1 >= items.length) {
            if (guestId) {
                const durationSeconds = Math.round((Date.now() - sessionStart) / 1000)
                await fetch('/api/streak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: guestId,
                        questionsAnswered: results.total + 1,
                        durationSeconds,
                    }),
                })
                await refreshProfile()
            }
            setDone(true)
        } else {
            setIndex(i => i + 1)
        }
    }, [index, items.length, guestId, results, feedback, refreshProfile, sessionStart])

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
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '14px', padding: '16px',
                        }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>{results.total - results.correct}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Incorrect</div>
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
        <div style={{ minHeight: '100dvh', padding: '20px', maxWidth: '480px', margin: '0 auto', paddingBottom: feedback ? '260px' : '20px' }}>
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

            {/* Don't know button */}
            {!feedback && (
                <button
                    onClick={() => handleAnswer(false)}
                    style={{
                        marginTop: '16px',
                        width: '100%',
                        padding: '14px',
                        background: 'transparent',
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        borderRadius: '14px',
                        color: '#64748b',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    I don't know
                </button>
            )}

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
