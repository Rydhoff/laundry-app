'use client'

import { useState } from 'react'
import {
    Wallet,
    ClipboardList,
    Weight,
    TrendingUp,
} from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

type Period = 'today' | 'week' | 'month' | 'set'

export default function ReportPage() {
    const [period, setPeriod] = useState<Period>('week')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')


    /* ===== DUMMY DATA ===== */
    const summary = {
        revenue: 3240000,
        totalOrder: 42,
        totalWeight: 128,
        avgPerDay: 6,
    }

    const chartData = [
        { day: 'Mon', revenue: 420000 },
        { day: 'Tue', revenue: 380000 },
        { day: 'Wed', revenue: 510000 },
        { day: 'Thu', revenue: 450000 },
        { day: 'Fri', revenue: 620000 },
        { day: 'Sat', revenue: 700000 },
        { day: 'Sun', revenue: 560000 },
    ]

    const statusBreakdown = [
        { label: 'Proses', value: 8, color: 'bg-yellow-400' },
        { label: 'Siap', value: 6, color: 'bg-blue-500' },
        { label: 'Selesai', value: 28, color: 'bg-green-500' },
    ]

    const serviceTop = [
        { name: 'Express (1 Hari)', percent: 42 },
        { name: 'Regular (3 Hari)', percent: 35 },
        { name: 'Ironing', percent: 23 },
    ]

    return (
        <div className="space-y-6">
            {/* ===== PAGE HEADER ===== */}
            <div>
                <h1 className="text-xl font-bold">Laporan</h1>
                <p className="text-sm text-slate-400">
                    Ringkasan performa laundry
                </p>
            </div>

            {/* ===== PERIOD FILTER ===== */}
            <div className="space-y-3">
                <div className="flex justify-between flex-wrap">
                    {[
                        { key: 'today', label: 'Hari Ini' },
                        { key: 'week', label: 'Mingguan' },
                        { key: 'month', label: 'Bulanan' },
                        { key: 'set', label: 'Set' },
                    ].map((p) => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key as Period)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition
          ${period === p.key
                                    ? 'bg-white border border-blue-500 text-blue-500'
                                    : 'bg-white border border-slate-500 text-slate-500  hover:text-blue-500'
                                }
        `}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* ===== SET RANGE ===== */}
                {period === 'set' && (
                    <div className="flex justify-between gap-3">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-white px-3 py-2 rounded-xl border text-sm border-slate-500 text-slate-500"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-white px-3 py-2 rounded-xl border text-sm border-slate-500 text-slate-500"
                        />
                    </div>
                )}

                {period === 'month' && (
                    <div className="flex justify-between gap-3">
                        <select className="bg-white w-full px-3 py-2 rounded-xl border text-sm border-slate-500 text-slate-500">
                            <option>Januari</option>
                            <option>Februari</option>
                            <option>Maret</option>
                            {/* dst */}
                        </select>

                        <select className="bg-white w-full px-3 py-2 rounded-xl border text-sm border-slate-500 text-slate-500">
                            <option>2026</option>
                            <option>2025</option>
                        </select>
                    </div>
                )}

            </div>


            {/* ===== SUMMARY ===== */}
            <div className="grid grid-cols-2 gap-4">
                <SummaryCard
                    title="Pendapatan"
                    value={`Rp ${summary.revenue.toLocaleString('id-ID')}`}
                    icon={<Wallet size={20} />}
                    color="text-blue-500"
                    bg="bg-blue-100"
                />
                <SummaryCard
                    title="Total Order"
                    value={summary.totalOrder}
                    icon={<ClipboardList size={20} />}
                    color="text-purple-500"
                    bg="bg-purple-100"
                />
                <SummaryCard
                    title="Total Berat"
                    value={`${summary.totalWeight} kg`}
                    icon={<Weight size={20} />}
                    color="text-green-600"
                    bg="bg-green-100"
                />
                <SummaryCard
                    title="Rata-rata / Hari"
                    value={summary.avgPerDay}
                    icon={<TrendingUp size={20} />}
                    color="text-orange-500"
                    bg="bg-orange-100"
                />
            </div>

            {/* ===== REVENUE CHART ===== */}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                <p className="font-semibold">Grafik Pendapatan</p>

                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis dataKey="day" />
                            <YAxis hide />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ===== STATUS BREAKDOWN ===== */}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                <p className="font-semibold">Status Order</p>

                {statusBreakdown.map((s) => (
                    <div key={s.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>{s.label}</span>
                            <span className="font-medium">{s.value}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${s.color}`}
                                style={{ width: `${(s.value / summary.totalOrder) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== TOP SERVICES ===== */}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                <p className="font-semibold">Layanan Terlaris</p>

                {serviceTop.map((s) => (
                    <div key={s.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>{s.name}</span>
                            <span className="font-medium">{s.percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500"
                                style={{ width: `${s.percent}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ======================
   COMPONENTS
====================== */

function SummaryCard({
    title,
    value,
    icon,
    color,
    bg,
}: {
    title: string
    value: any
    icon: React.ReactNode
    color: string
    bg: string
}) {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="">
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-xl flex items-center justify-center ${bg} ${color}`}>{icon}</div>
                    <p className="text-sm text-slate-400">{title}</p>
                </div>
                <div className="w-full text-center">
                    <p className="font-bold p-1">{value}</p>
                </div>
            </div>
        </div>
    )
}
