'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { Plus, Save, Trash2 } from 'lucide-react'

type Item = {
    id?: string
    name: string
    description: string
    price: number
    is_active: boolean
}

export default function TypesPage() {
    const [kilo, setKilo] = useState<Item[]>([])
    const [satuan, setSatuan] = useState<Item[]>([])
    const [deleteTarget, setDeleteTarget] = useState<{
        table: 'kilo_services' | 'satuan_items'
        id: string
    } | null>(null)

    // 1️⃣ FUNCTION LOAD (ASYNC, TANPA HOOK)
    const load = async () => {
        const kiloRes = await supabase
            .from('kilo_services')
            .select('*')
            .order('created_at')

        const satuanRes = await supabase
            .from('satuan_items')
            .select('*')
            .order('created_at')

        if (kiloRes.data && satuanRes.data) {
            setKilo(kiloRes.data)
            setSatuan(satuanRes.data)
        }
    }

    useEffect(() => {
        const run = async () => {
            await load()
        }
        run()
    }, [])

    /* ================= CRUD ================= */

    const saveItem = async (
        table: 'kilo_services' | 'satuan_items',
        item: Item
    ) => {
        const payload =
            table === 'kilo_services'
                ? {
                    name: item.name,
                    description: item.description,
                    price_per_kg: item.price,
                    is_active: item.is_active,
                }
                : {
                    name: item.name,
                    description: item.description,
                    price_per_item: item.price,
                    is_active: item.is_active,
                }

        if (item.id) {
            await supabase.from(table).update(payload).eq('id', item.id)
        } else {
            await supabase.from(table).insert(payload)
        }

        load()
    }

    const requestDelete = (
        table: 'kilo_services' | 'satuan_items',
        id?: string
    ) => {
        if (!id) return
        setDeleteTarget({ table, id })
    }


    const addNew = (
        setter: React.Dispatch<React.SetStateAction<Item[]>>
    ) => {
        setter((prev) => [
            {
                name: '',
                description: '',
                price: 0,
                is_active: true,
            },
            ...prev,
        ])
    }


    const confirmDelete = async () => {
        if (!deleteTarget) return

        await supabase
            .from(deleteTarget.table)
            .delete()
            .eq('id', deleteTarget.id)

        setDeleteTarget(null)
        load()
    }

    const toggleActive = async (
        table: 'kilo_services' | 'satuan_items',
        id: string,
        value: boolean
    ) => {
        await supabase
            .from(table)
            .update({ is_active: value })
            .eq('id', id)
    }

    return (
        <div className="space-y-4">
            {/* ===== HEADER ===== */}
            <div className="space-y-1">
                <h1 className="text-xl font-bold">Jenis Layanan</h1>
                <p className="text-sm text-slate-500">
                    Atur jenis layanan dan harga untuk pelanggan
                </p>
            </div>

            {/* ===== KILO ===== */}
            <Section
                title="Layanan Kiloan"
                description="Harga dihitung per kilogram"
                onAdd={() => addNew(setKilo)}
            >
                {kilo.map((item, i) => (
                    <FormRow
                        table="kilo_services"
                        item={item}
                        toggleActive={toggleActive}
                        key={item.id || i}
                        priceLabel="Harga / Kg"
                        onChange={(newItem) => {
                            const copy = [...kilo]
                            copy[i] = newItem
                            setKilo(copy)
                        }}
                        onSave={() => saveItem('kilo_services', item)}
                        onDelete={() => requestDelete('kilo_services', item.id)}
                    />
                ))}
            </Section>

            {/* ===== SATUAN ===== */}
            <Section
                title="Layanan Satuan"
                description="Harga dihitung per item"
                onAdd={() => addNew(setSatuan)}
            >
                {satuan.map((item, i) => (
                    <FormRow
                        table="satuan_items"
                        item={item}
                        toggleActive={toggleActive}
                        key={item.id || i}
                        priceLabel="Harga / Item"
                        onChange={(newItem) => {
                            const copy = [...satuan]
                            copy[i] = newItem
                            setSatuan(copy)
                        }}
                        onSave={() => saveItem('satuan_items', item)}
                        onDelete={() => requestDelete('satuan_items', item.id)}
                    />
                ))}
            </Section>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800">
                            ⚠️ Peringatan Hapus Layanan
                        </h3>

                        <p className="text-sm text-slate-600">
                            Setiap layanan memiliki ID unik dan dapat terhubung dengan data
                            order.
                        </p>

                        <p className="text-sm text-slate-600">
                            Menghapus layanan yang sudah pernah digunakan dalam order dapat
                            menyebabkan data order bermasalah atau tidak dapat ditampilkan.
                        </p>

                        <p className="text-sm text-slate-600">
                            Untuk keamanan sistem, sebaiknya <b>nonaktifkan</b> layanan
                            daripada menghapusnya.
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

function Section({
    title,
    description,
    children,
    onAdd,
}: {
    title: string
    description: string
    children: React.ReactNode
    onAdd: () => void
}) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="font-bold">{title}</h2>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-1 text-sm text-blue-500"
                >
                    <Plus size={16} />
                    Tambah
                </button>
            </div>
            {children}
        </div>
    )
}

function FormRow({
    table,
    item,
    priceLabel,
    onChange,
    onSave,
    onDelete,
    toggleActive,
}: {
    table: 'kilo_services' | 'satuan_items'
    item: Item
    priceLabel: string
    onChange: (item: Item) => void
    onSave: () => void
    onDelete: () => void
    toggleActive: (
        table: 'kilo_services' | 'satuan_items',
        id: string,
        value: boolean
    ) => Promise<void>
}) {
    return (
        <div className="space-y-3 border border-slate-200 hover:border-blue-300 rounded-xl p-5 transition">
            <div className="grid gap-3">
                <input
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 font-semibold border border-slate-200 rounded-xl"
                    placeholder="Nama layanan"
                    value={item.name}
                    onChange={(e) =>
                        onChange({ ...item, name: e.target.value })
                    }
                />

                <input
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 border border-slate-200 rounded-xl"
                    placeholder="Deskripsi (opsional)"
                    value={item.description}
                    onChange={(e) =>
                        onChange({ ...item, description: e.target.value })
                    }
                />

                <input
                    type="number"
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 border border-slate-200 rounded-xl"
                    placeholder={priceLabel}
                    value={item.price}
                    onChange={(e) =>
                        onChange({
                            ...item,
                            price: Number(e.target.value),
                        })
                    }
                />
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
                            onChange({
                                ...item,
                                is_active: value,
                            })

                            if (item.id) {
                                await toggleActive(
                                    table,
                                    item.id,
                                    value
                                )
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
