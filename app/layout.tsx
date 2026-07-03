import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { GuestProvider } from '@/lib/GuestProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
    title: 'AniJapanese — Learn Japanese Through Anime',
    description: 'Master anime vocabulary with spaced repetition. No textbooks, just words you\'ll actually hear.',
    keywords: ['japanese', 'anime', 'vocabulary', 'SRS', 'learning'],
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0d0d1a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
            <body style={{ background: '#0d0d1a', color: '#f1f5f9', minHeight: '100dvh', fontFamily: 'Inter, sans-serif' }}>
                <ClerkProvider
                    appearance={{
                        variables: {
                            colorBackground: '#13142a',
                            colorText: '#f1f5f9',
                            colorTextSecondary: '#94a3b8',
                            colorPrimary: '#7c3aed',
                            colorInputBackground: '#1e2040',
                            colorInputText: '#f1f5f9',
                            colorNeutral: '#f1f5f9',
                        },
                        elements: {
                            card: { boxShadow: 'none', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#13142a' },
                            headerTitle: { color: '#f1f5f9' },
                            headerSubtitle: { color: '#94a3b8' },
                            socialButtonsBlockButton: {
                                backgroundColor: '#1e2040',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: '#f1f5f9',
                            },
                            socialButtonsBlockButtonText: { color: '#f1f5f9' },
                            // Apple logo is black by default — invert to white
                            socialButtonsProviderIcon__apple: { filter: 'invert(1)' },
                            formFieldLabel: { color: '#94a3b8' },
                            formFieldInput: { backgroundColor: '#1e2040', color: '#f1f5f9', borderColor: 'rgba(255,255,255,0.12)' },
                            dividerLine: { backgroundColor: 'rgba(255,255,255,0.08)' },
                            dividerText: { color: '#64748b' },
                            footerActionLink: { color: '#a78bfa' },
                            footerActionText: { color: '#64748b' },
                            identityPreviewText: { color: '#f1f5f9' },
                            identityPreviewEditButton: { color: '#a78bfa' },
                        },
                    }}
                >
                    <GuestProvider>{children}</GuestProvider>
                </ClerkProvider>
            </body>
        </html>
    )
}
