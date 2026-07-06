'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGuest } from '@/lib/GuestProvider'

const PREVIEW_WORDS = [
    { jp: '仲間', reading: 'nakama', en: 'comrade / nakama' },
    { jp: '覚悟', reading: 'kakugo', en: 'resolve / readiness' },
    { jp: '最強', reading: 'saikyō', en: 'the strongest' },
]

const GOAL_OPTIONS = [
    { value: 'nosubs', emoji: '📺', label: 'Watch anime without subtitles', sub: 'The ultimate goal' },
    { value: 'vocab', emoji: '📚', label: 'Understand way more words', sub: 'Follow every episode' },
    { value: 'speak', emoji: '💬', label: 'Start speaking Japanese', sub: 'Sound like your fave character' },
    { value: 'explore', emoji: '🌸', label: 'Just exploring for now', sub: 'No pressure, dive in' },
]

const LEVEL_OPTIONS = [
    { value: 'none', emoji: '🌱', label: 'Total beginner', sub: 'Never studied Japanese' },
    { value: 'little', emoji: '👀', label: 'I know a little', sub: 'Some words from watching anime' },
    { value: 'some', emoji: '⚡', label: 'Intermediate', sub: 'Know hiragana, some grammar' },
]

const TIME_OPTIONS = [
    { value: '5', emoji: '⚡', label: '5 min', sub: 'Just a quick warmup' },
    { value: '10', emoji: '🔥', label: '10 min', sub: 'Solid daily habit' },
    { value: '20', emoji: '💪', label: '20 min', sub: 'Serious learner mode' },
    { value: '30', emoji: '🚀', label: '30+ min', sub: 'Full immersion' },
]

const GOAL_PREVIEW: Record<string, { jp: string; en: string }[]> = {
    nosubs: [{ jp: '無敵', en: 'invincible' }, { jp: '運命', en: 'destiny' }, { jp: '戦士', en: 'warrior' }],
    vocab:  [{ jp: '言葉', en: 'words / language' }, { jp: '記憶', en: 'memory' }, { jp: '理解', en: 'understand' }],
    speak:  [{ jp: 'ありがとう', en: 'thank you' }, { jp: '頑張る', en: "I'll do my best" }, { jp: 'すごい', en: 'amazing' }],
    explore:[{ jp: '冒険', en: 'adventure' }, { jp: '仲間', en: 'nakama' }, { jp: '夢', en: 'dream' }],
}

type Screen = 'welcome' | 'goal' | 'level' | 'time' | 'done'

