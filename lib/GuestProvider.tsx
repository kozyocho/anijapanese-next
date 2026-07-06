'use client'

import { useUser } from '@clerk/nextjs'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface GuestContextValue {
    guestId: string | null
    isLoading: boolean
    profile: { current_streak: number; is_guest: boolean; is_premium: boolean; plan_type: string } | null
    refreshProfile: () => Promise<void>
}

const GuestContext = createContext<GuestContextValue>({
    guestId: null,
    isLoading: true,
    profile: null,
    refreshProfile: async () => { },
})

export function useGuest() {
    return useContext(GuestContext)
}

export function GuestProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded, isSignedIn } = useUser()
    const [guestId, setGuestId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<GuestContextValue['profile']>(null)

    const refreshProfile = useCallback(async () => {
        const id = isSignedIn ? user?.id : (typeof window !== 'undefined' ? localStorage.getItem('anijp_guest_id') : null)
        if (!id) return
        const res = await fetch(`/api/profile?userId=${id}`)
        const { profile } = await res.json()
        if (profile) setProfile(profile)
    }, [isSignedIn, user?.id])

    useEffect(() => {
        if (!isLoaded) return

        async function init() {
            if (isSignedIn && user) {
                setGuestId(user.id)
                // Ensure profile exists in DB for this Clerk user
                await fetch('/api/user/init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id }),
                })
                await refreshProfile()
                setIsLoading(false)
                return
            }

            // Guest mode: get or create UUID
            let id = localStorage.getItem('anijp_guest_id')
            if (!id) {
                id = typeof crypto.randomUUID === 'function'
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
                localStorage.setItem('anijp_guest_id', id)

                try {
                    await fetch('/api/guest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ guestId: id }),
                    })
                } catch (e) {
                    console.error('Guest init error:', e)
                }
            }

            setGuestId(id)
            await refreshProfile()
            setIsLoading(false)
        }

        init()
    }, [isLoaded, isSignedIn, user?.id, refreshProfile])

    return (
        <GuestContext.Provider value={{ guestId, isLoading, profile, refreshProfile }}>
            {children}
        </GuestContext.Provider>
    )
}
