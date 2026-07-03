import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — AniJapanese' }

export default function PrivacyPage() {
    return (
        <div style={{ minHeight: '100dvh', maxWidth: '680px', margin: '0 auto', padding: '40px 24px 64px', color: '#f1f5f9' }}>
            <Link href="/" style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'none' }}>← Back</Link>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '32px 0 4px' }}>Privacy Policy</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '40px' }}>Last updated: July 3, 2026</p>

            <Section title="1. Overview">
                AniJapanese ("we", "us", or "our") is operated by an individual developer based in Japan. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
            </Section>

            <Section title="2. Information We Collect">
                <b>Account information:</b> When you sign in, we collect your email address and account identifiers via Clerk (our authentication provider).<br /><br />
                <b>Payment information:</b> Payments are processed by Stripe. We never store your credit card number or payment details on our servers. Stripe may retain payment data in accordance with their own privacy policy.<br /><br />
                <b>Usage data:</b> We store your learning progress (words studied, SRS intervals, streak counts) in our database (Supabase) to provide the core service.<br /><br />
                <b>Technical data:</b> Standard server logs may include IP addresses and browser information, retained only for security and debugging purposes.
            </Section>

            <Section title="3. How We Use Your Information">
                We use the information we collect to:
                <ul style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: 2, color: '#94a3b8' }}>
                    <li>Provide and maintain the AniJapanese learning service</li>
                    <li>Track your learning progress and streaks</li>
                    <li>Process payments and verify access</li>
                    <li>Respond to support inquiries</li>
                    <li>Improve the service</li>
                </ul>
                We do not sell your personal data to third parties.
            </Section>

            <Section title="4. Third-Party Services">
                We use the following third-party services, each with their own privacy policies:
                <ul style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: 2, color: '#94a3b8' }}>
                    <li><b style={{ color: '#f1f5f9' }}>Clerk</b> (clerk.com) — Authentication and account management</li>
                    <li><b style={{ color: '#f1f5f9' }}>Stripe</b> (stripe.com) — Payment processing</li>
                    <li><b style={{ color: '#f1f5f9' }}>Supabase</b> (supabase.com) — Database and data storage</li>
                    <li><b style={{ color: '#f1f5f9' }}>Vercel</b> (vercel.com) — Hosting and infrastructure</li>
                </ul>
            </Section>

            <Section title="5. Data Retention">
                We retain your account and learning data for as long as your account is active. You may request deletion of your data at any time by contacting us.
            </Section>

            <Section title="6. Cookies">
                We use cookies and local storage to maintain your session and remember your preferences (such as your guest ID). These are necessary for the service to function.
            </Section>

            <Section title="7. Children's Privacy">
                AniJapanese is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.
            </Section>

            <Section title="8. Your Rights">
                Depending on your location, you may have the right to access, correct, or delete the personal data we hold about you. To exercise these rights, contact us at the email below.
            </Section>

            <Section title="9. Changes to This Policy">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.
            </Section>

            <Section title="10. Contact">
                For any privacy-related questions or data requests:<br />
                <a href="mailto:osumomomo8110@gmail.com" style={{ color: '#a78bfa' }}>osumomomo8110@gmail.com</a>
            </Section>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 10px', color: '#f1f5f9' }}>{title}</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.8, margin: 0, fontSize: '0.92rem' }}>{children}</p>
        </div>
    )
}
