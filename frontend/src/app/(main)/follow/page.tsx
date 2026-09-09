'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  UserPlus,
  UserCheck,
  CheckCircle2,
  Users,
  Gamepad2,
  Sparkles,
  Flame,
  Trophy,
  Filter,
  MessageSquare,
  ChevronRight,
  Shield,
  Radio,
  Star,
  Zap,
} from 'lucide-react';
import { usersApi } from '@/services/api';

interface Gamer {
  id: number | string;
  name: string;
  username: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  games: string[];
  followersCount: number;
  followingCount: number;
  isVerified?: boolean;
  isOnline?: boolean;
  isPlaying?: string;
  rank?: string;
  mutualFriends?: number;
  isFollowing?: boolean;
}

const INITIAL_GAMERS: Gamer[] = [
  {
    id: 'g-1',
    name: 'ShadowPlayz',
    username: 'shadowplayz',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    coverImage: '/clutch_gameplay.jpg',
    bio: 'Radiant Valorant & Warzone Specialist. Daily clutches and tournament highlights!',
    games: ['Valorant', 'Warzone', 'CS2'],
    followersCount: 14200,
    followingCount: 320,
    isVerified: true,
    isOnline: true,
    isPlaying: 'Call of Duty: Warzone',
    rank: 'Radiant #42',
    mutualFriends: 18,
    isFollowing: false,
  },
  {
    id: 'g-2',
    name: 'Arik Gamer',
    username: 'arik_gamer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    coverImage: '/battlestation_setup.jpg',
    bio: 'Hardware geek, competitive shooter lover, and squad leader in Apex Legends.',
    games: ['Apex Legends', 'Overwatch 2', 'Cyberpunk'],
    followersCount: 8900,
    followingCount: 450,
    isVerified: true,
    isOnline: true,
    isPlaying: 'Apex Legends',
    rank: 'Predator',
    mutualFriends: 12,
    isFollowing: true,
  },
  {
    id: 'g-3',
    name: 'Lina Valkyrie',
    username: 'lina_valk',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    coverImage: '/minecraft_castle.jpg',
    bio: 'Builder & Survival Architect. Speedruns, Minecraft megabuilds, and RPGs.',
    games: ['Minecraft', 'Elden Ring', 'Terraria'],
    followersCount: 11500,
    followingCount: 290,
    isVerified: true,
    isOnline: true,
    isPlaying: 'Minecraft Survival',
    rank: 'Master Architect',
    mutualFriends: 9,
    isFollowing: false,
  },
  {
    id: 'g-4',
    name: 'RohanX',
    username: 'rohanx',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80',
    bio: 'Captain of Valorant Squad. Tactical shotcalling and entry fragging.',
    games: ['Valorant', 'Rainbow Six Siege'],
    followersCount: 6300,
    followingCount: 180,
    isVerified: false,
    isOnline: true,
    isPlaying: 'Valorant Ranked',
    rank: 'Immortal 3',
    mutualFriends: 24,
    isFollowing: true,
  },
  {
    id: 'g-5',
    name: 'NightFury',
    username: 'nightfury',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
    bio: 'Stealth enthusiast & sniper main. In the shadows until the final circle.',
    games: ['PUBG', 'Warzone', 'Hitman'],
    followersCount: 4200,
    followingCount: 210,
    isVerified: false,
    isOnline: false,
    rank: 'Grandmaster',
    mutualFriends: 14,
    isFollowing: false,
  },
  {
    id: 'g-6',
    name: 'DevHunter',
    username: 'devhunter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
    bio: 'Indie game developer by day, competitive gamer by night.',
    games: ['Hades', 'Rocket League', 'Valorant'],
    followersCount: 3800,
    followingCount: 410,
    isVerified: false,
    isOnline: true,
    isPlaying: 'Rocket League',
    rank: 'Champion II',
    mutualFriends: 15,
    isFollowing: false,
  },
  {
    id: 'g-7',
    name: 'ProGamerX',
    username: 'progamerx',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&auto=format&fit=crop&q=80',
    bio: 'FIFA & eFootball esports participant. Top 100 global leaderboard.',
    games: ['eFootball 2024', 'EA Sports FC 24'],
    followersCount: 7900,
    followingCount: 305,
    isVerified: true,
    isOnline: false,
    rank: 'Division 1 Elite',
    mutualFriends: 8,
    isFollowing: false,
  },
  {
    id: 'g-8',
    name: 'CyberSamurai',
    username: 'cyber_samurai',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=cyber_samurai',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    bio: 'Soulsborne veteran, no-hit runner, and dark fantasy enthusiast.',
    games: ['Elden Ring', 'Dark Souls 3', 'Sekiro'],
    followersCount: 9400,
    followingCount: 150,
    isVerified: true,
    isOnline: true,
    isPlaying: 'Elden Ring DLC',
    rank: 'No-Hit Champion',
    mutualFriends: 6,
    isFollowing: false,
  },
  {
    id: 'g-9',
    name: 'PixelQueen',
    username: 'pixel_queen',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=pixel_queen',
    coverImage: 'https://images.unsplash.com/photo-1627856014754-2907e2355324?w=500&auto=format&fit=crop&q=80',
    bio: 'Speedrunner and retro games collector. Super Mario & Metroid world records.',
    games: ['Celeste', 'Hollow Knight', 'Metroid'],
    followersCount: 12100,
    followingCount: 220,
    isVerified: true,
    isOnline: false,
    rank: 'WR Holder #1',
    mutualFriends: 11,
    isFollowing: false,
  },
];

