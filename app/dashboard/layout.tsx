'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, BarChart3, Settings, WashingMachine } from 'lucide-react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname()

    const nav = [
        { href: '/dashboard', label: 'Home', icon: Home },
        { href: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
        { href: '/dashboard/report', label: 'Report', icon: BarChart3 },
        { href: '/dashboard/setting', label: 'Setting', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-slate-100 pb-28">
            {/* ===== HEADER ===== */}
            <header className="bg-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                        <WashingMachine className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-lg">Laundry App</p>
                    </div>
                </div>
            </header>

            {/* ===== CONTENT ===== */}
            <main className="p-4 space-y-5">
                {children}
            </main>

            {/* ===== BOTTOM NAV ===== */}
            <nav className="fixed bottom-4 left-4 right-4 bg-white rounded-3xl shadow-lg h-18 flex justify-around items-center">
                {nav.map((item) => {
                    const active = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200
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

                            {/* indicator dot */}
                            {active && (
                                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            )}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
