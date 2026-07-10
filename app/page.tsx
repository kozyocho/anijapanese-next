'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { useGuest } from '@/lib/GuestProvider'
import { StreakBadge } from '@/components/StreakBadge'
import { useSale } from '@/lib/useSale'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/LoadingScreen'

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
                    500+ more words and scene dialogue quizzes are waiting for you.
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
                <Link href="/onboarding" style={{
                    display: 'inline-block', marginTop: '14px',
                    fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600,
                    textDecoration: 'underline', textUnderlineOffset: '3px',
                }}>
                    or continue with the free plan →
                </Link>
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

type PlanType = 'monthly' | 'annual' | 'lifetime'

const PLANS = [
    {
        id: 'monthly' as PlanType,
        label: 'Monthly',
        price: '$4.99',
        per: '/month',
        badge: null,
        features: ['Unlimited new words', 'All 500+ words', 'Scene dialogue quizzes', 'SRS system', 'Streak tracking'],
    },
    {
        id: 'annual' as PlanType,
        label: 'Annual',
        price: '$29.99',
        per: '/year',
        badge: 'Most Popular',
        monthlyEquiv: '$2.50/mo',
        features: ['Everything in Monthly', '50% cheaper than monthly', 'All future word packs'],
    },
    {
        id: 'lifetime' as PlanType,
        label: 'Lifetime',
        price: '$59.99',
        salePriceRaw: '$39.99',
        per: ' one-time',
        badge: null,
        features: ['Everything in Annual', 'Pay once, own forever', 'No subscription ever'],
    },
]

