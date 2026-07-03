'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface GuestContextValue {
    guestId: string | null
    isLoading: boolean
    profile: { current_streak: number; is_guest: boolean } | null
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
    const [guestId, setGuestId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<GuestContextValue['profile']>(null)

    const refreshProfile = useCallback(async () => {
        const id = localStorage.getItem('anijp_guest_id')
        if (!id) return

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id ?? id

        const res = await fetch(`/api/profile?userId=${userId}`)
        const { profile } = await res.json()
        if (profile) setProfile(profile)
    }, [])

    useEffect(() => {
        async function initGuest() {
            const supabase = createClient()

            // Check if logged in
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setGuestId(user.id)
                await refreshProfile()
                setIsLoading(false)
                return
            }

            // Guest mode: get or create UUID
            let id = localStorage.getItem('anijp_guest_id')
            if (!id) {
                id = crypto.randomUUID()
                localStorage.setItem('anijp_guest_id', id)

                // Create guest profile in DB
                try {
                    const res = await fetch('/api/guest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ guestId: id }),
                    })
                    if (!res.ok) console.error('Guest profile creation failed')
                } catch (e) {
                    console.error('Guest init error:', e)
                }
            }

            setGuestId(id)
            await refreshProfile()
            setIsLoading(false)
        }

        initGuest()
    }, [refreshProfile])

    return (
        <GuestContext.Provider value={{ guestId, isLoading, profile, refreshProfile }}>
            {children}
        </GuestContext.Provider>
    )
}
