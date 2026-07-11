'use client'

interface Props {
    isCorrect: boolean
    word: string
    reading: string
    correctAnswer: string
    onNext: () => void
}

const CORRECT_MSGS = [
    "Nice! You got it!",
    "Nailed it!",
    "Perfect!",
    "That's it! Keep going!",
    "You knew that one!",
]
const WRONG_MSGS = [
    "Almost! Remember this one.",
    "Not quite — it'll come back around.",
    "Close! Let it sink in.",
    "Oops! Don't worry, we'll review it.",
]

function random<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)] }

export function FeedbackOverlay({ isCorrect, word, reading, correctAnswer, onNext }: Props) {
    const msg = isCorrect ? random(CORRECT_MSGS) : random(WRONG_MSGS)
    const accent = isCorrect ? '#30D158' : '#FF453A'
    const bg = isCorrect ? '#071f18' : '#1f0707'

    return (
        <>
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
            `}</style>
            <div
                style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    background: bg,
                    borderTop: `2px solid ${accent}`,
                    padding: '20px 20px 40px',
                    animation: 'slide-up 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
                }}
                onClick={onNext}
            >
                <div style={{ width: '100%', maxWidth: '480px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: accent, marginBottom: '8px' }}>
                        {msg}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'rgba(235,235,245,0.45)', marginBottom: '16px' }}>
                        <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{word}</span>
                        {reading && <span style={{ color: 'rgba(235,235,245,0.3)' }}> ({reading})</span>}
                        {' '}means{' '}
                        <span style={{ color: accent, fontWeight: 700 }}>{correctAnswer}</span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onNext() }}
                        style={{
                            background: accent,
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '13px 32px',
                            fontFamily: 'inherit',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            width: '100%',
                        }}
                    >
                        Continue
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(235,235,245,0.3)', marginTop: '8px', marginBottom: 0 }}>
                        or press Space / Enter
                    </p>
                </div>
            </div>
        </>
    )
}