function LandingPage({ guestId }: { guestId: string | null }) {
    const sale = useSale()
    const [showDemo, setShowDemo] = useState(false)
    const [buying, setBuying] = useState<PlanType | null>(null)
    const [showPromo, setShowPromo] = useState(false)
    const [promoCode, setPromoCode] = useState('')
    const [promoStatus, setPromoStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [promoError, setPromoError] = useState('')
    const router = useRouter()

    async function redeemPromo() {
        if (!guestId || !promoCode.trim()) return
        setPromoStatus('loading')
        setPromoError('')
        const res = await fetch('/api/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: guestId, code: promoCode }),
        })
        const data = await res.json()
        if (!res.ok) {
            setPromoStatus('error')
            setPromoError(data.error ?? 'Something went wrong')
            return
        }
        router.replace('/?upgraded=1')
    }

    async function buy(planType: PlanType) {
        if (!guestId) return
        setBuying(planType)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planType,
                    useWelcomeOffer: sale.isActive && planType === 'lifetime',
                }),
            })
            const { url } = await res.json()
            if (url) window.location.href = url
        } finally {
            setBuying(null)
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
                    500+ anime words · 10 min/day · From $2.50/month
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

                {/* Primary CTA — Annual (most popular) */}
                <SignedIn>
                    <button onClick={() => buy('annual')} disabled={buying !== null} style={BTN}>
                        {buying === 'annual' ? 'Redirecting...' : 'Get Annual — $29.99/yr'}
                    </button>
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button style={BTN}>Get Annual — $29.99/yr</button>
                    </SignInButton>
                </SignedOut>

                <p style={{ marginTop: '10px', fontSize: '0.78rem', color: '#475569' }}>
                    $2.50/mo · Cancel anytime ·{' '}
                    <a href="#pricing" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>
                        See all plans ↓
                    </a>
                </p>
                <p style={{ marginTop: '6px', fontSize: '0.78rem', color: '#475569' }}>
                    Not sure yet?{' '}
                    <a href="#demo" style={{ color: '#94a3b8', textDecoration: 'underline', textUnderlineOffset: '3px', fontWeight: 600 }}>
                        Try 3 words free — no sign-up
                    </a>
                </p>
            </section>

            {/* Demo — show the product before explaining it */}
            <section id="demo" style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 48px' }}>
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
                            priceLabel="$29.99/yr"
                            onFinish={() => {}}
                            onBuy={() => buy('annual')}
                            buying={buying === 'annual'}
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

                    {/* Screen 4: Scene quiz */}
                    <div style={{ flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>④ Master real dialogue</div>
                        <div style={{ width: '220px', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'linear-gradient(135deg,#a78bfa,#fbbf24)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AniJapanese</span>
                                <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700 }}>🔥 7</span>
                            </div>
                            <div style={{ padding: '14px' }}>
                                <div style={{ fontSize: '0.55rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>🎬 Scene</div>
                                <div style={{ fontSize: '0.62rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '10px' }}>
                                    A rival finally shows up late. The hero smirks and says:
                                </div>
                                <div style={{ display: 'grid', gap: '5px' }}>
                                    {[
                                        { jp: 'やっと来たか', correct: true },
                                        { jp: 'やっと来ましたね', correct: false },
                                        { jp: 'もう来たのか', correct: false },
                                        { jp: 'やっと行くか', correct: false },
                                    ].map((opt, i) => (
                                        <div key={i} style={{
                                            padding: '7px 4px', fontSize: '0.68rem', fontWeight: 700,
                                            background: opt.correct ? 'rgba(34,197,94,0.15)' : '#1a1b35',
                                            borderRadius: '8px',
                                            border: `1.5px solid ${opt.correct ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.06)'}`,
                                            color: opt.correct ? '#4ade80' : '#94a3b8', textAlign: 'center',
                                        }}>{opt.jp}</div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: '#0a2e22', padding: '8px 14px', borderTop: '1px solid rgba(34,197,94,0.2)' }}>
                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                    Every wrong choice explained — register, grammar, nuance
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Screen 5: Dashboard */}
                    <div style={{ flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>⑤ Track your streak</div>
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
                        { n: '$2.50', label: 'per month (annual)' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#13142a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px 12px' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7c3aed', marginBottom: '4px' }}>{s.n}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 64px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                    Simple pricing
                </h2>
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', margin: '0 0 24px' }}>
                    Free to try · Upgrade anytime
                </p>

                {/* Free tier */}
                <div style={{
                    background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px', padding: '18px 20px', marginBottom: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>Free</div>
                        <div style={{ fontSize: '0.78rem', color: '#475569' }}>5 new words/day · No credit card</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#64748b' }}>$0</div>
                        <Link href="/onboarding" style={{
                            padding: '9px 16px', background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
                            color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 700,
                            textDecoration: 'none', whiteSpace: 'nowrap',
                        }}>
                            Start free
                        </Link>
                    </div>
                </div>

                {/* Paid plans */}
                {PLANS.map(plan => {
                    const isAnnual = plan.id === 'annual'
                    const isLifetime = plan.id === 'lifetime'
                    const displayPrice = isLifetime && sale.isActive ? plan.salePriceRaw! : plan.price
                    const isBuying = buying === plan.id

                    return (
                        <div key={plan.id} style={{
                            background: isAnnual ? 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(109,40,217,0.08))' : '#13142a',
                            border: isAnnual ? '1.5px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '18px', padding: '22px 20px', marginBottom: '12px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>{plan.label}</span>
                                        {plan.badge && (
                                            <span style={{
                                                fontSize: '0.65rem', fontWeight: 800,
                                                background: '#7c3aed', color: 'white',
                                                padding: '2px 8px', borderRadius: '99px',
                                                textTransform: 'uppercase', letterSpacing: '0.04em',
                                            }}>{plan.badge}</span>
                                        )}
                                        {isLifetime && sale.isActive && (
                                            <span style={{
                                                fontSize: '0.65rem', fontWeight: 800,
                                                background: '#db2777', color: 'white',
                                                padding: '2px 8px', borderRadius: '99px',
                                            }}>Sale</span>
                                        )}
                                    </div>
                                    {'monthlyEquiv' in plan && (
                                        <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>{plan.monthlyEquiv}</div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    {isLifetime && sale.isActive && (
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', textDecoration: 'line-through' }}>{plan.price}</div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                        <span style={{ fontSize: '1.6rem', fontWeight: 900 }}>{displayPrice}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{plan.per}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
                                {plan.features.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.83rem', color: '#94a3b8' }}>
                                        <span style={{ color: '#7c3aed', fontWeight: 800, flexShrink: 0 }}>✓</span>
                                        {f}
                                    </div>
                                ))}
                            </div>

                            <SignedIn>
                                <button
                                    onClick={() => buy(plan.id)}
                                    disabled={buying !== null}
                                    style={{
                                        ...BTN,
                                        background: isAnnual ? '#7c3aed' : 'rgba(124,58,237,0.15)',
                                        boxShadow: isAnnual ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
                                        color: isAnnual ? 'white' : '#a78bfa',
                                        border: isAnnual ? 'none' : '1px solid rgba(124,58,237,0.3)',
                                        opacity: buying !== null && !isBuying ? 0.6 : 1,
                                        fontSize: '0.9rem', padding: '14px',
                                    }}
                                >
                                    {isBuying ? 'Redirecting...' : `Get ${plan.label}`}
                                </button>
                            </SignedIn>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button style={{
                                        ...BTN,
                                        background: isAnnual ? '#7c3aed' : 'rgba(124,58,237,0.15)',
                                        boxShadow: isAnnual ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
                                        color: isAnnual ? 'white' : '#a78bfa',
                                        border: isAnnual ? 'none' : '1px solid rgba(124,58,237,0.3)',
                                        fontSize: '0.9rem', padding: '14px',
                                    }}>
                                        Get {plan.label}
                                    </button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    )
                })}

                {/* Promo code */}
                <div style={{ marginTop: '16px' }}>
                    {!showPromo ? (
                        <button onClick={() => setShowPromo(true)} style={{
                            background: 'transparent', border: 'none',
                            color: '#475569', fontSize: '0.82rem', fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'center',
                        }}>
                            Have a promo code?
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                value={promoCode}
                                onChange={e => setPromoCode(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && redeemPromo()}
                                placeholder="Enter promo code"
                                style={{
                                    flex: 1, padding: '10px 14px',
                                    background: '#1a1b35', border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '10px', color: '#f1f5f9',
                                    fontFamily: 'inherit', fontSize: '0.88rem',
                                    outline: 'none', textTransform: 'uppercase',
                                }}
                            />
                            <button
                                onClick={redeemPromo}
                                disabled={promoStatus === 'loading' || !promoCode.trim()}
                                style={{
                                    padding: '10px 18px', background: '#7c3aed',
                                    border: 'none', borderRadius: '10px',
                                    color: 'white', fontFamily: 'inherit',
                                    fontSize: '0.88rem', fontWeight: 700,
                                    cursor: promoStatus === 'loading' ? 'default' : 'pointer',
                                    opacity: !promoCode.trim() ? 0.5 : 1,
                                }}
                            >
                                {promoStatus === 'loading' ? '…' : 'Apply'}
                            </button>
                        </div>
                    )}
                    {promoStatus === 'error' && (
                        <p style={{ marginTop: '8px', fontSize: '0.78rem', color: '#f87171', textAlign: 'center' }}>{promoError}</p>
                    )}
                </div>
            </section>

            {/* FAQ */}
            <section style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 56px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, textAlign: 'center', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
                    Common questions
                </h2>
                {[
                    {
                        q: 'Do I need to know hiragana?',
                        a: 'No. Every word comes with romaji reading and audio, so you can start from zero. Kana knowledge helps but is never required.',
                    },
                    {
                        q: "I'm a total beginner. Will this work for me?",
                        a: 'Yes — a 2-minute placement test matches words to your level, starting from the essentials and gradually introducing harder vocab as you improve.',
                    },
                    {
                        q: 'What are scene dialogue quizzes?',
                        a: 'You see an anime-style scene and pick the line a character would actually say. Every wrong choice comes with a one-line explanation — formality, grammar, or nuance — so you learn why, not just what.',
                    },
                    {
                        q: 'How does the SRS system work?',
                        a: 'Words you get right come back at growing intervals (1, 3, 7, then 14 days). Words you miss come back sooner. You review exactly what you are about to forget.',
                    },
                    {
                        q: 'Can I cancel anytime?',
                        a: 'Yes. Monthly and Annual plans can be canceled anytime from your account and you keep access until the end of the paid period. Lifetime is a one-time payment — no subscription at all.',
                    },
                ].map(item => (
                    <details key={item.q} style={{
                        background: '#13142a', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '14px', padding: '16px 18px', marginBottom: '10px',
                    }}>
                        <summary style={{
                            fontSize: '0.92rem', fontWeight: 700, color: '#f1f5f9',
                            cursor: 'pointer', listStyle: 'none',
                        }}>
                            {item.q}
                        </summary>
                        <p style={{ margin: '10px 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.65 }}>
                            {item.a}
                        </p>
                    </details>
                ))}
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

function Dashboard({ guestId, profile, isPremium, showUpgradeSuccess }: {
    guestId: string
    profile: { current_streak: number } | null
    isPremium: boolean
    showUpgradeSuccess?: boolean
}) {
    const [data, setData] = useState<SessionData | null>(null)
    const [toastVisible, setToastVisible] = useState(showUpgradeSuccess ?? false)

    useEffect(() => {
        if (!showUpgradeSuccess) return
        const id = setTimeout(() => setToastVisible(false), 5000)
        return () => clearTimeout(id)
    }, [showUpgradeSuccess])

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
            {/* Upgrade success toast */}
            {toastVisible && (
                <div style={{
                    position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1000, background: 'linear-gradient(135deg,#7c3aed,#059669)',
                    borderRadius: '16px', padding: '16px 24px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    animation: 'fadeIn 0.3s ease',
                    maxWidth: '90vw',
                }}>
                    <span style={{ fontSize: '1.5rem' }}>🎉</span>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white' }}>Premium unlocked!</div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>Unlimited words, all features. Let's go!</div>
                    </div>
                    <button onClick={() => setToastVisible(false)} style={{
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                        fontSize: '1.1rem', cursor: 'pointer', padding: '0 0 0 8px',
                    }}>✕</button>
                </div>
            )}
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
                                {!isPremium && <span style={{ color: '#64748b' }}> · Free: 5 new/day</span>}
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

                <Link href={isPremium ? '/scene' : '/upgrade'} style={{
                    display: 'block', padding: '16px 18px', marginBottom: '16px',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(167,139,250,0.08))',
                    border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: '16px', color: '#e2e8f0',
                    fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
                }}>
                    🎬 Scene Quiz — What would they say?
                    {!isPremium && (
                        <span style={{
                            marginLeft: '8px', fontSize: '0.65rem', fontWeight: 800,
                            background: 'rgba(124,58,237,0.25)', color: '#a78bfa',
                            padding: '2px 8px', borderRadius: '99px', verticalAlign: 'middle',
                        }}>🔒 Premium</span>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginTop: '4px' }}>
                        Pick the natural line for each anime-style scene
                    </div>
                </Link>

                {!isPremium && (
                    <Link href="/upgrade" style={{
                        display: 'block', padding: '16px 18px', marginBottom: '16px',
                        background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                        borderRadius: '16px', color: 'white',
                        fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none',
                        boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                    }}>
                        🚀 Go unlimited — from $2.50/mo
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginTop: '4px' }}>
                            Unlimited new words + scene quizzes
                        </div>
                    </Link>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link href="/history" style={LINK_STYLE}>📊 Learning history</Link>
                    <Link href="/onboarding" style={LINK_STYLE}>⚙️ Learning settings</Link>
                    {isPremium && (
                        <Link href="/upgrade" style={LINK_STYLE}>
                            💎 Manage plan
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                                Change plan, payment method, or cancel
                            </span>
                        </Link>
                    )}
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
    const { isSignedIn } = useUser()
    const searchParams = useSearchParams()
    const router = useRouter()
    const upgraded = searchParams.get('upgraded') === '1'
    const [polling, setPolling] = useState(upgraded)
    const [confirmedPremium, setConfirmedPremium] = useState(false)

    // When redirected from Stripe (?upgraded=1), poll until is_premium is true
    useEffect(() => {
        if (!upgraded || !guestId) return
        let attempts = 0
        const check = async () => {
            const res = await fetch(`/api/profile?userId=${guestId}`)
            const data = await res.json()
            if (data.profile?.is_premium) {
                setConfirmedPremium(true)
                setPolling(false)
                return
            }
            attempts++
            if (attempts < 20) {
                setTimeout(check, 1000)
            } else {
                setPolling(false) // give up after 20s
            }
        }
        check()
    }, [upgraded, guestId])

    if (isLoading || polling) {
        return upgraded
            ? <LoadingScreen emoji="🎉" message="Payment successful! Activating your account…" />
            : <LoadingScreen />
    }

    const isPremium = (profile?.is_premium ?? false) || confirmedPremium
    const onboarded = !!profile?.onboarding_completed_at

    // Premium users and users who completed onboarding get the dashboard
    if ((isPremium || onboarded) && guestId) {
        return <Dashboard guestId={guestId} profile={profile} isPremium={isPremium} showUpgradeSuccess={upgraded} />
    }

    // Signed-in users never see the LP — send them to finish onboarding
    if (isSignedIn) {
        return <RedirectToOnboarding router={router} />
    }

    return <LandingPage guestId={guestId} />
}

function RedirectToOnboarding({ router }: { router: ReturnType<typeof useRouter> }) {
    useEffect(() => {
        router.replace('/onboarding')
    }, [router])
    return <LoadingScreen />
}
