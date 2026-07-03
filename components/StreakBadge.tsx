'use client'

interface Props {
    streak: number
}

export function StreakBadge({ streak }: Props) {
    return (
        <div
            style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '99px', padding: '6px 12px',
                fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24',
            }}
        >
            🔥 {streak}
        </div>
    )
}
