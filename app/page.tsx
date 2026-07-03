'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useGuest } from '@/lib/GuestProvider'
import { StreakBadge } from '@/components/StreakBadge'
import { useSale } from '@/lib/useSale'

// ── Demo words shown on landing page (no account needed) ──────────────────

const DEMO_WORDS = [
    { jp: '仲間', reading: 'nakama', en: 'comrade', options: ['rival', 'enemy', 'comrade', 'mentor'] },
    { jp: '覚悟', reading: 'kakugo', en: 'resolve', options: ['fear', 'resolve', 'regret', 'anger'] },
    { jp: '最強', reading: 'saikyō', en: 'strongest', options: ['fastest', 'kindest', 'strongest', 'wisest'] },
]

// ── Shared styles ──────────────────────────────────────────────────────────

const BTN: React.CSSProperties = {
    display: 'block', width: '100%', padding: '18px',
    background: '#7c3aed', border: 'none', borderRadius: '14px',
    color: 'white', fontFamily: 'inherit',
    fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer',
    boxShadow: '0 4px 32px rgba(124,58,237,0.45)',
}

// ── DemoQuiz ──────────────────────────────────────────────────────────────

function DemoQuiz({ onFinish, priceLabel, onBuy, buying }: {
    onFinish: (correct: number) => void
    priceLabel: string
    onBuy: () => void
    buying: boolean
}) {
    const [index, setIndex] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [correct, setCorrect] = useState(0)
    const [done, setDone] = useState(false)

    const word = DEMO_WORDS[index]

    // Shuffle options once per word (not on every render)
    const shuffled = useMemo(() => [...word.options].sort(() => Math.random() - 0.5), [index])

    function pick(opt: string) {
        if (selected) return
        setSelected(opt)
        const isCorrect = opt === word.en
        if (isCorrect) setCorrect(c => c + 1)
        setTimeout(() => {
            setSelected(null)
            if (index + 1 >= DEMO_WORDS.length) {
                setDone(true)
                onFinish(isCorrect ? correct + 1 : correct)
            } else {
                setIndex(i => i + 1)
            }
        }, 900)
    }

    if (done) {
        return (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '6px' }}>
                    {correct}/{DEMO_WORDS.length} correct
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
                    500+ more words are waiting for you.
                </div>
                <SignedIn>
                    <button onClick={onBuy} disabled={buying} style={BTN}>
                        {buying ? 'Redirecting...' : `Unlock all 500+ words — ${priceLabel}`}
                    </button>
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button style={BTN}>Unlock all 500+ words — {priceLabel}</button>
                    </SignInButton>
                </SignedOut>
            </div>
        )
    }

    return (
        <>
            <div style={{ marginBottom: '20px', fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>
                {index + 1} of {DEMO_WORDS.length}
            </div>
            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
                <div style={{ fontSize: '2.6rem', fontWeight: 900, marginBottom: '6px' }}>{word.jp}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{word.reading}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {shuffled.map(opt => {
                    const isCorrect = opt === word.en
                    const isSelected = opt === selected
                    const bg = selected
                        ? isCorrect ? 'rgba(34,197,94,0.15)' : isSelected ? 'rgba(239,68,68,0.15)' : '#1a1b35'
                        : '#1a1b35'
                    const border = selected
                        ? isCorrect ? 'rgba(34,197,94,0.5)' : isSelected ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.05)'
                        : 'rgba(255,255,255,0.08)'
                    const color = selected
                        ? isCorrect ? '#4ade80' : isSelected ? '#f87171' : '#475569'
                        : '#f1f5f9'
                    return (
                        <button key={opt} onClick={() => pick(opt)} style={{
                            padding: '14px 8px', background: bg,
                            border: `1.5px solid ${border}`, borderRadius: '10px',
                            color, fontFamily: 'inherit', fontSize: '0.9rem',
                            fontWeight: 600, cursor: selected ? 'default' : 'pointer',
                            transition: 'all 0.15s',
                        }}>{opt}</button>
                    )
                })}
            </div>
        </>
    )
}

// ── Landing Page ──────────────────────────────────────────────────────────

