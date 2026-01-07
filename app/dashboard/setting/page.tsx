'use client'

import { LogOut } from 'lucide-react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SettingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleLogout = async () => {
        setLoading(true)

        await supabase.auth.signOut()

        router.replace('/login')
    }

    return (
        <div className="space-y-5">
            {/* ===== PAGE HEADER ===== */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Pengaturan</h1>
            </div>

            {/* ===== LOGOUT BUTTON ===== */}
            <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-sm text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm"
            >
                <LogOut size={18} />
                {loading ? 'Logging out...' : 'Logout'}
            </button>
        </div>
    )
}
