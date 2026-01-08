'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import Image from "next/image"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            toast.error(error.message || 'Login failed')
            setLoading(false)
            return
        }

        router.push('/dashboard')
        setLoading(false)
    }

    return (
        <div className="min-h-dvh overflow-hidden flex items-center justify-center bg-linear-to-b bg-blue-50 to-slate-100">
            < div className="w-full lg:max-w-sm p-6 sm:p-8 lg:bg-white lg:rounded-2xl lg:shadow-sm" >

                {/* Logo */}
                < div className="flex justify-center mb-6" >
                    <div className="w-19 h-19 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden">
                        <Image
                            src="/logo/logo.png"
                            alt="Laundry App Logo"
                            width={120}
                            height={120}
                            priority
                        />
                    </div>
                </div >

                {/* Title */}
                < h1 className="text-2xl font-bold text-center" >
                    Admin Portal
                </h1 >
                <p className="text-sm text-slate-400 text-center mt-1 mb-6">
                    Kelola pesanan dan layanan dengan mudah.
                </p>
                <form onSubmit={(e) => e.preventDefault()}>
                    {/* Email */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-md font-semibold mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                id="email"
                                type="email"
                                placeholder="admin@laundry.app"
                                className="w-full pl-10 pr-3 py-2.5 border border-slate-400 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-md font-semibold mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                className="w-full pl-10 pr-10 py-2.5 border border-slate-400 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-medium transition disabled:opacity-60"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>

                </form>
                {/* Footer */}
                <p className="text-xs text-slate-400 text-center mt-8">
                    Version 1.0.0 • Laundry App
                </p>
            </div >
        </div >
    )
}
