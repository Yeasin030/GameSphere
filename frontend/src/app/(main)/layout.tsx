"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (!token) {
            router.replace('/login');
        } else {
            if (!isAuthenticated) {
                checkAuth().finally(() => setIsChecking(false));
            } else {
                setIsChecking(false);
            }
        }
    }, [isAuthenticated, router, checkAuth]);

    if (isChecking) {
        return (
            <div className="min-h-screen bg-[#08080C] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm font-medium">Entering GameSphere...</p>
            </div>
        );
    }

    return <>{children}</>;
}
