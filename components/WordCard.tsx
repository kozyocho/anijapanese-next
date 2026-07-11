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
                background: '#1C1C1E',
                border: '1px solid rgba(84,84,88,0.6)',
                borderRadius: '24px',
                padding: '48px 32px 40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >

            {/* Tag row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                {isReview && (
                    <span style={{
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
                        background: 'rgba(255,159,10,0.15)', border: '1px solid rgba(255,159,10,0.3)',
                        color: '#FFD60A', borderRadius: '99px', padding: '3px 10px',
                    }}>
                        REVIEW
                    </span>
                )}
                <span style={{
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
                    background: 'rgba(10,132,255,0.12)', border: '1px solid rgba(10,132,255,0.25)',
                    color: '#409CFF', borderRadius: '99px', padding: '3px 10px',
                }}>
                    {category}
                </span>
            </div>

            {/* Japanese word */}
            <div style={{
                fontSize: 'clamp(3.5rem, 10vw, 5rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: '12px',
                letterSpacing: '-0.02em',
            }}>
                {word}
            </div>

            {/* Reading */}
            <div style={{ fontSize: '1.1rem', color: 'rgba(235,235,245,0.6)', fontWeight: 500 }}>
                {reading}
            </div>
        </div>
    )
}
