import { notFound } from 'next/navigation'

type OrderStatus = 'Proses' | 'Siap' | 'Selesai'

type Order = {
    id: number
    name: string
    phone: string
    date: string
    service: string
    weight: number
    status: OrderStatus
    total: number
    note?: string
}

/* ===== DUMMY DATA ===== */
const ORDERS: Order[] = [
    {
        id: 1,
        name: 'Andi Pratama',
        phone: '08123456789',
        date: '12 September 2025',
        service: 'Express (1 Hari)',
        weight: 7,
        status: 'Proses',
        total: 50000,
        note: 'Tidak perlu cuci kering',
    },
    {
        id: 2,
        name: 'Budi Santoso',
        phone: '08987654321',
        date: '12 September 2025',
        service: 'Regular (3 Hari)',
        weight: 4,
        status: 'Siap',
        total: 30000,
    },
]

export default async function NotaPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params   // 🔥 WAJIB await
    const order = ORDERS.find((o) => o.id === Number(id))

    if (!order) return notFound()

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg overflow-hidden">

                {/* ===== HEADER ===== */}
                <div className="bg-blue-500 text-white px-6 py-5 text-center">
                    <h1 className="text-lg font-bold tracking-wide">
                        NOTA ELEKTRONIK
                    </h1>
                    <p className="text-sm opacity-90 mt-1">
                        Laundry Bersih Jaya
                    </p>
                    <p className="text-xs opacity-80">
                        Jl. Merdeka No. 10 • WA 08123456789
                    </p>
                </div>

                {/* ===== BODY ===== */}
                <div className="p-6 space-y-5">

                    {/* INFO */}
                    <div className="space-y-2 text-sm">
                        <Info label="No. Nota" value={`#${order.id}`} />
                        <Info label="Nama" value={order.name} />
                        <Info label="Tanggal Masuk" value={order.date} />

                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Status</span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium
                                ${order.status === 'Proses' && 'bg-yellow-100 text-yellow-700'}
                                ${order.status === 'Siap' && 'bg-blue-100 text-blue-600'}
                                ${order.status === 'Selesai' && 'bg-green-100 text-green-600'}
                            `}
                            >
                                {order.status}
                            </span>
                        </div>
                    </div>

                    <Divider />

                    {/* DETAIL */}
                    <div className="space-y-2 text-sm">
                        <Info label="Layanan" value={order.service} />
                        <Info label="Berat" value={`${order.weight} kg`} />
                        {order.note && (
                            <Info label="Catatan" value={order.note} />
                        )}
                    </div>

                    <Divider />

                    {/* TOTAL */}
                    <div className="flex justify-between items-center">
                        <span className="text-base font-semibold">Total</span>
                        <span className="text-xl font-bold text-blue-600">
                            Rp {order.total.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-right">{value}</span>
        </div>
    )
}

function Divider() {
    return <div className="border-t border-dashed my-4" />
}
