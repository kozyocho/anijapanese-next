'use client'

interface Props {
    word: string
    reading: string
    category: string
    isReview: boolean
}

export function WordCard({ word, reading, category, isReview }: Props) {
    return (
        <div
            style={{
                background: 'linear-gradient(160deg, #13142a, #1a1b35)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '48px 32px 40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background glow */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: '200px', height: '200px',
                background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Tag row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                {isReview && (
                    <span style={{
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
                        background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                        color: '#fbbf24', borderRadius: '99px', padding: '3px 10px',
                    }}>
                        REVIEW
                    </span>
                )}
                <span style={{
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
                    background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
                    color: '#a78bfa', borderRadius: '99px', padding: '3px 10px',
                }}>
                    {category}
                </span>
            </div>

            {/* Japanese word */}
            <div style={{
                fontSize: 'clamp(3.5rem, 10vw, 5rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: '12px',
                letterSpacing: '-0.02em',
            }}>
                {word}
            </div>

            {/* Reading */}
            <div style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 500 }}>
                {reading}
            </div>
        </div>
    )
}
