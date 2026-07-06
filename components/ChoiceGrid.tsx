'use client'

interface Props {
    choices: string[]
    correctAnswer: string
    selected: string | null
    onSelect: (choice: string) => void
}

export function ChoiceGrid({ choices, correctAnswer, selected, onSelect }: Props) {
    function getBg(choice: string) {
        if (!selected) return 'rgba(26,27,53,0.8)'
        if (choice === correctAnswer) return 'rgba(16,185,129,0.2)'
        if (choice === selected && choice !== correctAnswer) return 'rgba(239,68,68,0.2)'
        return 'rgba(26,27,53,0.5)'
    }

    function getBorder(choice: string) {
        if (!selected) return '1.5px solid rgba(255,255,255,0.1)'
        if (choice === correctAnswer) return '1.5px solid #10b981'
        if (choice === selected && choice !== correctAnswer) return '1.5px solid #ef4444'
        return '1.5px solid rgba(255,255,255,0.05)'
    }

    function getColor(choice: string) {
        if (!selected) return '#f1f5f9'
        if (choice === correctAnswer) return '#10b981'
        if (choice === selected && choice !== correctAnswer) return '#ef4444'
        return '#475569'
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {choices.map((choice, i) => (
                <button
                    key={i}
                    onClick={() => !selected && onSelect(choice)}
                    style={{
                        padding: '18px 12px 18px 10px',
                        background: getBg(choice),
                        border: getBorder(choice),
                        borderRadius: '14px',
                        color: getColor(choice),
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: selected ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left',
                        lineHeight: 1.3,
                        minHeight: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 800,
                        color: selected ? 'transparent' : '#334155',
                        background: selected ? 'transparent' : 'rgba(255,255,255,0.05)',
                        border: selected ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '5px',
                        padding: '2px 6px',
                        flexShrink: 0,
                        minWidth: '20px',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                    }}>
                        {i + 1}
                    </span>
                    {choice}
                </button>
            ))}
        </div>
    )
}
