'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useGuest } from '@/lib/GuestProvider'
import { StreakBadge } from '@/components/StreakBadge'

interface DashboardData {
    reviewCount: number
    newWordCount: number
}

export default function HomePage() {
    const { guestId, isLoading, profile } = useGuest()
    const [data, setData] = useState<DashboardData | null>(null)

    useEffect(() => {
        if (!guestId) return
        fetch(`/api/session?userId=${guestId}&new=10`)
            .then(r => r.json())
            .then(({ items }) => {
                if (!items) return
                const reviewCount = items.filter((i: { isReview: boolean }) => i.isReview).length
                const newWordCount = items.filter((i: { isReview: boolean }) => !i.isReview).length
                setData({ reviewCount, newWordCount })
            })
    }, [guestId])

    if (isLoading) {
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⟳</div>
                    <div style={{ color: '#64748b' }}>Loading...</div>
                </div>
            </div>
        )
    }

    const streak = profile?.current_streak ?? 0
    const totalCards = (data?.reviewCount ?? 0) + (data?.newWordCount ?? 0)

    return (
        <div style={{ minHeight: '100dvh', paddingBottom: '32px' }}>
            {/* Header */}
            <div style={{
                padding: '24px 20px 16px',
                maxWidth: '480px', margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                        <span style={{
                            background: 'linear-gradient(135deg,#a78bfa,#fbbf24)',
                            WebkitBackgroundClip: 'text', backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>AniJapanese</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        Understand anime in Japanese 🎌
                    </div>
                </div>
                <StreakBadge streak={streak} />
            </div>

            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>
                {/* Hero */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(245,158,11,0.08))',
                    border: '1px solid rgba(124,58,237,0.2)',
                    borderRadius: '20px',
                    padding: '28px 24px',
                    marginBottom: '16px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
                        {totalCards > 0 ? '⚡' : '🎉'}
                    </div>
                    {totalCards > 0 ? (
                        <>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
                                {totalCards} cards ready
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
                                {data?.reviewCount ? `${data.reviewCount} reviews` : 'No reviews'}{' '}
                                · {data?.newWordCount ? `${data.newWordCount} new words` : 'No new words'}
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
                                All caught up! 🌸
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
                                Come back tomorrow for more reviews
                            </div>
                        </>
                    )}
                    {totalCards > 0 && (
                        <Link href="/session"
                            style={{
                                display: 'block', padding: '16px',
                                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                                borderRadius: '14px', color: 'white',
                                fontWeight: 800, fontSize: '1.05rem',
                                textDecoration: 'none', textAlign: 'center',
                                boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                            }}
                        >
                            Start Session →
                        </Link>
                    )}
                </div>

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <StatCard icon="📖" label="Due Reviews" value={data?.reviewCount ?? 0} color="#f59e0b" />
                    <StatCard icon="✨" label="New Words" value={data?.newWordCount ?? 0} color="#7c3aed" />
                    <StatCard icon="🔥" label="Day Streak" value={streak} color="#ef4444" />
                </div>

                {/* Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link href="/history" style={linkStyle}>
                        📊 Learning history
                    </Link>
                    <Link href="/onboarding" style={linkStyle}>
                        ⚙️ Learning settings
                    </Link>
                    <Link href="/login" style={linkStyle}>
                        🔑 Sign in to save progress
                    </Link>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
    return (
        <div style={{
            background: '#13142a', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', padding: '18px 16px',
        }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{label}</div>
        </div>
    )
}

const linkStyle: React.CSSProperties = {
    display: 'block', padding: '14px 18px',
    background: '#13142a', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px', color: '#94a3b8',
    fontWeight: 600, fontSize: '0.9rem',
    textDecoration: 'none',
}
