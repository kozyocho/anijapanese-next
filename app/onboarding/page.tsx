'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useGuest } from '@/lib/GuestProvider'

const STEPS = [
    {
        id: 'hiragana',
        question: 'Do you know hiragana?',
        subtitle: 'The Japanese alphabet used in most anime subtitles',
        options: [
            { label: "Yes, I know it", value: 'yes', emoji: '✅' },
            { label: "A little bit", value: 'little', emoji: '🤏' },
            { label: "Not at all", value: 'no', emoji: '🆕' },
        ],
    },
    {
        id: 'anime_level',
        question: 'Can you catch simple anime dialogue?',
        subtitle: 'Like greetings, character names, "baka!", "nakama!"',
        options: [
            { label: "Yes, some phrases", value: 'some', emoji: '🎌' },
            { label: "Very little", value: 'little', emoji: '👀' },
            { label: "Totally new to me", value: 'none', emoji: '🌱' },
        ],
    },
    {
        id: 'minutes',
        question: 'How many minutes per day?',
        subtitle: 'Even 5 minutes daily makes a huge difference',
        options: [
            { label: '5 min', value: '5', emoji: '⚡' },
            { label: '10 min', value: '10', emoji: '🔥' },
            { label: '20 min', value: '20', emoji: '💪' },
            { label: '30+ min', value: '30', emoji: '🚀' },
        ],
    },
    {
        id: 'goal',
        question: 'Your #1 goal?',
        subtitle: "We'll tailor your vocab to match",
        options: [
            { label: 'Watch anime without subs', value: 'nosubs', emoji: '🍙' },
            { label: 'Understand more words', value: 'vocab', emoji: '📚' },
            { label: 'Speak some Japanese', value: 'speak', emoji: '💬' },
            { label: 'Just exploring', value: 'explore', emoji: '🌸' },
        ],
    },
]

export default function OnboardingPage() {
    const { guestId } = useGuest()
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    const currentStep = STEPS[step]
    const isLast = step === STEPS.length - 1

    async function handleOption(value: string) {
        const newAnswers = { ...answers, [currentStep.id]: value }
        setAnswers(newAnswers)

        if (!isLast) {
            setStep(s => s + 1)
            return
        }

        // Save profile
        setSaving(true)
        const supabase = createClient()

        // Determine difficulty from answers
        const knewHiragana = newAnswers.hiragana === 'yes'
        const hadAnimeExp = newAnswers.anime_level !== 'none'
        const mins = parseInt(newAnswers.minutes ?? '10')

        const jlpt_level = knewHiragana && hadAnimeExp ? 1 : knewHiragana ? 0 : 0

        if (guestId) {
            await supabase.from('profiles').update({
                jlpt_level,
                jlpt_label: jlpt_level === 1 ? 'N5' : 'Pre-N5',
                minutes_per_day: mins,
                goals: [newAnswers.goal ?? 'explore'],
                onboarding_completed_at: new Date().toISOString(),
            }).eq('id', guestId)
        }

        setSaving(false)
        router.push('/')
    }

    const progress = ((step) / STEPS.length) * 100

    return (
        <div style={{
            minHeight: '100dvh',
            display: 'flex', flexDirection: 'column',
            padding: '24px 20px',
            maxWidth: '480px', margin: '0 auto',
        }}>
            {/* Progress */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', fontWeight: 600,
                }}>
                    <span>Quick Setup</span>
                    <span>{step + 1} of {STEPS.length}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px' }}>
                    <div style={{
                        height: '100%', borderRadius: '99px',
                        background: 'linear-gradient(90deg,#7c3aed,#f59e0b)',
                        width: `${progress}%`, transition: 'width 0.4s ease',
                    }} />
                </div>
            </div>

            {/* Question */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                    fontSize: 'clamp(1.4rem, 5vw, 1.8rem)',
                    fontWeight: 900,
                    lineHeight: 1.2,
                    marginBottom: '10px',
                    letterSpacing: '-0.02em',
                }}>
                    {currentStep.question}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '32px' }}>
                    {currentStep.subtitle}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentStep.options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => handleOption(opt.value)}
                            disabled={saving}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '18px 20px',
                                background: '#13142a',
                                border: '1.5px solid rgba(255,255,255,0.08)',
                                borderRadius: '14px',
                                color: '#f1f5f9',
                                fontFamily: 'inherit', fontSize: '1rem', fontWeight: 600,
                                cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                                (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'
                                    ; (e.target as HTMLElement).style.background = 'rgba(124,58,237,0.08)'
                            }}
                            onMouseLeave={e => {
                                (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
                                    ; (e.target as HTMLElement).style.background = '#13142a'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{opt.emoji}</span>
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {saving && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', marginTop: '16px' }}>
                    Setting up your experience...
                </div>
            )}
        </div>
    )
}
