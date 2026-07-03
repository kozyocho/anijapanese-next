'use client'

import Link from 'next/link'
import { useSale } from '@/lib/useSale'

export function SaleBanner() {
    const { isActive, hours, minutes, seconds } = useSale()

    if (!isActive) return null

    return (
        <div style={{
            background: 'linear-gradient(135deg, #7c3aed, #db2777)',
            padding: '10px 20px',
            textAlign: 'center',
        }}>
            <Link href="/upgrade" style={{ textDecoration: 'none', color: 'white' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    WELCOME OFFER — 50% off your first month &nbsp;·&nbsp;
                </span>
                <span style={{
                    fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 800,
                    background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '6px',
                }}>
                    {hours}:{minutes}:{seconds}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}> &nbsp;left</span>
            </Link>
        </div>
    )
}