function LandingPage({ guestId }: { guestId: string | null }) {
    const sale = useSale()
    const [showDemo, setShowDemo] = useState(false)
    const [buying, setBuying] = useState(false)

    const salePrice = '$9.99'
    const regularPrice = '$19.99'
    const priceLabel = sale.isActive ? salePrice : regularPrice

    async function buy() {
        if (!guestId) return
        setBuying(true)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: guestId, useWelcomeOffer: sale.isActive }),
            })
            const { url } = await res.json()
            if (url) window.location.href = url
        } finally {
            setBuying(false)
        }
    }

    return (
        <div style={{ minHeight: '100dvh', color: '#f1f5f9' }}>
            {/* Sale banner — one idea, full width */}
            {sale.isActive && (
                <div style={{
                    background: 'linear-gradient(90deg,#7c3aed,#db2777)',
                    padding: '11px 20px', textAlign: 'center',
                    fontSize: '0.85rem', fontWeight: 700,
                }}>
                    Welcome offer — 50% off &nbsp;·&nbsp;
                    <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '6px' }}>
                        {sale.hours}:{sale.minutes}:{sale.seconds}
                    </span>
                    &nbsp; left
                </div>
            )}

            {/* Header — logo + Pricing link + sign in */}
            <header style={{
                maxWidth: '480px', margin: '0 auto',
                padding: '20px 20px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span style={{
                    fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg,#a78bfa,#fbbf24)',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>AniJapanese</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <a href="#pricing" style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}>Pricing</a>
                    <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button style={{
                                padding: '6px 14px', background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '99px', color: '#f1f5f9',
                                fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                            }}>Sign in</button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </header>

            {/* Hero — sells in one screen */}
            <section style={{ maxWidth: '480px', margin: '0 auto', padding: '52px 20px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '18px' }}>
                    500+ anime words · 10 min/day · One-time payment
                </div>
                <h1 style={{
                    fontSize: 'clamp(2rem, 8vw, 2.8rem)', fontWeight: 900,
                    lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 18px',
                }}>
                    Watch anime in Japanese<br />— without subtitles
                </h1>
                <p style={{
                    color: '#94a3b8', fontSize: '1rem', lineHeight: 1.65,
                    margin: '0 0 36px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto',
                }}>
                    Master the words you actually hear in your favorite anime. Spaced repetition. 10 minutes a day.
                </p>

                {/* ONE call to action */}
                <SignedIn>
                    <button onClick={buy} disabled={buying} style={BTN}>
                        {buying ? 'Redirecting...' : `Get lifetime access — ${priceLabel}`}
                    </button>
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button style={BTN}>Get lifetime access — {priceLabel}</button>
                    </SignInButton>
                </SignedOut>

                <p style={{ marginTop: '10px', fontSize: '0.78rem', color: '#475569' }}>
                    {sale.isActive
                        ? <><span style={{ textDecoration: 'line-through' }}>{regularPrice}</span> · One-time · No subscription</>
                        : 'One-time payment · No subscription · All future updates'}
                </p>
            </section>

            {/* Demo — show the product before explaining it */}
            <section style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 48px' }}>
                <div style={{
                    background: '#13142a', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '20px', padding: '24px',
                }}>
                    {!showDemo ? (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '20px' }}>
                                See how it works — try 3 words
                            </div>
                            <div style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '4px' }}>仲間</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>nakama · comrade</div>
                            <button onClick={() => setShowDemo(true)} style={{
                                padding: '12px 28px',
                                background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
                                borderRadius: '12px', color: '#a78bfa',
                                fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                            }}>
                                Start demo →
                            </button>
                        </div>
                    ) : (
                        <DemoQuiz
                            priceLabel={priceLabel}
                            onFinish={() => {}}
                            onBuy={buy}
                            buying={buying}
                        />
                    )}
                </div>
            </section>

            {/* App screenshots — show before explain */}
            <section style={{ maxWidth: '480px', margin: '0 auto', padding: '0 0 48px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textAlign: 'center', margin: '0 0 20px', letterSpacing: '-0.02em', padding: '0 20px' }}>
                    How it works
                </h2>

                {/* Horizontally scrollable screens */}
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 20px 12px', scrollSnapType: 'x mandatory' }}>

                    {/* Screen 1: Word card */}
                    <div style={{ flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>① A word appears</div>
                        <div style={{ width: '220px', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden' }}>
                            {/* Mini header */}
                            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'linear-gradient(135deg,#a78bfa,#fbbf24)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AniJapanese</span>
                                <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700 }}>🔥 3</span>
                            </div>
                            {/* Word card */}
                            <div style={{ padding: '24px 14px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.6rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Battle</div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '4px' }}>仲間</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '20px' }}>nakama</div>
                                {/* Blurred choices (pre-reveal) */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    {['', '', '', ''].map((_, i) => (
                                        <div key={i} style={{ height: '32px', background: '#1a1b35', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', filter: 'blur(3px)' }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Screen 2: Quiz choices */}
                    <div style={{ flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>② Pick the meaning</div>
                        <div style={{ width: '220px', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'linear-gradient(135deg,#a78bfa,#fbbf24)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AniJapanese</span>
                                <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700 }}>🔥 3</span>
                            </div>
                            <div style={{ padding: '24px 14px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.6rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Battle</div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '4px' }}>仲間</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '20px' }}>nakama</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    {['rival', 'enemy', 'comrade', 'mentor'].map((opt, i) => (
                                        <div key={i} style={{
                                            padding: '8px 4px', fontSize: '0.68rem', fontWeight: 600,
                                            background: '#1a1b35', borderRadius: '8px',
                                            border: '1.5px solid rgba(255,255,255,0.08)',
                                            color: '#f1f5f9', textAlign: 'center',
                                        }}>{opt}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Screen 3: Correct feedback */}
                    <div style={{ flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>③ Instant feedback</div>
                        <div style={{ width: '220px', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'linear-gradient(135deg,#a78bfa,#fbbf24)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AniJapanese</span>
                                <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700 }}>🔥 3</span>
                            </div>
                            <div style={{ padding: '24px 14px 12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.6rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Battle</div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '4px' }}>仲間</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '16px' }}>nakama</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                                    {[
                                        { label: 'rival', correct: false, selected: false },
                                        { label: 'enemy', correct: false, selected: false },
                                        { label: 'comrade', correct: true, selected: true },
                                        { label: 'mentor', correct: false, selected: false },
                                    ].map((opt, i) => (
                                        <div key={i} style={{
                                            padding: '8px 4px', fontSize: '0.68rem', fontWeight: 600,
                                            background: opt.correct ? 'rgba(34,197,94,0.15)' : '#1a1b35',
                                            borderRadius: '8px',
                                            border: `1.5px solid ${opt.correct ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.06)'}`,
                                            color: opt.correct ? '#4ade80' : '#475569', textAlign: 'center',
                                        }}>{opt.label}</div>
                                    ))}
                                </div>
                            </div>
                            {/* Feedback banner */}
                            <div style={{ background: '#0a2e22', padding: '10px 14px', borderTop: '1px solid rgba(34,197,94,0.2)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4ade80', marginBottom: '2px' }}>✓ Correct! +10 XP</div>
                                <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>comrade / ally / nakama</div>
                            </div>
                        </div>
                    </div>

                    {/* Screen 4: Dashboard */}
                    <div style={{ flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>④ Track your streak</div>
                        <div style={{ width: '220px', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'linear-gradient(135deg,#a78bfa,#fbbf24)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AniJapanese</span>
                                <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700 }}>🔥 7</span>
                            </div>
                            <div style={{ padding: '12px 14px' }}>
                                <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '12px', padding: '12px', textAlign: 'center', marginBottom: '8px' }}>
                                    <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>⚡</div>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 800, marginBottom: '2px' }}>8 cards ready</div>
                                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginBottom: '10px' }}>3 reviews · 5 new words</div>
                                    <div style={{ background: '#7c3aed', borderRadius: '8px', padding: '6px', fontSize: '0.65rem', fontWeight: 800, color: 'white' }}>Start Session →</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    {[
                                        { icon: '📖', label: 'Reviews', val: '3', color: '#f59e0b' },
                                        { icon: '✨', label: 'New', val: '5', color: '#7c3aed' },
                                        { icon: '🔥', label: 'Streak', val: '7', color: '#ef4444' },
                                        { icon: '⭐', label: 'XP', val: '240', color: '#fbbf24' },
                                    ].map((s, i) => (
                                        <div key={i} style={{ background: '#13142a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px' }}>
                                            <div style={{ fontSize: '0.7rem' }}>{s.icon}</div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                                            <div style={{ fontSize: '0.55rem', color: '#64748b' }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#334155', margin: '0' }}>← swipe to see more →</p>
            </section>

            {/* Numbers — no adjectives */}
            <section style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 48px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                    {[
                        { n: '500+', label: 'anime words' },
                        { n: '10 min', label: 'per day' },
                        { n: '$19.99', label: 'one-time only' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#13142a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px 12px' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7c3aed', marginBottom: '4px' }}>{s.n}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing — impossible to miss */}
            <section id="pricing" style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 64px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, textAlign: 'center', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
                    Simple pricing
                </h2>
                <div style={{
                    background: '#13142a', border: '1.5px solid rgba(124,58,237,0.35)',
                    borderRadius: '20px', padding: '28px 24px', textAlign: 'center',
                }}>
                    {sale.isActive ? (
                        <div style={{ marginBottom: '4px' }}>
                            <span style={{ fontSize: '1.1rem', color: '#64748b', textDecoration: 'line-through', marginRight: '10px' }}>{regularPrice}</span>
                            <span style={{ fontSize: '2.8rem', fontWeight: 900 }}>{salePrice}</span>
                        </div>
                    ) : (
                        <div style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '4px' }}>{regularPrice}</div>
                    )}
                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '24px' }}>
                        One-time · Lifetime access · No subscription ever
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', textAlign: 'left' }}>
                        {[
                            'Unlimited new words every day',
                            'All 500+ anime vocabulary words',
                            'Spaced repetition (SRS) system',
                            'Streak tracking & progress stats',
                            'All future word packs included',
                        ].map((f, i) => (
                            <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#94a3b8' }}>
                                <span style={{ color: '#7c3aed', fontWeight: 800, flexShrink: 0 }}>✓</span>
                                {f}
                            </div>
                        ))}
                    </div>
                    <SignedIn>
                        <button onClick={buy} disabled={buying} style={BTN}>
                            {buying ? 'Redirecting...' : `Get lifetime access — ${priceLabel}`}
                        </button>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button style={BTN}>Get lifetime access — {priceLabel}</button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </section>

            {/* Footer — something worth sharing */}
            <footer style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.7, marginBottom: '20px' }}>
                    Built by an anime fan who got tired of pausing to read subtitles.<br />
                    <span style={{ color: '#475569' }}>No textbooks. No grammar charts. Just words you'll actually hear.</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <Link href="/privacy" style={{ fontSize: '0.75rem', color: '#475569', textDecoration: 'none' }}>Privacy Policy</Link>
                    <Link href="/terms" style={{ fontSize: '0.75rem', color: '#475569', textDecoration: 'none' }}>Terms of Service</Link>
                    <Link href="/tokushoho" style={{ fontSize: '0.75rem', color: '#475569', textDecoration: 'none' }}>Specified Commercial Transactions</Link>
                    <a href="mailto:osumomomo8110@gmail.com" style={{ fontSize: '0.75rem', color: '#475569', textDecoration: 'none' }}>Contact</a>
                </div>
            </footer>
        </div>
    )
}

// ── Dashboard (premium users) ──────────────────────────────────────────────

interface SessionData { reviewCount: number; newWordCount: number }

function Dashboard({ guestId, profile }: {
    guestId: string
    profile: { current_streak: number } | null
}) {
    const [data, setData] = useState<SessionData | null>(null)

    useEffect(() => {
        fetch(`/api/session?userId=${guestId}&new=10`)
            .then(r => r.json())
            .then(res => {
                if (!res.items) return
                setData({
                    reviewCount: res.items.filter((i: { isReview: boolean }) => i.isReview).length,
                    newWordCount: res.items.filter((i: { isReview: boolean }) => !i.isReview).length,
                })
            })
    }, [guestId])

    const streak = profile?.current_streak ?? 0
    const total = (data?.reviewCount ?? 0) + (data?.newWordCount ?? 0)

    return (
        <div style={{ minHeight: '100dvh', paddingBottom: '32px' }}>
            <div style={{
                padding: '24px 20px 16px', maxWidth: '480px', margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{
                        fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg,#a78bfa,#fbbf24)',
                        WebkitBackgroundClip: 'text', backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>AniJapanese</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Understand anime in Japanese</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <StreakBadge streak={streak} />
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>

            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{
                    background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(245,158,11,0.08))',
                    border: '1px solid rgba(124,58,237,0.2)',
                    borderRadius: '20px', padding: '28px 24px', marginBottom: '16px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{total > 0 ? '⚡' : '🎉'}</div>
                    {total > 0 ? (
                        <>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>{total} cards ready</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
                                {data?.reviewCount ?? 0} reviews · {data?.newWordCount ?? 0} new words
                            </div>
                            <Link href="/session" style={{
                                display: 'block', padding: '16px',
                                background: '#7c3aed', borderRadius: '14px',
                                color: 'white', fontWeight: 800, fontSize: '1.05rem',
                                textDecoration: 'none', textAlign: 'center',
                                boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                            }}>
                                Start Session →
                            </Link>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>All caught up!</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Come back tomorrow for more reviews</div>
                        </>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    {[
                        { icon: '📖', label: 'Due Reviews', value: data?.reviewCount ?? 0, color: '#f59e0b' },
                        { icon: '✨', label: 'New Words', value: data?.newWordCount ?? 0, color: '#7c3aed' },
                        { icon: '🔥', label: 'Day Streak', value: streak, color: '#ef4444' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#13142a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '18px 16px' }}>
                            <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{s.icon}</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link href="/history" style={LINK_STYLE}>📊 Learning history</Link>
                    <Link href="/onboarding" style={LINK_STYLE}>⚙️ Learning settings</Link>
                </div>
            </div>
        </div>
    )
}

const LINK_STYLE: React.CSSProperties = {
    display: 'block', padding: '14px 18px',
    background: '#13142a', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px', color: '#94a3b8',
    fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
}

// ── Root ──────────────────────────────────────────────────────────────────

export default function HomePage() {
    const { guestId, isLoading, profile } = useGuest()

    if (isLoading) {
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748b' }}>Loading...</div>
            </div>
        )
    }

    const isPremium = (profile as { is_premium?: boolean } | null)?.is_premium ?? false

    if (isPremium && guestId) {
        return <Dashboard guestId={guestId} profile={profile} />
    }

    return <LandingPage guestId={guestId} />
}
