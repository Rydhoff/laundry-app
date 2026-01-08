'use client'

import { useState } from 'react'
import { ArrowLeft, User, Phone, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Service = 'reguler' | 'express'

export default function NewOrderPage() {
    const router = useRouter()

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [service, setService] = useState<Service>('reguler')
    const [weight, setWeight] = useState(1)

    const SERVICE_PRICE = {
        reguler: 5000,
        express: 7000,
    }

    const total = weight * SERVICE_PRICE[service]

    return (
        <div className=" bg-slate-100">
            <main className="space-y-4">

                {/* ===== CUSTOMER ===== */}
                <section className="space-y-3">
                    <h2 className="font-semibold">Data Pelanggan</h2>

                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input
                            placeholder="Nama pelanggan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input
                            placeholder="Nomor HP"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>
                </section>

                {/* ===== SERVICE ===== */}
                <section className="space-y-3">
                    <h2 className="font-semibold">Jenis Layanan</h2>

                    {/* REGULER */}
                    <ServiceCard
                        active={service === 'reguler'}
                        title="Reguler"
                        desc="Estimasi 3 Hari"
                        price={5000}
                        onClick={() => setService('reguler')}
                    />

                    {/* EXPRESS */}
                    <ServiceCard
                        active={service === 'express'}
                        title="Express"
                        desc="Estimasi 1 Hari"
                        price={7000}
                        onClick={() => setService('express')}
                    />
                </section>

                {/* ===== WEIGHT ===== */}
                <section className="space-y-3">
                    <h2 className="font-semibold">Berat Laundry</h2>

                    <div className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm">
                        <button
                            onClick={() =>
                                setWeight((prev) => Math.max(0.5, +(prev - 0.5).toFixed(1)))
                            }
                            className="w-10 h-10 rounded-full border text-xl"
                        >
                            −
                        </button>

                        <div className="text-center">
                            <p className="text-4xl font-bold">
                                {weight.toFixed(1)}
                            </p>
                            <p className="text-slate-400 text-sm">kg</p>
                        </div>

                        <button
                            onClick={() =>
                                setWeight((prev) => +(prev + 0.5).toFixed(1))
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
                        <span>Harga / kg</span>
                        <span>Rp {SERVICE_PRICE[service].toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Berat</span>
                        <span>{weight} kg</span>
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
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-md"
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
}: {
    title: string
    desc: string
    price: number
    active: boolean
    onClick: () => void
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
                <p className="font-semibold text-blue-500">
                    Rp {price.toLocaleString()} / kg
                </p>

                {active && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <Check size={14} />
                    </div>
                )}
            </div>
        </div>
    )
}
