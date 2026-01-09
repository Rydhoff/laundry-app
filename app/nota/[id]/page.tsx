import { notFound } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient'
import NotaQRCode from '@/app/components/ui/NotaQRCode'

type OrderStatus = 'Proses' | 'Siap' | 'Selesai'

type Order = {
    order_number: number
    customer_name: string
    customer_phone: string
    note: string | null
    category: 'kilo' | 'satuan'
    weight_kg: number | null
    qty: number | null
    status: OrderStatus
    total_price: number
    created_at: string

    kilo_service?: { name: string }
    satuan_item?: { name: string }
    speed?: { name: string }
}

type Profile = {
    laundry_name: string
    address: string
    phone: string
}

export default async function NotaPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params        // ✅ WAJIB await
    const orderNumber = Number(id)

    if (Number.isNaN(orderNumber)) return notFound()

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
    order_number,
    customer_name,
    customer_phone,
    note,
    category,
    weight_kg,
    qty,
    status,
    total_price,
    created_at,
    kilo_service:kilo_services ( name ),
    satuan_item:satuan_items ( name ),
    speed:service_speeds ( name )
  `)
        .eq('order_number', orderNumber)
        .single<Order>()   // 🔥 INI KUNCINYA

    if (error || !order) return notFound()

    const serviceText =
        order.category === 'kilo'
            ? `${order.kilo_service?.name} - ${order.speed?.name}`
            : `${order.satuan_item?.name} - ${order.speed?.name}`

    const qtyText =
        order.category === 'kilo'
            ? `${order.weight_kg} Kg`
            : `${order.qty} Pcs`

    const dateText = new Date(order.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })

    const formatNotaNumber = (orderNumber: number) =>
        orderNumber.toString().padStart(6, '0')

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('laundry_name, address, phone')
        .single<Profile>()

    if (profileError || !profile) return notFound()

    const notaUrl = `${process.env.NEXT_PUBLIC_APP_URL}/nota/${formatNotaNumber(order.order_number)}`

    return (
        <div className="min-h-dvh bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg overflow-hidden">

                {/* ===== HEADER ===== */}
                <div className="bg-blue-500 text-white px-6 py-5 text-center">
                    <h1 className="text-lg font-bold uppercase mb-1">{profile.laundry_name}</h1>

                    <p className="text-sm opacity-80">
                        {profile.address}
                    </p>

                    <p className="text-sm opacity-80">
                        WhatsApp : {profile.phone}
                    </p>
                </div>


                {/* ===== BODY ===== */}
                <div className="p-6 space-y-5 text-sm">

                    <Info label="No. Nota" value={`#${formatNotaNumber(order.order_number)}`} />
                    <Info label="Nama" value={order.customer_name} />
                    <Info label="Tanggal Masuk" value={dateText} />

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

                    <Divider />

                    <Info label="Layanan" value={serviceText} />
                    <Info label="Jumlah" value={qtyText} />

                    {order.note && (
                        <Info label="Catatan" value={order.note} />
                    )}

                    <Divider />

                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-blue-600">
                            Rp {order.total_price.toLocaleString('id-ID')}
                        </span>
                    </div>

                    <Divider />

                    <NotaQRCode value={notaUrl} />

                </div>
            </div>
        </div>
    )
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-right">{value}</span>
        </div>
    )
}

function Divider() {
    return <div className="border-t border-dashed my-4" />
}
