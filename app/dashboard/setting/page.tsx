'use client'

import { useEffect, useState } from 'react'
import {
    LogOut, ReceiptText, Layers, Scale, Clock,
    Pencil,
} from 'lucide-react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SettingPage() {
    const router = useRouter()
    const [loadingLogout, setLoadingLogout] = useState(false)
    const [loadingNota, setLoadingNota] = useState(false)
    const [loadingProfile, setLoadingProfile] = useState(false)
    const [address, setAddress] = useState('')
    const [phone, setPhone] = useState('')
    const [activeUntil, setActiveUntil] = useState('')
    const [waTemplateId, setWaTemplateId] = useState('')
    const [notaHeader, setNotaHeader] = useState('')
    const [notaFooter, setNotaFooter] = useState('')
    const [profileId, setProfileId] = useState('')
    const [laundryName, setLaundryName] = useState('')
    const [showProfileModal, setShowProfileModal] = useState(false)
    const today = new Date()
    const activeDate = activeUntil ? new Date(activeUntil) : null

    const daysLeft =
        activeDate
            ? Math.ceil(
                (activeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            )
            : null

    let subscriptionStatus: 'active' | 'warning' | 'expired' = 'expired'

    if (daysLeft !== null) {
        if (daysLeft > 3) subscriptionStatus = 'active'
        else if (daysLeft > 0) subscriptionStatus = 'warning'
        else subscriptionStatus = 'expired'
    }


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
        setLoadingProfile(true)

        await supabase
            .from('profiles')
            .update({
                laundry_name: laundryName,
                address,
                phone,
            })
            .eq('id', profileId)

        setLoadingProfile(false)
    }

    const saveWhatsappTemplate = async () => {
        setLoadingNota(true)

        if (waTemplateId) {
            await supabase
                .from('whatsapp_templates')
                .update({
                    header: notaHeader,
                    footer: notaFooter,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', waTemplateId)
        } else {
            const { data } = await supabase
                .from('whatsapp_templates')
                .insert({
                    header: notaHeader,
                    footer: notaFooter,
                })
                .select()
                .single()

            if (data) setWaTemplateId(data.id)
        }

        setLoadingNota(false)
    }

    const handleLogout = async () => {
        setLoadingLogout(true)
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
                    <p className="text-sm">{laundryName}&nbsp;</p>
                </Field>

                <Field label="Alamat">
                    <p className="text-sm">{address}&nbsp;</p>
                </Field>

                <Field label="No. Telepon">
                    <p className="text-sm">{phone}&nbsp;</p>
                </Field>

                {activeUntil && (
                    <div className="absolute top-4 right-4">
                        <SubscriptionBadge
                            status={subscriptionStatus}
                            activeUntil={activeUntil}
                        />
                    </div>
                )}

                <button
                    onClick={() => setShowProfileModal(true)}
                    className="p-2 rounded-full text-white bg-blue-500 hover:bg-blue-600 absolute right-4 bottom-4 active:scale-95"
                >
                    <Pencil size={18} />
                </button>
            </Section>

            <Section title="Layanan & Harga">
                <div className="grid grid-cols-1 gap-3">
                    <ServiceTab
                        title="Kategori Layanan"
                        description="Kelola kategori kiloan / satuan"
                        icon={<Layers size={18} />}
                        onClick={() => router.push('/dashboard/setting/services/categories')}
                    />

                    <ServiceTab
                        title="Jenis Layanan"
                        description="Kelola jenis layanan & harga"
                        icon={<Scale size={18} />}
                        onClick={() => router.push('/dashboard/setting/services/types')}
                    />

                    <ServiceTab
                        title="Kecepatan Layanan"
                        description="Reguler, express, dll"
                        icon={<Clock size={18} />}
                        onClick={() => router.push('/dashboard/setting/services/speeds')}
                    />
                </div>
            </Section>


            {/* ======================
          NOTA WHATSAPP
      ====================== */}
            <Section title="Nota Elektronik WhatsApp">
                <Field label="Header Nota">
                    <textarea
                        rows={6}
                        placeholder={`Contoh:
**NOTA ELEKTRONIK**

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
                        placeholder={`Contoh:
**Opsi Pembayaran:**

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
                    onClick={saveWhatsappTemplate}
                    disabled={loadingNota}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60
    text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                >
                    <ReceiptText size={24} />
                    {loadingNota ? 'Menyimpan...' : 'Update Nota'}
                </button>
            </Section>

            {/* ===== LOGOUT ===== */}
            <button
                onClick={handleLogout}
                disabled={loadingLogout}
                className="w-full mt-4 bg-red-500 hover:bg-red-600 disabled:opacity-60
    text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
                <LogOut size={18} />
                {loadingLogout ? 'Logging out...' : 'Logout'}
            </button>

            <p className="text-[11px] text-slate-400 text-center mt-6">
                WashBase – Fast & Paperless Laundry System
            </p>

            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-2 shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800">
                            Edit Profil Laundry
                        </h3>

                        {/* NAMA */}
                        <div className="">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Nama Laundry
                            </label>
                            <input
                                value={laundryName}
                                onChange={(e) => setLaundryName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* ALAMAT */}
                        <div className="">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Alamat
                            </label>
                            <textarea
                                rows={2}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* TELEPON */}
                        <div className="">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                No. Telepon
                            </label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* ACTION */}
                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100"
                            >
                                Batal
                            </button>

                            <button
                                disabled={loadingProfile}
                                onClick={async () => {
                                    await updateProfile()
                                    setShowProfileModal(false)
                                }}
                                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white"
                            >
                                {loadingProfile ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2 relative">
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

function ServiceTab({
    title,
    description,
    icon,
    onClick,
}: {
    title: string
    description: string
    icon: React.ReactNode
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-slate-50 hover:bg-blue-50
            border border-slate-200 hover:border-blue-300
            rounded-2xl p-4 transition
            flex items-center gap-4"
        >
            {/* ICON */}
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                {icon}
            </div>

            {/* TEXT */}
            <div>
                <p className="font-semibold text-slate-800">{title}</p>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
        </button>
    )
}

function SubscriptionBadge({
    status,
    activeUntil,
}: {
    status: 'active' | 'warning' | 'expired'
    activeUntil: string
}) {
    const styles = {
        active: 'bg-green-100 text-green-700 border-green-500',
        warning: 'bg-yellow-100 text-yellow-700 border-yellow-500',
        expired: 'bg-red-100 text-red-700 border-red-500',
    }

    const labels = {
        active: 'Aktif · sampai',
        warning: 'Hampir Habis · ',
        expired: 'Expired · ',
    }

    return (
        <div
            className={`text-xs px-3 py-1 rounded-full border font-semibold ${styles[status]}`}
        >
            {labels[status]}{' '}
            {new Date(activeUntil).toLocaleDateString('id-ID')}
        </div>
    )
}
