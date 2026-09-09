'use client';

import { Search, Plus, MoreVertical, Edit2, Trash2, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminGamesPage() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Game Management</h1>
          <p className="text-foreground/60 mt-1">Add, edit, and manage games on the platform.</p>
        </div>
        <Button variant="default" className="bg-accent-magenta text-white shadow-[0_0_15px_rgba(236,72,153,0.3)] border-0 gap-2">
          <Plus className="w-5 h-5" /> Add New Game
        </Button>
      </div>

      <Card className="bg-surface border-surface-border p-6 space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <input 
              type="text" 
              placeholder="Search games..." 
              className="w-full bg-background border border-surface-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-magenta transition-colors"
            />
          </div>
          <Button variant="outline" className="border-surface-border hover:bg-surface-light gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border text-foreground/50 text-xs uppercase tracking-wider">
                <th className="pb-4 font-bold pl-2">Game</th>
                <th className="pb-4 font-bold">Developer</th>
                <th className="pb-4 font-bold">Release Date</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { title: 'Elden Ring', dev: 'FromSoftware', date: 'Feb 25, 2022', status: 'Published', img: '/hero_cyberpunk_bg_1788280645324.jpg' },
                { title: 'Cyberpunk 2077', dev: 'CD Projekt Red', date: 'Dec 10, 2020', status: 'Published', img: '/feature_share_1788280706281.jpg' },
                { title: 'GTA VI', dev: 'Rockstar Games', date: 'Coming 2025', status: 'Draft', img: '/feature_connect_1788280659632.jpg' },
                { title: 'Valorant', dev: 'Riot Games', date: 'Jun 2, 2020', status: 'Published', img: '/feature_play_1788280674540.jpg' },
              ].map((game, idx) => (
                <tr key={idx} className="border-b border-surface-border hover:bg-surface-light/50 transition-colors">
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                        <img src={game.img} alt={game.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="font-bold text-white text-sm">{game.title}</p>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-foreground/80">{game.dev}</td>
                  <td className="py-4 text-sm text-foreground/60">{game.date}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      game.status === 'Published' 
                        ? 'bg-accent-lime/10 text-accent-lime border border-accent-lime/30' 
                        : 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30'
                    }`}>
                      {game.status}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-2">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-foreground/50 hover:text-accent-cyan">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-foreground/50 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-foreground/50 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-border">
          <p className="text-sm text-foreground/50">Showing 1 to 4 of 1,204 games</p>
          <div className="flex gap-2">
            <Button variant="outline" className="border-surface-border" disabled>Previous</Button>
            <Button variant="outline" className="border-surface-border">Next</Button>
          </div>
        </div>

      </Card>
    </div>
  );
}
