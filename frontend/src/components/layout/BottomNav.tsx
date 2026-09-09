'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, MessageSquare, User, Trophy } from 'lucide-react';
import { cn } from './Sidebar';
import { useAuthStore } from '@/stores/authStore';

const NAV_ITEMS = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/video', icon: Gamepad2, label: 'Video' },
  { href: '/tournaments', icon: Trophy, label: 'Tournaments' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname() || '';
  const { user } = useAuthStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#08080C]/90 backdrop-blur-xl border-t border-surface-border z-50 flex items-center justify-around px-4 pb-safe">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === '/feed'
          ? (pathname === '/feed' || pathname === '/')
          : (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all",
              isActive ? "text-accent-lime" : "text-foreground/60"
            )}
          >
            <div className="relative flex items-center justify-center">
              {isActive && (
                <div className="absolute -inset-2 bg-accent-lime/20 rounded-full blur-md" />
              )}
              {item.href === '/profile' && (user?.avatar_url || user?.avatar) ? (
                <img
                  src={user.avatar_url || user.avatar || ''}
                  alt={user.display_name || user.name || 'Profile'}
                  className={cn(
                    "w-6 h-6 rounded-lg object-cover border relative z-10",
                    isActive ? "border-accent-lime shadow-[0_0_8px_rgba(213,255,64,0.6)]" : "border-surface-border"
                  )}
                />
              ) : (
                <Icon className={cn("w-6 h-6 relative z-10", isActive ? "drop-shadow-[0_0_8px_rgba(213,255,64,0.5)]" : "")} />
              )}
            </div>
            {isActive && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-accent-lime shadow-[0_0_5px_#D5FF40]" />}
          </Link>
        );
      })}
    </nav>
  );
}
