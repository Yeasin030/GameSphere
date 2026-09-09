'use client';

import React, { useEffect, useState } from 'react';
import {
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
  Loader2,
  UserPlus,
  UserCheck,
  Flame,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { usersApi } from '@/services/api';

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'trophies' | 'library'>('activity');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          usersApi.getProfile(params.username),
          usersApi.getPosts(params.username).catch(() => ({ data: { data: [] } })),
        ]);

        setProfile(profileRes.data?.data);
        setPosts(postsRes.data?.data || []);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.username) {
      fetchUserData();
    }
  }, [params.username]);

  const handleToggleFollow = async () => {
    if (!profile || profile.is_self) return;
    setIsFollowLoading(true);

    const nextState = !profile.is_following;
    const delta = nextState ? 1 : -1;

    setProfile({
      ...profile,
      is_following: nextState,
      followers_count: Math.max(0, profile.followers_count + delta),
    });

    try {
      if (nextState) {
        await usersApi.follow(profile.id);
        showToast(`Now following @${profile.username}!`);
      } else {
        await usersApi.unfollow(profile.id);
        showToast(`Unfollowed @${profile.username}`);
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
      setProfile({
        ...profile,
        is_following: !nextState,
        followers_count: Math.max(0, profile.followers_count - delta),
      });
      showToast('Failed to update follow status.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-accent-magenta animate-spin" />
        <p className="text-foreground/60 text-sm font-medium">Loading @{params.username}'s profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <ShieldCheck className="w-12 h-12 text-red-400" />
        <h2 className="text-xl font-bold text-white">Gamer Not Found</h2>
        <p className="text-foreground/60 text-sm">The user @{params.username} does not exist or has deactivated.</p>
        <Link href="/profile">
          <Button variant="default" className="bg-accent-magenta text-white">
            Back to My Profile
          </Button>
        </Link>
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
            {/* Avatar */}
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

            {!profile.is_self && (
              <>
                <Button
                  onClick={handleToggleFollow}
                  disabled={isFollowLoading}
                  className={`flex-1 md:w-auto gap-2 font-bold transition-all shadow-lg ${
                    profile.is_following
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'
                      : 'bg-gradient-to-r from-accent-magenta to-accent-purple text-white hover:brightness-110 shadow-[0_0_15px_rgba(236,72,153,0.35)]'
                  }`}
                >
                  {isFollowLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : profile.is_following ? (
                    <>
                      <UserCheck className="w-4 h-4" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Follow
                    </>
                  )}
                </Button>

                <Link href="/messages">
                  <Button variant="outline" className="border-surface-border hover:bg-surface-light text-white">
                    <MessageSquare className="w-4 h-4 mr-1.5" /> Message
                  </Button>
                </Link>
              </>
            )}
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
          <Card className="bg-surface/70 border-surface-border p-5 flex flex-col items-center justify-center text-center">
            <Users className="w-6 h-6 mb-2 text-accent-magenta" />
            <div className="text-2xl font-black text-white">{profile.followers_count}</div>
            <div className="text-[11px] text-foreground/50 uppercase tracking-wider font-bold">Followers</div>
          </Card>

          <Card className="bg-surface/70 border-surface-border p-5 flex flex-col items-center justify-center text-center">
            <Gamepad2 className="w-6 h-6 mb-2 text-accent-cyan" />
            <div className="text-2xl font-black text-white">{profile.following_count}</div>
            <div className="text-[11px] text-foreground/50 uppercase tracking-wider font-bold">Following</div>
          </Card>

          <Card className="bg-surface/70 border-surface-border p-5 flex flex-col items-center justify-center text-center">
            <Trophy className="w-6 h-6 mb-2 text-amber-400" />
            <div className="text-2xl font-black text-white">{profile.wins_count}</div>
            <div className="text-[11px] text-foreground/50 uppercase tracking-wider font-bold">Tournament Wins</div>
          </Card>

          <Card className="bg-surface/70 border-surface-border p-5 flex flex-col items-center justify-center text-center">
            <Clock className="w-6 h-6 mb-2 text-accent-lime" />
            <div className="text-2xl font-black text-white">{profile.playtime_hours}h</div>
            <div className="text-[11px] text-foreground/50 uppercase tracking-wider font-bold">Total Playtime</div>
          </Card>
        </div>

        {/* Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-6 border-b border-surface-border overflow-x-auto custom-scrollbar">
              {[
                { id: 'activity', label: 'Activity Posts' },
                { id: 'trophies', label: `Trophies (${profile.achievements?.length || 0})` },
                { id: 'library', label: `Gaming Library (${profile.games?.length || 0})` },
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

            {/* Activity Posts */}
            {activeTab === 'activity' && (
              <div className="space-y-4 pt-2">
                {posts.length === 0 ? (
                  <Card className="bg-surface border-surface-border p-8 text-center text-foreground/60">
                    No activity posts from @{profile.username} yet.
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="bg-surface border-surface-border p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={profile.avatar || undefined}
                          fallback={profile.display_name?.slice(0, 2).toUpperCase() || 'P9'}
                        />
                        <div>
                          <h4 className="font-bold text-white text-sm">{profile.display_name}</h4>
                          <p className="text-xs text-foreground/50">
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <p className="text-foreground/90 text-sm leading-relaxed">{post.content}</p>

                      <div className="flex items-center gap-6 pt-2 border-t border-white/5 text-xs text-foreground/60 font-semibold">
                        <span className="flex items-center gap-1.5 text-red-400">
                          <Heart className="w-4 h-4 text-red-500" /> {post.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1.5 text-accent-cyan">
                          <MessageSquare className="w-4 h-4 text-accent-cyan" /> {post.comments_count || 0}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Trophies */}
            {activeTab === 'trophies' && (
              <div className="space-y-4 pt-2">
                {profile.achievements && profile.achievements.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.achievements.map((ach: any) => (
                      <Card
                        key={ach.id}
                        className="bg-surface/80 border-surface-border p-4 flex gap-4 hover:border-white/20 transition-colors"
                      >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-amber-400/30 bg-amber-400/10 text-amber-400">
                          <Trophy className="w-7 h-7" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border border-amber-400/40 text-amber-400">
                              {ach.rarity}
                            </span>
                            <span className="text-xs font-black text-amber-300">+{ach.points} pts</span>
                          </div>
                          <h4 className="text-base font-bold text-white">{ach.name}</h4>
                          <p className="text-xs text-foreground/60 line-clamp-2">{ach.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-surface border-surface-border p-8 text-center text-foreground/60">
                    No achievements unlocked yet.
                  </Card>
                )}
              </div>
            )}

            {/* Gaming Library */}
            {activeTab === 'library' && (
              <div className="space-y-4 pt-2">
                {profile.games && profile.games.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.games.map((g: any) => (
                      <Card
                        key={g.id}
                        className="bg-surface border-surface-border overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all"
                      >
                        <div className="flex gap-4 p-4">
                          <div className="w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-background">
                            <img
                              src={g.cover_image || '/feature_play_1788280674540.jpg'}
                              alt={g.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-magenta/15 text-accent-magenta border border-accent-magenta/30">
                              {g.pivot?.status || 'Playing'}
                            </span>

                            <h4 className="text-base font-bold text-white truncate">{g.name}</h4>

                            <div className="text-xs text-foreground/60 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{g.pivot?.playtime_hours || 0} hours played</span>
                            </div>
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
          </div>

          {/* Right Sidebar Showcase */}
          <div className="space-y-6">
            <Card className="bg-surface border-surface-border p-5 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-accent-magenta" /> Favorite Showcase
              </h3>

              {profile.games && profile.games.length > 0 ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {profile.games.slice(0, 6).map((g: any) => (
                    <div
                      key={g.id}
                      className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer border border-white/5"
                      title={g.name}
                    >
                      <img
                        src={g.cover_image || '/feature_play_1788280674540.jpg'}
                        alt={g.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-foreground/50">No games showcased.</p>
              )}
            </Card>

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
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
