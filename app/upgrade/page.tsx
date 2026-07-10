'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { useGuest } from '@/lib/GuestProvider'
import { useSale } from '@/lib/useSale'

type PlanType = 'monthly' | 'annual' | 'lifetime'

const PLANS = [
    {
        id: 'monthly' as PlanType,
        label: 'Monthly',
        price: '$4.99',
        per: '/month',
        badge: null as string | null,
        features: ['Unlimited new words', 'All 500+ words', 'Scene dialogue quizzes', 'SRS system'],
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
        badge: null as string | null,
        features: ['Everything in Annual', 'Pay once, own forever', 'No subscription ever'],
    },
]

export default function UpgradePage() {
    const { guestId, profile } = useGuest()
    const [buying, setBuying] = useState<PlanType | null>(null)
    const [loading, setLoading] = useState(false)

    const isPremium = profile?.is_premium ?? false
    const planType = profile?.plan_type ?? null
    const sale = useSale()

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

    async function handlePortal() {
        if (!guestId) return
        setLoading(true)
        try {
            const res = await fetch('/api/stripe/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: guestId }),
            })
            const { url } = await res.json()
            if (url) window.location.href = url
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100dvh', padding: '0 20px 48px', maxWidth: '480px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ padding: '24px 0 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back</Link>
            </div>

            {/* Sale countdown banner */}
            {sale.isActive && !isPremium && (
                <div style={{
                    background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                    borderRadius: '14px', padding: '14px 18px',
                    margin: '16px 0 0', textAlign: 'center',
                }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Welcome offer — Lifetime $39.99 expires in
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                        {sale.hours}:{sale.minutes}:{sale.seconds}
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center', padding: '24px 0 24px' }}>
                <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>🚀</div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                    AniJapanese Premium
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                    Unlimited words, scene quizzes, and the full SRS system.
                </p>
            </div>

            {isPremium ? (
                <div>
                    <div style={{
                        padding: '20px', textAlign: 'center',
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: '14px', marginBottom: '12px',
                    }}>
                        <div style={{ color: '#4ade80', fontWeight: 700, marginBottom: '4px' }}>
                            {planType === 'lifetime' ? 'Lifetime plan active'
                                : planType === 'annual' ? 'Annual plan active'
                                : planType === 'monthly' ? 'Monthly plan active'
                                : 'Premium active'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {planType === 'lifetime'
                                ? 'Paid once — yours forever. No subscription, nothing to cancel.'
                                : 'All premium features unlocked.'}
                        </div>
                    </div>
                    {planType !== 'lifetime' && (
                        <>
                            <button
                                onClick={handlePortal}
                                disabled={loading}
                                style={{
                                    display: 'block', width: '100%', padding: '16px',
                                    background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                                    borderRadius: '14px', color: '#a78bfa',
                                    fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
                                }}
                            >
                                {loading ? 'Opening…' : 'Manage subscription →'}
                            </button>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 4px 0' }}>
                                {['Switch between Monthly / Annual', 'Update payment method', 'Cancel anytime — access lasts until the end of the paid period'].map((t, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
                                        <span style={{ color: '#7c3aed', fontWeight: 800, flexShrink: 0 }}>✓</span>
                                        {t}
                                    </div>
                                ))}
                            </div>
                            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#475569', margin: '16px 0 0' }}>
                                Handled securely by Stripe
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <>
                    {PLANS.map(plan => {
                        const isAnnual = plan.id === 'annual'
                        const isLifetime = plan.id === 'lifetime'
                        const displayPrice = isLifetime && sale.isActive ? plan.salePriceRaw! : plan.price
                        const isBuying = buying === plan.id
                        const btnStyle: React.CSSProperties = {
                            display: 'block', width: '100%', padding: '14px',
                            background: isAnnual ? '#7c3aed' : 'rgba(124,58,237,0.15)',
                            boxShadow: isAnnual ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
                            color: isAnnual ? 'white' : '#a78bfa',
                            border: isAnnual ? 'none' : '1px solid rgba(124,58,237,0.3)',
                            borderRadius: '14px', fontFamily: 'inherit',
                            fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer',
                            opacity: buying !== null && !isBuying ? 0.6 : 1,
                        }

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
                                    <button onClick={() => buy(plan.id)} disabled={buying !== null} style={btnStyle}>
                                        {isBuying ? 'Redirecting...' : `Get ${plan.label}`}
                                    </button>
                                </SignedIn>
                                <SignedOut>
                                    <SignInButton mode="modal" forceRedirectUrl="/upgrade">
                                        <button style={btnStyle}>Get {plan.label}</button>
                                    </SignInButton>
                                </SignedOut>
                            </div>
                        )
                    })}
                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#475569', margin: '4px 0 0' }}>
                        Secure payment via Stripe · Cancel anytime
                    </p>
                </>
            )}
        </div>
    )
}
