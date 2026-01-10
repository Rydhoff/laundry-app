'use client'

import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="p-8 max-w-sm w-full text-center space-y-6">
                {/* Text */}
                <div className="space-y-2">
                    <h1 className="text-xl font-bold">
                        Halaman Tidak Ditemukan
                    </h1>
                    <p className="text-sm text-slate-500">
                        Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={14} />
                        Kembali
                    </button>
                </div>
            </div>
        </div>
    )
}
