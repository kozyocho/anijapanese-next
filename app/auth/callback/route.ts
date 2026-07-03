import { NextResponse } from 'next/server'

// Auth callback is now handled by Clerk
export async function GET() {
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'))
}
