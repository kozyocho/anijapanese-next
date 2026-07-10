'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useGuest } from '@/lib/GuestProvider'
import { LoadingScreen } from '@/components/LoadingScreen'

interface Distractor {
    phrase: string
    reading: string
    reason: string
}

interface SceneQuiz {
    id: number
    scene_en: string
    question_type: 'fill_blank' | 'choose_line'
    prompt_jp: string | null
    correct_phrase: string
    correct_reading: string
    correct_meaning: string
    distractors: Distractor[]
}

function speakJapanese(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
}

export default function ScenePage() {
    const { guestId, refreshProfile } = useGuest()
    const router = useRouter()

    const [items, setItems] = useState<SceneQuiz[]>([])
    const [index, setIndex] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [results, setResults] = useState({ correct: 0, total: 0 })
    const [done, setDone] = useState(false)
    const [loading, setLoading] = useState(true)
    const [sessionStart] = useState<number>(() => Date.now())
    const [shuffledChoices, setShuffledChoices] = useState<string[]>([])

    useEffect(() => {
        if (!guestId) return
        let cancelled = false
        async function init() {
            const res = await fetch(`/api/scene-session?userId=${guestId}`)
            const data = await res.json()
            if (cancelled) return
            if (data.premiumRequired) { router.replace('/'); return }
            if (!data.items?.length) { router.push('/'); return }
            setItems(data.items)
            setLoading(false)
        }
        init()
        return () => { cancelled = true }
    }, [guestId, router])

    const currentItem = items[index]

    useEffect(() => {
        if (!currentItem) return
        const pool = [...currentItem.distractors.map(d => d.phrase), currentItem.correct_phrase]
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]]
        }
        setShuffledChoices(pool)
        setSelected(null)
    }, [currentItem?.id]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (selected) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        }
    }, [selected])

    const handleSelect = useCallback(async (choice: string) => {
        if (selected || !currentItem || !guestId) return
        setSelected(choice)
        const isCorrect = choice === currentItem.correct_phrase
        speakJapanese(currentItem.correct_phrase)
        setResults(r => ({ correct: r.correct + (isCorrect ? 1 : 0), total: r.total + 1 }))

        await fetch('/api/scene-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: guestId, quizId: currentItem.id, correct: isCorrect }),
        })
    }, [selected, currentItem, guestId])

    const handleNext = useCallback(async () => {
        if (index + 1 >= items.length) {
            if (guestId) {
                const durationSeconds = Math.round((Date.now() - sessionStart) / 1000)
                await fetch('/api/streak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: guestId,
                        questionsAnswered: results.total,
                        durationSeconds,
                    }),
                })
                await refreshProfile()
            }
            setDone(true)
        } else {
            setIndex(i => i + 1)
        }
    }, [index, items.length, guestId, results, refreshProfile, sessionStart])

    // Keyboard: 1-4 to pick, Space/Enter to continue
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === ' ' || e.key === 'Enter') {
                if (selected) { e.preventDefault(); handleNext() }
                return
            }
            const num = parseInt(e.key)
            if (num >= 1 && num <= shuffledChoices.length && !selected) {
                handleSelect(shuffledChoices[num - 1])
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [selected, shuffledChoices, handleSelect, handleNext])

    if (loading) return <LoadingScreen message="Setting the scene..." />

    if (done) {
        const acc = Math.round((results.correct / results.total) * 100)
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
                        Scene Complete!
                    </div>
                    <div style={{ color: '#94a3b8', marginBottom: '24px' }}>
                        {results.correct}/{results.total} correct · {acc}% accuracy
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
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

    const isCorrect = selected === currentItem.correct_phrase
    const distractorMap = new Map(currentItem.distractors.map(d => [d.phrase, d]))

    return (
        <div style={{ minHeight: '100dvh', padding: '20px', maxWidth: '480px', margin: '0 auto', paddingBottom: '40px' }}>
            {/* Progress bar */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
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
                        width: `${(index / items.length) * 100}%`,
                        transition: 'width 0.3s ease',
                    }} />
                </div>
            </div>

            {/* Scene card */}
            <div key={currentItem.id} style={{ animation: 'fadeIn 0.25s ease both' }}>
                <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }`}</style>
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '18px',
                    padding: '20px',
                    marginBottom: '16px',
                }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Scene
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                        {currentItem.scene_en}
                    </div>
                    {currentItem.question_type === 'fill_blank' && currentItem.prompt_jp && (
                        <div style={{
                            marginTop: '14px', padding: '14px',
                            background: 'rgba(124,58,237,0.08)',
                            border: '1px solid rgba(124,58,237,0.2)',
                            borderRadius: '12px',
                            fontSize: '1.3rem', fontWeight: 700, textAlign: 'center', color: '#f1f5f9',
                        }}>
                            「{currentItem.prompt_jp}」
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '16px', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                    {currentItem.question_type === 'fill_blank'
                        ? 'What fills the blank?'
                        : 'What would this character say?'}
                </div>

                {/* Choices */}
                <div style={{ display: 'grid', gap: '10px' }}>
                    {shuffledChoices.map((choice) => {
                        const isThisCorrect = choice === currentItem.correct_phrase
                        const isThisSelected = choice === selected
                        let bg = 'rgba(255,255,255,0.04)'
                        let border = '1.5px solid rgba(255,255,255,0.1)'
                        if (selected) {
                            if (isThisCorrect) {
                                bg = 'rgba(16,185,129,0.12)'
                                border = '1.5px solid rgba(16,185,129,0.5)'
                            } else if (isThisSelected) {
                                bg = 'rgba(239,68,68,0.12)'
                                border = '1.5px solid rgba(239,68,68,0.5)'
                            }
                        }
                        return (
                            <button
                                key={choice}
                                onClick={() => handleSelect(choice)}
                                disabled={!!selected}
                                style={{
                                    padding: '16px', background: bg, border, borderRadius: '14px',
                                    color: '#f1f5f9', fontFamily: 'inherit',
                                    fontSize: '1.1rem', fontWeight: 700,
                                    cursor: selected ? 'default' : 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {choice}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Feedback panel */}
            {selected && (
                <div style={{ marginTop: '20px', animation: 'fadeIn 0.25s ease both' }}>
                    <div style={{
                        background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                        borderRadius: '16px', padding: '18px', marginBottom: '12px',
                    }}>
                        <div style={{
                            fontSize: '1rem', fontWeight: 800,
                            color: isCorrect ? '#10b981' : '#ef4444', marginBottom: '10px',
                        }}>
                            {isCorrect ? '✓ Correct!' : '✗ Not quite'}
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '2px' }}>
                            {currentItem.correct_phrase}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                            {currentItem.correct_reading}
                        </div>
                        <div style={{ fontSize: '0.92rem', color: '#e2e8f0' }}>
                            {currentItem.correct_meaning}
                        </div>
                    </div>

                    {/* Why the others are wrong */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '16px', padding: '16px', marginBottom: '16px',
                    }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                            Why the others are wrong
                        </div>
                        {currentItem.distractors.map(d => (
                            <div key={d.phrase} style={{
                                marginBottom: '10px', paddingBottom: '10px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                            }}>
                                <div style={{
                                    fontSize: '0.95rem', fontWeight: 700,
                                    color: d.phrase === selected ? '#ef4444' : '#cbd5e1',
                                }}>
                                    {d.phrase} <span style={{ fontWeight: 400, color: '#64748b', fontSize: '0.8rem' }}>({d.reading})</span>
                                </div>
                                <div style={{ fontSize: '0.83rem', color: '#94a3b8', marginTop: '2px' }}>
                                    {d.reason}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        style={{
                            width: '100%', padding: '16px',
                            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                            border: 'none', borderRadius: '14px',
                            color: 'white', fontFamily: 'inherit',
                            fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                        }}
                    >
                        {index + 1 >= items.length ? 'Finish' : 'Continue'}
                    </button>
                </div>
            )}
        </div>
    )
}