export default function OnboardingPage() {
    const { guestId } = useGuest()
    const router = useRouter()
    const [screen, setScreen] = useState<Screen>('welcome')
    const [answers, setAnswers] = useState<{ goal?: string; level?: string; time?: string }>({})
    const [saving, setSaving] = useState(false)

    const totalSteps = 3
    const stepIndex: Record<Screen, number> = { welcome: 0, goal: 1, level: 2, time: 3, done: 3 }
    const progress = (stepIndex[screen] / totalSteps) * 100

    async function pickGoal(value: string) {
        setAnswers(a => ({ ...a, goal: value }))
        setScreen('level')
    }

    async function pickLevel(value: string) {
        setAnswers(a => ({ ...a, level: value }))
        setScreen('time')
    }

    async function pickTime(value: string) {
        const newAnswers = { ...answers, time: value }
        setAnswers(newAnswers)
        setSaving(true)

        if (guestId) {
            const jlpt_level = newAnswers.level === 'some' ? 1 : 0
            await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: guestId,
                    jlpt_level,
                    jlpt_label: jlpt_level === 1 ? 'N5' : 'Pre-N5',
                    minutes_per_day: parseInt(value),
                    goals: [newAnswers.goal ?? 'explore'],
                    onboarding_completed_at: new Date().toISOString(),
                }),
            })
        }

        setSaving(false)
        setScreen('done')
    }

    // ── Welcome ──────────────────────────────────────────────────────────────
    if (screen === 'welcome') {
        return (
            <div style={{ minHeight: '100dvh', padding: '0 20px 40px', maxWidth: '480px', margin: '0 auto' }}>
                <div style={{ padding: '28px 0 0', textAlign: 'center' }}>
                    <div style={{
                        fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg,#a78bfa,#fbbf24)',
                        WebkitBackgroundClip: 'text', backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>AniJapanese</div>
                </div>

                <div style={{ textAlign: 'center', padding: '32px 0 0' }}>
                    <div style={{ fontSize: '2.8rem', marginBottom: '14px' }}>🎌</div>
                    <h1 style={{
                        fontSize: 'clamp(1.6rem,6vw,2rem)', fontWeight: 900,
                        lineHeight: 1.2, letterSpacing: '-0.03em',
                        margin: '0 0 12px',
                    }}>
                        Learn Japanese<br />the anime way
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0 0 32px', lineHeight: 1.6 }}>
                        Real words from real anime. Master vocab that actually comes up when you watch.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                        {PREVIEW_WORDS.map((w, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 18px',
                                background: '#13142a',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '14px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{w.jp}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{w.reading}</span>
                                </div>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{w.en}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setScreen('goal')}
                        style={{
                            display: 'block', width: '100%', padding: '18px',
                            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                            border: 'none', borderRadius: '14px',
                            color: 'white', fontFamily: 'inherit',
                            fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer',
                            boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                        }}
                    >
                        Start setup
                    </button>
                    <p style={{ marginTop: '12px', fontSize: '0.78rem', color: '#475569' }}>
                        No account required &nbsp;·&nbsp; 2 min setup
                    </p>
                </div>
            </div>
        )
    }

    // ── Done ─────────────────────────────────────────────────────────────────
    if (screen === 'done') {
        const goal = answers.goal ?? 'explore'
        const previewWords = GOAL_PREVIEW[goal] ?? GOAL_PREVIEW.explore
        const mins = answers.time ?? '10'
        const goalLabel = GOAL_OPTIONS.find(o => o.value === goal)?.label ?? 'Explore'

        return (
            <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '0 20px 40px', maxWidth: '480px', margin: '0 auto' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                        Your plan is ready!
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 32px' }}>
                        {mins} minutes a day &nbsp;·&nbsp; {goalLabel}
                    </p>

                    <div style={{
                        background: 'rgba(124,58,237,0.08)',
                        border: '1px solid rgba(124,58,237,0.2)',
                        borderRadius: '16px', padding: '20px',
                        marginBottom: '28px', textAlign: 'left',
                    }}>
                        <div style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            First words you will learn
                        </div>
                        {previewWords.map((w, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between',
                                padding: '9px 0',
                                borderBottom: i < previewWords.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            }}>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{w.jp}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.9rem', alignSelf: 'center' }}>{w.en}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        style={{
                            display: 'block', width: '100%', padding: '18px',
                            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                            border: 'none', borderRadius: '14px',
                            color: 'white', fontFamily: 'inherit',
                            fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer',
                            boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                        }}
                    >
                        Start learning
                    </button>
                </div>
            </div>
        )
    }

    // ── Step screens ─────────────────────────────────────────────────────────
    type StepOption = { value: string; emoji: string; label: string; sub: string }
    const stepConfig: {
        step: number; title: string; sub: string
        options: StepOption[]; onPick: (v: string) => void
    } = screen === 'goal'
        ? { step: 1, title: "What's your main goal?", sub: "We'll tailor your vocab pack to match", options: GOAL_OPTIONS, onPick: pickGoal }
        : screen === 'level'
        ? { step: 2, title: 'How much Japanese do you know?', sub: "Don't worry — we'll meet you where you are", options: LEVEL_OPTIONS, onPick: pickLevel }
        : { step: 3, title: 'How long can you study each day?', sub: 'Even 5 minutes daily builds a powerful habit', options: TIME_OPTIONS, onPick: pickTime }

    return (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '24px 20px 40px', maxWidth: '480px', margin: '0 auto' }}>
            {/* Progress */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
                    <span>Setup</span>
                    <span>{stepConfig.step} of {totalSteps}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px' }}>
                    <div style={{
                        height: '100%', borderRadius: '99px',
                        background: 'linear-gradient(90deg,#7c3aed,#f59e0b)',
                        width: `${progress}%`, transition: 'width 0.4s ease',
                    }} />
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h2 style={{
                    fontSize: 'clamp(1.4rem,5vw,1.8rem)', fontWeight: 900,
                    lineHeight: 1.2, letterSpacing: '-0.02em',
                    margin: '0 0 8px',
                }}>
                    {stepConfig.title}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 28px' }}>
                    {stepConfig.sub}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {stepConfig.options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => stepConfig.onPick(opt.value)}
                            disabled={saving}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '16px 18px',
                                background: '#13142a',
                                border: '1.5px solid rgba(255,255,255,0.07)',
                                borderRadius: '14px',
                                color: '#f1f5f9', fontFamily: 'inherit',
                                fontSize: '0.95rem', fontWeight: 600,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                textAlign: 'left',
                                transition: 'border-color 0.15s, background 0.15s',
                            }}
                            onMouseEnter={e => {
                                if (saving) return
                                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'
                                e.currentTarget.style.background = 'rgba(124,58,237,0.08)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                                e.currentTarget.style.background = '#13142a'
                            }}
                        >
                            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{opt.emoji}</span>
                            <div>
                                <div>{opt.label}</div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>{opt.sub}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {saving && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginTop: '20px' }}>
                        Setting up your plan...
                    </div>
                )}
            </div>
        </div>
    )
}
