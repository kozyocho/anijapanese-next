import Link from 'next/link'

export const metadata = { title: '特定商取引法に基づく表記 — AniJapanese' }

const TABLE: { label: string; value: React.ReactNode }[] = [
    { label: '販売業者', value: '山崎将平' },
    { label: '所在地', value: '請求があった場合は遅滞なく開示します' },
    { label: '電話番号', value: '請求があった場合は遅滞なく開示します' },
    { label: 'メールアドレス', value: <a href="mailto:osumomomo8110@gmail.com" style={{ color: '#a78bfa' }}>osumomomo8110@gmail.com</a> },
    { label: '運営統括責任者', value: '山崎将平' },
    { label: 'サービス名', value: 'AniJapanese' },
    { label: 'サービス内容', value: 'アニメ語彙に特化した日本語学習Webアプリ（スペース反復学習方式）' },
    { label: '販売価格', value: '$19.99（買い切り・税込）' },
    { label: '支払い方法', value: 'クレジットカード（Stripe社の決済システムを使用）' },
    { label: '支払い時期', value: 'ご注文時にお支払いいただきます' },
    { label: 'サービス提供時期', value: '決済完了後、即時にご利用いただけます' },
    { label: '返品・キャンセル', value: 'デジタルコンテンツの性質上、購入後の返品・返金・キャンセルはお受けできません。ご不明な点はご購入前にお問い合わせください。' },
    { label: '動作環境', value: 'インターネット接続環境が必要です。モダンブラウザ（Chrome / Safari / Firefox / Edge 最新版）に対応しています。' },
]

export default function TokushohoPage() {
    return (
        <div style={{ minHeight: '100dvh', maxWidth: '680px', margin: '0 auto', padding: '40px 24px 64px', color: '#f1f5f9' }}>
            <Link href="/" style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'none' }}>← Back</Link>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '32px 0 4px' }}>
                特定商取引法に基づく表記
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '40px' }}>
                特定商取引に関する法律第11条に基づき、以下の事項を表示します。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {TABLE.map((row, i) => (
                    <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '160px 1fr',
                        borderTop: '1px solid rgba(255,255,255,0.07)',
                        ...(i === TABLE.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.07)' } : {}),
                    }}>
                        <div style={{
                            padding: '14px 16px',
                            fontSize: '0.82rem', fontWeight: 700, color: '#64748b',
                            background: 'rgba(255,255,255,0.02)',
                        }}>
                            {row.label}
                        </div>
                        <div style={{
                            padding: '14px 16px',
                            fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.7,
                        }}>
                            {row.value}
                        </div>
                    </div>
                ))}
            </div>

            <p style={{ marginTop: '32px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.8 }}>
                ※ 所在地・電話番号については、消費者からの請求があった場合は遅滞なく開示いたします。<br />
                ※ お問い合わせはメールにてお受けしております。
            </p>
        </div>
    )
}
