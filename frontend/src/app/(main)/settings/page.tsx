'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Monitor, 
  Link as LinkIcon, 
  Camera, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  Globe,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { usersApi } from '@/services/api';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications' | 'display' | 'apps'>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    email: '',
    bio: '',
    country: '',
    website: '',
    avatar: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || user.name || '',
        username: user.username || '',
        email: user.email || '',
        bio: (user as any).bio || '',
        country: (user as any).country || 'United States',
        website: (user as any).website || '',
        avatar: user.avatar_url || user.avatar || '',
      });
    }

    // Fetch freshest data from API
    usersApi.getMe()
      .then((res) => {
        const u = res.data?.data || res.data;
        if (u) {
          setFormData((prev) => ({
            ...prev,
            display_name: u.display_name || u.name || prev.display_name,
            username: u.username || prev.username,
            email: u.email || prev.email,
            bio: u.bio || prev.bio,
            country: u.country || prev.country,
            website: u.website || prev.website,
            avatar: u.avatar_url || u.avatar || prev.avatar,
          }));
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await usersApi.updateMe({
        display_name: formData.display_name,
        bio: formData.bio,
        country: formData.country,
        website: formData.website,
        avatar: formData.avatar,
      });

      const updated = res.data?.data || res.data;

      // Update authStore
      updateUser({
        display_name: formData.display_name,
        name: formData.display_name,
        avatar: formData.avatar,
        avatar_url: formData.avatar,
      });

      showToast('Settings saved successfully!');
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      showToast(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatarUrl = formData.avatar || user?.avatar_url || user?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${formData.username || 'Gamer'}`;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12141c]/95 border border-[#5542f6]/40 text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <Sparkles className="w-5 h-5 text-[#5542f6] animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <h1 className="text-3xl font-display font-bold text-white mb-8">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          {[
            { id: 'account', label: 'Account', icon: User },
            { id: 'privacy', label: 'Privacy', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'display', label: 'Display', icon: Monitor },
            { id: 'apps', label: 'Connected Apps', icon: LinkIcon }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id
                  ? 'bg-[#5542f6]/15 text-[#8b5cf6] border border-[#5542f6]/30 shadow-[0_0_12px_rgba(85,66,246,0.2)]' 
                  : 'text-foreground/60 hover:bg-surface-light hover:text-white border border-transparent'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'account' && (
            <Card className="bg-surface border-surface-border p-6 md:p-8 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Account Settings</h2>
                <p className="text-sm text-foreground/50">Update your gamer profile details and personal information.</p>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative group cursor-pointer">
                    <img 
                      src={currentAvatarUrl} 
                      alt="Avatar" 
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-[#5542f6]/40 bg-surface shadow-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                      <Camera className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2 w-full sm:w-auto text-center sm:text-left flex-1 max-w-md">
                    <label className="text-xs font-bold text-foreground/70">Avatar Image URL</label>
                    <input 
                      type="url" 
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-background border border-surface-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#5542f6] transition-colors"
                    />
                    <p className="text-[11px] text-foreground/40">Paste a direct image link or DiceBear avatar URL.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80">Display Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="Your gamer name"
                      className="w-full bg-background border border-surface-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#5542f6] transition-colors text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 font-bold">@</span>
                      <input 
                        type="text" 
                        disabled
                        value={formData.username}
                        className="w-full bg-background/50 border border-surface-border/60 rounded-xl py-3 pl-8 pr-4 text-gray-400 text-sm cursor-not-allowed"
                        title="Username cannot be changed after registration"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-foreground/80">Email Address</label>
                    <input 
                      type="email" 
                      disabled
                      value={formData.email}
                      className="w-full bg-background/50 border border-surface-border/60 rounded-xl py-3 px-4 text-gray-400 text-sm cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80">Location / Country</label>
                    <input 
                      type="text" 
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g. United States"
                      className="w-full bg-background border border-surface-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#5542f6] transition-colors text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80">Website / Stream Channel</label>
                    <input 
                      type="url" 
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://twitch.tv/..."
                      className="w-full bg-background border border-surface-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#5542f6] transition-colors text-sm"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-foreground/80">Bio</label>
                    <textarea 
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell other gamers what you play and stream..."
                      className="w-full bg-background border border-surface-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#5542f6] transition-colors resize-none text-sm leading-relaxed"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-surface-border flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-[#5542f6] hover:bg-[#6654f8] text-white shadow-[0_0_15px_rgba(85,66,246,0.35)] border-0 gap-2 h-12 px-8 font-bold text-sm"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card className="bg-surface border-surface-border p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Privacy & Safety</h2>
                <p className="text-sm text-foreground/50">Manage who can see your profile, online status, and game activity.</p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { title: 'Public Profile', desc: 'Allow anyone to find your profile and follow you', defaultChecked: true },
                  { title: 'Show Online Status', desc: 'Display a green indicator when you are active on GameSphere', defaultChecked: true },
                  { title: 'Share Game Activity', desc: 'Broadcast the game and match you are currently playing', defaultChecked: true },
                  { title: 'Direct Messages from Anyone', desc: 'Allow messages from users who are not in your squad', defaultChecked: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-surface-border">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-foreground/50">{item.desc}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      defaultChecked={item.defaultChecked} 
                      className="w-5 h-5 accent-[#5542f6] cursor-pointer" 
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="bg-surface border-surface-border p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Notification Preferences</h2>
                <p className="text-sm text-foreground/50">Select which events trigger in-app and email notifications.</p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { title: 'Tournament Match Alerts', desc: 'Receive instant alerts when your tournament match is ready to start', defaultChecked: true },
                  { title: 'New Followers', desc: 'Notify when another gamer follows your profile', defaultChecked: true },
                  { title: 'Post Comments & Likes', desc: 'Notify when someone likes or comments on your clips & posts', defaultChecked: true },
                  { title: 'Squad & Community Invites', desc: 'Notify when you are invited to join a community or squad', defaultChecked: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-surface-border">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-foreground/50">{item.desc}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      defaultChecked={item.defaultChecked} 
                      className="w-5 h-5 accent-[#5542f6] cursor-pointer" 
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'display' && (
            <Card className="bg-surface border-surface-border p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Display & Theme</h2>
                <p className="text-sm text-foreground/50">Customize the visual theme and gaming interface.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#090c13] border-2 border-[#5542f6] text-center space-y-2 cursor-pointer shadow-[0_0_15px_rgba(85,66,246,0.25)]">
                  <div className="w-8 h-8 rounded-full bg-[#5542f6] mx-auto flex items-center justify-center text-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Cyber Dark</h4>
                  <p className="text-[11px] text-foreground/50">Default neon theme</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#10141e] border border-surface-border text-center space-y-2 cursor-pointer hover:border-white/20 transition-all opacity-60">
                  <div className="w-8 h-8 rounded-full bg-surface-light mx-auto" />
                  <h4 className="font-bold text-white text-sm">Midnight OLED</h4>
                  <p className="text-[11px] text-foreground/50">Pure deep black</p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'apps' && (
            <Card className="bg-surface border-surface-border p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Connected Gaming Accounts</h2>
                <p className="text-sm text-foreground/50">Link your gaming platform IDs to showcase achievements.</p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { name: 'Discord', status: 'Connected', account: `${formData.username || 'gamer'}#0001`, connected: true },
                  { name: 'Steam', status: 'Not connected', connected: false },
                  { name: 'Twitch', status: 'Not connected', connected: false },
                  { name: 'Riot Games', status: 'Not connected', connected: false },
                ].map((app, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-surface-border">
                    <div>
                      <h4 className="font-bold text-white text-sm">{app.name}</h4>
                      <p className="text-xs text-foreground/50">{app.account || app.status}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className={`text-xs ${app.connected ? 'border-emerald-500/40 text-emerald-400' : 'border-surface-border text-gray-300'}`}
                    >
                      {app.connected ? 'Connected' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
