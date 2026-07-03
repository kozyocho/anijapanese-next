'use client'

import { useEffect, useState } from 'react'

const SALE_DURATION_MS = 24 * 60 * 60 * 1000
const STORAGE_KEY = 'anijp_first_visit'

export function useSale() {
    const [timeLeft, setTimeLeft] = useState<number | null>(null)

    useEffect(() => {
        let firstVisit = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0')
        if (!firstVisit) {
            firstVisit = Date.now()
            localStorage.setItem(STORAGE_KEY, String(firstVisit))
        }
        const expiry = firstVisit + SALE_DURATION_MS

        const tick = () => setTimeLeft(Math.max(0, expiry - Date.now()))
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [])

    const isActive = timeLeft !== null && timeLeft > 0
    const h = isActive ? Math.floor(timeLeft! / 3_600_000) : 0
    const m = isActive ? Math.floor((timeLeft! % 3_600_000) / 60_000) : 0
    const s = isActive ? Math.floor((timeLeft! % 60_000) / 1000) : 0

    return {
        isActive,
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
    }
}
