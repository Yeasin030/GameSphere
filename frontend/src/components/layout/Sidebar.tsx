'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Gamepad2, 
  MessageSquare, 
  User, 
  Trophy, 
  Newspaper, 
  Users, 
  Video, 
  Film, 
  Bell, 
  Bookmark, 
  Settings, 
  ChevronDown,
  Sparkles,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { href: '/feed', icon: Home, label: 'Home' },
  { href: '/follow', icon: UserPlus, label: 'Follow Gamers', badge: 'New', badgeColor: 'bg-emerald-500' },
  { href: '/news', icon: Newspaper, label: 'News' },
  { href: '/games', icon: Gamepad2, label: 'Games' },
  { href: '/groups', icon: Users, label: 'Communities' },
  { href: '/tournaments', icon: Trophy, label: 'Tournaments' },
  { href: '/video', icon: Video, label: 'Videos' },
  { href: '/reels', icon: Film, label: 'Reels' },
  { href: '/messages', icon: MessageSquare, label: 'Messages', badge: '6', badgeColor: 'bg-[#5542f6]' },
  { href: '/call/test-room', icon: Video, label: 'Voice/Video Call', badge: 'Live', badgeColor: 'bg-red-500' },
  { href: '/notifications', icon: Bell, label: 'Notifications', badge: null, badgeColor: 'bg-[#ec4899]' },
  { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const SHORTCUTS = [
  { name: 'Valorant Squad', img: '/squad_emblem.jpg', href: '/messages' },
  { name: 'GTA V Community', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&auto=format&fit=crop&q=80', href: '/groups' },
  { name: 'eFootball League', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=80&auto=format&fit=crop&q=80', href: '/tournaments' },
  { name: 'Minecraft Builders', img: 'https://images.unsplash.com/photo-1627856014754-2907e2355324?w=80&auto=format&fit=crop&q=80', href: '/groups' },
  { name: 'Call of Duty Zone', img: '/clutch_gameplay.jpg', href: '/feed' },
];

export default function Sidebar() {
  const pathname = usePathname() || '';
  const [showMoreShortcuts, setShowMoreShortcuts] = useState(false);
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-[#161b26] bg-[#090c13] z-50 select-none">
      {/* Brand Header */}
      <div className="flex items-center px-6 h-16 border-b border-[#161b26]/80 flex-shrink-0">
        <Link href="/feed" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#ec4899] flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white tracking-wide">
            GameSphere
          </span>
        </Link>
      </div>

      {/* Scrollable Navigation & Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3.5 py-4 space-y-6">
        {/* Main Nav Items */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/feed' 
              ? (pathname === '/feed' || pathname === '/')
              : (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
            const Icon = item.icon;

            const badgeValue = item.href === '/notifications'
              ? (unreadCount > 0 ? (unreadCount > 99 ? '99+' : String(unreadCount)) : null)
              : item.badge;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group",
                  isActive
                    ? "bg-[#5542f6] text-white shadow-[0_0_20px_rgba(85,66,246,0.35)]"
                    : "text-gray-400 hover:text-gray-100 hover:bg-[#141926]"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={cn(
                    "w-[19px] h-[19px] transition-colors",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                  )} />
                  <span>{item.label}</span>
                </div>

                {badgeValue && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full leading-none shadow-[0_0_8px_rgba(85,66,246,0.6)]",
                    item.badgeColor || "bg-[#ec4899]"
                  )}>
                    {badgeValue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Shortcuts Section */}
        <div className="pt-2">
          <p className="px-3.5 text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2.5">
            Your Shortcuts
          </p>
          <div className="flex flex-col gap-1.5">
            {SHORTCUTS.slice(0, showMoreShortcuts ? undefined : 5).map((sc) => (
              <Link
                key={sc.name}
                href={sc.href}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-[#141926] transition-colors group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={sc.img}
                    alt=""
                    className="w-5 h-5 rounded-md object-cover border border-[#232a3b] flex-shrink-0"
                  />
                  <span className="truncate">{sc.name}</span>
                </div>
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setShowMoreShortcuts(!showMoreShortcuts)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <span>Show More</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showMoreShortcuts && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* Go Premium Card */}
        <div className="relative p-3.5 rounded-2xl bg-gradient-to-b from-[#141828] to-[#0c0f18] border border-[#232a3d] overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 text-sm">👑</span>
              <h4 className="font-display font-bold text-white text-sm">Go Premium</h4>
            </div>
            
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Unlock exclusive badges, no ads, custom profile and more!
            </p>

            <button
              type="button"
              className="w-full py-2 px-3 rounded-xl bg-[#5542f6] hover:bg-[#6654f8] text-white text-xs font-semibold shadow-[0_0_15px_rgba(85,66,246,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade Now
            </button>

            {/* Glowing 3D Shield Crest */}
            <div className="relative pt-2 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-[#8b5cf6]/20 blur-xl absolute inset-0 m-auto" />
              <img
                src="/premium_shield.jpg"
                alt="Championship Shield"
                className="w-24 h-24 object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(139,92,246,0.5)] hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Card & Logout Footer */}
      <div className="p-3 border-t border-[#161b26] bg-[#090c13] flex items-center justify-between gap-2 flex-shrink-0">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 min-w-0 flex-1 hover:bg-[#141926] p-1.5 rounded-xl transition-colors group"
        >
          <div className="relative flex-shrink-0">
            <img
              src={user?.avatar_url || user?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${user?.username || 'Gamer'}`}
              alt={user?.name || user?.username || 'User'}
              className="w-9 h-9 rounded-xl object-cover border border-[#232a3b] bg-surface"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#090c13]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate group-hover:text-[#8b5cf6] transition-colors">
              {user?.display_name || user?.name || user?.username || 'Gamer'}
            </span>
            <span className="text-[10px] text-gray-400 truncate">
              @{user?.username || 'gamer'}
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          title="Log Out"
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex-shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
