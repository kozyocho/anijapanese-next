'use client'

import { SignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()

    return (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎌</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '6px' }}>
                    Save your progress
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Your streak won&apos;t be lost
                </div>
            </div>

            <SignIn
                routing="hash"
                afterSignInUrl="/"
                afterSignUpUrl="/"
            />

            <button
                onClick={() => router.push('/')}
                style={{
                    marginTop: '20px',
                    padding: '12px 20px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                }}
            >
                Continue as guest
            </button>
        </div>
    )
}
