'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGuest } from '@/lib/GuestProvider'

// ── Placement test questions (2 per JLPT level: N5→N2) ────────────────────
// N5(5)=easiest → N2(2)=advanced
const PLACEMENT_QUESTIONS = [
    { jp: '友達', reading: 'tomodachi', en: 'friend', level: 5, opts: ['enemy', 'friend', 'family', 'teacher'] },
    { jp: '強い', reading: 'tsuyoi', en: 'strong', level: 5, opts: ['weak', 'fast', 'strong', 'smart'] },
    { jp: '影', reading: 'kage', en: 'shadow', level: 4, opts: ['light', 'shadow', 'fire', 'spirit'] },
    { jp: '命', reading: 'inochi', en: 'life', level: 4, opts: ['death', 'life', 'soul', 'heart'] },
    { jp: '覚悟', reading: 'kakugo', en: 'resolve', level: 3, opts: ['fear', 'regret', 'resolve', 'anger'] },
    { jp: '最強', reading: 'saikyō', en: 'strongest', level: 3, opts: ['fastest', 'kindest', 'strongest', 'wisest'] },
    { jp: '奥義', reading: 'ougi', en: 'secret technique', level: 2, opts: ['basic move', 'secret technique', 'defense', 'power up'] },
    { jp: '奈落', reading: 'naraku', en: 'abyss', level: 2, opts: ['paradise', 'abyss', 'mountain', 'heavens'] },
]

interface LevelResult {
    level: number
    label: string
    display: string
    sub: string
}

const LEVEL_RESULTS: LevelResult[] = [
    { level: 5, label: 'N5', display: 'Beginner', sub: "We'll start with the essentials and build from there." },
    { level: 4, label: 'N4', display: 'Elementary', sub: "You know some words — we'll expand your vocab fast." },
    { level: 3, label: 'N3', display: 'Intermediate', sub: 'Solid base! Time to level up with harder vocab.' },
    { level: 2, label: 'N2', display: 'Advanced', sub: "Impressive! You'll be tackling the tough stuff." },
]

function scoreToJlptLevel(correct: number): LevelResult {
    if (correct <= 1) return LEVEL_RESULTS[0]
    if (correct <= 3) return LEVEL_RESULTS[1]
    if (correct <= 5) return LEVEL_RESULTS[2]
    return LEVEL_RESULTS[3]
}

const GOAL_OPTIONS = [
    { value: 'nosubs', emoji: '📺', label: 'Watch anime without subtitles', sub: 'The ultimate goal' },
    { value: 'vocab', emoji: '📚', label: 'Understand way more words', sub: 'Follow every episode' },
    { value: 'speak', emoji: '💬', label: 'Start speaking Japanese', sub: 'Sound like your fave character' },
    { value: 'explore', emoji: '🌸', label: 'Just exploring for now', sub: 'No pressure, dive in' },
]

const TIME_OPTIONS = [
    { value: '5', emoji: '⚡', label: '5 min', sub: 'Just a quick warmup' },
    { value: '10', emoji: '🔥', label: '10 min', sub: 'Solid daily habit' },
    { value: '20', emoji: '💪', label: '20 min', sub: 'Serious learner mode' },
    { value: '30', emoji: '🚀', label: '30+ min', sub: 'Full immersion' },
]

type Screen = 'welcome' | 'goal' | 'placement' | 'level-pick' | 'time' | 'done'

