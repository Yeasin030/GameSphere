'use client';

import { Users, Gamepad2, AlertTriangle, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function AdminDashboardPage() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Overview</h1>
          <p className="text-foreground/60 mt-1">Platform statistics and recent activity.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface border border-surface-border p-1.5 rounded-lg">
          {['Today', '7d', '30d', 'All Time'].map((time, i) => (
            <button key={time} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${i === 2 ? 'bg-accent-magenta text-white' : 'text-foreground/60 hover:text-white'}`}>
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '45,231', icon: Users, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', border: 'border-accent-cyan/30', trend: '+12.5%' },
          { label: 'Active Games', value: '1,204', icon: Gamepad2, color: 'text-accent-magenta', bg: 'bg-accent-magenta/10', border: 'border-accent-magenta/30', trend: '+4.2%' },
          { label: 'Revenue', value: '$84,230', icon: DollarSign, color: 'text-accent-lime', bg: 'bg-accent-lime/10', border: 'border-accent-lime/30', trend: '+28.4%' },
          { label: 'Open Reports', value: '23', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', trend: '-5.1%' },
        ].map((stat, idx) => (
          <Card key={idx} className={`bg-surface border-surface-border p-6 relative overflow-hidden group hover:border-surface-border/80 transition-colors`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full ${stat.bg} -mr-16 -mt-16 transition-transform group-hover:scale-110`} />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.bg} ${stat.border}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded bg-background/50 ${stat.trend.startsWith('+') ? 'text-accent-lime' : 'text-red-400'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-foreground/50 uppercase tracking-wider">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts / Tables Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <Card className="lg:col-span-2 bg-surface border-surface-border p-6 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-cyan" /> User Growth
            </h3>
          </div>
          <div className="flex-1 border border-surface-border border-dashed rounded-xl flex items-center justify-center bg-surface-light/30">
            <p className="text-foreground/40 font-bold tracking-widest uppercase">Chart Visualization Here</p>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-surface border-surface-border p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white text-lg">Recent Activity</h3>
            <span className="text-accent-magenta text-sm font-bold cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-6 flex-1">
            {[
              { text: "New user registered", user: "GamerBoy", time: "2 mins ago" },
              { text: "Tournament created", user: "Admin", time: "1 hour ago" },
              { text: "Game added", user: "Admin", time: "3 hours ago" },
              { text: "Report submitted", user: "ToxicPlayer", time: "5 hours ago" },
              { text: "Server maintenance", user: "System", time: "1 day ago" },
            ].map((activity, idx) => (
              <div key={idx} className="flex gap-4 items-start relative">
                {idx !== 4 && <div className="absolute left-2.5 top-6 bottom-[-24px] w-px bg-surface-border" />}
                <div className="w-5 h-5 rounded-full bg-surface-light border-2 border-surface-border shrink-0 mt-0.5 z-10" />
                <div>
                  <p className="text-sm text-white font-medium">{activity.text}</p>
                  <p className="text-xs text-foreground/50 mt-1">
                    <span className="text-accent-cyan">{activity.user}</span> • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
