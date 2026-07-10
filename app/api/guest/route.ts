import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service-role client for server-side guest creation (bypasses RLS)
const adminClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
    try {
        const { guestId } = await req.json()
        if (!guestId || typeof guestId !== 'string' || !UUID_RE.test(guestId)) {
            return NextResponse.json({ error: 'Invalid guestId' }, { status: 400 })
        }

        // Insert guest profile if missing (idempotent — existing rows untouched).
        // jlpt_level set explicitly: DB default was 0, violating CHECK (1-5) from migration 011.
        const { error } = await adminClient
            .from('profiles')
            .upsert({ id: guestId, is_guest: true, jlpt_level: 5 }, { onConflict: 'id', ignoreDuplicates: true })

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
