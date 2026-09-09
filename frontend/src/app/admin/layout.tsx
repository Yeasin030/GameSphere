'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Gamepad2, Newspaper, Flag, Settings, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/games', label: 'Games', icon: Gamepad2 },
    { href: '/admin/news', label: 'News', icon: Newspaper },
    { href: '/admin/reports', label: 'Reports', icon: Flag },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-surface border-r border-surface-border flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-surface-border">
          <div className="flex items-center gap-3 text-accent-magenta font-display font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-accent-magenta/20 flex items-center justify-center border border-accent-magenta/50">
              G
            </div>
            Admin Panel
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-accent-magenta/10 text-accent-magenta border border-accent-magenta/30 shadow-[inset_0_0_10px_rgba(236,72,153,0.1)]' 
                    : 'text-foreground/60 hover:text-white hover:bg-surface-light border border-transparent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-surface-border">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-foreground/60 hover:text-white hover:bg-surface-light rounded-xl transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" /> Back to App
          </Link>
        </div>
      </aside>
      
      {/* Admin Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-background">
        {children}
      </main>
    </div>
  );
}
