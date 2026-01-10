'use client'

import { useState } from 'react'
import {
    Plus,
    Search,
    ReceiptText,
    Pencil,
    Trash2,
    MessageSquareShare
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient'
import { useEffect } from 'react'


type OrderStatus = 'Proses' | 'Siap' | 'Selesai'

type Order = {
    id: string
    order_number: number

    customer_name: string
    customer_phone: string
    note: string | null

    category: 'kilo' | 'satuan'

    kilo_service_id: string | null
    satuan_item_id: string | null
    speed_id: string

    kilo_service?: { name: string }
    satuan_item?: { name: string }
    speed?: { name: string }

    weight_kg: number | null
    qty: number | null

    base_price: number
    express_extra: number
    price_per_unit: number
    total_price: number

    status: OrderStatus
    created_at: string
}

const statusFilters: { key: 'all' | OrderStatus; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'Proses', label: 'Proses' },
    { key: 'Siap', label: 'Siap' },
    { key: 'Selesai', label: 'Selesai' },
]

export default function OrdersPage() {
    const [filter, setFilter] = useState<'all' | OrderStatus>('all')
    const [search, setSearch] = useState('')
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [editOrder, setEditOrder] = useState<Order | null>(null)
    const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
    const [waHeader, setWaHeader] = useState('')
    const [waFooter, setWaFooter] = useState('')
    const [profile, setProfile] = useState<{
        laundry_name: string
        address: string
        phone: string
    } | null>(null)
    const [activeUntil, setActiveUntil] = useState<Date | null>(null)
    const [laundryName, setLaundryName] = useState<string | null>(null)
    const [showSubscribeModal, setShowSubscribeModal] = useState(false)

    useEffect(() => {
        async function load() {
            setLoading(true)

            // ===== ORDERS =====
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                *,
                kilo_service:kilo_services ( name ),
                satuan_item:satuan_items ( name ),
                speed:service_speeds ( name )
            `)
                .order('created_at', { ascending: false })

            if (!ordersError && ordersData) {
                setOrders(ordersData)
            }

            setLoading(false)

            // ===== PROFILE =====
            const { data: profile } = await supabase
                .from('profiles')
                .select('laundry_name, active_until, address, phone')
                .single()

            if (profile) {
                setLaundryName(profile.laundry_name)
                setActiveUntil(
                    profile.active_until
                        ? new Date(profile.active_until)
                        : null
                )
                setProfile(profile)
            }

            // ===== WHATSAPP TEMPLATE =====
            const { data: wa } = await supabase
                .from('whatsapp_templates')
                .select('header, footer')
                .single()

            if (wa) {
                setWaHeader(wa.header || '')
                setWaFooter(wa.footer || '')
            }
        }

        load()
    }, [])

    const filteredOrders = orders.filter((o) => {
        const byStatus = filter === 'all' || o.status === filter
        const bySearch =
            o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_phone.includes(search) ||
            o.order_number.toString().includes(search)

        return byStatus && bySearch
    })

    const updateStatus = async (id: string, status: OrderStatus) => {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)

        if (error) {
            console.error(error)
            return
        }

        // update UI langsung (tanpa refetch)
        setOrders((prev) =>
            prev.map((o) =>
                o.id === id ? { ...o, status } : o
            )
        )
    }

    const handleDelete = async () => {
        if (!deleteOrderId) return

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', deleteOrderId)

        if (error) {
            console.error(error)
            return
        }

        setOrders((prev) => prev.filter((o) => o.id !== deleteOrderId))
        setDeleteOrderId(null)
    }

    const formatDateID = (date: string | Date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    }


    const buildWhatsappMessage = (order: Order) => {
        if (!profile) return ''

        const service =
            order.category === 'kilo'
                ? `${order.kilo_service?.name} - ${order.speed?.name}`
                : `${order.satuan_item?.name} - ${order.speed?.name}`

        const qty =
            order.category === 'kilo'
                ? `${order.weight_kg} Kg`
                : `${order.qty} Pcs`

        const notaUrl = `${process.env.NEXT_PUBLIC_APP_URL}/nota/${order.order_number}`

        return `
${waHeader}

No. Nota : ${order.order_number}
Status : ${order.status}
Nama : ${order.customer_name}
Tanggal Masuk : ${formatDateID(order.created_at)}
Layanan : ${service}
Jumlah : ${qty}
Total : Rp ${order.total_price.toLocaleString('id-ID')}

Link Nota :
${notaUrl}

${waFooter}
    `.trim()
    }

    const sendWhatsapp = (order: Order) => {
        const phone = order.customer_phone.replace(/[^0-9]/g, '')
        const waNumber = phone.startsWith('0')
            ? '62' + phone.slice(1)
            : phone

        const message = buildWhatsappMessage(order)
        const safeMessage = message.normalize('NFC')

        const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(safeMessage)}`
        window.open(url, '_blank')
    }

    const isSubscriptionActive =
        !!activeUntil && new Date() <= activeUntil


    return (
        <div className="space-y-5">

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
                                Masa aktif berakhir pada{' '}
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
                                href={`https://wa.me/62895324443540?text=${encodeURIComponent(
                                    `Halo admin 👋\n\nSaya ingin memperpanjang langganan aplikasi laundry.\n\nNama Laundry: ${laundryName}\nMasa aktif sebelumnya: ${activeUntil?.toLocaleDateString('id-ID')}`
                                )}`}
                                target="_blank"
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white! px-4 py-2 rounded-xl text-center font-semibold"
                            >
                                Perpanjang
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== PAGE HEADER ===== */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Kelola Order</h1>
                </div>

                <button
                    onClick={() => {
                        if (isSubscriptionActive) {
                            router.push('/dashboard/orders/new')
                        } else {
                            setShowSubscribeModal(true)
                        }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-sm text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm"
                >
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
                    placeholder="Cari dari nama, no. hp, atau no. order"
                    className="w-full rounded-2xl! pl-10 pr-3 py-2.5 border border-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
            </div>

            {/* ===== FILTER ===== */}
            <div className="flex justify-between overflow-x-auto pb-1">
                {statusFilters.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setFilter(item.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition
              ${filter === item.key
                                ? 'bg-white border border-blue-500 text-blue-500'
                                : 'bg-white border border-slate-500 text-slate-500  hover:text-blue-500'
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {loading && (
                <p className="text-center text-sm text-slate-500 py-10">
                    Memuat data...
                </p>
            )}

            {editOrder && (
                <EditOrderModal
                    order={editOrder}
                    onClose={() => setEditOrder(null)}
                    onSaved={(updated) => {
                        setOrders((prev) =>
                            prev.map((o) => (o.id === updated.id ? updated : o))
                        )
                        setEditOrder(null)
                    }}
                />
            )}

            {deleteOrderId && (
                <ConfirmDeleteModal
                    onCancel={() => setDeleteOrderId(null)}
                    onConfirm={handleDelete}
                />
            )}

            {/* ===== ORDER LIST ===== */}
            <div className="space-y-3">
                {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} onEdit={() => setEditOrder(order)} onDelete={() => setDeleteOrderId(order.id)} onSendNota={() => sendWhatsapp(order)} />
                ))}

                {!loading && filteredOrders.length === 0 && (
                    <p className="text-center text-sm text-slate-500 py-10">
                        Tidak ada order ditemukan
                    </p>
                )}
            </div>
        </div>
    )
}

/* ======================
   ORDER CARD
====================== */
function OrderCard({
    order,
    onUpdateStatus,
    onEdit,
    onDelete,
    onSendNota,
}: {
    order: Order
    onUpdateStatus: (id: string, status: OrderStatus) => void
    onEdit: () => void
    onDelete: () => void
    onSendNota: () => void
}) {

    const statusBadge = {
        Proses: 'bg-yellow-100 text-yellow-700',
        Siap: 'bg-blue-100 text-blue-600',
        Selesai: 'bg-green-100 text-green-600',
    }[order.status]

    const getServiceText = (order: Order) => {
        if (order.category === 'kilo') {
            return `${order.kilo_service?.name} - ${order.speed?.name}`
        }
        return `${order.satuan_item?.name} - ${order.speed?.name}`
    }


    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
            {/* ===== HEADER ===== */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-semibold">{order.customer_name}</p>
                    <p className="text-sm text-slate-500">{order.customer_phone}</p>
                    <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
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
                    <p className="text-slate-500">No. Order</p>
                    <p className="font-semibold">{order.order_number}</p>
                </div>
                <div>
                    <p className="text-slate-500">Catatan</p>
                    <p className="font-semibold">{order.note}</p>
                </div>
                <div>
                    <p className="text-slate-500">Layanan</p>
                    <p className="font-semibold">{getServiceText(order)}</p>
                </div>
                <div>
                    <p className="text-slate-500">{order.category === 'kilo' ? 'Berat' : 'Qty'}</p>
                    <p className="font-semibold">{order.category === 'kilo' ? order.weight_kg + ' Kg' : order.qty + ' Pcs'}</p>
                </div>
            </div>

            {/* ===== DIVIDER ===== */}
            <div className="border-t border-slate-400" />

            {/* ===== TOTAL ===== */}
            <div>
                <p className="text-slate-500 text-sm">Total</p>
                <p className="text-blue-600 font-bold text-lg">
                    Rp {order.total_price.toLocaleString('id-ID')}
                </p>
            </div>

            {/* ===== STATUS ACTION ===== */}
            <div className="flex gap-2">
                {(['Proses', 'Siap', 'Selesai'] as OrderStatus[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => {
                            if (order.status !== s) {
                                onUpdateStatus(order.id, s)
                            }
                        }}
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
                <button onClick={onSendNota} className="flex items-center gap-2 text-blue-500 font-medium">
                    <MessageSquareShare size={18} />
                    Kirim Nota
                </button>


                <div className="flex gap-3">
                    <Link href={`/nota/${order.order_number}`} className="text-blue-500!">
                        <ReceiptText size={18} />
                    </Link>
                    <button onClick={onEdit} className="text-blue-500">
                        <Pencil size={18} />
                    </button>
                    <button onClick={onDelete} className="text-blue-500">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}

function EditOrderModal({
    order,
    onClose,
    onSaved,
}: {
    order: Order
    onClose: () => void
    onSaved: (order: Order) => void
}) {
    const [form, setForm] = useState({ ...order })

    const updateField = <K extends keyof Order>(key: K, value: Order[K]) => {
        setForm((p) => ({ ...p, [key]: value }))
    }

    const handleSave = async () => {
        const { data, error } = await supabase
            .from('orders')
            .update({
                customer_name: form.customer_name,
                customer_phone: form.customer_phone,
                note: form.note,

                category: form.category,

                kilo_service_id:
                    form.category === 'kilo' ? form.kilo_service_id : null,

                satuan_item_id:
                    form.category === 'satuan' ? form.satuan_item_id : null,

                speed_id: form.speed_id, // ⬅️ WAJIB

                weight_kg:
                    form.category === 'kilo' ? form.weight_kg : null,

                qty:
                    form.category === 'satuan' ? form.qty : null,

                base_price: form.base_price,
                express_extra: form.express_extra,
                price_per_unit: form.price_per_unit,
                total_price: form.total_price,
            })
            .eq('id', order.id)
            .select()
            .single()

        if (error) {
            console.error(error)
            return
        }

        onSaved(data as Order)
    }

    return (
        <div className="fixed min-h-dvh inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
            <div
                className="bg-white w-full max-w-md rounded-2xl p-5 space-y-5 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ===== HEADER ===== */}
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Edit Order</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        ✕
                    </button>
                </div>

                {/* ===== DATA PELANGGAN ===== */}
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-600">
                        Data Pelanggan
                    </p>

                    <div>
                        <label className="text-xs text-slate-500">Nama Pelanggan</label>
                        <input
                            value={form.customer_name}
                            onChange={(e) => updateField('customer_name', e.target.value)}
                            className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-500">Nomor HP / WhatsApp</label>
                        <input
                            value={form.customer_phone}
                            onChange={(e) => updateField('customer_phone', e.target.value)}
                            className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-500">Catatan</label>
                        <input
                            value={form.note ?? ''}
                            onChange={(e) => updateField('note', e.target.value)}
                            className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            placeholder="Opsional"
                        />
                    </div>
                </div>

                {/* ===== JUMLAH ===== */}
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-600">
                        Jumlah Laundry
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-500">Berat (kg)</label>
                            <input
                                type="number"
                                value={form.weight_kg ?? ''}
                                onChange={(e) =>
                                    updateField('weight_kg', Number(e.target.value))
                                }
                                className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-500">Qty (pcs)</label>
                            <input
                                type="number"
                                value={form.qty ?? ''}
                                onChange={(e) =>
                                    updateField('qty', Number(e.target.value))
                                }
                                className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* ===== HARGA ===== */}
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-600">
                        Harga
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-500">
                                Harga / Unit
                            </label>
                            <input
                                type="number"
                                value={form.price_per_unit}
                                onChange={(e) =>
                                    updateField('price_per_unit', Number(e.target.value))
                                }
                                className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-500">Total</label>
                            <input
                                type="number"
                                value={form.total_price}
                                onChange={(e) =>
                                    updateField('total_price', Number(e.target.value))
                                }
                                className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* ===== ACTION ===== */}
                <div className="flex justify-end gap-2 pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
                    >
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    )
}

function ConfirmDeleteModal({
    onCancel,
    onConfirm,
}: {
    onCancel: () => void
    onConfirm: () => void
}) {
    return (
        <div className="fixed min-h-dvh inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
            <div
                className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold text-slate-800">
                    Hapus Order
                </h2>

                <p className="text-sm text-slate-600">
                    Apakah kamu yakin ingin menghapus order ini?
                    Tindakan ini tidak bisa dibatalkan.
                </p>

                <div className="flex justify-end gap-2 pt-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                        Batal
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
                    >
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    )
}
