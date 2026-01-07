import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
    let response = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: any) {
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // 🔒 protect dashboard
    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // 🚀 prevent logged-in user accessing login
    if (session && req.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return response
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
}
