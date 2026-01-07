'use client'

import { useState } from 'react'
import {
    Plus,
    Search,
    ReceiptText,
    Pencil,
    Trash2
} from 'lucide-react'

type OrderStatus = 'Proses' | 'Siap' | 'Selesai'

type Order = {
    [x: string]: any
    id: number
    name: string
    phone: string
    date: string
    service: string
    weight: number
    status: OrderStatus
}

export default function OrdersPage() {
    const [filter, setFilter] = useState<'all' | OrderStatus>('all')
    const [search, setSearch] = useState('')

    const orders: Order[] = [
        {
            id: 1,
            name: 'Andi Pratama',
            phone: '08123456789',
            date: '12 Sep 2025',
            service: 'Express (1 Hari)',
            weight: 7,
            status: 'Proses',
            total: 50000,
        },
        {
            id: 2,
            name: 'Budi Santoso',
            phone: '08987654321',
            date: '12 Sep 2025',
            service: 'Regular (3 Hari)',
            weight: 4,
            status: 'Siap',
            total: 30000,
        },
        {
            id: 3,
            name: 'Siti Aminah',
            phone: '11 Sep 2025',
            service: 'Express (1 Hari)',
            weight: 6,
            status: 'Selesai',
            date: '12 Sep 2025',
            total: 40000,
        },
    ]

    const filteredOrders = orders.filter((o) => {
        const byStatus = filter === 'all' || o.status === filter
        const bySearch =
            o.name.toLowerCase().includes(search.toLowerCase()) ||
            o.phone.includes(search)
        return byStatus && bySearch
    })

    const count = {
        all: orders.length,
        Proses: orders.filter((o) => o.status === 'Proses').length,
        Siap: orders.filter((o) => o.status === 'Siap').length,
        Selesai: orders.filter((o) => o.status === 'Selesai').length,
    }

    return (
        <div className="space-y-5">
            {/* ===== PAGE HEADER ===== */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Kelola Order</h1>
                </div>

                <button className="bg-blue-500 hover:bg-blue-600 text-sm text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm">
                    <Plus size={18} />
                    Tambah Order
                </button>
            </div>

            {/* ===== SEARCH ===== */}
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-3.5 top-3.5 text-slate-500"
                />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama pelanggan atau nomor HP"
                    className="w-full rounded-2xl! pl-10 pr-3 py-2.5 border border-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
            </div>

            {/* ===== FILTER ===== */}
            <div className="flex justify-between overflow-x-auto pb-1">
                {[
                    { key: 'all', label: 'Semua' },
                    { key: 'Proses', label: 'Proses' },
                    { key: 'Siap', label: 'Siap' },
                    { key: 'Selesai', label: 'Selesai' },
                ].map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setFilter(item.key as any)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
              ${filter === item.key
                                ? 'bg-white border border-blue-500 text-blue-500'
                                : 'bg-white border border-slate-500 text-slate-500  hover:text-blue-500'
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* ===== ORDER LIST ===== */}
            <div className="space-y-3">
                {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}

                {filteredOrders.length === 0 && (
                    <p className="text-center text-sm text-slate-500 py-10">
                        Tidak ada order ditemukan
                    </p>
                )}
            </div>
        </div>
    )
}

const statusStyle: Record<OrderStatus, {
    badge: string
    button: string
    buttonInactive: string
}> = {
    Proses: {
        badge: 'bg-yellow-100 text-yellow-700',
        button: 'bg-yellow-500 text-white',
        buttonInactive: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    },
    Siap: {
        badge: 'bg-blue-100 text-blue-600',
        button: 'bg-blue-500 text-white',
        buttonInactive: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    },
    Selesai: {
        badge: 'bg-green-100 text-green-600',
        button: 'bg-green-500 text-white',
        buttonInactive: 'bg-green-50 text-green-600 hover:bg-green-100',
    },
}


/* ======================
   ORDER CARD
====================== */
function OrderCard({ order }: { order: Order }) {
    const statusBadge = {
        Proses: 'bg-yellow-100 text-yellow-700',
        Siap: 'bg-blue-100 text-blue-600',
        Selesai: 'bg-green-100 text-green-600',
    }[order.status]

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
            {/* ===== HEADER ===== */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-semibold">{order.name}</p>
                    <p className="text-sm text-slate-500">{order.phone}</p>
                    <p className="text-xs text-slate-500">{order.date}</p>
                </div>

                <span
                    className={`text-sm px-3 py-1 rounded-full font-medium ${statusBadge}`}
                >
                    {order.status}
                </span>
            </div>

            {/* ===== DIVIDER ===== */}
            <div className="border-t border-slate-400" />

            {/* ===== SERVICE & WEIGHT ===== */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-slate-500">Layanan</p>
                    <p className="font-semibold">{order.service}</p>
                </div>
                <div>
                    <p className="text-slate-500">Berat</p>
                    <p className="font-semibold">{order.weight} kg</p>
                </div>
            </div>

            {/* ===== DIVIDER ===== */}
            <div className="border-t border-slate-400" />

            {/* ===== TOTAL ===== */}
            <div>
                <p className="text-slate-500 text-sm">Total</p>
                <p className="text-blue-600 font-bold text-lg">
                    Rp {order.total.toLocaleString('id-ID')}
                </p>
            </div>

            {/* ===== STATUS ACTION ===== */}
            <div className="flex gap-2">
                {(['Proses', 'Siap', 'Selesai'] as OrderStatus[]).map((s) => (
                    <button
                        key={s}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
              ${order.status === s
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'border border-slate-500 text-slate-500 hover:bg-slate-50'
                            }
            `}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* ===== FOOTER ACTION ===== */}
            <div className="flex items-center justify-between pt-1">
                <button className="flex items-center gap-2 text-green-600 font-medium">
                    <ReceiptText size={18} />
                    Kirim Nota
                </button>

                <div className="flex gap-3">
                    <button className="text-slate-500 hover:text-blue-500">
                        <Pencil size={18} />
                    </button>
                    <button className="text-slate-500 hover:text-red-500">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
