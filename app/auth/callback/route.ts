import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const adminClient = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const guestId = request.cookies.get('anijp_guest_id')?.value
        ?? searchParams.get('guest_id')

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            const authUserId = data.user.id

            // Merge guest data if a guest_id was stored
            if (guestId && guestId !== authUserId) {
                try {
                    await adminClient.rpc('merge_guest_to_user' as never, {
                        p_guest_id: guestId,
                        p_auth_id: authUserId,
                    } as never)
                } catch (mergeErr) {
                    console.error('Guest merge failed:', mergeErr)
                }
            }

            return NextResponse.redirect(`${origin}/`)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
}
