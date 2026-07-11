'use client'

interface Props {
    message?: string
}

export function LoadingScreen({ message }: Props) {
    return (
        <>
            <style>{`
                @keyframes anijp-spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes anijp-fade-up {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div style={{
                minHeight: '100dvh',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '16px', color: '#FFFFFF',
                animation: 'anijp-fade-up 0.3s ease both',
            }}>
                <div style={{
                    fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg,#0A84FF,#64D2FF)',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    AniJapanese
                </div>

                {/* Spinner */}
                <div style={{
                    width: '32px', height: '32px',
                    border: '3px solid rgba(10,132,255,0.2)',
                    borderTopColor: '#0A84FF',
                    borderRadius: '50%',
                    animation: 'anijp-spin 0.75s linear infinite',
                }} />

                {message && (
                    <div style={{ color: 'rgba(235,235,245,0.45)', fontSize: '0.88rem', fontWeight: 500 }}>
                        {message}
                    </div>
                )}
            </div>
        </>
    )
}
