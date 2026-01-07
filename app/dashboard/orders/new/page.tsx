'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function NewOrderPage() {
    const router = useRouter()
    const [services, setServices] = useState<any[]>([])
    const [form, setForm] = useState({
        customer_name: '',
        phone: '',
        weight_kg: '',
        service_id: '',
    })
    const [price, setPrice] = useState(0)

    useEffect(() => {
        supabase.from('services').select('*').then(({ data }) => {
            setServices(data || [])
        })
    }, [])

    useEffect(() => {
        const service = services.find(s => s.id === form.service_id)
        if (service && form.weight_kg) {
            setPrice(Number(form.weight_kg) * Number(service.price_per_kg))
        }
    }, [form, services])

    const submit = async () => {
        await supabase.from('orders').insert({
            ...form,
            weight_kg: Number(form.weight_kg),
            price,
            status: 'Diterima',
        })
        router.push('/orders')
    }

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-lg font-semibold mb-4">Order Baru</h1>

            <input
                placeholder="Nama pelanggan"
                className="input"
                value={form.customer_name}
                onChange={e => setForm({ ...form, customer_name: e.target.value })}
            />

            <input
                placeholder="No HP"
                className="input"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
            />

            <input
                placeholder="Berat (kg)"
                type="number"
                className="input"
                value={form.weight_kg}
                onChange={e => setForm({ ...form, weight_kg: e.target.value })}
            />

            <select
                className="input"
                value={form.service_id}
                onChange={e => setForm({ ...form, service_id: e.target.value })}
            >
                <option value="">Pilih layanan</option>
                {services.map(s => (
                    <option key={s.id} value={s.id}>
                        {s.name}
                    </option>
                ))}
            </select>

            <p className="my-2 font-medium">Total: Rp {price.toLocaleString()}</p>

            <button onClick={submit} className="btn-primary w-full">
                Simpan Order
            </button>
        </div>
    )
}
