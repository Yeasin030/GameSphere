'use client';

import { Users, UserPlus, Image as ImageIcon, Video, Paperclip, ShieldCheck, Calendar, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';

export default function GroupDetailsPage({ params }: { params: { slug: string } }) {
  return (
    <div className="relative min-h-screen bg-background animate-in fade-in duration-700">
      
      {/* Group Banner */}
      <div className="relative h-[40vh] z-0">
        <img 
          src="/hero_cyberpunk_bg_1788280645324.jpg" 
          alt="Group Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 -mt-24 space-y-8 pb-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex items-end gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-background bg-surface shadow-xl shrink-0">
              <img src="/feature_share_1788280706281.jpg" alt="Group Icon" className="w-full h-full object-cover" />
            </div>
            <div className="pb-2">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Valorant Bangladesh</h1>
              <p className="text-foreground/70 flex items-center gap-2 font-medium">
                <Lock className="w-4 h-4" /> Private Group • <Users className="w-4 h-4 ml-2" /> 12.5K Members
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:w-auto border-accent-blue/30 text-accent-blue hover:bg-accent-blue hover:text-white">
              Joined
            </Button>
            <Button variant="default" className="flex-1 md:w-auto gap-2 bg-accent-magenta text-white hover:bg-accent-magenta/90 shadow-[0_0_15px_rgba(236,72,153,0.3)] border-0">
              <UserPlus className="w-5 h-5" /> Invite
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 overflow-x-auto border-b border-surface-border custom-scrollbar">
          {['Feed', 'Members', 'Events', 'Rules', 'Media'].map((tab, idx) => (
            <button 
              key={tab}
              className={`pb-4 text-sm font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
                idx === 0 
                  ? 'text-accent-blue border-b-2 border-accent-blue' 
                  : 'text-foreground/50 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Create Post in Group */}
            <Card className="bg-surface border-surface-border p-4">
              <div className="flex gap-4">
                <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" fallback="ME" />
                <div className="flex-1 space-y-4">
                  <input 
                    type="text" 
                    placeholder="Write something to the group..." 
                    className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-foreground/40 text-lg"
                  />
                  <div className="flex items-center justify-between pt-3 border-t border-surface-border">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-foreground/60 hover:text-accent-blue hover:bg-accent-blue/10">
                        <ImageIcon className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-foreground/60 hover:text-accent-magenta hover:bg-accent-magenta/10">
                        <Video className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-foreground/60 hover:text-accent-lime hover:bg-accent-lime/10">
                        <Paperclip className="w-5 h-5" />
                      </Button>
                    </div>
                    <Button variant="default" className="h-9 px-6 font-bold shadow-[0_0_10px_rgba(139,92,246,0.3)]">Post</Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Group Post Example */}
            <Card className="bg-surface border-surface-border p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar src="https://i.pravatar.cc/150?u=12" fallback="JD" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white cursor-pointer hover:underline">Jett Main 99</p>
                      <span className="bg-accent-blue/20 text-accent-blue text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Admin</span>
                    </div>
                    <p className="text-xs text-foreground/50">2 hours ago</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-foreground/90 leading-relaxed">
                  Hey guys! We are organizing a custom 5v5 tournament this weekend. First place gets a 50$ Riot Gift Card. Who's in? Drop your Riot IDs below! 👇🔥
                </p>
                <div className="rounded-xl overflow-hidden max-h-96">
                  <img src="/feature_play_1788280674540.jpg" alt="Post attachment" className="w-full h-full object-cover" />
                </div>
              </div>
            </Card>

          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            
            {/* About Group */}
            <Card className="bg-surface border-surface-border p-5">
              <h3 className="font-bold text-white text-lg mb-4">About Group</h3>
              <p className="text-sm text-foreground/70 leading-relaxed mb-6">
                The biggest community for Valorant players in Bangladesh. Find teammates, share clips, and participate in local tournaments!
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <Lock className="w-4 h-4 text-accent-blue" />
                  <div>
                    <span className="font-semibold text-white block">Private</span>
                    <span className="text-xs text-foreground/50">Only members can see who's in the group and what they post.</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <Calendar className="w-4 h-4 text-accent-magenta" />
                  <div>
                    <span className="font-semibold text-white block">History</span>
                    <span className="text-xs text-foreground/50">Created on January 15, 2022</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Admins */}
            <Card className="bg-surface border-surface-border p-5">
              <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent-blue" /> Admins & Moderators
              </h3>
              
              <div className="space-y-4">
                {[
                  { name: 'Jett Main 99', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=12' },
                  { name: 'Reyna Bot', role: 'Moderator', avatar: 'https://i.pravatar.cc/150?u=15' },
                  { name: 'Omen One Trick', role: 'Moderator', avatar: 'https://i.pravatar.cc/150?u=18' }
                ].map((admin, idx) => (
                  <div key={idx} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Avatar src={admin.avatar} fallback={admin.name[0]} className="w-10 h-10" />
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-accent-blue transition-colors">{admin.name}</p>
                        <p className="text-xs text-accent-cyan font-medium">{admin.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
