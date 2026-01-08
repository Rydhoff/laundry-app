'use client'

import { useState } from 'react'
import { Banknote, LogOut, ReceiptText, Save, WashingMachine } from 'lucide-react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SettingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    /* ======================
       PROFIL LAUNDRY
    ====================== */
    const [laundryName, setLaundryName] = useState('Laundry Bersih Jaya')
    const activeUntil = '31 Desember 2026'

    /* ======================
       LAYANAN & HARGA
    ====================== */
    const [regularPrice, setRegularPrice] = useState(5000)
    const [expressPrice, setExpressPrice] = useState(7000)

    /* ======================
       NOTA WHATSAPP
    ====================== */
    const [notaHeader, setNotaHeader] = useState("")

    const [notaFooter, setNotaFooter] = useState("")

    /* ======================
       HANDLERS
    ====================== */
    const handleSave = () => {
        alert('Pengaturan berhasil disimpan')
        // nanti: update ke Supabase
    }

    const handleLogout = async () => {
        setLoading(true)
        await supabase.auth.signOut()
        router.replace('/login')
    }

    return (
        <div className="space-y-4">
            {/* ===== PAGE HEADER ===== */}
            <div>
                <h1 className="text-xl font-bold">Pengaturan</h1>
            </div>

            {/* ======================
          PROFIL LAUNDRY
      ====================== */}
            <Section title="Profil Laundry">
                <Field label="Nama">
                    <p className="text-sm">{laundryName}</p>
                </Field>

                <Field label="Masa Aktif">
                    <p className="mt-1 bg-white text-xs w-fit text-blue-500 px-2 py-1 border border-blue-500 rounded-full">{`Aktif sampai ${activeUntil}`}</p>
                </Field>
            </Section>

            {/* ======================
          LAYANAN & HARGA
      ====================== */}
            <Section title="Layanan & Harga">
                {/* REGULER */}
                <div className="bg-white rounded-2xl py-3 px-4 mb-3 border border-blue-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center font-semibold">
                            <WashingMachine size={28} />
                        </div>

                        <div>
                            <p className="font-semibold mb-1">Reguler (3 Hari)</p>
                            <div className="text-right">
                                <input
                                    type="number"
                                    value={regularPrice}
                                    onChange={(e) => setRegularPrice(Number(e.target.value))}
                                    className="w-24 text-right px-4 py-1 rounded-xl border border-slate-300 text-sm font-semibold
              focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-slate-700 transition"
                                />
                                <p className="inline text-sm mt-1"> / kg</p>
                            </div>
                        </div>
                    </div>


                </div>

                {/* EXPRESS */}
                <div className="bg-white rounded-2xl py-3 px-4 mb-3 border border-blue-300">
                    <div className="flex items-center gap-4" >
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center font-semibold">
                            <WashingMachine size={28} />
                        </div>
                        <div>
                            <p className="font-semibold mb-2">Express (1 Hari)</p>
                            <div className="text-right">
                                <input
                                    type="number"
                                    value={expressPrice}
                                    onChange={(e) => setExpressPrice(Number(e.target.value))}
                                    className="w-24 text-right px-4 py-1 rounded-xl border border-slate-300 text-sm font-semibold
              focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-slate-700 transition"
                                />
                                <p className="inline text-sm mt-1"> / kg</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                >
                    <Banknote size={24} />
                    Update Harga
                </button>
            </Section>

            {/* ======================
          NOTA WHATSAPP
      ====================== */}
            <Section title="Nota Elektronik WhatsApp">
                <Field label="Header Nota">
                    <textarea
                        rows={6}
                        placeholder={`**NOTA ELEKTRONIK**

**Laundry Bersih Jaya**
Jl. Merdeka No. 10
WA: 08123456789`}
                        value={notaHeader}
                        onChange={(e) => setNotaHeader(e.target.value)}
                        className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
                    />
                </Field>

                {/* FIXED CONTENT */}
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-500">
                    <label className="text font-semibold text-slate-800">
                        Isi Nota Otomatis
                    </label>
                    <ul className="list-disc p-4 space-y-1">
                        <li>No. Nota</li>
                        <li>Nama Pelanggan</li>
                        <li>Tanggal Masuk</li>
                        <li>Status Order</li>
                        <li>Total</li>
                        <li>Link Nota (/nota/:id)</li>
                    </ul>
                </div>

                <Field label="Footer Nota">
                    <textarea
                        rows={10}
                        placeholder={`**Opsi Pembayaran:**

1. Cash langsung di tempat
2. Transfer Bank (BNI, BCA, Mandiri)
    Rekening: 123456789
3. Dana
    08123456789

Terima kasih 🙏`}
                        value={notaFooter}
                        onChange={(e) => setNotaFooter(e.target.value)}
                        className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
                    />
                </Field>


                <button
                    onClick={handleSave}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                >
                    <ReceiptText size={24} />
                    Update Nota
                </button>
            </Section>

            {/* ===== LOGOUT ===== */}
            <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full mt-4 bg-red-500 hover:bg-red-600 disabled:opacity-60
        text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
                <LogOut size={18} />
                {loading ? 'Logging out...' : 'Logout'}
            </button>
        </div>
    )
}

/* ======================
   SMALL COMPONENTS
====================== */

function Section({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
            <h2 className="text-md font-bold text-slate-800">
                {title}
            </h2>
            {children}
        </div>
    )
}

function Field({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
                {label}
            </label>
            {children}
        </div>
    )
}
