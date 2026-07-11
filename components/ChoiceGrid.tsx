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
        if (choice === correctAnswer) return 'rgba(48,209,88,0.2)'
        if (choice === selected && choice !== correctAnswer) return 'rgba(255,69,58,0.2)'
        return 'rgba(26,27,53,0.5)'
    }

    function getBorder(choice: string) {
        if (!selected) return '1.5px solid rgba(84,84,88,0.65)'
        if (choice === correctAnswer) return '1.5px solid #30D158'
        if (choice === selected && choice !== correctAnswer) return '1.5px solid #FF453A'
        return '1.5px solid rgba(84,84,88,0.4)'
    }

    function getColor(choice: string) {
        if (!selected) return '#FFFFFF'
        if (choice === correctAnswer) return '#30D158'
        if (choice === selected && choice !== correctAnswer) return '#FF453A'
        return 'rgba(235,235,245,0.3)'
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
                        fontSize: '0.65rem', fontWeight: 600,
                        color: selected ? 'transparent' : 'rgba(235,235,245,0.3)',
                        background: selected ? 'transparent' : 'rgba(84,84,88,0.4)',
                        border: selected ? 'none' : '1px solid rgba(84,84,88,0.6)',
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