export default function OnboardingPage() {
    const { guestId, refreshProfile } = useGuest()
    const router = useRouter()
    const [screen, setScreen] = useState<Screen>('welcome')
    const [goal, setGoal] = useState<string>('explore')
    const [minutes, setMinutes] = useState<string>('10')
    const [saving, setSaving] = useState(false)

    // Placement test state
    const [qIndex, setQIndex] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [correctCount, setCorrectCount] = useState(0)
    const [placementDone, setPlacementDone] = useState(false)
    const [detectedLevel, setDetectedLevel] = useState<LevelResult | null>(null)

    function resetPlacement() {
        setQIndex(0)
        setSelected(null)
        setCorrectCount(0)
        setPlacementDone(false)
    }

    const totalSteps = 3
    const stepIndex: Record<Screen, number> = { welcome: 0, goal: 1, placement: 2, 'level-pick': 2, time: 3, done: 3 }
    const progress = (stepIndex[screen] / totalSteps) * 100

    // Auto-advance after answer
    useEffect(() => {
        if (!selected) return
        const timer = setTimeout(() => {
            const next = qIndex + 1
            setSelected(null)
            if (next >= PLACEMENT_QUESTIONS.length) {
                const result = scoreToJlptLevel(correctCount)
                setDetectedLevel(result)
                setPlacementDone(true)
            } else {
                setQIndex(next)
            }
        }, 700)
        return () => clearTimeout(timer)
    }, [selected, qIndex, correctCount])

    function pickAnswer(opt: string) {
        if (selected) return
        const isCorrect = opt === PLACEMENT_QUESTIONS[qIndex].en
        if (isCorrect) setCorrectCount(c => c + 1)
        setSelected(opt)
    }

    async function pickTime(value: string) {
        setSaving(true)
        setMinutes(value)
        const result = detectedLevel ?? LEVEL_RESULTS[0]
        if (guestId) {
            await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: guestId,
                    jlpt_level: result.level,
                    jlpt_label: result.label,
                    minutes_per_day: parseInt(value),
                    goals: [goal],
                    onboarding_completed_at: new Date().toISOString(),
                }),
            })
            await refreshProfile()
        }
        setSaving(false)
        setScreen('done')
    }

    // ── Welcome ─────────────────────────────────────────────────────────────
    if (screen === 'welcome') {
        return (
            <div style={{ minHeight: '100dvh', padding: '0 20px 40px', maxWidth: '480px', margin: '0 auto' }}>
                <div style={{ padding: '28px 0 0', textAlign: 'center' }}>
                    <div style={{
                        fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg,#a78bfa,#fbbf24)',
                        WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>AniJapanese</div>
                </div>
                <div style={{ textAlign: 'center', padding: '32px 0 0' }}>
                    <div style={{ fontSize: '2.8rem', marginBottom: '14px' }}>🎌</div>
                    <h1 style={{ fontSize: 'clamp(1.6rem,6vw,2rem)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
                        Learn Japanese<br />the anime way
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0 0 32px', lineHeight: 1.6 }}>
                        Real words from real anime. Master vocab that actually comes up when you watch.
                    </p>
                    <button onClick={() => setScreen('goal')} style={{
                        display: 'block', width: '100%', padding: '18px',
                        background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                        border: 'none', borderRadius: '14px',
                        color: 'white', fontFamily: 'inherit',
                        fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer',
                        boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                    }}>
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
        const result = detectedLevel ?? LEVEL_RESULTS[0]
        const goalLabel = GOAL_OPTIONS.find(g => g.value === goal)
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '0 20px 40px', maxWidth: '480px', margin: '0 auto' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
                        Your plan is ready!
                    </h2>
                    <div style={{
                        background: '#13142a', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px', padding: '18px', marginBottom: '24px', textAlign: 'left',
                    }}>
                        {[
                            { icon: '📊', label: 'Level', value: `${result.display} (${result.label})` },
                            { icon: '⏱️', label: 'Daily goal', value: `${minutes} min / day` },
                            ...(goalLabel ? [{ icon: goalLabel.emoji, label: 'Goal', value: goalLabel.label }] : []),
                        ].map((row, i, arr) => (
                            <div key={row.label} style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 0',
                                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>{row.icon}</span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', width: '80px', flexShrink: 0 }}>{row.label}</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 28px', lineHeight: 1.7 }}>
                        We'll match words and scene quizzes to your level, and introduce harder ones as you progress. You can change this anytime in settings.
                    </p>
                    <button onClick={() => router.push('/')} style={{
                        display: 'block', width: '100%', padding: '18px',
                        background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                        border: 'none', borderRadius: '14px',
                        color: 'white', fontFamily: 'inherit',
                        fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer',
                        boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                    }}>
                        Start learning
                    </button>
                </div>
            </div>
        )
    }

    // ── Manual level pick (skip test) ─────────────────────────────────────────
    if (screen === 'level-pick') {
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '24px 20px 40px', maxWidth: '480px', margin: '0 auto' }}>
                <ProgressBar progress={progress} step={stepIndex[screen]} total={totalSteps} onBack={() => { resetPlacement(); setScreen('placement') }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(1.4rem,5vw,1.8rem)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                        Pick your level
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 28px' }}>
                        You can change this anytime in settings
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {LEVEL_RESULTS.map(lv => (
                            <button key={lv.level} onClick={() => { setDetectedLevel(lv); setScreen('time') }} style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '16px 18px', background: '#13142a',
                                border: '1.5px solid rgba(255,255,255,0.07)',
                                borderRadius: '14px', color: '#f1f5f9', fontFamily: 'inherit',
                                fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                                textAlign: 'left', transition: 'border-color 0.15s, background 0.15s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.background = 'rgba(124,58,237,0.08)' }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#13142a' }}
                            >
                                <span style={{
                                    flexShrink: 0, width: '44px', textAlign: 'center',
                                    padding: '4px 0', borderRadius: '8px',
                                    background: 'rgba(124,58,237,0.15)', color: '#a78bfa',
                                    fontWeight: 800, fontSize: '0.85rem',
                                }}>{lv.label}</span>
                                <div>
                                    <div>{lv.display}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>{lv.sub}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // ── Placement test ────────────────────────────────────────────────────────
    if (screen === 'placement') {
        const q = PLACEMENT_QUESTIONS[qIndex]

        if (placementDone && detectedLevel) {
            return (
                <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '24px 20px 40px', maxWidth: '480px', margin: '0 auto' }}>
                    <ProgressBar progress={progress} step={stepIndex[screen]} total={totalSteps} onBack={() => { resetPlacement() }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 8px' }}>Your level is set!</h2>
                        <p style={{ color: '#94a3b8', margin: '0 0 20px' }}>
                            {correctCount} / {PLACEMENT_QUESTIONS.length} correct
                        </p>
                        <div style={{
                            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
                            borderRadius: '16px', padding: '20px', marginBottom: '28px',
                        }}>
                            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#a78bfa', marginBottom: '4px' }}>
                                {detectedLevel.display}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                {detectedLevel.sub}
                            </div>
                        </div>
                        <button onClick={() => setScreen('time')} style={{
                            display: 'block', width: '100%', padding: '18px',
                            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                            border: 'none', borderRadius: '14px',
                            color: 'white', fontFamily: 'inherit',
                            fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer',
                            boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                        }}>
                            Looks good →
                        </button>
                    </div>
                </div>
            )
        }

        return (
            <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '24px 20px 40px', maxWidth: '480px', margin: '0 auto' }}>
                <ProgressBar progress={progress} step={stepIndex[screen]} total={totalSteps} onBack={() => { resetPlacement(); setScreen('goal') }} />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
                        Question {qIndex + 1} of {PLACEMENT_QUESTIONS.length}
                    </div>

                    {/* Word card */}
                    <div style={{
                        background: '#13142a', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px', padding: '36px 24px',
                        textAlign: 'center', marginBottom: '20px',
                    }}>
                        <div style={{ fontSize: '0.65rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                            What does this mean?
                        </div>
                        <div style={{ fontSize: 'clamp(3rem,10vw,4.5rem)', fontWeight: 900, marginBottom: '8px' }}>{q.jp}</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{q.reading}</div>
                    </div>

                    {/* Choices */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {q.opts.map(opt => {
                            const isCorrect = opt === q.en
                            const isSelected = opt === selected
                            const bg = selected
                                ? isCorrect ? 'rgba(16,185,129,0.2)' : isSelected ? 'rgba(239,68,68,0.15)' : '#13142a'
                                : '#13142a'
                            const border = selected
                                ? isCorrect ? '1.5px solid #10b981' : isSelected ? '1.5px solid #ef4444' : '1.5px solid rgba(255,255,255,0.06)'
                                : '1.5px solid rgba(255,255,255,0.08)'
                            const color = selected
                                ? isCorrect ? '#10b981' : isSelected ? '#ef4444' : '#475569'
                                : '#f1f5f9'
                            return (
                                <button key={opt} onClick={() => pickAnswer(opt)} style={{
                                    padding: '16px 10px', background: bg,
                                    border, borderRadius: '12px',
                                    color, fontFamily: 'inherit', fontSize: '0.9rem',
                                    fontWeight: 600, cursor: selected ? 'default' : 'pointer',
                                    transition: 'all 0.15s', minHeight: '60px',
                                }}>{opt}</button>
                            )
                        })}
                    </div>

                    {/* Mini progress dots */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '28px' }}>
                        {PLACEMENT_QUESTIONS.map((_, i) => (
                            <div key={i} style={{
                                width: '6px', height: '6px', borderRadius: '99px',
                                background: i < qIndex ? '#7c3aed' : i === qIndex ? '#a78bfa' : 'rgba(255,255,255,0.12)',
                                transition: 'background 0.2s',
                            }} />
                        ))}
                    </div>

                    {/* Skip test */}
                    <button onClick={() => setScreen('level-pick')} style={{
                        marginTop: '20px', background: 'none', border: 'none',
                        color: '#64748b', fontFamily: 'inherit', fontSize: '0.82rem',
                        fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                    }}>
                        I already know my level — skip the test
                    </button>
                </div>
            </div>
        )
    }

    // ── Goal + Time steps ─────────────────────────────────────────────────────
    type StepOption = { value: string; emoji: string; label: string; sub: string }
    const isGoal = screen === 'goal'
    const options: StepOption[] = isGoal ? GOAL_OPTIONS : TIME_OPTIONS
    const title = isGoal ? "What's your main goal?" : 'How long can you study each day?'
    const sub = isGoal ? "We'll tailor your vocab pack to match" : 'Even 5 minutes daily builds a powerful habit'

    function onPick(value: string) {
        if (isGoal) {
            setGoal(value)
            setScreen('placement')
        } else {
            pickTime(value)
        }
    }

    return (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '24px 20px 40px', maxWidth: '480px', margin: '0 auto' }}>
            <ProgressBar
                progress={progress} step={stepIndex[screen]} total={totalSteps}
                onBack={() => setScreen(isGoal ? 'welcome' : placementDone ? 'placement' : 'level-pick')}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h2 style={{ fontSize: 'clamp(1.4rem,5vw,1.8rem)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                    {title}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 28px' }}>{sub}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {options.map(opt => (
                        <button key={opt.value} onClick={() => !saving && onPick(opt.value)} disabled={saving} style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '16px 18px', background: '#13142a',
                            border: '1.5px solid rgba(255,255,255,0.07)',
                            borderRadius: '14px', color: '#f1f5f9', fontFamily: 'inherit',
                            fontSize: '0.95rem', fontWeight: 600,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            textAlign: 'left', transition: 'border-color 0.15s, background 0.15s',
                        }}
                            onMouseEnter={e => { if (!saving) { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.background = 'rgba(124,58,237,0.08)' } }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#13142a' }}
                        >
                            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{opt.emoji}</span>
                            <div>
                                <div>{opt.label}</div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>{opt.sub}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ProgressBar({ progress, step, total, onBack }: { progress: number; step: number; total: number; onBack?: () => void }) {
    return (
        <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {onBack && (
                        <button onClick={onBack} aria-label="Back" style={{
                            background: 'none', border: 'none', color: '#64748b',
                            cursor: 'pointer', fontSize: '1rem', padding: 0, fontFamily: 'inherit',
                        }}>←</button>
                    )}
                    Setup
                </span>
                <span>{step} of {total}</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px' }}>
                <div style={{
                    height: '100%', borderRadius: '99px',
                    background: 'linear-gradient(90deg,#7c3aed,#f59e0b)',
                    width: `${progress}%`, transition: 'width 0.4s ease',
                }} />
            </div>
        </div>
    )
}
