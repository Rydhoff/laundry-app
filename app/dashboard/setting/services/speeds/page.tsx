'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Speed = {
    id?: string
    name: string
    description: string
    extra_price_kilo: number
    extra_price_satuan: number
    is_active: boolean
}

export default function SpeedsPage() {
    const router = useRouter()
    const [data, setData] = useState<Speed[]>([])
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const { data } = await supabase
            .from('service_speeds')
            .select('*')
            .order('created_at')

        if (data) {
            setData(
                data.map((i) => ({
                    id: i.id,
                    name: i.name,
                    description: i.description || '',
                    extra_price_kilo: i.extra_price_kilo,
                    extra_price_satuan: i.extra_price_satuan,
                    is_active: i.is_active,
                }))
            )
        }
    }

    /* ================= CRUD ================= */

    const save = async (item: Speed) => {
        const payload = {
            name: item.name,
            description: item.description,
            extra_price_kilo: item.extra_price_kilo,
            extra_price_satuan: item.extra_price_satuan,
            is_active: item.is_active,
        }

        if (item.id) {
            await supabase
                .from('service_speeds')
                .update(payload)
                .eq('id', item.id)
        } else {
            await supabase.from('service_speeds').insert(payload)
        }

        load()
    }

    const requestDelete = (id?: string) => {
        if (!id) return
        setDeleteTarget(id)
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return

        await supabase
            .from('service_speeds')
            .delete()
            .eq('id', deleteTarget)

        setDeleteTarget(null)
        load()
    }


    const addNew = () => {
        setData((prev) => [
            {
                name: '',
                description: '',
                extra_price_kilo: 0,
                extra_price_satuan: 0,
                is_active: true,
            },
            ...prev,
        ])
    }

    const toggleActive = async (id: string, value: boolean) => {
        await supabase
            .from('service_speeds')
            .update({ is_active: value })
            .eq('id', id)
    }

    return (
        <div className="space-y-4">
            {/* ===== HEADER ===== */}
            <div className="space-y-1">
                <h1 className="text-xl font-bold">Kecepatan Layanan</h1>
                <p className="text-sm text-slate-500">
                    Atur estimasi waktu dan biaya tambahan layanan
                </p>
            </div>

            {/* ===== CONTENT ===== */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="font-bold">Daftar Kecepatan</h2>
                        <p className="text-sm text-slate-500">
                            Biaya tambahan akan ditambahkan ke harga layanan
                        </p>
                    </div>
                    <button
                        onClick={addNew}
                        className="flex items-center gap-1 text-sm text-blue-500"
                    >
                        <Plus size={16} />
                        Tambah
                    </button>
                </div>

                {data.map((item, i) => (
                    <FormRow
                        key={item.id || i}
                        item={item}
                        toggleActive={toggleActive}   // ⬅️ TAMBAH
                        onChange={(newItem) => {
                            const copy = [...data]
                            copy[i] = newItem
                            setData(copy)
                        }}
                        onSave={() => save(item)}
                        onDelete={() => requestDelete(item.id)}
                    />

                ))}
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800">
                            ⚠️ Peringatan Hapus Kecepatan
                        </h3>

                        <p className="text-sm text-slate-600">
                            Setiap kecepatan layanan memiliki ID unik dan dapat terhubung
                            dengan data order.
                        </p>

                        <p className="text-sm text-slate-600">
                            Menghapus kecepatan yang sudah pernah digunakan dalam order
                            dapat menyebabkan data order bermasalah atau tidak dapat
                            ditampilkan.
                        </p>

                        <p className="text-sm text-slate-600">
                            Untuk keamanan sistem, sebaiknya <b>nonaktifkan</b> kecepatan
                            layanan daripada menghapusnya.
                        </p>

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100"
                            >
                                Batal
                            </button>

                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                            >
                                Tetap Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

/* ================= UI ================= */

function FormRow({
    item,
    onChange,
    onSave,
    onDelete,
    toggleActive,
}: {
    item: Speed
    onChange: (item: Speed) => void
    onSave: () => void
    onDelete: () => void
    toggleActive: (id: string, value: boolean) => Promise<void>
}) {
    return (
        <div className="space-y-3 border border-slate-200 hover:border-blue-300 rounded-xl p-5 transition">
            <div className="grid gap-3">
                <input
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 font-semibold border border-slate-200 rounded-xl"
                    placeholder="Nama kecepatan (Reguler / Express)"
                    value={item.name}
                    onChange={(e) =>
                        onChange({ ...item, name: e.target.value })
                    }
                />

                <input
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 font-semibold border border-slate-200 rounded-xl"
                    placeholder="Deskripsi / estimasi waktu"
                    value={item.description}
                    onChange={(e) =>
                        onChange({ ...item, description: e.target.value })
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label htmlFor="kiloan" className="text-sm font-semibold">Biaya tambahan kiloan</label>
                    <input
                        id="kiloan"
                        type="number"
                        className="focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 font-semibold border border-slate-200 rounded-xl"
                        placeholder="Biaya tambahan kiloan"
                        value={item.extra_price_kilo}
                        onChange={(e) =>
                            onChange({
                                ...item,
                                extra_price_kilo: Number(e.target.value),
                            })
                        }
                    />

                    <label htmlFor="satuan" className="text-sm font-semibold">Biaya tambahan satuan</label>
                    <input
                        id="satuan"
                        type="number"
                        className="focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 font-semibold border border-slate-200 rounded-xl"
                        placeholder="Biaya tambahan satuan"
                        value={item.extra_price_satuan}
                        onChange={(e) =>
                            onChange({
                                ...item,
                                extra_price_satuan: Number(e.target.value),
                            })
                        }
                    />
                </div>
            </div>

            <div className="flex justify-between items-center">
                {/* SWITCH */}
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.is_active}
                        onChange={async (e) => {
                            const value = e.target.checked

                            // optimistic UI
                            onChange({ ...item, is_active: value })

                            if (item.id) {
                                await toggleActive(item.id, value)
                            }
                        }}
                    />
                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-blue-500 transition" />
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition" />
                </label>

                <div className="flex gap-2">

                    {item.id && (
                        <button
                            onClick={onDelete}
                            className="text-red-500 hover:text-white px-3 py-1.5 rounded-xl"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                    <button
                        onClick={onSave}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-xl flex items-center gap-1 text-sm"
                    >
                        <Save size={14} />
                        Simpan
                    </button>

                </div>
            </div>
        </div>
    )
}
