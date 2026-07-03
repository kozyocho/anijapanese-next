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
        <ClerkProvider
            appearance={{
                variables: {
                    colorBackground: '#13142a',
                    colorText: '#f1f5f9',
                    colorPrimary: '#7c3aed',
                    colorInputBackground: '#1e2040',
                    colorInputText: '#f1f5f9',
                },
                elements: {
                    card: { boxShadow: 'none', border: '1px solid rgba(255,255,255,0.08)' },
                    footerAction: { color: '#94a3b8' },
                },
            }}
        >
            <html lang="en" className={inter.variable}>
                <body style={{ background: '#0d0d1a', color: '#f1f5f9', minHeight: '100dvh', fontFamily: 'Inter, sans-serif' }}>
                    <GuestProvider>{children}</GuestProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}
