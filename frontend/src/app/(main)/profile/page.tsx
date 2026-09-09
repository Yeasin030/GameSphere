'use client';

import React, { useEffect, useState } from 'react';
import {
  Edit3,
  MapPin,
  Calendar,
  Trophy,
  Gamepad2,
  Clock,
  Share2,
  ShieldCheck,
  Globe,
  Sparkles,
  Heart,
  MessageSquare,
  Award,
  Users,
  CheckCircle2,
  X,
  Loader2,
  ExternalLink,
  Flame,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { useProfileStore } from '@/stores/profileStore';

export default function ProfilePage() {
  const {
    profile,
    posts,
    friends,
    activeTab,
    isLoading,
    isLoadingPosts,
    isLoadingFriends,
    isSaving,
    isEditModalOpen,
    fetchProfile,
    updateProfile,
    setActiveTab,
    setEditModalOpen,
  } = useProfileStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit form state
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    website: '',
    country: '',
    avatar: '',
    cover_image: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchProfile('me');
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
        country: profile.country || 'US',
        avatar: profile.avatar || '',
        cover_image: profile.cover_image || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile(formData);
    showToast(res.message);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-accent-magenta animate-spin" />
        <p className="text-foreground/60 text-sm font-medium">Loading gaming profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <ShieldCheck className="w-12 h-12 text-red-400" />
        <h2 className="text-xl font-bold text-white">Profile Not Found</h2>
        <p className="text-foreground/60 text-sm">Could not load the requested user profile.</p>
        <Button onClick={() => fetchProfile('me')} variant="default" className="bg-accent-magenta text-white">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12141c]/95 border border-accent-magenta/40 text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <Sparkles className="w-5 h-5 text-accent-magenta animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Cover Photo */}
      <div className="relative h-[32vh] lg:h-[42vh] w-full overflow-hidden z-0 bg-[#0c0d14]">
        <img
          src={profile.cover_image || '/hero_cyberpunk_bg_1788280645324.jpg'}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 -mt-20 lg:-mt-28 pb-24 space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full md:w-auto">
            {/* Avatar with Live pulse */}
            <div className="relative shrink-0">
              <Avatar
                src={profile.avatar || undefined}
                fallback={profile.display_name?.slice(0, 2).toUpperCase() || 'P9'}
                className="w-32 h-32 md:w-36 md:h-36 rounded-3xl border-4 border-background bg-surface shadow-2xl overflow-hidden object-cover"
              />
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent-lime rounded-full border-4 border-background shadow-[0_0_15px_rgba(213,255,64,0.6)]"
                title="Online Now"
              />
            </div>

            <div className="text-center md:text-left space-y-1.5 pb-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">
                  {profile.display_name}
                </h1>
                {profile.is_verified && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan text-xs font-bold"
                    title="Verified Gamer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Pro
                  </span>
                )}
              </div>

              <p className="text-accent-magenta font-bold text-base">@{profile.username}</p>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs text-foreground/60 font-medium pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent-cyan" /> {profile.country || 'Global'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-foreground/40" /> Joined {profile.created_at}
                </span>
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-accent-cyan hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" /> {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto pb-2 justify-center">
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 md:w-auto border-surface-border text-foreground/70 hover:text-white"
            >
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button
              onClick={() => setEditModalOpen(true)}
              variant="default"
              className="flex-1 md:w-auto gap-2 bg-gradient-to-r from-accent-magenta to-accent-purple text-white shadow-[0_0_15px_rgba(236,72,153,0.35)] border-0 font-bold"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Bio Banner */}
        {profile.bio && (
          <div className="bg-surface/50 border border-white/5 rounded-2xl p-4 backdrop-blur-md text-sm text-foreground/80 leading-relaxed">
            {profile.bio}
          </div>
        )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-surface/70 border-surface-border p-5 flex flex-col items-center justify-center text-center hover:border-accent-magenta/40 transition-colors">
            <Users className="w-6 h-6 mb-2 text-accent-magenta" />
            <div className="text-2xl font-black text-white">{profile.followers_count}</div>
            <div className="text-[11px] text-foreground/50 uppercase tracking-wider font-bold">Followers</div>
          </Card>

          <Card className="bg-surface/70 border-surface-border p-5 flex flex-col items-center justify-center text-center hover:border-accent-cyan/40 transition-colors">
            <Gamepad2 className="w-6 h-6 mb-2 text-accent-cyan" />
            <div className="text-2xl font-black text-white">{profile.following_count}</div>
            <div className="text-[11px] text-foreground/50 uppercase tracking-wider font-bold">Following</div>
          </Card>

          <Card className="bg-surface/70 border-surface-border p-5 flex flex-col items-center justify-center text-center hover:border-amber-400/40 transition-colors">
            <Trophy className="w-6 h-6 mb-2 text-amber-400" />
            <div className="text-2xl font-black text-white">{profile.wins_count}</div>
            <div className="text-[11px] text-foreground/50 uppercase tracking-wider font-bold">Tournament Wins</div>
          </Card>

          <Card className="bg-surface/70 border-surface-border p-5 flex flex-col items-center justify-center text-center hover:border-accent-lime/40 transition-colors">
            <Clock className="w-6 h-6 mb-2 text-accent-lime" />
            <div className="text-2xl font-black text-white">{profile.playtime_hours}h</div>
            <div className="text-[11px] text-foreground/50 uppercase tracking-wider font-bold">Total Playtime</div>
          </Card>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tabs Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs Nav */}
            <div className="flex gap-6 border-b border-surface-border overflow-x-auto custom-scrollbar">
              {[
                { id: 'activity', label: 'Activity Posts' },
                { id: 'trophies', label: `Trophies (${profile.achievements?.length || 0})` },
                { id: 'library', label: `Gaming Library (${profile.games?.length || 0})` },
                { id: 'friends', label: `Squad & Friends (${profile.friends_count})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-sm font-bold tracking-wider uppercase whitespace-nowrap transition-all relative ${
                    activeTab === tab.id
                      ? 'text-accent-magenta border-b-2 border-accent-magenta'
                      : 'text-foreground/50 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Activity */}
            {activeTab === 'activity' && (
              <div className="space-y-4 pt-2">
                {isLoadingPosts ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-8 h-8 text-accent-magenta animate-spin" />
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="bg-surface border-surface-border p-8 text-center text-foreground/60">
                    No activity posts yet.
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="bg-surface border-surface-border p-5 space-y-4 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={post.author?.avatar || profile.avatar || undefined}
                            fallback={post.author?.display_name?.slice(0, 2).toUpperCase() || 'P9'}
                          />
                          <div>
                            <h4 className="font-bold text-white text-sm">
                              {post.author?.display_name || profile.display_name}
                            </h4>
                            <p className="text-xs text-foreground/50">
                              {new Date(post.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-foreground/90 text-sm leading-relaxed">{post.content}</p>

                      {post.media && post.media.length > 0 && (
                        <div className="h-64 rounded-xl overflow-hidden bg-background/50">
                          <img
                            src={post.media[0].url}
                            alt="Post attachment"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-6 pt-2 border-t border-white/5 text-xs text-foreground/60 font-semibold">
                        <span className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                          <Heart className="w-4 h-4 text-red-500" /> {post.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-accent-cyan transition-colors">
                          <MessageSquare className="w-4 h-4 text-accent-cyan" /> {post.comments_count || 0}
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-accent-lime transition-colors">
                          <Share2 className="w-4 h-4 text-accent-lime" /> {post.shares_count || 0}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Trophies & Achievements */}
            {activeTab === 'trophies' && (
              <div className="space-y-4 pt-2">
                {profile.achievements && profile.achievements.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.achievements.map((ach) => {
                      const rarityColor =
                        ach.rarity === 'legendary'
                          ? 'text-amber-400 border-amber-400/40 bg-amber-400/10'
                          : ach.rarity === 'epic'
                          ? 'text-purple-400 border-purple-400/40 bg-purple-400/10'
                          : ach.rarity === 'rare'
                          ? 'text-accent-cyan border-accent-cyan/40 bg-accent-cyan/10'
                          : 'text-accent-lime border-accent-lime/40 bg-accent-lime/10';

                      return (
                        <Card
                          key={ach.id}
                          className="bg-surface/80 border-surface-border p-4 flex gap-4 hover:border-white/20 transition-colors group"
                        >
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${rarityColor}`}
                          >
                            <Trophy className="w-7 h-7" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${rarityColor}`}
                              >
                                {ach.rarity}
                              </span>
                              <span className="text-xs font-black text-amber-300">
                                +{ach.points} pts
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-white group-hover:text-accent-magenta transition-colors">
                              {ach.name}
                            </h4>
                            <p className="text-xs text-foreground/60 line-clamp-2">
                              {ach.description}
                            </p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="bg-surface border-surface-border p-8 text-center text-foreground/60">
                    No achievements unlocked yet.
                  </Card>
                )}
              </div>
            )}

            {/* Tab 3: Gaming Library */}
            {activeTab === 'library' && (
              <div className="space-y-4 pt-2">
                {profile.games && profile.games.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.games.map((g) => (
                      <Card
                        key={g.id}
                        className="bg-surface border-surface-border overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all group"
                      >
                        <div className="flex gap-4 p-4">
                          <div className="w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-background">
                            <img
                              src={g.cover_image || '/feature_play_1788280674540.jpg'}
                              alt={g.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-magenta/15 text-accent-magenta border border-accent-magenta/30">
                                {g.pivot?.status || 'Playing'}
                              </span>
                              {g.pivot?.rating && (
                                <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {g.pivot.rating}/10
                                </span>
                              )}
                            </div>

                            <h4 className="text-base font-bold text-white truncate group-hover:text-accent-cyan transition-colors">
                              {g.name}
                            </h4>

                            <div className="text-xs text-foreground/60 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{g.pivot?.playtime_hours || 0} hours played</span>
                            </div>

                            {g.pivot?.notes && (
                              <p className="text-[11px] text-foreground/50 italic truncate pt-1">
                                "{g.pivot.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-surface border-surface-border p-8 text-center text-foreground/60">
                    No games in library yet.
                  </Card>
                )}
              </div>
            )}

            {/* Tab 4: Friends */}
            {activeTab === 'friends' && (
              <div className="space-y-4 pt-2">
                {isLoadingFriends ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-8 h-8 text-accent-magenta animate-spin" />
                  </div>
                ) : friends.length === 0 ? (
                  <Card className="bg-surface border-surface-border p-8 text-center text-foreground/60">
                    No squad members or friends added yet.
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {friends.map((friend) => (
                      <Card
                        key={friend.id}
                        className="bg-surface border-surface-border p-4 flex items-center justify-between hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={friend.avatar || undefined}
                            fallback={friend.display_name?.slice(0, 2).toUpperCase() || 'F'}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-white">{friend.display_name}</h4>
                              {friend.is_verified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
                              )}
                            </div>
                            <p className="text-xs text-accent-magenta">@{friend.username}</p>
                          </div>
                        </div>

                        <a
                          href={`/profile/${friend.username}`}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10"
                        >
                          View
                        </a>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Showcase */}
          <div className="space-y-6">
            {/* Top Games Showcase */}
            <Card className="bg-surface border-surface-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-accent-magenta" /> Favorite Showcase
                </h3>
                <span
                  onClick={() => setActiveTab('library')}
                  className="text-xs text-accent-cyan font-bold cursor-pointer hover:underline"
                >
                  View All
                </span>
              </div>

              {profile.games && profile.games.length > 0 ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {profile.games.slice(0, 6).map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setActiveTab('library')}
                      className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer border border-white/5"
                      title={g.name}
                    >
                      <img
                        src={g.cover_image || '/feature_play_1788280674540.jpg'}
                        alt={g.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                        <span className="text-[10px] font-bold text-white truncate">{g.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-foreground/50">No favorite games selected.</p>
              )}
            </Card>

            {/* Badges & Accolades */}
            <Card className="bg-surface border-surface-border p-5 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Top Accolades
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background/50 border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Elden Lord</h5>
                    <p className="text-[11px] text-foreground/50">Legendary Achievement</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background/50 border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Radiant Valor</h5>
                    <p className="text-[11px] text-foreground/50">Competitive Mastery</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background/50 border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-purple-400/10 border border-purple-400/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Apex Predator</h5>
                    <p className="text-[11px] text-foreground/50">Top 750 Global Rank</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10121a] border border-white/10 rounded-3xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-surface/40">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-accent-magenta" /> Edit Profile
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-foreground/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1.5">Display Name</label>
                <input
                  type="text"
                  required
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Your gamer tag"
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell other gamers what you play and stream..."
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground/70 block mb-1.5">Location / Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. United States"
                    className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/70 block mb-1.5">Website / Stream URL</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://twitch.tv/..."
                    className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1.5">Avatar Image URL</label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1.5">Cover Banner URL</label>
                <input
                  type="url"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  className="border-surface-border text-foreground/70"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-accent-magenta text-white hover:bg-accent-magenta/90 font-bold px-6"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
