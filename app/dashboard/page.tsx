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
    Info,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function DashboardPage() {
    const [now, setNow] = useState(new Date())
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [laundryName, setLaundryName] = useState<string | null>(null)
    const [activeUntil, setActiveUntil] = useState<Date | null>(null)
    const [showSubscribeModal, setShowSubscribeModal] = useState(false)
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

            // ===== 1️⃣ HARI INI =====
            const startOfDay = new Date()
            startOfDay.setHours(0, 0, 0, 0)

            const endOfDay = new Date()
            endOfDay.setHours(23, 59, 59, 999)

            const { data: todayData, error: todayError } = await supabase
                .from('orders')
                .select('total_price')
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())

            if (todayError) {
                console.error(todayError)
                setLoading(false)
                return
            }

            setIncomeToday(
                todayData.reduce((sum, o) => sum + o.total_price, 0)
            )
            setTotalToday(todayData.length)

            // ===== 2️⃣ STATUS SEMUA DATA =====
            const { data: statusData, error: statusError } = await supabase
                .from('orders')
                .select('status')

            if (statusError) {
                console.error(statusError)
                setLoading(false)
                return
            }

            setStatusCount({
                proses: statusData.filter(o => o.status === 'Proses').length,
                siap: statusData.filter(o => o.status === 'Siap').length,
                selesai: statusData.filter(o => o.status === 'Selesai').length,
            })

            setLoading(false)
        }

        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('active_until, laundry_name')
                .single()

            if (!error && data?.active_until) {
                setActiveUntil(new Date(data.active_until))
            }

            if (!error && data?.laundry_name) {
                setLaundryName(data.laundry_name)
            }
        }

        fetchProfile()
        fetchDashboard()
    }, [])

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
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

    const isSubscriptionActive =
        !!activeUntil && new Date() <= activeUntil

    const waLink = `https://wa.me/62895324443540?text=${encodeURIComponent(
        `Halo admin 👋\n\nSaya ingin memperpanjang langganan aplikasi laundry.\n\nNama Laundry: ${laundryName}\nMasa aktif sebelumnya: ${activeUntil?.toLocaleDateString('id-ID')}`
    )}`

    const daysLeft =
        activeUntil
            ? Math.ceil(
                (activeUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )
            : null


    return (
        <>
            {showSubscribeModal && (
                <div className="fixed min-h-dvh inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800">
                            🔒 Langganan Berakhir
                        </h3>

                        <p className="text-sm text-slate-600">
                            Fitur <b>Tambah Order</b> hanya tersedia untuk akun dengan langganan aktif.
                        </p>

                        {activeUntil && (
                            <p className="text-sm text-slate-500">
                                Masa aktif berakhir pada:{' '}
                                <b>{activeUntil.toLocaleDateString('id-ID')}</b>
                            </p>
                        )}

                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={() => setShowSubscribeModal(false)}
                                className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-xl"
                            >
                                Tutup
                            </button>

                            <a
                                href={waLink}
                                target="_blank"
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white! px-4 py-2 rounded-xl text-center font-semibold"
                            >
                                Perpanjang
                            </a>
                        </div>
                    </div>
                </div>
            )}

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

            {daysLeft !== null && daysLeft <= 3 && daysLeft > 0 && (
                <div className="border border-yellow-500 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl text-sm">
                    <Info size={16} className="inline text-yellow-700" /><span className="ml-2">Masa aktif tersisa {daysLeft} hari</span>
                </div>
            )}

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
                onClick={() => {
                    if (isSubscriptionActive) {
                        router.push('/dashboard/orders/new')
                    } else {
                        setShowSubscribeModal(true)
                    }
                }}
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
