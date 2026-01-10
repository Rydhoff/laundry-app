'use client'

import { useCallback, useMemo, useState } from 'react'
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
import { supabase } from '@/app/lib/supabaseClient'
import { useEffect } from 'react'

type Period = 'today' | 'week' | 'month' | 'set'
type OrderStatus = 'Proses' | 'Siap' | 'Selesai'
type Category = 'kilo' | 'satuan'

type Order = {
    id: string
    category: Category
    status: OrderStatus
    total_price: number
    weight_kg: number | null
    qty: number | null
    kilo_service_id: string | null
    satuan_item_id: string | null
    created_at: string
}

type ChartPoint = {
    day: string
    revenue: number
    orders: number
}

type StatusItem = {
    label: OrderStatus
    value: number
    color: string
}

type ServiceTopItem = {
    name: string
    percent: number
}

export default function ReportPage() {
    const [period, setPeriod] = useState<Period>('week')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [orders, setOrders] = useState<Order[]>([])
    const [selectedMonth, setSelectedMonth] = useState<number>(
        new Date().getMonth()
    )
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    )
    const [availableYears, setAvailableYears] = useState<number[]>([])
    const [availableMonths, setAvailableMonths] = useState<number[]>([])

    const months = [
        'Januari', 'Februari', 'Maret', 'April',
        'Mei', 'Juni', 'Juli', 'Agustus',
        'September', 'Oktober', 'November', 'Desember'
    ]

    const [summary, setSummary] = useState({
        revenue: 0,
        totalOrder: 0,
        totalWeight: 0,
        avgPerDay: 0,
    })

    const [chartData, setChartData] = useState<ChartPoint[]>([])
    const [statusBreakdown, setStatusBreakdown] = useState<StatusItem[]>([])
    const [serviceMap, setServiceMap] = useState<Record<string, string>>({})

    useEffect(() => {
        async function fetchAvailableYears() {
            const { data, error } = await supabase
                .from('orders')
                .select('created_at')

            if (error || !data) return

            const years = Array.from(
                new Set(
                    data.map(o => new Date(o.created_at).getFullYear())
                )
            ).sort((a, b) => b - a)

            setAvailableYears(years)

            // set default ke tahun terbaru
            if (years.length > 0) {
                setSelectedYear(years[0])
            }
        }

        fetchAvailableYears()
    }, [])

    useEffect(() => {
        async function fetchAvailableMonths() {
            if (!selectedYear) return

            const { data, error } = await supabase
                .from('orders')
                .select('created_at')
                .gte('created_at', `${selectedYear}-01-01`)
                .lte('created_at', `${selectedYear}-12-31`)

            if (error || !data) return

            const months = Array.from(
                new Set(
                    data.map(o => new Date(o.created_at).getMonth())
                )
            ).sort((a, b) => a - b)

            setAvailableMonths(months)

            // default ke bulan pertama yang ada
            if (months.length > 0) {
                setSelectedMonth(months[0])
            }
        }

        fetchAvailableMonths()
    }, [selectedYear])

    useEffect(() => {
        async function fetchServiceMap() {
            const map: Record<string, string> = {}

            const { data: kilo } = await supabase
                .from('kilo_services')
                .select('id, name')

            kilo?.forEach(s => {
                map[s.id] = s.name
            })

            const { data: satuan } = await supabase
                .from('satuan_items')
                .select('id, name')

            satuan?.forEach(s => {
                map[s.id] = s.name
            })

            setServiceMap(map)
        }

        fetchServiceMap()
    }, [])

    const serviceTop = useMemo<ServiceTopItem[]>(() => {
        if (orders.length === 0 || Object.keys(serviceMap).length === 0) return []

        const map: Record<string, number> = {}

        orders.forEach(o => {
            const key = o.kilo_service_id || o.satuan_item_id
            if (!key) return
            map[key] = (map[key] ?? 0) + 1
        })

        const total = Object.values(map).reduce((a, b) => a + b, 0)

        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([key, value]) => ({
                name: serviceMap[key] ?? 'Unknown Service',
                percent: total === 0 ? 0 : Math.round((value / total) * 100),
            }))
    }, [orders, serviceMap])

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
        })
    }

    function processSummary(orders: Order[]) {
        const revenue = orders.reduce((a, b) => a + b.total_price, 0)
        const totalOrder = orders.length
        const totalWeight = orders
            .filter(o => o.category === 'kilo')
            .reduce((a, b) => a + (b.weight_kg ?? 0), 0)

        // 🔑 hitung hari AKTIF
        const activeDays = new Set(
            orders.map(o =>
                new Date(o.created_at).toDateString()
            )
        ).size

        setSummary({
            revenue,
            totalOrder,
            totalWeight,
            avgPerDay:
                activeDays === 0
                    ? 0
                    : Math.round(totalOrder / activeDays),
        })
    }


    const processChart = useCallback((orders: Order[]) => {
        const map: Record<string, ChartPoint> = {}

        orders.forEach(o => {
            const date = formatDate(o.created_at)

            if (!map[date]) {
                map[date] = {
                    day: date,
                    revenue: 0,
                    orders: 0,
                }
            }

            map[date].revenue += o.total_price
            map[date].orders += 1
        })

        setChartData(Object.values(map))
    }, [])


    function processStatus(orders: Order[]) {
        const statuses: OrderStatus[] = ['Proses', 'Siap', 'Selesai']

        const data = statuses.map(status => ({
            label: status,
            value: orders.filter(o => o.status === status).length,
            color:
                status === 'Proses'
                    ? 'bg-yellow-400'
                    : status === 'Siap'
                        ? 'bg-blue-500'
                        : 'bg-green-500',
        }))

        setStatusBreakdown(data)
    }

    const getDateRange = useCallback((
        period: Period,
        startDate?: string,
        endDate?: string
    ) => {
        const now = new Date()
        let start: Date
        let end: Date

        if (period === 'today') {
            start = new Date(now.setHours(0, 0, 0, 0))
            end = new Date(now.setHours(23, 59, 59, 999))
        } else if (period === 'week') {
            const day = now.getDay() || 7
            start = new Date(now)
            start.setDate(now.getDate() - day + 1)
            start.setHours(0, 0, 0, 0)

            end = new Date(start)
            end.setDate(start.getDate() + 6)
            end.setHours(23, 59, 59, 999)
        } else if (period === 'month') {
            start = new Date(selectedYear, selectedMonth, 1)
            end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59)
        } else {
            start = new Date(startDate!)
            end = new Date(endDate!)
        }

        return { start, end }
    }, [selectedMonth, selectedYear])

    useEffect(() => {
        async function fetchReport() {
            const { start, end } = getDateRange(period, startDate, endDate)

            const { data, error } = await supabase
                .from('orders')
                .select(`
                id,
                category,
                status,
                total_price,
                weight_kg,
                qty,
                kilo_service_id,
                satuan_item_id,
                created_at
            `)
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString())

            if (error || !data) return

            setOrders(data)

            processSummary(data)
            processChart(data)
            processStatus(data)
        }

        if (period !== 'set' || (startDate && endDate)) {
            fetchReport()
        }
    }, [period, startDate, endDate, selectedMonth, selectedYear, getDateRange, processChart])

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
                            className="w-full focus:outline-none bg-white px-3 py-2 rounded-xl border text-sm border-slate-500 text-slate-500"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full focus:outline-none bg-white px-3 py-2 rounded-xl border text-sm border-slate-500 text-slate-500"
                        />
                    </div>
                )}

                {period === 'month' && (
                    <div className="flex justify-between gap-3">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="focus:outline-none bg-white w-full px-3 py-2 rounded-xl border text-sm border-slate-500 text-slate-500"
                        >
                            {availableMonths.map((m) => (
                                <option key={m} value={m}>
                                    {months[m]}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="focus:outline-none bg-white w-full px-3 py-2 rounded-xl border text-sm border-slate-500 text-slate-500"
                        >
                            {availableYears.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
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

                            {/* Y kiri = jumlah order */}
                            <YAxis yAxisId="left" />

                            {/* Y kanan = revenue */}
                            <YAxis yAxisId="right" orientation="right" hide />

                            <Tooltip />

                            {/* Revenue */}
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                name="Pendapatan"
                            />

                            {/* Order count */}
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="orders"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                name="Jumlah Order"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ===== STATUS BREAKDOWN ===== */}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                <p className="font-semibold">Status Order</p>

                {statusBreakdown.map((s) => {
                    const percent =
                        summary.totalOrder === 0
                            ? 0
                            : (s.value / summary.totalOrder) * 100

                    return (
                        <div key={s.label} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>{s.label}</span>
                                <span className="font-medium">{s.value}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${s.color}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    )
                })}

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
    value: string | number
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
