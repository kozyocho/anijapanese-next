import Link from 'next/link'

export const metadata = { title: 'Terms of Service — AniJapanese' }

export default function TermsPage() {
    return (
        <div style={{ minHeight: '100dvh', maxWidth: '680px', margin: '0 auto', padding: '40px 24px 64px', color: '#FFFFFF' }}>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'rgba(235,235,245,0.45)', textDecoration: 'none' }}>← Back</Link>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '32px 0 4px' }}>Terms of Service</h1>
            <p style={{ color: 'rgba(235,235,245,0.45)', fontSize: '0.85rem', marginBottom: '40px' }}>Last updated: July 3, 2026</p>

            <Section title="1. Acceptance of Terms">
                By accessing or using AniJapanese ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
            </Section>

            <Section title="2. Description of Service">
                AniJapanese is a web-based Japanese vocabulary learning application that uses spaced repetition (SRS) to help users memorize anime-related vocabulary. Access to the full Service requires a one-time payment for lifetime access.
            </Section>

            <Section title="3. Eligibility">
                You must be at least 13 years old to use the Service. By using the Service, you represent that you meet this requirement.
            </Section>

            <Section title="4. Payment and Access">
                <b>One-time payment:</b> Access to the full Service is granted upon a single, non-recurring payment. There is no subscription.<br /><br />
                <b>Lifetime access:</b> Once purchased, you retain access to the Service for as long as the Service is operational.<br /><br />
                <b>No refunds:</b> Due to the digital nature of the Service, all sales are final and non-refundable. If you experience a technical issue, please contact us and we will do our best to resolve it.
            </Section>

            <Section title="5. User Accounts">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
            </Section>

            <Section title="6. Acceptable Use">
                You agree not to:
                <ul style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: 2, color: 'rgba(235,235,245,0.6)' }}>
                    <li>Share your account with others</li>
                    <li>Attempt to reverse engineer or copy the Service</li>
                    <li>Use the Service for any unlawful purpose</li>
                    <li>Interfere with or disrupt the Service</li>
                </ul>
            </Section>

            <Section title="7. Intellectual Property">
                All content, design, and code within AniJapanese are owned by the operator. You may not reproduce or distribute any part of the Service without permission. Vocabulary content is compiled for educational purposes.
            </Section>

            <Section title="8. Disclaimer of Warranties">
                The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or that it will meet your specific requirements.
            </Section>

            <Section title="9. Limitation of Liability">
                To the fullest extent permitted by law, the operator shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
            </Section>

            <Section title="10. Service Availability">
                We reserve the right to modify, suspend, or discontinue the Service at any time. In the event of permanent discontinuation, we will make reasonable efforts to notify users in advance.
            </Section>

            <Section title="11. Changes to Terms">
                We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </Section>

            <Section title="12. Governing Law">
                These Terms are governed by the laws of Japan, without regard to its conflict of law provisions.
            </Section>

            <Section title="13. Contact">
                For questions about these Terms:<br />
                <a href="mailto:osumomomo8110@gmail.com" style={{ color: '#409CFF' }}>osumomomo8110@gmail.com</a>
            </Section>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 10px', color: '#FFFFFF' }}>{title}</h2>
            <p style={{ color: 'rgba(235,235,245,0.6)', lineHeight: 1.8, margin: 0, fontSize: '0.92rem' }}>{children}</p>
        </div>
    )
}
