'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { useGuest } from '@/lib/GuestProvider'
import { useSale } from '@/lib/useSale'

const FEATURES = [
    { free: '5 new words / day', premium: 'Unlimited new words', icon: '📚' },
    { free: 'Unlimited reviews', premium: 'Unlimited reviews', icon: '🔄' },
    { free: 'Basic categories', premium: 'All anime categories', icon: '🎌' },
    { free: 'Streak tracking', premium: 'Streak tracking', icon: '🔥' },
    { free: null, premium: 'Detailed learning stats', icon: '📊' },
    { free: null, premium: 'Priority support', icon: '⚡' },
]

export default function UpgradePage() {
    const { guestId, profile } = useGuest()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const isPremium = (profile as { is_premium?: boolean } | null)?.is_premium ?? false
    const sale = useSale()

    async function handleUpgrade() {
        if (!guestId) return
        setLoading(true)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: guestId, useWelcomeOffer: sale.isActive }),
            })
            const { url } = await res.json()
            if (url) window.location.href = url
        } finally {
            setLoading(false)
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
                    marginBottom: '16px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Welcome offer — expires in
                    </div>
                    <div style={{
                        fontFamily: 'monospace', fontSize: '2rem', fontWeight: 900,
                        letterSpacing: '0.04em',
                    }}>
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
                    Unlock unlimited learning. Watch anime without subtitles.
                </p>
            </div>

            {/* Price card */}
            {!isPremium && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(245,158,11,0.08))',
                    border: `1.5px solid ${sale.isActive ? 'rgba(219,39,119,0.4)' : 'rgba(124,58,237,0.3)'}`,
                    borderRadius: '20px', padding: '24px',
                    textAlign: 'center', marginBottom: '20px',
                }}>
                    {sale.isActive ? (
                        <>
                            <div style={{ fontSize: '0.8rem', color: '#f472b6', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                50% off — first month only
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '1.2rem', color: '#64748b', textDecoration: 'line-through', marginBottom: '6px' }}>$4.99</span>
                                <span style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>$2.49</span>
                                <span style={{ color: '#64748b', marginBottom: '6px' }}>/mo</span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Then $4.99/month · Cancel anytime</div>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Monthly plan
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>$4.99</span>
                                <span style={{ color: '#64748b', marginBottom: '6px' }}>/month</span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Cancel anytime</div>
                        </>
                    )}
                </div>
            )}

            {/* Feature comparison */}
            <div style={{ background: '#13142a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Free</div>
                    <div style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>Premium</div>
                </div>
                {FEATURES.map((f, i) => (
                    <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        borderBottom: i < FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                        <div style={{ padding: '13px 16px', fontSize: '0.85rem', color: f.free ? '#94a3b8' : '#334155' }}>
                            {f.free ?? '—'}
                        </div>
                        <div style={{ padding: '13px 16px', fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 500, borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
                            {f.icon} {f.premium}
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            {isPremium ? (
                <div>
                    <div style={{
                        padding: '16px', textAlign: 'center',
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: '14px', marginBottom: '12px',
                        color: '#4ade80', fontWeight: 700,
                    }}>
                        Premium active
                    </div>
                    <button
                        onClick={handlePortal}
                        disabled={loading}
                        style={{
                            display: 'block', width: '100%', padding: '14px',
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '14px', color: '#64748b',
                            fontFamily: 'inherit', fontSize: '0.9rem', cursor: 'pointer',
                        }}
                    >
                        {loading ? 'Opening...' : 'Manage subscription'}
                    </button>
                </div>
            ) : (
                <>
                    <SignedIn>
                        <button
                            onClick={handleUpgrade}
                            disabled={loading}
                            style={{
                                display: 'block', width: '100%', padding: '18px',
                                background: loading ? '#4c1d95' : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                                border: 'none', borderRadius: '14px',
                                color: 'white', fontFamily: 'inherit',
                                fontSize: '1.05rem', fontWeight: 800,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                                marginBottom: '12px',
                            }}
                        >
                            {loading ? 'Redirecting...' : 'Upgrade to Premium →'}
                        </button>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal" afterSignInUrl="/upgrade">
                            <button style={{
                                display: 'block', width: '100%', padding: '18px',
                                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                                border: 'none', borderRadius: '14px',
                                color: 'white', fontFamily: 'inherit',
                                fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer',
                                boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                                marginBottom: '12px',
                            }}>
                                Sign in to Upgrade →
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#475569', margin: 0 }}>
                        Secure payment via Stripe · Cancel anytime
                    </p>
                </>
            )}
        </div>
    )
}
