"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        try {
            await login(email, password);
            router.push('/feed');
        } catch {
            // error already set in store
        }
    };

    return (
        <div className="min-h-screen bg-[#08080C] flex">
            {/* Left branding */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-black overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-black to-pink-900/30" />
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(139,92,246,0.3) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
                <div className="relative z-10 text-center px-12 max-w-lg">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40">
                        <Gamepad2 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
                        Game<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Sphere</span>
                    </h2>
                    <p className="text-white/60 text-lg">Connect. Play. Compete. Conquer.</p>
                    <p className="text-white/40 text-sm mt-2">The ultimate gaming social network.</p>
                </div>
            </div>

            {/* Right form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                            <Gamepad2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">GameSphere</span>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Welcome back!</h1>
                        <p className="text-gray-400 text-sm">Login to your account to continue</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">Forgot password?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Logging in...</> : 'Login'}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[#08080C] px-3 text-gray-500">or continue with</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {[
                            { label: 'Google', icon: 'https://www.svgrepo.com/show/475656/google-color.svg', invert: false },
                            { label: 'Discord', icon: 'https://www.svgrepo.com/show/353655/discord-icon.svg', invert: false },
                            { label: 'Steam', icon: 'https://www.svgrepo.com/show/354388/steam.svg', invert: true },
                        ].map((p) => (
                            <button
                                key={p.label}
                                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                            >
                                <img src={p.icon} alt={p.label} className={`w-5 h-5 ${p.invert ? 'invert' : ''}`} />
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-sm text-gray-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-purple-400 font-semibold hover:text-purple-300">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