export default function FollowPage() {
  const [gamers, setGamers] = useState<Gamer[]>(INITIAL_GAMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'discover' | 'following' | 'followers'>('discover');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch real users from backend API
  useEffect(() => {
    usersApi
      .getAll()
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const apiGamers: Gamer[] = res.data.data.map((u: any) => ({
            id: u.id,
            name: u.display_name || u.name || u.username,
            username: u.username,
            avatar: u.avatar_url || u.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${u.username}`,
            bio: u.bio || 'Passionate gamer looking for new squad members!',
            games: ['Valorant', 'CS2'],
            followersCount: u.followers_count || Math.floor(Math.random() * 2000) + 100,
            followingCount: u.following_count || Math.floor(Math.random() * 500) + 50,
            isVerified: !!u.is_verified,
            isOnline: !!u.is_online,
            mutualFriends: Math.floor(Math.random() * 15) + 1,
            isFollowing: false,
          }));

          // Merge without duplicates
          setGamers((prev) => {
            const existingUsernames = new Set(prev.map((g) => g.username.toLowerCase()));
            const newOnes = apiGamers.filter((g) => !existingUsernames.has(g.username.toLowerCase()));
            return [...newOnes, ...prev];
          });
        }
      })
      .catch(() => {
        // Fallback smoothly
      });
  }, []);

  const handleToggleFollow = (gamerId: number | string) => {
    setGamers((prev) =>
      prev.map((gamer) => {
        if (gamer.id !== gamerId) return gamer;
        const nowFollowing = !gamer.isFollowing;
        const newCount = nowFollowing ? gamer.followersCount + 1 : gamer.followersCount - 1;

        // Show brief toast
        setToastMessage(nowFollowing ? `You are now following ${gamer.name}!` : `Unfollowed ${gamer.name}`);
        setTimeout(() => setToastMessage(null), 3000);

        return {
          ...gamer,
          isFollowing: nowFollowing,
          followersCount: newCount,
        };
      })
    );
  };

  const filteredGamers = gamers.filter((g) => {
    // Filter by tab
    if (activeTab === 'following' && !g.isFollowing) return false;
    if (activeTab === 'followers' && g.id === 'g-4') return false; // sample filter

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = g.name.toLowerCase().includes(q);
      const matchUser = g.username.toLowerCase().includes(q);
      const matchBio = g.bio.toLowerCase().includes(q);
      const matchGame = g.games.some((game) => game.toLowerCase().includes(q));
      if (!matchName && !matchUser && !matchBio && !matchGame) return false;
    }

    // Filter by category
    if (activeCategory === 'verified' && !g.isVerified) return false;
    if (activeCategory === 'online' && !g.isOnline) return false;
    if (activeCategory === 'pro' && !g.rank) return false;

    return true;
  });

  const followingCount = gamers.filter((g) => g.isFollowing).length;

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0b0e14] text-[#e2e8f0] font-sans">
      {/* ─────────────────────────────────────────────────────────────
          TOP GLOBAL HEADER
      ───────────────────────────────────────────────────────────── */}
      <header className="h-16 border-b border-[#161b26] bg-[#0b0e14] sticky top-0 z-30 flex items-center justify-between px-6">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex items-center flex-1">
            <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by gamer tag, name, game..."
              className="w-full bg-[#121622] border border-[#1e2434] rounded-xl py-2 pl-10 pr-4 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#5542f6] focus:ring-1 focus:ring-[#5542f6] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="w-9 h-9 rounded-xl bg-[#141926] hover:bg-[#1c2336] text-gray-300 hover:text-white flex items-center justify-center border border-[#1f2639] transition-all"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>

          <Link
            href="/feed"
            className="px-3.5 py-1.5 rounded-xl bg-[#141926] hover:bg-[#1c2336] border border-[#1f2639] text-xs font-semibold text-gray-200 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-[#5542f6]" />
            <span>Feed</span>
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          BANNER HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <div className="relative border-b border-[#161b26] bg-gradient-to-r from-[#121626] via-[#0f1422] to-[#130f24] px-6 lg:px-10 py-8 overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#5542f6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-64 h-64 bg-[#ec4899]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#5542f6]/20 text-[#8b5cf6] border border-[#5542f6]/30">
                Gamer Network
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                142K Gamers Online
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl lg:text-3xl text-white tracking-wide">
              Discover & Follow Gamers
            </h1>
            <p className="text-xs lg:text-sm text-gray-400 max-w-xl leading-relaxed">
              Connect with competitive players, streamers, squad leaders, and creators. Follow them to see their clips, match activity, and join their games.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-3 bg-[#101420]/80 border border-[#1f273b] p-3.5 rounded-2xl backdrop-blur-md shadow-xl">
            <div className="text-center px-3">
              <p className="font-display font-bold text-base lg:text-lg text-white">2.4M+</p>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Active Players</p>
            </div>
            <div className="text-center px-3 border-x border-[#1e2539]">
              <p className="font-display font-bold text-base lg:text-lg text-[#8b5cf6]">38K</p>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Squads</p>
            </div>
            <div className="text-center px-3">
              <p className="font-display font-bold text-base lg:text-lg text-emerald-400">890K</p>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Matches Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN BODY: TABS, FILTERS & GAMERS GRID
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-10 py-8 space-y-6">
        {/* Navigation Tabs & Categories */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#161b26] pb-4">
          {/* Main Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'discover', label: 'Discover Gamers', count: gamers.length },
              { id: 'following', label: 'Following', count: followingCount },
              { id: 'followers', label: 'Followers', count: 18 },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[#5542f6] text-white shadow-[0_0_15px_rgba(85,66,246,0.35)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#141926]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-[#182030] text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'verified', label: '⭐ Verified & Pros' },
              { id: 'online', label: '🟢 Online Now' },
              { id: 'pro', label: '🏆 Ranked Leaders' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#182030] text-white border border-[#27324c]'
                    : 'text-gray-400 hover:text-white hover:bg-[#131722]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            GAMERS GRID
        ───────────────────────────────────────────────────────────── */}
        {filteredGamers.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#141926] border border-[#20273a] flex items-center justify-center text-gray-500">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-white">No gamers found</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Try searching with another username, gamer tag, or switch categories.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="px-4 py-2 rounded-xl bg-[#5542f6] text-white text-xs font-semibold shadow-md mt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGamers.map((gamer) => (
              <div
                key={gamer.id}
                className="bg-[#10141e] border border-[#1c2333] hover:border-[#2f3a53] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group"
              >
                {/* Gamer Card Header Cover */}
                <div className="relative h-24 w-full bg-gradient-to-r from-[#171d2c] to-[#121624] overflow-hidden">
                  {gamer.coverImage ? (
                    <img
                      src={gamer.coverImage}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#5542f6]/20 via-[#ec4899]/10 to-transparent" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10141e] to-transparent" />

                  {/* Rank Badge on top right */}
                  {gamer.rank && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {gamer.rank}
                    </span>
                  )}
                </div>

                {/* Avatar & Profile Info */}
                <div className="px-5 pb-5 -mt-10 flex-1 flex flex-col justify-between relative z-10 space-y-3.5">
                  <div className="space-y-3">
                    <div className="flex items-end justify-between">
                      <Link href={`/profile/${gamer.username}`} className="relative cursor-pointer group/av">
                        <img
                          src={gamer.avatar}
                          alt={gamer.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-[#10141e] shadow-xl ring-2 ring-[#5542f6]/50 group-hover/av:scale-105 transition-transform"
                        />
                        {gamer.isOnline && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#10141e]"
                            title="Online"
                          />
                        )}
                      </Link>

                      {/* Follow Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleFollow(gamer.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
                          gamer.isFollowing
                            ? 'bg-[#182030] text-gray-300 border border-[#27334d] hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                            : 'bg-[#5542f6] hover:bg-[#6654f8] text-white shadow-[0_0_15px_rgba(85,66,246,0.35)]'
                        }`}
                      >
                        {gamer.isFollowing ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Name & Handle */}
                    <Link href={`/profile/${gamer.username}`} className="block group/link">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display font-bold text-sm text-white group-hover/link:text-[#8b5cf6] transition-colors">
                          {gamer.name}
                        </h3>
                        {gamer.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] fill-[#38bdf8]/20 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono">
                        @{gamer.username}
                      </p>
                    </Link>

                    {/* Playing Now Status */}
                    {gamer.isPlaying && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141926] border border-[#20283a] text-[11px] text-gray-300">
                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span className="text-gray-400">Playing:</span>
                        <span className="text-white font-medium truncate">{gamer.isPlaying}</span>
                      </div>
                    )}

                    {/* Bio */}
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                      {gamer.bio}
                    </p>

                    {/* Favorite Games Tags */}
                    {gamer.games && gamer.games.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {gamer.games.map((g, gi) => (
                          <span
                            key={gi}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#161c2b] text-gray-300 border border-[#222b3e]"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Counters & Actions */}
                  <div className="pt-3 border-t border-[#161c26] flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-3 text-[11px]">
                      <div>
                        <span className="font-bold text-white">
                          {gamer.followersCount >= 1000
                            ? `${(gamer.followersCount / 1000).toFixed(1)}K`
                            : gamer.followersCount}
                        </span>{' '}
                        Followers
                      </div>
                      {gamer.mutualFriends && (
                        <div className="text-gray-400 flex items-center gap-1">
                          <span>•</span>
                          <span>{gamer.mutualFriends} mutual</span>
                        </div>
                      )}
                    </div>

                    <Link
                      href="/messages"
                      className="p-1.5 rounded-lg bg-[#151a27] hover:bg-[#1f2638] text-gray-300 hover:text-white border border-[#1f2638] transition-colors"
                      title="Send Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#5542f6] text-white text-xs font-semibold shadow-[0_10px_25px_rgba(85,66,246,0.6)] flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
