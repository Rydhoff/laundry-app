'use client'

import { useEffect, useState } from 'react'
import { User, Phone, Check, StickyNote } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient'
import { toast } from 'sonner'

/* ======================
   TYPES
====================== */
type ServiceCategory = {
    id: string
    code: 'kilo' | 'satuan'
    name: string
}
type KiloService = {
    id: string
    name: string
    description: string | null
    price_per_kg: number
}

type SatuanItem = {
    id: string
    name: string
    description: string | null
    price_per_item: number
}

type Speed = {
    id: string
    name: string
    description: string | null
    extra_price_kilo: number
    extra_price_satuan: number
}


export default function NewOrderPage() {
    const router = useRouter()

    /* ======================
       STATE
    ====================== */
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [note, setNote] = useState('')

    const [categories, setCategories] = useState<ServiceCategory[]>([])
    const [category, setCategory] = useState<ServiceCategory | null>(null)

    const [kiloServices, setKiloServices] = useState<KiloService[]>([])
    const [satuanItems, setSatuanItems] = useState<SatuanItem[]>([])
    const [speeds, setSpeeds] = useState<Speed[]>([])

    const [kiloService, setKiloService] = useState<KiloService | null>(null)
    const [satuanItem, setSatuanItem] = useState<SatuanItem | null>(null)
    const [speed, setSpeed] = useState<Speed | null>(null)


    const [weight, setWeight] = useState(1)
    const [qty, setQty] = useState(1)

    const [activeUntil, setActiveUntil] = useState<Date | null>(null)
    const [checkingSub, setCheckingSub] = useState(true)

    useEffect(() => {
        const checkSubscription = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('active_until')
                .single()

            if (error) {
                console.error(error)
                setCheckingSub(false)
                return
            }

            const isActive =
                data?.active_until &&
                new Date() <= new Date(data.active_until)

            if (!isActive) {
                // 🔴 LANGSUNG TENDANG BALIK
                router.replace('/dashboard')
                return
            }

            setActiveUntil(new Date(data.active_until))
            setCheckingSub(false)
        }

        checkSubscription()
    }, [router])

    useEffect(() => {
        const fetchMaster = async () => {
            const { data: categories } = await supabase
                .from('service_categories')
                .select('*')
                .eq('is_active', true)
                .order('name')

            const { data: kilo } = await supabase
                .from('kilo_services')
                .select('*')
                .eq('is_active', true)

            const { data: satuan } = await supabase
                .from('satuan_items')
                .select('*')
                .eq('is_active', true)

            const { data: speeds } = await supabase
                .from('service_speeds')
                .select('*')
                .eq('is_active', true)

            setCategories(categories || [])
            setKiloServices(kilo || [])
            setSatuanItems(satuan || [])
            setSpeeds(speeds || [])

            if (categories?.length) setCategory(categories[0])
            if (kilo?.length) setKiloService(kilo[0])
            if (satuan?.length) setSatuanItem(satuan[0])
            if (speeds?.length) setSpeed(speeds[0])
        }

        fetchMaster()
    }, [])

    useEffect(() => {
        if (!speed && speeds.length > 0) {
            setSpeed(speeds[0])
        }
    }, [category, speeds])


    const basePrice =
        category?.code === 'kilo'
            ? kiloService?.price_per_kg ?? 0
            : satuanItem?.price_per_item ?? 0

    const expressExtra =
        category?.code === 'kilo'
            ? speed?.extra_price_kilo ?? 0
            : speed?.extra_price_satuan ?? 0

    const activePrice = basePrice + expressExtra

    const total =
        category?.code === 'kilo'
            ? weight * activePrice
            : qty * activePrice

    const handleSave = async () => {
        if (!activeUntil || new Date() > activeUntil) {
            toast.error('Langganan Anda telah berakhir')
            router.replace('/dashboard')
            return
        }

        if (!name || !phone) {
            toast.warning('Nama dan nomor HP wajib diisi')
            return
        }

        if (!speed) {
            toast.warning('Pilih kecepatan layanan')
            return
        }

        toast.loading('Menyimpan order...', { id: 'save-order' })

        const payload = {
            customer_name: name,
            customer_phone: phone,
            note,

            category: category!.code,

            kilo_service_id:
                category?.code === 'kilo' ? kiloService?.id : null,

            satuan_item_id:
                category?.code === 'satuan' ? satuanItem?.id : null,

            speed_id: speed.id, // ⬅️ TIDAK BOLEH NULL

            weight_kg:
                category?.code === 'kilo' ? weight : null,

            qty:
                category?.code === 'satuan' ? qty : null,

            base_price: basePrice,
            express_extra: expressExtra,
            price_per_unit: activePrice,
            total_price: total,
        }

        const { error } = await supabase.from('orders').insert([payload])

        if (error) {
            console.error(error)
            toast.error('Gagal menyimpan order', { id: 'save-order' })
            return
        }

        toast.success('Order berhasil disimpan', { id: 'save-order' })
        router.push('/dashboard/orders')
    }


    /* ======================
       UI
    ====================== */

    return (
        <div className="bg-slate-100">
            <main className="space-y-3 max-w-md mx-auto">
                {/* ===== CUSTOMER ===== */}
                <section className="space-y-3">
                    <h2 className="font-semibold">Data Pelanggan</h2>

                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input
                            placeholder="Nama pelanggan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input
                            placeholder="Nomor HP / WhatsApp"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="relative">
                        <StickyNote className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input
                            placeholder="Catatan (opsional)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </section>

                {/* ===== CATEGORY ===== */}
                <section className="space-y-3">
                    <h2 className="font-semibold">Kategori Layanan</h2>

                    {categories.map((cat) => (
                        <ServiceCard
                            key={cat.id}
                            title={cat.name}
                            desc={cat.code === 'kilo'
                                ? 'Laundry kiloan'
                                : 'Bed cover, sepatu, dll'}
                            active={category?.id === cat.id}
                            onClick={() => setCategory(cat)}
                            hidePrice
                        />
                    ))}
                </section>


                {/* ===== KILO SERVICE ===== */}
                {category?.code === 'kilo' && (
                    <section className="space-y-3">
                        <h2 className="font-semibold">Jenis Per Kilo</h2>

                        {kiloServices.map((item) => (
                            <ServiceCard
                                key={item.id}
                                title={item.name}
                                desc={item.description || ''}
                                price={item.price_per_kg}
                                active={kiloService?.id === item.id}
                                onClick={() => setKiloService(item)}
                            />
                        ))}

                    </section>
                )}

                {/* ===== SATUAN ITEM ===== */}
                {category?.code === 'satuan' && (
                    <section className="space-y-3">
                        <h2 className="font-semibold">Jenis Satuan</h2>
                        {satuanItems.map((item) => (
                            <ServiceCard
                                key={item.id}
                                title={item.name}
                                desc={item.description || 'Harga per item'}
                                price={item.price_per_item}
                                active={satuanItem?.id === item.id}
                                onClick={() => setSatuanItem(item)}
                            />
                        ))}

                    </section>
                )}

                {/* ===== SPEED ===== */}
                <section className="space-y-3">
                    <h2 className="font-semibold">Kecepatan</h2>
                    {speeds.map((s) => (
                        <ServiceCard
                            key={s.id}
                            title={s.name}
                            desc={
                                category?.code === 'kilo'
                                    ? `+Rp ${s.extra_price_kilo.toLocaleString('id-ID')} / kg`
                                    : `+Rp ${s.extra_price_satuan.toLocaleString('id-ID')} / item`
                            }
                            active={speed?.id === s.id}
                            onClick={() => setSpeed(s)}
                            hidePrice
                        />
                    ))}

                </section>

                {/* ===== WEIGHT / QTY ===== */}
                <section className="space-y-3">
                    <h2 className="font-semibold">
                        {category?.code === 'kilo' ? 'Berat Laundry' : 'Jumlah'}
                    </h2>

                    <div className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm">
                        <button
                            onClick={() =>
                                category?.code === 'kilo'
                                    ? setWeight((p) => Math.max(0.5, +(p - 0.5).toFixed(1)))
                                    : setQty((p) => Math.max(1, p - 1))
                            }
                            className="w-10 h-10 rounded-full border text-xl"
                        >
                            −
                        </button>

                        <div className="text-center">
                            <p className="text-4xl font-bold">
                                {category?.code === 'kilo' ? weight.toFixed(1) : qty}
                            </p>
                            <p className="text-slate-400 text-sm">
                                {category?.code === 'kilo' ? 'kg' : 'pcs'}
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                category?.code === 'kilo'
                                    ? setWeight((p) => +(p + 0.5).toFixed(1))
                                    : setQty((p) => p + 1)
                            }
                            className="w-12 h-12 rounded-full bg-blue-500 text-white text-xl"
                        >
                            +
                        </button>
                    </div>
                </section>

                {/* ===== SUMMARY ===== */}
                <section className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Harga / {category?.code === 'kilo' ? 'kg' : 'item'}</span>
                        <span>Rp {activePrice.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="flex justify-between font-semibold text-lg pt-2">
                        <span>Total</span>
                        <span className="text-blue-600">
                            Rp {total.toLocaleString('id-ID')}
                        </span>
                    </div>
                </section>

                {/* ===== SAVE ===== */}
                <button
                    onClick={handleSave}
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-md"
                >
                    <Check size={20} />
                    Simpan Order
                </button>

            </main>
        </div>
    )
}

/* ======================
   SERVICE CARD
====================== */
function ServiceCard({
    title,
    desc,
    price,
    active,
    onClick,
    hidePrice,
}: {
    title: string
    desc: string
    price?: number
    active: boolean
    onClick: () => void
    hidePrice?: boolean
}) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer bg-white rounded-2xl p-4 flex items-center justify-between border-2 transition
        ${active ? 'border-blue-500 bg-blue-50' : 'border-transparent'}
      `}
        >
            <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-slate-400">{desc}</p>
            </div>

            <div className="flex items-center gap-3">
                {!hidePrice && price !== undefined && (
                    <p className="font-semibold text-blue-500">
                        Rp {price.toLocaleString('id-ID')}
                    </p>
                )}

                {active && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <Check size={14} />
                    </div>
                )}
            </div>
        </div>
    )
}
