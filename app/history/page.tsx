'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGuest } from '@/lib/GuestProvider'
import { LoadingScreen } from '@/components/LoadingScreen'

interface DayData {
    date: string
    questions: number
    duration_seconds: number
    words_learned: number
}

interface HistoryData {
    days: DayData[]
    totals: {
        total_words_learned: number
        current_streak: number
        longest_streak: number
        total_duration_seconds: number
    }
}

function formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    const remainMins = mins % 60
    return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`
}

function lastNDays(n: number): string[] {
    const dates: string[] = []
    const today = new Date()
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        dates.push(d.toISOString().split('T')[0])
    }
    return dates
}

function heatColor(questions: number): string {
    if (questions === 0) return 'rgba(255,255,255,0.06)'
    if (questions < 5) return 'rgba(124,58,237,0.3)'
    if (questions < 15) return 'rgba(124,58,237,0.6)'
    return '#7c3aed'
}

const TODAY = new Date().toISOString().split('T')[0]

export default function HistoryPage() {
    const { guestId } = useGuest()
    const router = useRouter()
    const [data, setData] = useState<HistoryData | null>(null)

    useEffect(() => {
        if (!guestId) return
        fetch(`/api/history?userId=${guestId}`)
            .then(r => r.json())
            .then(setData)
    }, [guestId])

    if (!data) {
        return <LoadingScreen />
    }

    const { days, totals } = data
    const activityMap = Object.fromEntries(days.map(d => [d.date, d]))

    // Calendar heatmap: last 84 days padded to start on Sunday
    const heatDates = lastNDays(84)
    const firstDow = new Date(heatDates[0]).getDay()
    const padded: (string | null)[] = [...Array(firstDow).fill(null), ...heatDates]
    const weeks: (string | null)[][] = []
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7))

    // Bar chart: last 14 days
    const barDates = lastNDays(14)
    const maxQ = Math.max(...barDates.map(d => activityMap[d]?.questions || 0), 1)

    // This week
    const weekDates = lastNDays(7)
    const weekTotals = weekDates.reduce(
        (acc, d) => {
            const day = activityMap[d]
            return day
                ? { questions: acc.questions + day.questions, duration: acc.duration + day.duration_seconds, words: acc.words + day.words_learned }
                : acc
        },
        { questions: 0, duration: 0, words: 0 }
    )

    return (
        <div style={{ minHeight: '100dvh', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ padding: '20px 20px 0', maxWidth: '480px', margin: '0 auto' }}>
                <button
                    onClick={() => router.push('/')}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem', padding: 0, marginBottom: '16px' }}
                >
                    ← Back
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 20px', color: '#f1f5f9' }}>
                    Learning History
                </h1>
            </div>

            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <StatCard icon="📚" label="Words Learned" value={String(totals.total_words_learned)} />
                    <StatCard icon="⏱️" label="Study Time" value={formatTime(totals.total_duration_seconds)} />
                    <StatCard icon="🔥" label="Current Streak" value={`${totals.current_streak} days`} />
                    <StatCard icon="🏆" label="Best Streak" value={`${totals.longest_streak} days`} />
                </div>

                {/* Calendar heatmap */}
                <Section title="Activity (12 weeks)">
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ display: 'flex', gap: '3px', minWidth: 'fit-content' }}>
                            {/* Day labels */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginRight: '4px', paddingTop: '0' }}>
                                {['S','M','T','W','T','F','S'].map((l, i) => (
                                    <div key={i} style={{ height: '14px', fontSize: '9px', color: '#475569', lineHeight: '14px', width: '8px' }}>
                                        {i % 2 === 1 ? l : ''}
                                    </div>
                                ))}
                            </div>
                            {/* Week columns */}
                            {weeks.map((week, wi) => (
                                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    {week.map((date, di) => (
                                        <div
                                            key={di}
                                            title={date ? `${date}: ${activityMap[date]?.questions || 0} questions` : ''}
                                            style={{
                                                width: '14px', height: '14px', borderRadius: '3px',
                                                background: date ? heatColor(activityMap[date]?.questions || 0) : 'transparent',
                                                outline: date === TODAY ? '1.5px solid #a78bfa' : 'none',
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '9px', color: '#475569' }}>Less</span>
                            {[0, 3, 8, 20].map(q => (
                                <div key={q} style={{ width: '10px', height: '10px', borderRadius: '2px', background: heatColor(q) }} />
                            ))}
                            <span style={{ fontSize: '9px', color: '#475569' }}>More</span>
                        </div>
                    </div>
                </Section>

                {/* Bar chart */}
                <Section title="Last 14 Days">
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
                        {barDates.map(date => {
                            const q = activityMap[date]?.questions || 0
                            const isToday = date === TODAY
                            const label = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 1)
                            return (
                                <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                                    <div style={{
                                        width: '100%',
                                        height: q > 0 ? `${(q / maxQ) * 68}px` : '3px',
                                        minHeight: '3px',
                                        background: isToday ? '#a78bfa' : q > 0 ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                                        borderRadius: '3px 3px 0 0',
                                        transition: 'height 0.3s ease',
                                    }} />
                                    <div style={{ fontSize: '9px', color: isToday ? '#a78bfa' : '#475569' }}>{label}</div>
                                </div>
                            )
                        })}
                    </div>
                </Section>

                {/* Weekly summary */}
                <Section title="This Week">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                        <MiniStat label="Questions" value={String(weekTotals.questions)} />
                        <MiniStat label="Words" value={String(weekTotals.words)} />
                        <MiniStat label="Time" value={formatTime(weekTotals.duration)} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {weekDates.map(date => {
                            const day = activityMap[date]
                            const isToday = date === TODAY
                            const label = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
                            return (
                                <div key={date} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '8px 12px',
                                    background: isToday ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${isToday ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)'}`,
                                    borderRadius: '10px',
                                }}>
                                    <span style={{ fontSize: '0.82rem', color: isToday ? '#a78bfa' : '#94a3b8', fontWeight: isToday ? 700 : 400 }}>
                                        {label}
                                    </span>
                                    {day ? (
                                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                            {day.questions}q · {day.words_learned}w · {formatTime(day.duration_seconds)}
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '0.78rem', color: '#334155' }}>—</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </Section>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div style={{ background: '#13142a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '18px 16px' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f1f5f9' }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{label}</div>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {title}
            </div>
            <div style={{ background: '#13142a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
                {children}
            </div>
        </div>
    )
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9' }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{label}</div>
        </div>
    )
}
