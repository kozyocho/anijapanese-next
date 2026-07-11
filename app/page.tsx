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
    background: '#0A84FF', border: 'none', borderRadius: '14px',
    color: 'white', fontFamily: 'inherit',
    fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer',
    boxShadow: 'none',
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
                <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>
                    {correct}/{DEMO_WORDS.length} correct
                </div>
                <div style={{ color: 'rgba(235,235,245,0.6)', fontSize: '0.9rem', marginBottom: '24px' }}>
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
                    fontSize: '0.82rem', color: 'rgba(235,235,245,0.6)', fontWeight: 600,
                    textDecoration: 'underline', textUnderlineOffset: '3px',
                }}>
                    or continue with the free plan →
                </Link>
            </div>
        )
    }

    return (
        <>
            <div style={{ marginBottom: '20px', fontSize: '0.72rem', color: 'rgba(235,235,245,0.3)', fontWeight: 600 }}>
                {index + 1} of {DEMO_WORDS.length}
            </div>
            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
                <div style={{ fontSize: '2.6rem', fontWeight: 700, marginBottom: '6px' }}>{word.jp}</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(235,235,245,0.45)' }}>{word.reading}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {shuffled.map(opt => {
                    const isCorrect = opt === word.en
                    const isSelected = opt === selected
                    const bg = selected
                        ? isCorrect ? 'rgba(48,209,88,0.15)' : isSelected ? 'rgba(255,69,58,0.15)' : '#2C2C2E'
                        : '#2C2C2E'
                    const border = selected
                        ? isCorrect ? 'rgba(48,209,88,0.5)' : isSelected ? 'rgba(255,69,58,0.5)' : 'rgba(84,84,88,0.4)'
                        : 'rgba(84,84,88,0.6)'
                    const color = selected
                        ? isCorrect ? '#30D158' : isSelected ? '#FF453A' : 'rgba(235,235,245,0.3)'
                        : '#FFFFFF'
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
        <div style={{ minHeight: '100dvh', color: '#FFFFFF' }}>
            {/* Sale banner — one idea, full width */}
            {sale.isActive && (
                <div style={{
                    background: '#FF375F',
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
                    fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg,#0A84FF,#64D2FF)',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>AniJapanese</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <a href="#pricing" style={{ fontSize: '0.85rem', color: 'rgba(235,235,245,0.6)', textDecoration: 'none', fontWeight: 600 }}>Pricing</a>
                    <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button style={{
                                padding: '6px 14px', background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '99px', color: '#FFFFFF',
                                fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                            }}>Sign in</button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </header>

            {/* Hero — sells in one screen */}
            <section style={{ maxWidth: '480px', margin: '0 auto', padding: '52px 20px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A84FF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '18px' }}>
                    500+ anime words · 10 min/day · From $2.50/month
                </div>
                <h1 style={{
                    fontSize: 'clamp(2rem, 8vw, 2.8rem)', fontWeight: 700,
                    lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 18px',
                }}>
                    Watch anime in Japanese<br />— without subtitles
                </h1>
                <p style={{
                    color: 'rgba(235,235,245,0.6)', fontSize: '1rem', lineHeight: 1.65,
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

                <p style={{ marginTop: '10px', fontSize: '0.78rem', color: 'rgba(235,235,245,0.3)' }}>
                    $2.50/mo · Cancel anytime ·{' '}
                    <a href="#pricing" style={{ color: '#0A84FF', textDecoration: 'none', fontWeight: 600 }}>
                        See all plans ↓
                    </a>
                </p>
                <p style={{ marginTop: '6px', fontSize: '0.78rem', color: 'rgba(235,235,245,0.3)' }}>
                    Not sure yet?{' '}
                    <a href="#demo" style={{ color: 'rgba(235,235,245,0.6)', textDecoration: 'underline', textUnderlineOffset: '3px', fontWeight: 600 }}>
                        Try 3 words free — no sign-up
                    </a>
                </p>
            </section>

            {/* Demo — show the product before explaining it */}
            <section id="demo" style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 48px' }}>
                <div style={{
                    background: '#1C1C1E', border: '1px solid rgba(84,84,88,0.5)',
                    borderRadius: '20px', padding: '24px',
                }}>
                    {!showDemo ? (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(235,235,245,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '20px' }}>
                                See how it works — try 3 words
                            </div>
                            <div style={{ fontSize: '2.8rem', fontWeight: 700, marginBottom: '4px' }}>仲間</div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(235,235,245,0.45)', marginBottom: '24px' }}>nakama · comrade</div>
                            <button onClick={() => setShowDemo(true)} style={{
                                padding: '12px 28px',
                                background: 'rgba(10,132,255,0.12)', border: '1px solid rgba(10,132,255,0.3)',
                                borderRadius: '12px', color: '#409CFF',
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
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', margin: '0 0 20px', letterSpacing: '-0.02em', padding: '0 20px' }}>
                    How it works
                </h2>

                {/* Horizontally scrollable screens */}
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 20px 12px', scrollSnapType: 'x mandatory' }}>

                    {/* Screen 1: Word card */}
                    <div style={{ flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(235,235,245,0.45)', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>① A word appears</div>
                        <div style={{ width: '220px', background: '#000000', border: '1px solid rgba(84,84,88,0.65)', borderRadius: '20px', overflow: 'hidden' }}>
                            {/* Mini header */}
                            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(84,84,88,0.4)' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'linear-gradient(135deg,#0A84FF,#64D2FF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AniJapanese</span>
                                <span style={{ fontSize: '0.65rem', color: '#FF453A', fontWeight: 700 }}>Streak 3</span>
                            </div>
                            {/* Word card */}
                            <div style={{ padding: '24px 14px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.6rem', color: '#0A84FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Battle</div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '4px' }}>仲間</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(235,235,245,0.45)', marginBottom: '20px' }}>nakama</div>
                                {/* Blurred choices (pre-reveal) */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    {['', '', '', ''].map((_, i) => (
                                        <div key={i} style={{ height: '32px', background: '#2C2C2E', borderRadius: '8px', border: '1px solid rgba(84,84,88,0.5)', filter: 'blur(3px)' }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Screen 2: Quiz choices */}
                    <div style={{ flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(235,235,245,0.45)', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>② Pick the meaning</div>
                        <div style={{ width: '220px', background: '#000000', border: '1px solid rgba(84,84,88,0.65)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(84,84,88,0.4)' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'linear-gradient(135deg,#0A84FF,#64D2FF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AniJapanese</span>
                                <span style={{ fontSize: '0.65rem', color: '#FF453A', fontWeight: 700 }}>Streak 3</span>
                            </div>
                            <div style={{ padding: '24px 14px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.6rem', color: '#0A84FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Battle</div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '4px' }}>仲間</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(235,235,245,0.45)', marginBottom: '20px' }}>nakama</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    {['rival', 'enemy', 'comrade', 'mentor'].map((opt, i) => (
                                        <div key={i} style={{
                                            padding: '8px 4px', fontSize: '0.68rem', fontWeight: 600,
                                            background: '#2C2C2E', borderRadius: '8px',
                                            border: '1.5px solid rgba(84,84,88,0.6)',
                                            color: '#FFFFFF', textAlign: 'center',
                                        }}>{opt}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Screen 3: Correct feedback */}
                    <div style={{ flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(235,235,245,0.45)', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>③ Instant feedback</div>
                        <div style={{ width: '220px', background: '#000000', border: '1px solid rgba(84,84,88,0.65)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(84,84,88,0.4)' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'linear-gradient(135deg,#0A84FF,#64D2FF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AniJapanese</span>
                                <span style={{ fontSize: '0.65rem', color: '#FF453A', fontWeight: 700 }}>Streak 3</span>
                            </div>
                            <div style={{ padding: '24px 14px 12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.6rem', color: '#0A84FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Battle</div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '4px' }}>仲間</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(235,235,245,0.45)', marginBottom: '16px' }}>nakama</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                                    {[
                                        { label: 'rival', correct: false, selected: false },
                                        { label: 'enemy', correct: false, selected: false },
                                        { label: 'comrade', correct: true, selected: true },
                                        { label: 'mentor', correct: false, selected: false },
                                    ].map((opt, i) => (
                                        <div key={i} style={{
                                            padding: '8px 4px', fontSize: '0.68rem', fontWeight: 600,
                                            background: opt.correct ? 'rgba(48,209,88,0.15)' : '#2C2C2E',
                                            borderRadius: '8px',
                                            border: `1.5px solid ${opt.correct ? 'rgba(48,209,88,0.5)' : 'rgba(84,84,88,0.5)'}`,
                                            color: opt.correct ? '#30D158' : 'rgba(235,235,245,0.3)', textAlign: 'center',
                                        }}>{opt.label}</div>
                                    ))}
                                </div>
                            </div>
                            {/* Feedback banner */}
                            <div style={{ background: 'rgba(48,209,88,0.1)', padding: '10px 14px', borderTop: '1px solid rgba(48,209,88,0.2)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#30D158', marginBottom: '2px' }}>✓ Correct! +10 XP</div>
                                <div style={{ fontSize: '0.62rem', color: 'rgba(235,235,245,0.6)' }}>comrade / ally / nakama</div>
                            </div>
                        </div>
                    </div>

                    {/* Screen 4: Scene quiz */}
                    <div style={{ flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(235,235,245,0.45)', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>④ Master real dialogue</div>
                        <div style={{ width: '220px', background: '#000000', border: '1px solid rgba(84,84,88,0.65)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(84,84,88,0.4)' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'linear-gradient(135deg,#0A84FF,#64D2FF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AniJapanese</span>
                                <span style={{ fontSize: '0.65rem', color: '#FF453A', fontWeight: 700 }}>Streak 7</span>
                            </div>
                            <div style={{ padding: '14px' }}>
                                <div style={{ fontSize: '0.55rem', color: '#409CFF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Scene</div>
                                <div style={{ fontSize: '0.62rem', color: 'rgba(235,235,245,0.6)', lineHeight: 1.5, marginBottom: '10px' }}>
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
                                            background: opt.correct ? 'rgba(48,209,88,0.15)' : '#2C2C2E',
                                            borderRadius: '8px',
                                            border: `1.5px solid ${opt.correct ? 'rgba(48,209,88,0.5)' : 'rgba(84,84,88,0.5)'}`,
                                            color: opt.correct ? '#30D158' : 'rgba(235,235,245,0.6)', textAlign: 'center',
                                        }}>{opt.jp}</div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: 'rgba(48,209,88,0.1)', padding: '8px 14px', borderTop: '1px solid rgba(48,209,88,0.2)' }}>
                                <div style={{ fontSize: '0.6rem', color: 'rgba(235,235,245,0.6)', lineHeight: 1.5 }}>
                                    Every wrong choice explained — register, grammar, nuance
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Screen 5: Dashboard */}
                    <div style={{ flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(235,235,245,0.45)', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>⑤ Track your streak</div>
                        <div style={{ width: '220px', background: '#000000', border: '1px solid rgba(84,84,88,0.65)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(84,84,88,0.4)' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'linear-gradient(135deg,#0A84FF,#64D2FF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AniJapanese</span>
                                <span style={{ fontSize: '0.65rem', color: '#FF453A', fontWeight: 700 }}>Streak 7</span>
                            </div>
                            <div style={{ padding: '12px 14px' }}>
                                <div style={{ background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.2)', borderRadius: '12px', padding: '12px', textAlign: 'center', marginBottom: '8px' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: '2px' }}>8 cards ready</div>
                                    <div style={{ fontSize: '0.6rem', color: 'rgba(235,235,245,0.6)', marginBottom: '10px' }}>3 reviews · 5 new words</div>
                                    <div style={{ background: '#0A84FF', borderRadius: '8px', padding: '6px', fontSize: '0.65rem', fontWeight: 600, color: 'white' }}>Start Session →</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    {[
                                        { label: 'Reviews', val: '3', color: '#FF9F0A' },
                                        { label: 'New', val: '5', color: '#0A84FF' },
                                        { label: 'Streak', val: '7', color: '#FF453A' },
                                        { label: 'XP', val: '240', color: '#FFD60A' },
                                    ].map((s, i) => (
                                        <div key={i} style={{ background: '#1C1C1E', border: '1px solid rgba(84,84,88,0.5)', borderRadius: '8px', padding: '8px' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: s.color }}>{s.val}</div>
                                            <div style={{ fontSize: '0.55rem', color: 'rgba(235,235,245,0.45)' }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(235,235,245,0.3)', margin: '0' }}>← swipe to see more →</p>
            </section>

            {/* Numbers — no adjectives */}
            <section style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 48px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                    {[
                        { n: '500+', label: 'anime words' },
                        { n: '10 min', label: 'per day' },
                        { n: '$2.50', label: 'per month (annual)' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#1C1C1E', border: '1px solid rgba(84,84,88,0.5)', borderRadius: '14px', padding: '18px 12px' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0A84FF', marginBottom: '4px' }}>{s.n}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(235,235,245,0.45)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 64px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                    Simple pricing
                </h2>
                <p style={{ textAlign: 'center', color: 'rgba(235,235,245,0.45)', fontSize: '0.85rem', margin: '0 0 24px' }}>
                    Free to try · Upgrade anytime
                </p>

                {/* Free tier */}
                <div style={{
                    background: '#000000', border: '1px solid rgba(84,84,88,0.5)',
                    borderRadius: '16px', padding: '18px 20px', marginBottom: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>Free</div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(235,235,245,0.3)' }}>5 new words/day · No credit card</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'rgba(235,235,245,0.45)' }}>$0</div>
                        <Link href="/onboarding" style={{
                            padding: '9px 16px', background: 'rgba(84,84,88,0.5)',
                            border: '1px solid rgba(84,84,88,0.65)', borderRadius: '10px',
                            color: '#EBEBF5', fontSize: '0.82rem', fontWeight: 700,
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
                            background: isAnnual ? 'rgba(10,132,255,0.12)' : '#1C1C1E',
                            border: isAnnual ? '1.5px solid rgba(10,132,255,0.5)' : '1px solid rgba(84,84,88,0.5)',
                            borderRadius: '18px', padding: '22px 20px', marginBottom: '12px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>{plan.label}</span>
                                        {plan.badge && (
                                            <span style={{
                                                fontSize: '0.65rem', fontWeight: 600,
                                                background: '#0A84FF', color: 'white',
                                                padding: '2px 8px', borderRadius: '99px',
                                                textTransform: 'uppercase', letterSpacing: '0.04em',
                                            }}>{plan.badge}</span>
                                        )}
                                        {isLifetime && sale.isActive && (
                                            <span style={{
                                                fontSize: '0.65rem', fontWeight: 600,
                                                background: '#FF375F', color: 'white',
                                                padding: '2px 8px', borderRadius: '99px',
                                            }}>Sale</span>
                                        )}
                                    </div>
                                    {'monthlyEquiv' in plan && (
                                        <div style={{ fontSize: '0.75rem', color: '#0A84FF', fontWeight: 600 }}>{plan.monthlyEquiv}</div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    {isLifetime && sale.isActive && (
                                        <div style={{ fontSize: '0.78rem', color: 'rgba(235,235,245,0.45)', textDecoration: 'line-through' }}>{plan.price}</div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                        <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{displayPrice}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'rgba(235,235,245,0.45)' }}>{plan.per}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
                                {plan.features.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.83rem', color: 'rgba(235,235,245,0.6)' }}>
                                        <span style={{ color: '#0A84FF', fontWeight: 600, flexShrink: 0 }}>✓</span>
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
                                        background: isAnnual ? '#0A84FF' : 'rgba(10,132,255,0.15)',
                                        boxShadow: isAnnual ? 'none' : 'none',
                                        color: isAnnual ? 'white' : '#409CFF',
                                        border: isAnnual ? 'none' : '1px solid rgba(10,132,255,0.3)',
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
                                        background: isAnnual ? '#0A84FF' : 'rgba(10,132,255,0.15)',
                                        boxShadow: isAnnual ? 'none' : 'none',
                                        color: isAnnual ? 'white' : '#409CFF',
                                        border: isAnnual ? 'none' : '1px solid rgba(10,132,255,0.3)',
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
                            color: 'rgba(235,235,245,0.3)', fontSize: '0.82rem', fontWeight: 600,
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
                                    background: '#2C2C2E', border: '1px solid rgba(84,84,88,0.65)',
                                    borderRadius: '10px', color: '#FFFFFF',
                                    fontFamily: 'inherit', fontSize: '0.88rem',
                                    outline: 'none', textTransform: 'uppercase',
                                }}
                            />
                            <button
                                onClick={redeemPromo}
                                disabled={promoStatus === 'loading' || !promoCode.trim()}
                                style={{
                                    padding: '10px 18px', background: '#0A84FF',
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
                        <p style={{ marginTop: '8px', fontSize: '0.78rem', color: '#FF453A', textAlign: 'center' }}>{promoError}</p>
                    )}
                </div>
            </section>

            {/* FAQ */}
            <section style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 56px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, textAlign: 'center', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
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
                        background: '#1C1C1E', border: '1px solid rgba(84,84,88,0.5)',
                        borderRadius: '14px', padding: '16px 18px', marginBottom: '10px',
                    }}>
                        <summary style={{
                            fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF',
                            cursor: 'pointer', listStyle: 'none',
                        }}>
                            {item.q}
                        </summary>
                        <p style={{ margin: '10px 0 0', fontSize: '0.85rem', color: 'rgba(235,235,245,0.6)', lineHeight: 1.65 }}>
                            {item.a}
                        </p>
                    </details>
                ))}
            </section>

            {/* Footer — something worth sharing */}
            <footer style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.82rem', color: 'rgba(235,235,245,0.3)', lineHeight: 1.7, marginBottom: '20px' }}>
                    Built by an anime fan who got tired of pausing to read subtitles.<br />
                    <span style={{ color: 'rgba(235,235,245,0.3)' }}>No textbooks. No grammar charts. Just words you'll actually hear.</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <Link href="/privacy" style={{ fontSize: '0.75rem', color: 'rgba(235,235,245,0.3)', textDecoration: 'none' }}>Privacy Policy</Link>
                    <Link href="/terms" style={{ fontSize: '0.75rem', color: 'rgba(235,235,245,0.3)', textDecoration: 'none' }}>Terms of Service</Link>
                    <Link href="/tokushoho" style={{ fontSize: '0.75rem', color: 'rgba(235,235,245,0.3)', textDecoration: 'none' }}>Specified Commercial Transactions</Link>
                    <a href="mailto:osumomomo8110@gmail.com" style={{ fontSize: '0.75rem', color: 'rgba(235,235,245,0.3)', textDecoration: 'none' }}>Contact</a>
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
                    zIndex: 1000, background: '#0A84FF',
                    borderRadius: '16px', padding: '16px 24px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    animation: 'fadeIn 0.3s ease',
                    maxWidth: '90vw',
                }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'white' }}>Premium unlocked!</div>
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
                        fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg,#0A84FF,#64D2FF)',
                        WebkitBackgroundClip: 'text', backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>AniJapanese</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(235,235,245,0.45)', marginTop: '2px' }}>Understand anime in Japanese</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <StreakBadge streak={streak} />
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>

            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{
                    background: '#1C1C1E',
                    border: '1px solid rgba(10,132,255,0.2)',
                    borderRadius: '20px', padding: '28px 24px', marginBottom: '16px', textAlign: 'center',
                }}>
                    {total > 0 ? (
                        <>
                            <div style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '6px' }}>{total} cards ready</div>
                            <div style={{ color: 'rgba(235,235,245,0.6)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                {data?.reviewCount ?? 0} reviews · {data?.newWordCount ?? 0} new words
                                {!isPremium && <span style={{ color: 'rgba(235,235,245,0.45)' }}> · Free: 5 new/day</span>}
                            </div>
                            <Link href="/session" style={{
                                display: 'block', padding: '16px',
                                background: '#0A84FF', borderRadius: '14px',
                                color: 'white', fontWeight: 600, fontSize: '1.05rem',
                                textDecoration: 'none', textAlign: 'center',
                                boxShadow: 'none',
                            }}>
                                Start Session →
                            </Link>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '6px' }}>All caught up!</div>
                            <div style={{ color: 'rgba(235,235,245,0.6)', fontSize: '0.9rem' }}>Come back tomorrow for more reviews</div>
                        </>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    {[
                        { label: 'Due Reviews', value: data?.reviewCount ?? 0, color: '#FF9F0A' },
                        { label: 'New Words', value: data?.newWordCount ?? 0, color: '#0A84FF' },
                        { label: 'Day Streak', value: streak, color: '#FF453A' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#1C1C1E', border: '1px solid rgba(84,84,88,0.5)', borderRadius: '16px', padding: '18px 16px' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 600, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(235,235,245,0.45)', marginTop: '2px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <Link href={isPremium ? '/scene' : '/upgrade'} style={{
                    display: 'block', padding: '16px 18px', marginBottom: '16px',
                    background: '#1C1C1E',
                    border: '1px solid rgba(10,132,255,0.3)',
                    borderRadius: '16px', color: '#EBEBF5',
                    fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
                }}>
                    Scene Quiz — What would they say?
                    {!isPremium && (
                        <span style={{
                            marginLeft: '8px', fontSize: '0.65rem', fontWeight: 600,
                            background: 'rgba(10,132,255,0.25)', color: '#409CFF',
                            padding: '2px 8px', borderRadius: '99px', verticalAlign: 'middle',
                        }}>Premium</span>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'rgba(235,235,245,0.6)', fontWeight: 500, marginTop: '4px' }}>
                        Pick the natural line for each anime-style scene
                    </div>
                </Link>

                {!isPremium && (
                    <Link href="/upgrade" style={{
                        display: 'block', padding: '16px 18px', marginBottom: '16px',
                        background: '#0A84FF',
                        borderRadius: '16px', color: 'white',
                        fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
                        boxShadow: 'none',
                    }}>
                        Go unlimited — from $2.50/mo
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginTop: '4px' }}>
                            Unlimited new words + scene quizzes
                        </div>
                    </Link>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link href="/history" style={LINK_STYLE}>
                        Learning history
                        <span style={CHEVRON_STYLE}>›</span>
                    </Link>
                    <Link href="/onboarding" style={LINK_STYLE}>
                        Learning settings
                        <span style={CHEVRON_STYLE}>›</span>
                    </Link>
                    {isPremium && (
                        <Link href="/upgrade" style={LINK_STYLE}>
                            <span>
                                Manage plan
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(235,235,245,0.45)', fontWeight: 500, marginTop: '2px' }}>
                                    Change plan, payment method, or cancel
                                </span>
                            </span>
                            <span style={CHEVRON_STYLE}>›</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

const LINK_STYLE: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px',
    background: '#1C1C1E', border: '1px solid rgba(84,84,88,0.5)',
    borderRadius: '14px', color: 'rgba(235,235,245,0.6)',
    fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
}

const CHEVRON_STYLE: React.CSSProperties = {
    color: 'rgba(235,235,245,0.3)', fontSize: '1.2rem', fontWeight: 400,
    lineHeight: 1, flexShrink: 0, marginLeft: '12px',
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

    // When redirected from Stripe (?upgraded=1), verify the session directly
    // for instant activation; fall back to polling the webhook result.
    useEffect(() => {
        if (!upgraded || !guestId) return
        const sessionId = searchParams.get('session_id')

        let attempts = 0
        const pollWebhook = async () => {
            const res = await fetch(`/api/profile?userId=${guestId}`)
            const data = await res.json()
            if (data.profile?.is_premium) {
                setConfirmedPremium(true)
                setPolling(false)
                return
            }
            attempts++
            if (attempts < 10) {
                setTimeout(pollWebhook, 1000)
            } else {
                setPolling(false) // give up after 10s
            }
        }

        const run = async () => {
            if (sessionId) {
                try {
                    const res = await fetch('/api/stripe/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId }),
                    })
                    const data = await res.json()
                    if (data.premium) {
                        setConfirmedPremium(true)
                        setPolling(false)
                        return
                    }
                } catch { /* fall through to polling */ }
            }
            pollWebhook()
        }
        run()
    }, [upgraded, guestId, searchParams])

    if (isLoading || polling) {
        return upgraded
            ? <LoadingScreen message="Payment successful! Activating your account…" />
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
