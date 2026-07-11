import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { GuestProvider } from '@/lib/GuestProvider'

export const metadata: Metadata = {
    title: 'AniJapanese — Learn Japanese Through Anime',
    description: 'Master anime vocabulary with spaced repetition. No textbooks, just words you\'ll actually hear.',
    keywords: ['japanese', 'anime', 'vocabulary', 'SRS', 'learning'],
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body style={{ background: '#000000', color: '#FFFFFF', minHeight: '100dvh' }}>
                <ClerkProvider
                    appearance={{
                        variables: {
                            colorBackground: '#1C1C1E',
                            colorText: '#FFFFFF',
                            colorTextSecondary: 'rgba(235,235,245,0.6)',
                            colorPrimary: '#0A84FF',
                            colorInputBackground: '#2C2C2E',
                            colorInputText: '#FFFFFF',
                            colorNeutral: '#FFFFFF',
                        },
                        elements: {
                            card: { boxShadow: 'none', border: '1px solid rgba(84,84,88,0.6)', backgroundColor: '#1C1C1E' },
                            headerTitle: { color: '#FFFFFF' },
                            headerSubtitle: { color: 'rgba(235,235,245,0.6)' },
                            socialButtonsBlockButton: {
                                backgroundColor: '#2C2C2E',
                                border: '1px solid rgba(84,84,88,0.65)',
                                color: '#FFFFFF',
                            },
                            socialButtonsBlockButtonText: { color: '#FFFFFF' },
                            // Apple logo is black by default — invert to white
                            socialButtonsProviderIcon__apple: { filter: 'invert(1)' },
                            formFieldLabel: { color: 'rgba(235,235,245,0.6)' },
                            formFieldInput: { backgroundColor: '#2C2C2E', color: '#FFFFFF', borderColor: 'rgba(84,84,88,0.65)' },
                            dividerLine: { backgroundColor: 'rgba(84,84,88,0.6)' },
                            dividerText: { color: 'rgba(235,235,245,0.45)' },
                            footerActionLink: { color: '#409CFF' },
                            footerActionText: { color: 'rgba(235,235,245,0.45)' },
                            identityPreviewText: { color: '#FFFFFF' },
                            identityPreviewEditButton: { color: '#409CFF' },
                        },
                    }}
                >
                    <GuestProvider>{children}</GuestProvider>
                </ClerkProvider>
            </body>
        </html>
    )
}
