import Link from 'next/link'

export const metadata = { title: 'Specified Commercial Transactions Act — AniJapanese' }

const TABLE: { label: string; value: React.ReactNode }[] = [
    { label: 'Seller', value: 'Shohei Yamasaki' },
    { label: 'Address', value: 'Will be disclosed without delay upon request' },
    { label: 'Phone', value: 'Will be disclosed without delay upon request' },
    { label: 'Email', value: <a href="mailto:osumomomo8110@gmail.com" style={{ color: '#409CFF' }}>osumomomo8110@gmail.com</a> },
    { label: 'Representative', value: 'Shohei Yamasaki' },
    { label: 'Service', value: 'AniJapanese' },
    { label: 'Description', value: 'Web-based Japanese vocabulary learning app focused on anime terminology, using spaced repetition (SRS)' },
    { label: 'Price', value: 'Displayed within the service (tax included)' },
    { label: 'Payment Method', value: 'Credit card (via Stripe)' },
    { label: 'Payment Timing', value: 'Charged at the time of purchase' },
    { label: 'Delivery', value: 'Access is granted immediately upon completion of payment' },
    { label: 'Returns & Cancellations', value: 'Due to the digital nature of the service, we do not accept returns, refunds, or cancellations after purchase. Please contact us before purchasing if you have any questions.' },
    { label: 'System Requirements', value: 'Internet connection required. Compatible with the latest versions of Chrome, Safari, Firefox, and Edge.' },
]

export default function TokushohoPage() {
    return (
        <div style={{ minHeight: '100dvh', maxWidth: '680px', margin: '0 auto', padding: '40px 24px 64px', color: '#FFFFFF' }}>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'rgba(235,235,245,0.45)', textDecoration: 'none' }}>← Back</Link>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '32px 0 4px' }}>
                Specified Commercial Transactions Act
            </h1>
            <p style={{ color: 'rgba(235,235,245,0.45)', fontSize: '0.85rem', marginBottom: '40px' }}>
                Disclosure pursuant to Article 11 of Japan's Act on Specified Commercial Transactions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {TABLE.map((row, i) => (
                    <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '160px 1fr',
                        borderTop: '1px solid rgba(84,84,88,0.5)',
                        ...(i === TABLE.length - 1 ? { borderBottom: '1px solid rgba(84,84,88,0.5)' } : {}),
                    }}>
                        <div style={{
                            padding: '14px 16px',
                            fontSize: '0.82rem', fontWeight: 700, color: 'rgba(235,235,245,0.45)',
                            background: 'rgba(255,255,255,0.02)',
                        }}>
                            {row.label}
                        </div>
                        <div style={{
                            padding: '14px 16px',
                            fontSize: '0.88rem', color: 'rgba(235,235,245,0.6)', lineHeight: 1.7,
                        }}>
                            {row.value}
                        </div>
                    </div>
                ))}
            </div>

            <p style={{ marginTop: '32px', fontSize: '0.8rem', color: 'rgba(235,235,245,0.3)', lineHeight: 1.8 }}>
                * Address and phone number will be disclosed without delay upon request from consumers.<br />
                * Please contact us by email for any inquiries.
            </p>
        </div>
    )
}
