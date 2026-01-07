'use client'

import { useEffect, useState } from 'react'
import {
    Wallet,
    ClipboardList,
    Loader,
    PackageCheck,
    CheckCircle,
    Plus,
    CalendarDays,
    Clock,
} from 'lucide-react'

export default function DashboardPage() {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date())
        }, 60000) // update tiap menit

        return () => clearInterval(timer)
    }, [])

    const time = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    })

    const date = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    return (
        <>
            {/* ===== PENDAPATAN HARI INI ===== */}
            <div className="relative overflow-hidden bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-3xl p-6">

                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-md opacity-80">Pendapatan Hari Ini</p>
                        <p className="text-4xl font-bold mt-2">Rp 450.000</p>
                    </div>

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <Wallet className="text-white" size={22} />
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -right-2 -top-6 w-20 h-20 bg-white/10 rounded-full" />
            </div>


            {/* ===== DATE & TIME ===== */}
            <div className="w-full flex justify-between items-center bg-white px-4 py-2 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={16} className="text-slate-500" />
                    <span>{date}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock size={16} className="text-slate-500" />
                    <span>{time}</span>
                </div>
            </div>



            {/* ===== STAT GRID ===== */}
            <div className="grid grid-cols-2 gap-4">
                <StatBox
                    title="Hari Ini"
                    value="12"
                    icon={<ClipboardList size={20} />}
                    iconBg="bg-orange-100"
                    iconColor="text-orange-500"
                />
                <StatBox
                    title="Diproses"
                    value="4"
                    icon={<Loader size={20} />}
                    iconBg="bg-blue-100"
                    iconColor="text-blue-500"
                />
                <StatBox
                    title="Siap Diambil"
                    value="3"
                    icon={<PackageCheck size={20} />}
                    iconBg="bg-purple-100"
                    iconColor="text-purple-500"
                />
                <StatBox
                    title="Selesai"
                    value="8"
                    icon={<CheckCircle size={20} />}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                />
            </div>

            {/* ===== TAMBAH ORDER ===== */}
            <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-md"
            >
                <Plus size={22} />
                Tambah Order Baru
            </button>
        </>
    )
}

type StatBoxProps = {
    title: string
    value: string
    icon: React.ReactNode
    iconBg: string
    iconColor: string
}

function StatBox({ title, value, icon, iconBg, iconColor }: StatBoxProps) {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}
                >
                    {icon}
                </div>

                <div>
                    <p className="text-sm text-slate-400">{title}</p>
                    <p className="text-xl font-bold">{value}</p>
                </div>
            </div>
        </div>
    )
}
