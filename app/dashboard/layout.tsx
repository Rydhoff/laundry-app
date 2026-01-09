'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, BarChart3, Settings } from 'lucide-react'
import Image from 'next/image'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname()

    const nav = [
        { href: '/dashboard', label: 'Home', icon: Home },
        { href: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
        { href: '/dashboard/report', label: 'Report', icon: BarChart3 },
        { href: '/dashboard/setting', label: 'Setting', icon: Settings },
    ]

    return (
        <div className="min-h-dvh bg-slate-100 flex justify-center">
            {/* ===== CENTER WRAPPER (SATU-SATUNYA MAX WIDTH) ===== */}
            <div className="relative w-full max-w-md sm:max-w-6xl pb-28">

                {/* ===== HEADER ===== */}
                <header
                    className="
            fixed top-0 left-1/2 -translate-x-1/2
            w-full max-w-md sm:max-w-6xl
            z-20 bg-white px-4 py-3 shadow-sm rounded-b-2xl
          "
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                            <Image
                                src="/logo/logo.png"
                                alt="Laundry App Logo"
                                width={40}
                                height={40}
                                priority
                            />
                        </div>
                        <p className="font-semibold text-lg">Laundry App</p>
                    </div>
                </header>

                {/* ===== CONTENT ===== */}
                <main className="pt-20 px-4 space-y-5">
                    {children}
                </main>

                {/* ===== BOTTOM NAV ===== */}
                <nav
                    className="
            fixed bottom-4 left-1/2 -translate-x-1/2
            w-[calc(100%-2rem)] max-w-md sm:max-w-6xl
            bg-white rounded-3xl shadow-lg h-16
            flex justify-around items-center z-20
          "
                >
                    {nav.map((item) => {
                        const active = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition
                  ${active
                                        ? 'bg-blue-50 text-blue-600 -translate-y-1'
                                        : 'text-slate-400 hover:text-blue-500'
                                    }
                `}
                            >
                                <Icon size={22} />
                                <span className="text-[11px] mt-0.5 font-medium">
                                    {item.label}
                                </span>

                                {active && (
                                    <span className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

            </div>
        </div>
    )
}
