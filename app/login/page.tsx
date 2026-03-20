'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleEmailLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        setLoading(false)
        if (error) { setError(error.message); return }
        setSent(true)
    }

    async function handleGoogle() {
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
    }

    if (sent) {
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📬</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Check your inbox</div>
                    <div style={{ color: '#94a3b8', marginBottom: '24px' }}>
                        We sent a magic link to <strong style={{ color: '#f1f5f9' }}>{email}</strong>
                    </div>
                    <button onClick={() => setSent(false)} style={ghostBtnStyle}>
                        Try a different email
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ maxWidth: '400px', width: '100%' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎌</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '6px' }}>
                        Save your progress
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        Your streak and XP won't be lost
                    </div>
                </div>

                {/* Google */}
                <button onClick={handleGoogle} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    padding: '14px', marginBottom: '16px',
                    background: '#fff', color: '#111',
                    border: 'none', borderRadius: '12px',
                    fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 700,
                    cursor: 'pointer',
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
                    color: '#64748b', fontSize: '0.8rem',
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                    or
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                </div>

                {/* Email magic link */}
                <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{
                            padding: '14px 16px',
                            background: '#13142a', border: '1.5px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px', color: '#f1f5f9',
                            fontFamily: 'inherit', fontSize: '1rem',
                            outline: 'none',
                        }}
                    />
                    {error && <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}
                    <button type="submit" disabled={loading} style={{
                        padding: '14px',
                        background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                        border: 'none', borderRadius: '12px',
                        color: 'white', fontFamily: 'inherit',
                        fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                    }}>
                        {loading ? 'Sending...' : 'Send Magic Link'}
                    </button>
                </form>

                <button onClick={() => router.push('/')} style={{ ...ghostBtnStyle, width: '100%', marginTop: '16px' }}>
                    Continue as guest
                </button>
            </div>
        </div>
    )
}

const ghostBtnStyle: React.CSSProperties = {
    padding: '12px 20px', background: 'none', border: 'none',
    color: '#64748b', fontFamily: 'inherit', fontSize: '0.9rem',
    cursor: 'pointer', textDecoration: 'underline',
}
