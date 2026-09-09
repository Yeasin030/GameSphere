"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Gamepad2, 
  Home, 
  Trophy, 
  Users, 
  MessageSquare, 
  Bell, 
  Search,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';

const navigation = [
  { name: 'Feed', href: '/feed', icon: Home },
  { name: 'Tournaments', href: '/tournaments', icon: Trophy },
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-space text-gray-100 flex overflow-hidden selection:bg-neon-violet selection:text-white">
      

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-space/50 backdrop-blur-xl z-20">
          <div className="bg-gradient-to-tr from-neon-violet to-neon-cyan p-1.5 rounded-lg">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex gap-4 text-gray-400">
            <Search className="w-5 h-5" />
            <Bell className="w-5 h-5" />
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <div className="max-w-3xl mx-auto w-full pb-20 md:pb-0">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/5 bg-space/80 backdrop-blur-xl p-3 flex justify-around z-20">
          {navigation.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className={`p-2 rounded-xl ${isActive ? 'text-neon-violet' : 'text-gray-400'}`}>
                <Icon className="w-6 h-6" />
              </Link>
            );
          })}
        </nav>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 hidden lg:flex flex-col border-l border-white/5 bg-space/50 backdrop-blur-xl">
        <div className="p-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Gamesphere..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 space-y-8">
          {/* Trending Tournaments */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Trending Now</h3>
            <div className="space-y-4">
              {[
                { tag: '#ApexGlobal', posts: '124K posts' },
                { tag: '#ValorantChampions', posts: '89K posts' },
                { tag: 'Cyberpunk DLC', posts: '45K posts' }
              ].map((trend) => (
                <div key={trend.tag} className="group cursor-pointer">
                  <p className="font-medium text-gray-200 group-hover:text-neon-violet transition-colors">{trend.tag}</p>
                  <p className="text-xs text-gray-500">{trend.posts}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Online Friends */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Online Friends (3)</h3>
            <div className="space-y-4">
              {[
                { name: 'AlexTheGreat', game: 'Playing Valorant', avatar: 'https://i.pravatar.cc/150?u=2' },
                { name: 'SarahSniper', game: 'In a match', avatar: 'https://i.pravatar.cc/150?u=3' },
                { name: 'NoobMaster69', game: 'Online', avatar: 'https://i.pravatar.cc/150?u=4' }
              ].map((friend) => (
                <div key={friend.name} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <Avatar src={friend.avatar} fallback={friend.name} className="w-10 h-10 ring-2 ring-transparent group-hover:ring-neon-violet transition-all" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-neon-green rounded-full border-2 border-space"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{friend.name}</p>
                    <p className="text-xs text-neon-cyan">{friend.game}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

    </div>
  );
}
