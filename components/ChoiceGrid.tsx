'use client'

import { useState } from 'react'

interface Props {
    choices: string[]           // 4 options (shuffled, includes correct)
    correctAnswer: string
    onAnswer: (isCorrect: boolean) => void
}

export function ChoiceGrid({ choices, correctAnswer, onAnswer }: Props) {
    const [selected, setSelected] = useState<string | null>(null)

    function handleSelect(choice: string) {
        if (selected) return   // already answered
        setSelected(choice)
        onAnswer(choice === correctAnswer)
    }

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
        return '#64748b'
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
        }}>
            {choices.map((choice, i) => (
                <button
                    key={i}
                    onClick={() => handleSelect(choice)}
                    style={{
                        padding: '18px 12px',
                        background: getBg(choice),
                        border: getBorder(choice),
                        borderRadius: '14px',
                        color: getColor(choice),
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: selected ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'center',
                        lineHeight: 1.3,
                        minHeight: '64px',
                    }}
                >
                    {choice}
                </button>
            ))}
        </div>
    )
}
