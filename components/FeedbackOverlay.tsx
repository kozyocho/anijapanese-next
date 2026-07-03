'use client'

interface Props {
    isCorrect: boolean
    word: string
    correctAnswer: string
    onNext: () => void
}

const CORRECT_MSGS = [
    "Nice! You got it! 🎉",
    "Nailed it! ⚡",
    "Perfect! 🌟",
    "That's it! Keep going! 🔥",
    "You knew that one! ✨",
]
const WRONG_MSGS = [
    "Almost! Remember this one.",
    "Not quite — it'll come back around.",
    "Close! Let it sink in. 💪",
    "Oops! Don't worry, we'll review it.",
]

function random<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)] }

export function FeedbackOverlay({ isCorrect, word, correctAnswer, onNext }: Props) {
    const msg = isCorrect ? random(CORRECT_MSGS) : random(WRONG_MSGS)

    return (
        <div
            style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: isCorrect ? '#0a2e22' : '#2e0a0a',
                borderTop: `2px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                padding: '20px 20px 40px',
            }}
            onClick={onNext}
        >
            <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: isCorrect ? '#10b981' : '#ef4444' }}>
                    {msg}
                </div>
                {!isCorrect && (
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '16px' }}>
                        <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{word}</span> means{' '}
                        <span style={{ color: '#10b981', fontWeight: 700 }}>{correctAnswer}</span>
                    </div>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onNext() }}
                    style={{
                        marginTop: '4px',
                        background: isCorrect ? '#10b981' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 32px',
                        fontFamily: 'inherit',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        width: '100%',
                    }}
                >
                    Next →
                </button>
            </div>
        </div>
    )
}
