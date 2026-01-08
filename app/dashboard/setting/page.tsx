'use client'

import { useEffect, useState } from 'react'
import { Banknote, LogOut, ReceiptText, Save, WashingMachine } from 'lucide-react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SettingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [address, setAddress] = useState('')
    const [phone, setPhone] = useState('')
    const [activeUntil, setActiveUntil] = useState('')
    const [waTemplateId, setWaTemplateId] = useState('')
    const [notaHeader, setNotaHeader] = useState('')
    const [notaFooter, setNotaFooter] = useState('')
    const [profileId, setProfileId] = useState('')
    const [laundryName, setLaundryName] = useState('')

    useEffect(() => {
        const loadSettings = async () => {
            /* ===== PROFILES (1 DATA) ===== */
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, laundry_name, address, phone, active_until')
                .single()

            if (profile) {
                setProfileId(profile.id)
                setLaundryName(profile.laundry_name)
                setAddress(profile.address)
                setPhone(profile.phone)
                setActiveUntil(profile.active_until)
            }

            /* ===== WHATSAPP TEMPLATE (1 DATA) ===== */
            const { data: wa } = await supabase
                .from('whatsapp_templates')
                .select('id, header, footer')
                .single()

            if (wa) {
                setWaTemplateId(wa.id)
                setNotaHeader(wa.header)
                setNotaFooter(wa.footer)
            }
        }

        loadSettings()
    }, [])


    /* ======================
       HANDLERS
    ====================== */
    const updateProfile = async () => {
        if (!profileId) return

        await supabase
            .from('profiles')
            .update({
                laundry_name: laundryName,
                address,
                phone,
            })
            .eq('id', profileId)
    }

    const updateWhatsappTemplate = async () => {
        if (!waTemplateId) return

        await supabase
            .from('whatsapp_templates')
            .update({
                header: notaHeader,
                footer: notaFooter,
            })
            .eq('id', waTemplateId)
    }







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
                    <input className="block py-1 focus:outline-none" value={laundryName} onChange={(e) => setLaundryName(e.target.value)} />
                </Field>

                <Field label="Alamat">
                    <input className="block py-1 focus:outline-none" value={address} onChange={(e) => setAddress(e.target.value)} />
                </Field>

                <Field label="No. Telp">
                    <input className="block py-1 focus:outline-none" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Field>
                <p className="mt-4 mb-2 bg-white text-xs w-fit text-blue-500 px-2 py-1 border border-blue-500 rounded-full">Aktif sampai {new Date(activeUntil).toLocaleDateString('id-ID')}</p>
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
                <Field label="Isi Nota Otomatis">
                    <div className="mt-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl px-4 text-sm text-slate-500">
                        <ul className="list-disc p-4 space-y-1">
                            <li>No. Nota</li>
                            <li>Nama Pelanggan</li>
                            <li>Tanggal Masuk</li>
                            <li>Status Order</li>
                            <li>Total</li>
                            <li>Link Nota (/nota/:id)</li>
                        </ul>
                    </div>
                </Field>

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
