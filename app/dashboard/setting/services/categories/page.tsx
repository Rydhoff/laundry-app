'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'

type CategoryStatus = {
    kilo: boolean
    satuan: boolean
}

export default function CategoriesPage() {
    const [status, setStatus] = useState<CategoryStatus>({
        kilo: true,
        satuan: true,
    })

    const load = async () => {
        const { data } = await supabase
            .from('service_categories')
            .select('code, is_active')

        if (!data) return

        const next: CategoryStatus = {
            kilo: false,
            satuan: false,
        }

        data.forEach((row) => {
            if (row.code === 'kilo') next.kilo = row.is_active
            if (row.code === 'satuan') next.satuan = row.is_active
        })

        setStatus(next)
    }

    useEffect(() => {
        const run = async () => {
            await load()
        }
        run()
    }, [])

    const toggle = async (code: 'kilo' | 'satuan') => {
        const newValue = !status[code]

        await supabase
            .from('service_categories')
            .update({ is_active: newValue })
            .eq('code', code)

        setStatus((prev) => ({
            ...prev,
            [code]: newValue,
        }))
    }

    return (
        <div className="space-y-5">
            {/* ===== HEADER ===== */}
            <div className="space-y-1">
                <h1 className="text-xl font-bold">Kategori Layanan</h1>
                <p className="text-sm text-slate-500">
                    Aktifkan atau nonaktifkan jenis layanan
                </p>
            </div>

            {/* ===== LIST ===== */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2 relative">

                {/* === PER KILO === */}
                <div className="flex justify-between items-center bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl p-4 transition">
                    <div>
                        <p className="font-semibold text-slate-800">
                            Per Kilo
                        </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={status.kilo}
                            onChange={() => toggle('kilo')}
                        />
                        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-blue-500 transition" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition" />
                    </label>
                </div>

                {/* === SATUAN === */}
                <div className="flex justify-between items-center bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl p-4 transition">
                    <div>
                        <p className="font-semibold text-slate-800">
                            Satuan
                        </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={status.satuan}
                            onChange={() => toggle('satuan')}
                        />
                        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-blue-500 transition" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition" />
                    </label>
                </div>
            </div>
        </div>
    )
}
