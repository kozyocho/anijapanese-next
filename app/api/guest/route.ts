import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service-role client for server-side guest creation (bypasses RLS)
const adminClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        const { guestId } = await req.json()
        if (!guestId || typeof guestId !== 'string') {
            return NextResponse.json({ error: 'Invalid guestId' }, { status: 400 })
        }

        // Upsert guest profile (idempotent — safe to call twice)
        const { error } = await adminClient
            .from('profiles')
            .upsert({ id: guestId, is_guest: true }, { onConflict: 'id' })

        if (error) {
            console.error('Guest profile create error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ ok: true, guestId })
    } catch (err) {
        console.error('Guest API error:', err)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
