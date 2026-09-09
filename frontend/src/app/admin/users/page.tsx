'use client';

import { Search, MoreVertical, Edit2, Trash2, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

export default function AdminUsersPage() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">User Management</h1>
          <p className="text-foreground/60 mt-1">View, edit, and manage registered users.</p>
        </div>
        <Button variant="default" className="bg-accent-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] border-0">
          Export Users
        </Button>
      </div>

      <Card className="bg-surface border-surface-border p-6 space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <input 
              type="text" 
              placeholder="Search by name, email, or username..." 
              className="w-full bg-background border border-surface-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-blue transition-colors"
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
                <th className="pb-4 font-bold pl-2">User</th>
                <th className="pb-4 font-bold">Email</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold">Joined</th>
                <th className="pb-4 font-bold text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Alex Smith', user: 'AlexTheGreat', email: 'alex@example.com', status: 'Active', date: 'Oct 12, 2023', avatar: 'https://i.pravatar.cc/150?u=1' },
                { name: 'Sarah Connor', user: 'SarahSniper', email: 'sarah.c@example.com', status: 'Active', date: 'Nov 05, 2023', avatar: 'https://i.pravatar.cc/150?u=2' },
                { name: 'John Doe', user: 'NoobMaster69', email: 'johndoe@example.com', status: 'Suspended', date: 'Dec 10, 2023', avatar: 'https://i.pravatar.cc/150?u=3' },
                { name: 'Jane Smith', user: 'JaneGamer', email: 'jane@example.com', status: 'Active', date: 'Jan 22, 2024', avatar: 'https://i.pravatar.cc/150?u=4' },
                { name: 'Mike Ross', user: 'MikeyR', email: 'mike@example.com', status: 'Active', date: 'Feb 14, 2024', avatar: 'https://i.pravatar.cc/150?u=5' },
              ].map((user, idx) => (
                <tr key={idx} className="border-b border-surface-border hover:bg-surface-light/50 transition-colors">
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-bold text-white text-sm">{user.name}</p>
                        <p className="text-xs text-foreground/50">@{user.user}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-foreground/80">{user.email}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.status === 'Active' 
                        ? 'bg-accent-lime/10 text-accent-lime border border-accent-lime/30' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/30'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-foreground/60">{user.date}</td>
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
          <p className="text-sm text-foreground/50">Showing 1 to 5 of 45,231 users</p>
          <div className="flex gap-2">
            <Button variant="outline" className="border-surface-border" disabled>Previous</Button>
            <Button variant="outline" className="border-surface-border">Next</Button>
          </div>
        </div>

      </Card>
    </div>
  );
}
