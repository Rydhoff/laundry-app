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
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function DashboardPage() {
    const [now, setNow] = useState(new Date())
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    const [incomeToday, setIncomeToday] = useState(0)
    const [totalToday, setTotalToday] = useState(0)
    const [statusCount, setStatusCount] = useState({
        proses: 0,
        siap: 0,
        selesai: 0,
    })


    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true)

            const startOfDay = new Date()
            startOfDay.setHours(0, 0, 0, 0)

            const endOfDay = new Date()
            endOfDay.setHours(23, 59, 59, 999)

            const { data, error } = await supabase
                .from('orders')
                .select('total_price, status')
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())

            console.log(data)
            if (error) {
                console.error(error)
                setLoading(false)
                return
            }

            const income = data.reduce((sum, o) => sum + o.total_price, 0)

            setIncomeToday(income)
            setTotalToday(data.length)

            setStatusCount({
                proses: data.filter((o) => o.status === 'Proses').length,
                siap: data.filter((o) => o.status === 'Siap').length,
                selesai: data.filter((o) => o.status === 'Selesai').length,
            })

            setLoading(false)
        }

        fetchDashboard()
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
                        <p className="text-4xl font-bold mt-2">
                            Rp {loading ? "" : incomeToday.toLocaleString('id-ID')}
                        </p>
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
                    value={totalToday.toString()}
                    icon={<ClipboardList size={20} />}
                    iconBg="bg-orange-100"
                    iconColor="text-orange-500"
                    isLoading={loading ? "text-white" : ""}
                />
                <StatBox
                    title="Diproses"
                    value={statusCount.proses.toString()}
                    icon={<Loader size={20} />}
                    iconBg="bg-blue-100"
                    iconColor="text-blue-500"
                    isLoading={loading ? "text-white" : ""}
                />
                <StatBox
                    title="Siap Diambil"
                    value={statusCount.siap.toString()}
                    icon={<PackageCheck size={20} />}
                    iconBg="bg-purple-100"
                    iconColor="text-purple-500"
                    isLoading={loading ? "text-white" : ""}
                />
                <StatBox
                    title="Selesai"
                    value={statusCount.selesai.toString()}
                    icon={<CheckCircle size={20} />}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                    isLoading={loading ? "text-white" : ""}
                />
            </div>

            {/* ===== TAMBAH ORDER ===== */}
            <button
                onClick={() => router.push('/dashboard/orders/new')}
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
    isLoading: string
}

function StatBox({ title, value, icon, iconBg, iconColor, isLoading }: StatBoxProps) {
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
                    <p className={`text-xl font-bold ${isLoading}`}>{value}</p>
                </div>
            </div>
        </div >
    )
}
